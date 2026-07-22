import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function serverClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const getSiteData = createServerFn({ method: "GET" }).handler(async () => {
  const sb = serverClient();
  const [settings, menu, hero, services, features, stats, testimonials] = await Promise.all([
    sb.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    sb.from("menu_items").select("*").eq("active", true).eq("location", "header").order("sort"),
    sb.from("hero_slides").select("*").eq("active", true).order("sort"),
    sb.from("services").select("*").eq("active", true).order("sort"),
    sb.from("features").select("*").eq("active", true).order("sort"),
    sb.from("stats").select("*").eq("active", true).order("sort"),
    sb.from("testimonials").select("*").eq("active", true).order("sort"),
  ]);
  return {
    settings: settings.data,
    menu: menu.data ?? [],
    hero: hero.data ?? [],
    services: services.data ?? [],
    features: features.data ?? [],
    stats: stats.data ?? [],
    testimonials: testimonials.data ?? [],
  };
});

export const getServiceBySlug = createServerFn({ method: "GET" })
  .inputValidator((v) => z.object({ slug: z.string() }).parse(v))
  .handler(async ({ data }) => {
    const sb = serverClient();
    const { data: service } = await sb
      .from("services")
      .select("*")
      .eq("slug", data.slug)
      .eq("active", true)
      .maybeSingle();
    return service;
  });

export const getPageBySlug = createServerFn({ method: "GET" })
  .inputValidator((v) => z.object({ slug: z.string() }).parse(v))
  .handler(async ({ data }) => {
    const sb = serverClient();
    const { data: page } = await sb
      .from("pages")
      .select("*")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    return page;
  });

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((v) =>
    z
      .object({
        name: z.string().trim().min(1).max(200),
        email: z.string().trim().email().max(320),
        phone: z.string().trim().max(40).optional().or(z.literal("")),
        subject: z.string().trim().max(200).optional().or(z.literal("")),
        message: z.string().trim().min(1).max(5000),
      })
      .parse(v),
  )
  .handler(async ({ data }) => {
    const sb = serverClient();
    const { error } = await sb.from("contact_messages").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject || null,
      message: data.message,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
