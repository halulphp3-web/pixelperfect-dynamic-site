import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CookieConsent, FloatingWidgets } from "./FloatingWidgets";
import type { Tables } from "@/integrations/supabase/types";
import { DEFAULT_FLAGS, type FeatureFlags } from "@/lib/public-content.functions";

function mergeFlags(raw: any): FeatureFlags {
  const src = (raw ?? {}) as Partial<FeatureFlags>;
  return {
    home: { ...DEFAULT_FLAGS.home, ...(src.home ?? {}) },
    header: { ...DEFAULT_FLAGS.header, ...(src.header ?? {}) },
    widgets: { ...DEFAULT_FLAGS.widgets, ...(src.widgets ?? {}) },
    properties_page: { ...DEFAULT_FLAGS.properties_page, ...(src.properties_page ?? {}) },
  };
}

export function useFlags(settings: Tables<"site_settings"> | null): FeatureFlags {
  return mergeFlags(settings?.feature_flags as any);
}

export function SiteLayout({
  settings,
  menu,
  children,
  locations = [],
  onHeaderSearch,
  hideHeaderSearch = false,
}: {
  settings: Tables<"site_settings"> | null;
  menu: Tables<"menu_items">[];
  children: ReactNode;
  locations?: string[];
  onHeaderSearch?: (v: { destination: string; guests: number }) => void;
  hideHeaderSearch?: boolean;
}) {
  const flags = mergeFlags(settings?.feature_flags as any);
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header settings={settings} menu={menu} flags={flags} locations={locations} onSearch={onHeaderSearch} hideSearch={hideHeaderSearch} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <FloatingWidgets whatsapp={settings?.whatsapp} flags={flags} />
      <CookieConsent />
    </div>
  );
}
