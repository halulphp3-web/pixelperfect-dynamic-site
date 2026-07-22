import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteRow, listRows } from "@/lib/admin.functions";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/messages")({
  component: Messages,
});

function Messages() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-list", "contact_messages"],
    queryFn: () => listRows({ data: { table: "contact_messages" } }),
  });
  async function remove(id: string) {
    if (!confirm("Delete this message?")) return;
    await deleteRow({ data: { table: "contact_messages", id } });
    qc.invalidateQueries({ queryKey: ["admin-list", "contact_messages"] });
  }
  return (
    <div>
      <h1 className="text-2xl font-bold">Contact Messages</h1>
      <p className="text-sm text-muted-foreground">Messages sent via the contact form.</p>
      <div className="mt-6 space-y-3">
        {data.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
        {data.map((m: any) => (
          <div key={m.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-semibold">{m.name}</div>
                <div className="text-xs text-muted-foreground">{m.email} {m.phone ? `· ${m.phone}` : ""}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</div>
                <button onClick={() => remove(m.id)} className="rounded-md p-1.5 hover:bg-accent text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {m.subject && <div className="mt-3 text-sm font-medium">{m.subject}</div>}
            <p className="mt-2 text-sm whitespace-pre-wrap">{m.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
