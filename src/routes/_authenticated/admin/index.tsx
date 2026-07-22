import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getAdminOverview } from "@/lib/admin.functions";
import { Wrench, MessageSquare, Star, Newspaper } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data } = useQuery({ queryKey: ["admin-overview"], queryFn: () => getAdminOverview() });
  const c = data?.counts;
  const cards = [
    { label: "Services", value: c?.services ?? 0, icon: Wrench },
    { label: "Testimonials", value: c?.testimonials ?? 0, icon: Star },
    { label: "Pages", value: c?.pages ?? 0, icon: Newspaper },
    { label: "Messages", value: c?.messages ?? 0, icon: MessageSquare },
  ];
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Content overview and recent messages.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{c.label}</div>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-3xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-xl border border-border bg-card">
        <div className="p-5 border-b border-border font-semibold">Recent messages</div>
        <div className="divide-y divide-border">
          {(data?.recent ?? []).map((m: any) => (
            <div key={m.id} className="p-5">
              <div className="flex items-center justify-between text-sm">
                <div className="font-medium">{m.name} <span className="text-muted-foreground">· {m.email}</span></div>
                <div className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</div>
              </div>
              <div className="mt-1 text-sm text-muted-foreground line-clamp-2">{m.message}</div>
            </div>
          ))}
          {(!data?.recent || data.recent.length === 0) && (
            <div className="p-5 text-sm text-muted-foreground">No messages yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
