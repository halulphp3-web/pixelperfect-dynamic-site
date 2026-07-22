import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Facebook, Instagram, Linkedin, MessageCircle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Settings = Tables<"site_settings"> | null;

export function Footer({ settings }: { settings: Settings }) {
  const socials = (settings?.socials ?? {}) as Record<string, string>;
  const whatsapp = settings?.whatsapp;
  return (
    <footer className="mt-24 bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-16 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="text-xl font-bold text-white">{settings?.site_name}</div>
          <p className="mt-4 text-sm text-slate-400 max-w-sm leading-relaxed">
            {settings?.tagline}
          </p>
        </div>

        <div>
          <div className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-4">Information</div>
          <ul className="space-y-3 text-sm">
            <li><Link to="/" className="text-white hover:text-primary transition">Home</Link></li>
            <li><Link to="/properties" className="text-white hover:text-primary transition">Properties</Link></li>
            <li><Link to="/about" className="text-white hover:text-primary transition">About</Link></li>
            <li><Link to="/contact" className="text-white hover:text-primary transition">Contact</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-4">Contact</div>
          <ul className="space-y-3 text-sm text-slate-300">
            {settings?.email && (
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary shrink-0" />{settings.email}</li>
            )}
            {settings?.phone && (
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary shrink-0" />{settings.phone}</li>
            )}
            {whatsapp && (
              <li>
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                  className="inline-flex items-center gap-2 font-semibold text-white hover:text-primary transition"
                >
                  <MessageCircle className="h-4 w-4 text-primary" />
                  WhatsApp us
                </a>
              </li>
            )}
            {settings?.address && (
              <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />{settings.address}</li>
            )}
          </ul>
        </div>

        <div>
          <div className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-4">Follow Us</div>
          <div className="flex gap-3">
            {socials.facebook && (
              <a href={socials.facebook} className="grid h-10 w-10 place-items-center rounded-full bg-slate-800 hover:bg-primary hover:text-primary-foreground transition" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
            )}
            {socials.instagram && (
              <a href={socials.instagram} className="grid h-10 w-10 place-items-center rounded-full bg-slate-800 hover:bg-primary hover:text-primary-foreground transition" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {socials.linkedin && (
              <a href={socials.linkedin} className="grid h-10 w-10 place-items-center rounded-full bg-slate-800 hover:bg-primary hover:text-primary-foreground transition" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-5 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} {settings?.site_name}. All rights reserved.</span>
          <Link to="/admin" className="hover:text-white transition">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
