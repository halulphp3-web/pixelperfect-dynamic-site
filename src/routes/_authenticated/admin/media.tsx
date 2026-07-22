import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Upload } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/media")({
  component: Media,
});

function Media() {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const { data = [] } = useQuery({
    queryKey: ["media-list"],
    queryFn: async () => {
      const { data } = await supabase.from("media").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const { error: upErr } = await supabase.storage.from("media").upload(path, file);
      if (upErr) throw upErr;
      const { data: url } = supabase.storage.from("media").getPublicUrl(path);
      await supabase.from("media").insert({
        path, url: url.publicUrl, mime: file.type, size: file.size,
      });
      qc.invalidateQueries({ queryKey: ["media-list"] });
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function remove(id: string, path: string) {
    if (!confirm("Delete this file?")) return;
    await supabase.storage.from("media").remove([path]);
    await supabase.from("media").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["media-list"] });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-sm text-muted-foreground">Upload images and files to reference elsewhere.</p>
        </div>
        <label className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground cursor-pointer">
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading…" : "Upload"}
          <input type="file" hidden onChange={onUpload} disabled={uploading} />
        </label>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {data.map((m: any) => (
          <div key={m.id} className="rounded-xl border border-border bg-card overflow-hidden group relative">
            {m.mime?.startsWith("image/") ? (
              <img src={m.url} alt="" className="aspect-square w-full object-cover" />
            ) : (
              <div className="aspect-square grid place-items-center text-xs text-muted-foreground">{m.mime}</div>
            )}
            <div className="p-3">
              <div className="text-xs truncate">{m.path}</div>
              <div className="mt-2 flex items-center gap-2">
                <button onClick={() => navigator.clipboard.writeText(m.url)} className="rounded-md border border-border px-2 py-1 text-xs">
                  Copy URL
                </button>
                <button onClick={() => remove(m.id, m.path)} className="rounded-md p-1 hover:bg-accent text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full">No media uploaded yet.</p>
        )}
      </div>
    </div>
  );
}
