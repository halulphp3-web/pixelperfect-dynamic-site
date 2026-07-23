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
