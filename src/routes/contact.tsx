import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { Mail, MapPin, Phone } from "lucide-react";
import { getSiteData, submitContactMessage } from "@/lib/public-content.functions";
import { SiteLayout } from "@/components/site/SiteLayout";

const siteQuery = queryOptions({ queryKey: ["site-data"], queryFn: () => getSiteData(), staleTime: 60_000 });

const schema = z.object({
  name: z.string().trim().min(1, "Required").max(200),
  email: z.string().trim().email("Invalid email").max(320),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Required").max(5000),
});

export const Route = createFileRoute("/contact")({
  loader: ({ context }) => context.queryClient.ensureQueryData(siteQuery),
  head: () => ({
    meta: [
      { title: "Contact — Northline Services" },
      { name: "description", content: "Get in touch — tell us what you need and we'll come back with a plan." },
      { property: "og:title", content: "Contact — Northline" },
      { property: "og:description", content: "Get in touch — tell us what you need and we'll come back with a plan." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const { data: site } = useSuspenseQuery(siteQuery);
  const s = site.settings;
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errMsg, setErrMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setErrMsg("");
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[i.path[0] as string] = i.message));
      setErrors(errs);
      return;
    }
    setStatus("sending");
    try {
      await submitContactMessage({ data: parsed.data });
      setStatus("ok");
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setStatus("error");
      setErrMsg(err?.message ?? "Something went wrong");
    }
  }

  return (
    <SiteLayout settings={s} menu={site.menu}>
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-20 grid gap-12 md:grid-cols-2">
        <div>
          <div className="text-sm font-medium text-primary">Contact</div>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight">Let's talk</h1>
          <p className="mt-3 text-muted-foreground">Send us a message and we'll get back within one business day.</p>
          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            {s?.email && (
              <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary" />{s.email}</li>
            )}
            {s?.phone && (
              <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" />{s.phone}</li>
            )}
            {s?.address && (
              <li className="flex items-start gap-3"><MapPin className="h-4 w-4 mt-0.5 text-primary" />{s.address}</li>
            )}
          </ul>
        </div>
        <form onSubmit={onSubmit} className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-4">
          <Field label="Name" name="name" error={errors.name} />
          <Field label="Email" name="email" type="email" error={errors.email} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Phone" name="phone" error={errors.phone} />
            <Field label="Subject" name="subject" error={errors.subject} />
          </div>
          <Field label="Message" name="message" textarea error={errors.message} />
          <button
            disabled={status === "sending"}
            className="w-full rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Send message"}
          </button>
          {status === "ok" && <p className="text-sm text-green-600">Thanks — we'll be in touch soon.</p>}
          {status === "error" && <p className="text-sm text-destructive">{errMsg || "Failed to send."}</p>}
        </form>
      </section>
    </SiteLayout>
  );
}

function Field({
  label, name, type = "text", textarea, error,
}: { label: string; name: string; type?: string; textarea?: boolean; error?: string }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          rows={5}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      ) : (
        <input
          type={type}
          name={name}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      )}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
