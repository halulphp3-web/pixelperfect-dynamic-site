import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CookieConsent, FloatingWidgets } from "./FloatingWidgets";
import type { Tables } from "@/integrations/supabase/types";

export function SiteLayout({
  settings,
  menu,
  children,
}: {
  settings: Tables<"site_settings"> | null;
  menu: Tables<"menu_items">[];
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header settings={settings} menu={menu} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <FloatingWidgets whatsapp={settings?.whatsapp} />
      <CookieConsent />
    </div>
  );
}
