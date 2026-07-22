import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Settings = Tables<"site_settings"> | null;
type MenuItem = Tables<"menu_items">;

export function Header({ settings, menu }: { settings: Settings; menu: MenuItem[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all ${
        scrolled ? "bg-background/85 backdrop-blur border-b border-border" : "bg-background/40 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight text-foreground">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt={settings.site_name} className="h-8 w-auto" />
          ) : (
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground text-sm">
              {(settings?.site_name ?? "N")[0]}
            </span>
          )}
          <span className="hidden sm:inline">{settings?.site_name ?? "Site"}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {menu.map((m) => (
            <Link
              key={m.id}
              to={m.url}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
              activeProps={{ className: "text-foreground bg-accent" }}
            >
              {m.label}
            </Link>
          ))}
          <Link
            to="/contact"
            className="ml-2 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            Get a quote
          </Link>
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
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
              Get a quote
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
