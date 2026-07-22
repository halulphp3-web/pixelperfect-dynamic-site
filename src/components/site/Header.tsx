import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Moon, Sun, Globe } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import type { FeatureFlags } from "@/lib/public-content.functions";
import { useSite } from "@/lib/site-context";
import { SearchBar } from "./SearchBar";

type Settings = Tables<"site_settings"> | null;
type MenuItem = Tables<"menu_items">;

export function Header({
  settings,
  flags,
  locations = [],
  onSearch,
  hideSearch = false,
}: {
  settings: Settings;
  menu: MenuItem[];
  flags: FeatureFlags;
  locations?: string[];
  onSearch?: (v: { destination: string; guests: number }) => void;
  hideSearch?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
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
        scrolled ? "bg-background/95 backdrop-blur border-b border-border" : "bg-background/80 backdrop-blur-sm border-b border-border/60"
      }`}
    >
      <div className="mx-auto flex items-center gap-4 max-w-7xl px-4 md:px-6 py-3">
        <Link to="/" className="flex shrink-0 items-center gap-2 font-bold text-lg tracking-tight text-foreground">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt={settings.site_name} className="h-9 w-auto" />
          ) : (
            <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground text-sm">
              {(settings?.site_name ?? "S")[0]}
            </span>
          )}
          <span className="hidden sm:inline whitespace-nowrap">{settings?.site_name ?? "Stays"}</span>
        </Link>

        <div className="flex-1 min-w-0 hidden md:block">
          <SearchBar
            locations={locations}
            variant="header"
            onSubmit={onSearch ? (v) => onSearch({ destination: v.destination, guests: v.guests }) : undefined}
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {flags.header.currency_switcher && (
            <select
              aria-label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="h-9 rounded-md border border-border bg-background px-2 text-xs font-semibold"
            >
              {supportedCurrencies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
          {flags.header.language_switcher && (
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-background px-2 text-xs font-semibold hover:bg-accent"
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
      </div>

      <div className="md:hidden border-t border-border/60 px-4 py-3">
        <SearchBar
          locations={locations}
          variant="header"
          onSubmit={onSearch ? (v) => onSearch({ destination: v.destination, guests: v.guests }) : undefined}
        />
      </div>
    </header>
  );
}
