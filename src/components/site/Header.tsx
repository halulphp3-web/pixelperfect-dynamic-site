import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Moon, Sun, Globe, Check, ChevronDown } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import type { FeatureFlags } from "@/lib/public-content.functions";
import { useSite } from "@/lib/site-context";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const { currency, setCurrency, supportedCurrencies, lang, setLang, supportedLangs, theme, toggleTheme } = useSite();
  const activeLang = supportedLangs.find((l) => l.code === lang) ?? supportedLangs[0];

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

        {!hideSearch && (
          <div className="flex-1 min-w-0 hidden md:block">
            <SearchBar
              locations={locations}
              variant="header"
              onSubmit={onSearch ? (v) => onSearch({ destination: v.destination, guests: v.guests }) : undefined}
            />
          </div>
        )}
        {hideSearch && <div className="flex-1" />}

        <div className="flex shrink-0 items-center gap-2">
          {flags.header.currency_switcher && (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  aria-label="Currency"
                  className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-background px-2.5 text-xs font-semibold hover:bg-accent"
                >
                  {currency}
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-40 p-1">
                <div className="max-h-72 overflow-y-auto">
                  {supportedCurrencies.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent ${
                        c === currency ? "font-semibold" : ""
                      }`}
                    >
                      {c}
                      {c === currency && <Check className="h-3.5 w-3.5 text-primary" />}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
          {flags.header.language_switcher && (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-background px-2.5 text-xs font-semibold hover:bg-accent"
                  aria-label="Language"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {activeLang.code.toUpperCase().split("-")[0]}
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-52 p-1">
                <div className="max-h-72 overflow-y-auto">
                  {supportedLangs.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code)}
                      className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent ${
                        l.code === lang ? "font-semibold" : ""
                      }`}
                    >
                      <span className="truncate">
                        {l.native} <span className="text-muted-foreground">({l.label})</span>
                      </span>
                      {l.code === lang && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
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

      {!hideSearch && (
        <div className="md:hidden border-t border-border/60 px-4 py-3">
          <SearchBar
            locations={locations}
            variant="header"
            onSubmit={onSearch ? (v) => onSearch({ destination: v.destination, guests: v.guests }) : undefined}
          />
        </div>
      )}
    </header>
  );
}
