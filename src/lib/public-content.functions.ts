import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database, Tables } from "@/integrations/supabase/types";


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

export type FeatureFlags = {
  home: { hero: boolean; stats: boolean; services: boolean; features: boolean; properties: boolean; testimonials: boolean; cta: boolean };
  header: { currency_switcher: boolean; language_switcher: boolean; dark_mode: boolean; search_bar: boolean };
  widgets: { whatsapp: boolean; back_to_top: boolean; ai_chat: boolean };
  properties_page: { map: boolean; filters: boolean };
};

export const DEFAULT_FLAGS: FeatureFlags = {
  home: { hero: true, stats: true, services: true, features: true, properties: true, testimonials: true, cta: true },
  header: { currency_switcher: true, language_switcher: true, dark_mode: true, search_bar: false },
  widgets: { whatsapp: true, back_to_top: true, ai_chat: false },
  properties_page: { map: true, filters: true },
};

type SiteData = {
  settings: Tables<"site_settings"> | null;
  menu: Tables<"menu_items">[];
  hero: Tables<"hero_slides">[];
  services: Tables<"services">[];
  features: Tables<"features">[];
  stats: Tables<"stats">[];
  testimonials: Tables<"testimonials">[];
  featuredProperties: Tables<"properties">[];
};

export const getSiteData = createServerFn({ method: "GET" }).handler(async (): Promise<SiteData> => {
  const sb = serverClient();
  const [settings, menu, hero, services, features, stats, testimonials, featured] = await Promise.all([
    sb.from("site_settings").select("id, site_name, tagline, logo_url, favicon_url, email, phone, whatsapp, address, google_map_embed, socials, default_currency, supported_currencies, seo, feature_flags, updated_at").eq("id", 1).maybeSingle(),
    sb.from("menu_items").select("*").eq("active", true).eq("location", "header").order("sort"),
    sb.from("hero_slides").select("*").eq("active", true).order("sort"),
    sb.from("services").select("*").eq("active", true).order("sort"),
    sb.from("features").select("*").eq("active", true).order("sort"),
    sb.from("stats").select("*").eq("active", true).order("sort"),
    sb.from("testimonials").select("*").eq("active", true).order("sort"),
    sb.from("properties").select("*").eq("active", true).eq("featured", true).order("sort").limit(6),
  ]);
  return JSON.parse(JSON.stringify({
    settings: settings.data,
    menu: menu.data ?? [],
    hero: hero.data ?? [],
    services: services.data ?? [],
    features: features.data ?? [],
    stats: stats.data ?? [],
    testimonials: testimonials.data ?? [],
    featuredProperties: featured.data ?? [],
  }));
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

export const listProperties = createServerFn({ method: "GET" })
  .inputValidator((v) =>
    z
      .object({
        search: z.string().trim().max(120).optional().or(z.literal("")),
        guests: z.number().int().min(1).max(30).optional(),
      })
      .parse(v ?? {}),
  )
  .handler(async ({ data }): Promise<Tables<"properties">[]> => {
    try {
      const sb = serverClient();
      let q = sb.from("properties").select("*").eq("active", true).order("sort");
      if (data.guests) q = q.gte("guests", data.guests);
      if (data.search) q = q.or(`title.ilike.%${data.search}%,location.ilike.%${data.search}%,property_type.ilike.%${data.search}%`);
      const { data: rows, error } = await q;
      if (error) { console.error("[listProperties] supabase error", error); throw new Error(error.message); }
      const out = JSON.parse(JSON.stringify(rows ?? []));
      console.log("[listProperties] rows=", out.length);
      return out;
    } catch (e: any) {
      console.error("[listProperties] handler error", e?.message, e?.stack);
      throw new Error(String(e?.message ?? e));
    }
  });

export const getPropertyBySlug = createServerFn({ method: "GET" })
  .inputValidator((v) => z.object({ slug: z.string() }).parse(v))
  .handler(async ({ data }) => {
    const sb = serverClient();
    const { data: prop } = await sb
      .from("properties")
      .select("*")
      .eq("slug", data.slug)
      .eq("active", true)
      .maybeSingle();
    return prop ? JSON.parse(JSON.stringify(prop)) : null;
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
