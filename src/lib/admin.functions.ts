import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data, userId: context.userId };
  });

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const counts = async (table: any) => {
      const { count } = await sb.from(table).select("*", { count: "exact", head: true });
      return count ?? 0;
    };
    const [services, testimonials, pages, messages, recent] = await Promise.all([
      counts("services"),
      counts("testimonials"),
      counts("pages"),
      counts("contact_messages"),
      sb.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(5),
    ]);
    return {
      counts: { services, testimonials, pages, messages },
      recent: recent.data ?? [],
    };
  });

const tableSchema = z.enum([
  "services",
  "testimonials",
  "stats",
  "features",
  "hero_slides",
  "menu_items",
  "pages",
  "contact_messages",
  "media",
  "properties",
]);

export const listRows = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ table: tableSchema, search: z.string().optional() }).parse(v))
  .handler(async ({ data, context }) => {
    let q = context.supabase.from(data.table as any).select("*");
    q = q.order("sort" as any, { ascending: true, nullsFirst: false } as any);
    const { data: rows, error } = await q;
    if (error) {
      // fallback for tables without "sort"
      const alt = await context.supabase.from(data.table as any).select("*").order("created_at", { ascending: false });
      return alt.data ?? [];
    }
    return rows ?? [];
  });

export const upsertRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ table: tableSchema, row: z.record(z.string(), z.any()) }).parse(v))
  .handler(async ({ data, context }) => {
    const { row, table } = data;
    const { data: res, error } = await context.supabase.from(table as any).upsert(row as any).select().single();
    if (error) throw new Error(error.message);
    return res;
  });

export const deleteRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ table: tableSchema, id: z.string() }).parse(v))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from(data.table as any).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.record(z.string(), z.any()).parse(v))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("site_settings").update(data as any).eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// One-shot backfill: re-sign any /object/public/property-images/<path> URLs
// stored on properties (cover + gallery) into long-lived signed URLs. The
// bucket is private (workspace policy blocks public buckets), so old
// getPublicUrl() links return 404.
export const resignPropertyImageUrls = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
    const PUB_RE = /\/storage\/v1\/object\/public\/property-images\/([^?#\s"']+)/;
    const resign = async (url: string): Promise<string> => {
      const m = typeof url === "string" ? url.match(PUB_RE) : null;
      if (!m) return url;
      const path = decodeURIComponent(m[1]);
      const { data, error } = await supabaseAdmin.storage
        .from("property-images")
        .createSignedUrl(path, TEN_YEARS);
      if (error || !data) return url;
      return data.signedUrl;
    };
    const { data: rows, error } = await supabaseAdmin
      .from("properties")
      .select("id, cover_image_url, gallery_urls");
    if (error) throw new Error(error.message);
    let updated = 0;
    for (const r of rows ?? []) {
      const patch: any = {};
      if (r.cover_image_url) {
        const nu = await resign(r.cover_image_url);
        if (nu !== r.cover_image_url) patch.cover_image_url = nu;
      }
      if (Array.isArray(r.gallery_urls)) {
        const next = await Promise.all(r.gallery_urls.map((u: any) => (typeof u === "string" ? resign(u) : u)));
        if (JSON.stringify(next) !== JSON.stringify(r.gallery_urls)) patch.gallery_urls = next;
      }
      if (Object.keys(patch).length > 0) {
        await supabaseAdmin.from("properties").update(patch).eq("id", r.id);
        updated++;
      }
    }
    // Also resign hero_slides.image_url and site_settings.logo_url/favicon_url
    const { data: slides } = await supabaseAdmin.from("hero_slides").select("id, image_url");
    for (const s of slides ?? []) {
      if (s.image_url) {
        const nu = await resign(s.image_url);
        if (nu !== s.image_url) {
          await supabaseAdmin.from("hero_slides").update({ image_url: nu }).eq("id", s.id);
          updated++;
        }
      }
    }
    const { data: settings } = await supabaseAdmin
      .from("site_settings")
      .select("id, logo_url, favicon_url")
      .eq("id", 1)
      .maybeSingle();
    if (settings) {
      const patch: any = {};
      if (settings.logo_url) {
        const nu = await resign(settings.logo_url);
        if (nu !== settings.logo_url) patch.logo_url = nu;
      }
      if (settings.favicon_url) {
        const nu = await resign(settings.favicon_url);
        if (nu !== settings.favicon_url) patch.favicon_url = nu;
      }
      if (Object.keys(patch).length > 0) {
        await supabaseAdmin.from("site_settings").update(patch).eq("id", 1);
        updated++;
      }
    }
    return { ok: true, updated };
  });
