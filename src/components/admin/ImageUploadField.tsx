import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function ImageUploadField({
  value,
  onChange,
  multiple = false,
}: {
  value: string | string[] | null | undefined;
  onChange: (v: string | string[]) => void;
  multiple?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urls: string[] = multiple
    ? Array.isArray(value)
      ? (value as string[])
      : typeof value === "string" && value
      ? tryParseArray(value)
      : []
    : value
    ? [value as string]
    : [];

  async function upload(files: FileList) {
    setError(null);
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("property-images")
          .upload(path, file, { cacheControl: "3600", contentType: file.type || undefined, upsert: false });
        if (upErr) throw upErr;
        // Bucket is private (workspace policy blocks public buckets); use a
        // long-lived signed URL so images render on the public site.
        const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
        const { data: signed, error: signErr } = await supabase.storage
          .from("property-images")
          .createSignedUrl(path, TEN_YEARS);
        if (signErr) throw signErr;
        if (!signed?.signedUrl) throw new Error("Uploaded image URL could not be created");
        uploaded.push(signed.signedUrl);
      }
      if (multiple) onChange([...urls, ...uploaded]);
      else onChange(uploaded[0]);
    } catch (e: any) {
      setError(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(u: string) {
    if (multiple) onChange(urls.filter((x) => x !== u));
    else onChange("");
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {urls.map((u) => (
          <div key={u} className="relative h-20 w-28 overflow-hidden rounded-md border border-border bg-muted">
            <img src={u} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(u)}
              className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/70 text-white hover:bg-black"
              aria-label="Remove"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex h-20 w-28 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border text-xs text-muted-foreground hover:bg-accent"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Uploading" : "Upload"}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => e.target.files && upload(e.target.files)}
      />
      <input
        type="text"
        value={multiple ? JSON.stringify(urls) : urls[0] ?? ""}
        onChange={(e) => {
          if (multiple) {
            try {
              onChange(JSON.parse(e.target.value));
            } catch {
              /* ignore */
            }
          } else onChange(e.target.value);
        }}
        placeholder={multiple ? '["https://..."]' : "https://..."}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-muted-foreground"
      />
      {error && <div className="text-xs text-destructive">{error}</div>}
    </div>
  );
}

function tryParseArray(v: string): string[] {
  try {
    const p = JSON.parse(v);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}
