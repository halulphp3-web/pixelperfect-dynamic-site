import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { updateSettings } from "@/lib/admin.functions";
import { DEFAULT_FLAGS, type FeatureFlags } from "@/lib/public-content.functions";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

function mergeFlags(raw: any): FeatureFlags {
  const src = (raw ?? {}) as Partial<FeatureFlags>;
  return {
    home: { ...DEFAULT_FLAGS.home, ...(src.home ?? {}) },
    header: { ...DEFAULT_FLAGS.header, ...(src.header ?? {}) },
    widgets: { ...DEFAULT_FLAGS.widgets, ...(src.widgets ?? {}) },
    properties_page: { ...DEFAULT_FLAGS.properties_page, ...(src.properties_page ?? {}) },
  };
}

function SettingsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
      return data;
    },
  });
  const [form, setForm] = useState<any>({});
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"brand" | "toggles" | "seo">("brand");

  useEffect(() => {
    if (data) {
      setForm({
        ...data,
        feature_flags: mergeFlags((data as any).feature_flags),
      });
    }
  }, [data]);

  const socials = form.socials ?? {};
  const seo = form.seo ?? {};
  const scripts = form.scripts ?? {};
  const flags: FeatureFlags = form.feature_flags ?? DEFAULT_FLAGS;
  const supported: string[] = Array.isArray(form.supported_currencies)
    ? form.supported_currencies
    : ["AED", "USD", "EUR", "GBP"];

  function set(k: string, v: any) { setForm({ ...form, [k]: v }); }
  function setSocial(k: string, v: string) { setForm({ ...form, socials: { ...socials, [k]: v } }); }
  function setSeo(k: string, v: string) { setForm({ ...form, seo: { ...seo, [k]: v } }); }
  function setScript(k: string, v: string) { setForm({ ...form, scripts: { ...scripts, [k]: v } }); }
  function setFlag(group: keyof FeatureFlags, key: string, v: boolean) {
    setForm({
      ...form,
      feature_flags: { ...flags, [group]: { ...(flags[group] as any), [key]: v } },
    });
  }

  async function save() {
    const { id: _id, updated_at: _u, ...payload } = form;
    await updateSettings({ data: payload });
    qc.invalidateQueries({ queryKey: ["settings"] });
    qc.invalidateQueries({ queryKey: ["site-data"] });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">Website Settings</h1>
      <p className="text-sm text-muted-foreground">Global site information, feature toggles, and SEO defaults.</p>

      <div className="mt-6 inline-flex rounded-lg border border-border bg-card p-1 text-sm">
        {(["brand", "toggles", "seo"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md capitalize ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t === "toggles" ? "Feature toggles" : t}
          </button>
        ))}
      </div>

      {tab === "brand" && (
        <>
          <Section title="Brand">
            <Field label="Site Name" value={form.site_name} onChange={(v) => set("site_name", v)} />
            <Field label="Tagline" value={form.tagline} onChange={(v) => set("tagline", v)} />
            <Field label="Logo URL" value={form.logo_url} onChange={(v) => set("logo_url", v)} />
            <Field label="Favicon URL" value={form.favicon_url} onChange={(v) => set("favicon_url", v)} />
          </Section>

          <Section title="Contact">
            <Field label="Email" value={form.email} onChange={(v) => set("email", v)} />
            <Field label="Phone" value={form.phone} onChange={(v) => set("phone", v)} />
            <Field label="WhatsApp Number (digits only)" value={form.whatsapp} onChange={(v) => set("whatsapp", v)} />
            <Field label="Address" value={form.address} onChange={(v) => set("address", v)} textarea />
            <Field label="Google Map Embed URL" value={form.google_map_embed} onChange={(v) => set("google_map_embed", v)} />
          </Section>

          <Section title="Social">
            <Field label="Facebook URL" value={socials.facebook} onChange={(v) => setSocial("facebook", v)} />
            <Field label="Instagram URL" value={socials.instagram} onChange={(v) => setSocial("instagram", v)} />
            <Field label="LinkedIn URL" value={socials.linkedin} onChange={(v) => setSocial("linkedin", v)} />
            <Field label="Twitter URL" value={socials.twitter} onChange={(v) => setSocial("twitter", v)} />
          </Section>
        </>
      )}

      {tab === "toggles" && (
        <>
          <Section title="Home page sections">
            {Object.entries(flags.home).map(([k, v]) => (
              <Toggle key={k} label={labelize(k)} value={v} onChange={(nv) => setFlag("home", k, nv)} />
            ))}
          </Section>
          <Section title="Header widgets">
            {Object.entries(flags.header).map(([k, v]) => (
              <Toggle key={k} label={labelize(k)} value={v} onChange={(nv) => setFlag("header", k, nv)} />
            ))}
          </Section>
          <Section title="Floating widgets">
            {Object.entries(flags.widgets).map(([k, v]) => (
              <Toggle key={k} label={labelize(k)} value={v} onChange={(nv) => setFlag("widgets", k, nv)} />
            ))}
          </Section>
          <Section title="Properties page">
            {Object.entries(flags.properties_page).map(([k, v]) => (
              <Toggle key={k} label={labelize(k)} value={v} onChange={(nv) => setFlag("properties_page", k, nv)} />
            ))}
          </Section>
          <Section title="Currency">
            <Field label="Default currency (ISO)" value={form.default_currency} onChange={(v) => set("default_currency", v.toUpperCase())} />
            <Field
              label="Supported currencies (comma-separated ISO codes)"
              value={supported.join(", ")}
              onChange={(v) => set("supported_currencies", v.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean))}
            />
          </Section>
        </>
      )}

      {tab === "seo" && (
        <>
          <Section title="SEO Defaults">
            <Field label="Meta Title" value={seo.meta_title} onChange={(v) => setSeo("meta_title", v)} />
            <Field label="Meta Description" value={seo.meta_description} onChange={(v) => setSeo("meta_description", v)} textarea />
            <Field label="Meta Keywords" value={seo.meta_keywords} onChange={(v) => setSeo("meta_keywords", v)} />
          </Section>
          <Section title="Analytics & Scripts">
            <Field label="Google Analytics ID" value={scripts.ga_id} onChange={(v) => setScript("ga_id", v)} />
            <Field label="Google Tag Manager ID" value={scripts.gtm_id} onChange={(v) => setScript("gtm_id", v)} />
            <Field label="Facebook Pixel ID" value={scripts.fb_pixel} onChange={(v) => setScript("fb_pixel", v)} />
            <Field label="Custom Header Scripts" value={scripts.head} onChange={(v) => setScript("head", v)} textarea />
            <Field label="Custom Footer Scripts" value={scripts.body} onChange={(v) => setScript("body", v)} textarea />
          </Section>
        </>
      )}

      <div className="mt-8 flex items-center gap-3">
        <button onClick={save} className="rounded-md bg-primary px-5 py-2 text-sm text-primary-foreground">Save changes</button>
        {saved && <span className="text-sm text-green-600">Saved.</span>}
      </div>
    </div>
  );
}

function labelize(k: string) {
  return k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-6">
      <div className="text-lg font-semibold">{title}</div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({
  label, value, onChange, textarea,
}: { label: string; value: any; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <label className="block sm:col-span-1 last:sm:col-span-2">
      <span className="block text-sm font-medium mb-1">{label}</span>
      {textarea ? (
        <textarea
          rows={3}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      ) : (
        <input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      )}
    </label>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm">
      <span className="min-w-0 truncate">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        aria-pressed={value}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${value ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-background transition ${value ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </label>
  );
}
