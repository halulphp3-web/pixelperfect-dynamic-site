import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Settings = Tables<"site_settings"> | null;

export function Footer({ settings }: { settings: Settings }) {
  const socials = (settings?.socials ?? {}) as Record<string, string>;
  return (
    <footer className="mt-24 border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="text-lg font-bold">{settings?.site_name}</div>
          <p className="mt-3 text-sm text-muted-foreground max-w-md">{settings?.tagline}</p>
          <div className="mt-5 flex gap-3">
            {socials.facebook && (
              <a href={socials.facebook} className="rounded-md p-2 hover:bg-accent" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
            )}
            {socials.instagram && (
              <a href={socials.instagram} className="rounded-md p-2 hover:bg-accent" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {socials.linkedin && (
              <a href={socials.linkedin} className="rounded-md p-2 hover:bg-accent" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3">Company</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/services" className="hover:text-foreground">Services</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3">Contact</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {settings?.email && (
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" />{settings.email}</li>
            )}
            {settings?.phone && (
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" />{settings.phone}</li>
            )}
            {settings?.address && (
              <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5" />{settings.address}</li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-5 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} {settings?.site_name}. All rights reserved.</span>
          <Link to="/admin" className="hover:text-foreground">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
