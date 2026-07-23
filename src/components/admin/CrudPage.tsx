import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteRow, listRows, upsertRow } from "@/lib/admin.functions";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { ImageUploadField } from "./ImageUploadField";

export type FieldDef =
  | { key: string; label: string; type: "text" | "number" | "url" | "textarea" | "boolean" | "image" | "images" }
  | { key: string; label: string; type: "select"; options: { label: string; value: string }[] };


export function CrudPage({
  title, table, fields, searchKeys = ["title", "name", "label", "heading"],
}: {
  title: string;
  table: string;
  fields: FieldDef[];
  searchKeys?: string[];
}) {
  const qc = useQueryClient();
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin-list", table],
    queryFn: () => listRows({ data: { table: table as any } }),
  });
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Record<string, any> | null>(null);

  const filtered = useMemo(() => {
    if (!search) return rows;
    const s = search.toLowerCase();
    return rows.filter((r: any) =>
      searchKeys.some((k) => (r[k] ?? "").toString().toLowerCase().includes(s)),
    );
  }, [rows, search, searchKeys]);

  async function save(row: any) {
    await upsertRow({ data: { table: table as any, row } });
    qc.invalidateQueries({ queryKey: ["admin-list", table] });
    setEditing(null);
  }
  async function remove(id: string) {
    if (!confirm("Delete this item?")) return;
    await deleteRow({ data: { table: table as any, id } });
    qc.invalidateQueries({ queryKey: ["admin-list", table] });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">Manage {title.toLowerCase()}.</p>
        </div>
        <button
          onClick={() => setEditing({ active: true, sort: rows.length })}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              {fields.slice(0, 4).map((f) => (
                <th key={f.key} className="px-4 py-2 font-medium">{f.label}</th>
              ))}
              <th className="px-4 py-2 font-medium">Active</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td className="p-4 text-muted-foreground" colSpan={fields.length + 2}>Loading…</td></tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr><td className="p-4 text-muted-foreground" colSpan={fields.length + 2}>No items yet.</td></tr>
            )}
            {filtered.map((r: any) => (
              <tr key={r.id} className="border-t border-border">
                {fields.slice(0, 4).map((f) => (
                  <td key={f.key} className="px-4 py-2 align-top max-w-xs truncate">{String(r[f.key] ?? "—")}</td>
                ))}
                <td className="px-4 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${r.active === false ? "bg-muted text-muted-foreground" : "bg-green-500/10 text-green-600"}`}>
                    {r.active === false ? "inactive" : "active"}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => setEditing(r)} className="mr-2 rounded-md p-1.5 hover:bg-accent"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(r.id)} className="rounded-md p-1.5 hover:bg-accent text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditModal fields={fields} row={editing} onCancel={() => setEditing(null)} onSave={save} />
      )}
    </div>
  );
}

function EditModal({
  fields, row, onCancel, onSave,
}: { fields: FieldDef[]; row: any; onCancel: () => void; onSave: (r: any) => void }) {
  const [form, setForm] = useState<any>(row);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl bg-card text-card-foreground border border-border shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold">{row.id ? "Edit" : "New"}</h2>
        <div className="mt-4 space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium mb-1">{f.label}</label>
              {f.type === "textarea" ? (
                <textarea
                  rows={5}
                  value={form[f.key] ?? ""}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              ) : f.type === "boolean" ? (
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })}
                  />
                  Enabled
                </label>
              ) : f.type === "image" || f.type === "images" ? (
                <ImageUploadField
                  value={form[f.key]}
                  multiple={f.type === "images"}
                  onChange={(v) => setForm({ ...form, [f.key]: v })}
                />
              ) : f.type === "select" ? (
                <select
                  value={form[f.key] ?? ""}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {(f as any).options.map((o: any) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type === "number" ? "number" : "text"}
                  value={form[f.key] ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [f.key]: f.type === "number" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value,
                    })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-md border border-border px-4 py-2 text-sm">Cancel</button>
          <button onClick={() => onSave(form)} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Save</button>
        </div>
      </div>
    </div>
  );
}
