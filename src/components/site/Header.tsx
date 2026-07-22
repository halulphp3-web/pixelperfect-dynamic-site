import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Moon, Sun, Globe } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import type { FeatureFlags } from "@/lib/public-content.functions";
import { useSite } from "@/lib/site-context";

type Settings = Tables<"site_settings"> | null;
type MenuItem = Tables<"menu_items">;

export function Header({
  settings,
  menu,
  flags,
}: {
  settings: Settings;
  menu: MenuItem[];
  flags: FeatureFlags;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { currency, setCurrency, supportedCurrencies, lang, setLang, theme, toggleTheme } = useSite();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all ${
        scrolled ? "bg-background/90 backdrop-blur border-b border-border" : "bg-background/50 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 h-16 max-w-7xl px-4 md:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2 font-bold text-lg tracking-tight text-foreground">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt={settings.site_name} className="h-8 w-auto shrink-0" />
          ) : (
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground text-sm">
              {(settings?.site_name ?? "S")[0]}
            </span>
          )}
          <span className="truncate hidden sm:inline">{settings?.site_name ?? "Stays"}</span>
        </Link>

        <div className="flex items-center gap-1">
          <div className="hidden sm:flex items-center gap-1 ml-1">
            {flags.header.currency_switcher && (
              <select
                aria-label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="h-9 rounded-md border border-border bg-background px-2 text-xs font-medium"
              >
                {supportedCurrencies.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}
            {flags.header.language_switcher && (
              <button
                onClick={() => setLang(lang === "en" ? "ar" : "en")}
                className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-background px-2 text-xs font-medium hover:bg-accent"
                aria-label="Toggle language"
              >
                <Globe className="h-3.5 w-3.5" />
                {lang.toUpperCase()}
              </button>
            )}
            {flags.header.dark_mode && (
              <button
                onClick={toggleTheme}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background hover:bg-accent"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}
          </div>

          <Link
            to="/contact"
            className="hidden md:inline-flex ml-2 items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            Book now
          </Link>

          {menu.length > 0 && (
            <button
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
            {menu.map((m) => (
              <Link
                key={m.id}
                to={m.url}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
              >
                {m.label}
              </Link>
            ))}
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Book now
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
