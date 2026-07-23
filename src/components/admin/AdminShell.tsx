import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Settings, Wrench, Sparkles, LayoutList, MessageSquare,
  Newspaper, Image as ImageIcon, MenuIcon, Star, Gauge, LogOut, Home, BedDouble,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/settings", label: "Website Settings", icon: Settings },
  { to: "/admin/properties", label: "Properties", icon: BedDouble },
  { to: "/admin/menu", label: "Menu Builder", icon: MenuIcon },
  { to: "/admin/hero", label: "Hero Slides", icon: Sparkles },
  { to: "/admin/services", label: "Concierge Services", icon: Wrench },
  { to: "/admin/features", label: "Features", icon: LayoutList },
  { to: "/admin/stats", label: "Stats / Counters", icon: Gauge },
  { to: "/admin/testimonials", label: "Testimonials", icon: Star },
  { to: "/admin/pages", label: "Pages", icon: Newspaper },
  { to: "/admin/messages", label: "Contact Messages", icon: MessageSquare },
  { to: "/admin/media", label: "Media Library", icon: ImageIcon },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [ok, setOk] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        navigate({ to: "/auth" });
        return;
      }
      try {
        const { getIsAdmin } = await import("@/lib/admin.functions");
        const res = await getIsAdmin();
        setOk(!!res?.isAdmin);
      } catch {
        setOk(false);
      }
      setChecked(true);
    })();
  }, [navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (!checked) return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading…</div>;
  if (!ok)
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <h1 className="text-xl font-bold">Not authorized</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your account doesn't have admin access.</p>
          <button onClick={signOut} className="mt-4 rounded-md border border-border px-4 py-2 text-sm">
            Sign out
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="w-64 shrink-0 border-r border-border bg-card flex flex-col">
        <div className="h-16 flex items-center px-5 border-b border-border font-bold">Admin</div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map((n) => {
            const active = n.exact ? path === n.to : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:bg-accent hover:text-foreground"
                }`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          <Link to="/" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground/70 hover:bg-accent hover:text-foreground">
            <Home className="h-4 w-4" /> View site
          </Link>
          <button onClick={signOut} className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground/70 hover:bg-accent hover:text-foreground">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6">
          <div className="ml-auto flex items-center gap-2">
            <Link to="/" className="text-sm text-foreground/70 hover:text-foreground">View site →</Link>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 bg-background text-foreground">{children}</main>
      </div>
    </div>
  );
}

export function AdminOutlet() {
  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
