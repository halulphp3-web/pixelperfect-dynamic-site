import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import * as Icons from "lucide-react";
import { ArrowRight } from "lucide-react";
import { getSiteData } from "@/lib/public-content.functions";
import { SiteLayout } from "@/components/site/SiteLayout";

const siteQuery = queryOptions({ queryKey: ["site-data"], queryFn: () => getSiteData(), staleTime: 60_000 });

export const Route = createFileRoute("/services/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(siteQuery),
  head: () => ({
    meta: [
      { title: "Services — Northline" },
      { name: "description", content: "Facility, cleaning, maintenance, security, landscaping, and logistics services." },
      { property: "og:title", content: "Services — Northline" },
      { property: "og:description", content: "Facility, cleaning, maintenance, security, landscaping, and logistics services." },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesIndex,
});

function Icon({ name, className }: { name?: string | null; className?: string }) {
  const C = name ? ((Icons as any)[name] as any) : null;
  return C ? <C className={className} /> : null;
}

function ServicesIndex() {
  const { data } = useSuspenseQuery(siteQuery);
  return (
    <SiteLayout settings={data.settings} menu={data.menu}>
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-20">
        <div className="max-w-2xl">
          <div className="text-sm font-medium text-primary">Services</div>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight">Everything your building needs, from one team</h1>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.services.map((s) => (
            <Link
              key={s.id}
              to="/services/$slug"
              params={{ slug: s.slug }}
              className="group rounded-xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-md transition"
            >
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon name={s.icon} className="h-5 w-5" />
              </div>
              <div className="mt-4 font-semibold">{s.title}</div>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{s.summary}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-sm text-primary">
                Learn more <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
