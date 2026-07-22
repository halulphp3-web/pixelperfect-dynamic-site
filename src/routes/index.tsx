import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import * as Icons from "lucide-react";
import { ArrowRight, Quote, Star } from "lucide-react";
import { getSiteData } from "@/lib/public-content.functions";
import { SiteLayout } from "@/components/site/SiteLayout";

const siteQuery = queryOptions({
  queryKey: ["site-data"],
  queryFn: () => getSiteData(),
  staleTime: 60_000,
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(siteQuery),
  head: () => ({
    meta: [
      { title: "Northline Services — Facility management done right" },
      {
        name: "description",
        content:
          "Reliable facility, cleaning, maintenance, security, landscaping, and logistics services for modern businesses.",
      },
      { property: "og:title", content: "Northline Services" },
      { property: "og:description", content: "Facility management and business services." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Icon({ name, className }: { name?: string | null; className?: string }) {
  if (!name) return null;
  const C = (Icons as any)[name] as any;
  return C ? <C className={className} /> : null;
}

function Home() {
  const { data } = useSuspenseQuery(siteQuery);
  const { settings, menu, hero, services, features, stats, testimonials } = data;
  const first = hero[0];

  return (
    <SiteLayout settings={settings} menu={menu}>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-accent/30" />
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-20 md:py-28 grid gap-10 md:grid-cols-2 md:items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary" /> Trusted by 350+ businesses
            </div>
            <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              {first?.heading ?? settings?.tagline}
            </h1>
            {first?.subheading && (
              <p className="mt-5 text-lg text-muted-foreground max-w-xl">{first.subheading}</p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={(first?.cta_url as any) ?? "/services"}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                {first?.cta_label ?? "Explore services"} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center rounded-md border border-border bg-background px-5 py-3 text-sm font-medium hover:bg-accent"
              >
                Contact us
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative aspect-[4/3] rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/40" />
              <div className="absolute inset-6 grid grid-cols-2 gap-4">
                {services.slice(0, 4).map((s) => (
                  <div key={s.id} className="rounded-xl bg-background/70 backdrop-blur p-4 border border-border">
                    <Icon name={s.icon} className="h-6 w-6 text-primary" />
                    <div className="mt-3 text-sm font-semibold">{s.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      {stats.length > 0 && (
        <section className="border-y border-border bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 md:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.id} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-foreground">
                  {s.value}
                  <span className="text-primary">{s.suffix}</span>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SERVICES */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-20">
        <div className="max-w-2xl">
          <div className="text-sm font-medium text-primary">What we do</div>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">Services built for the way you work</h2>
          <p className="mt-3 text-muted-foreground">
            One partner, one point of contact, and teams that show up when they say they will.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
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
              <div className="mt-4 inline-flex items-center gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition">
                Learn more <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      {features.length > 0 && (
        <section className="bg-muted/30 border-y border-border">
          <div className="mx-auto max-w-7xl px-4 md:px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-sm font-medium text-primary">Why us</div>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">Boring reliability, done well</h2>
              <p className="mt-3 text-muted-foreground">
                No mystery invoices, no vanishing crews. Just steady, high-quality service work.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((f) => (
                <div key={f.id} className="rounded-xl bg-background border border-border p-5">
                  <Icon name={f.icon} className="h-5 w-5 text-primary" />
                  <div className="mt-3 font-semibold">{f.title}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 md:px-6 py-20">
          <div className="max-w-2xl">
            <div className="text-sm font-medium text-primary">Kind words</div>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">What clients say</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.id} className="rounded-xl border border-border bg-card p-6">
                <Quote className="h-6 w-6 text-primary/40" />
                <p className="mt-3 text-sm">{t.quote}</p>
                <div className="mt-4 flex items-center gap-1 text-yellow-500">
                  {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <div className="mt-3 text-sm font-semibold">{t.name}</div>
                {t.role && <div className="text-xs text-muted-foreground">{t.role}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 pb-24">
        <div className="rounded-2xl bg-primary text-primary-foreground p-10 md:p-14 grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold">Ready to hand over the details?</h3>
            <p className="mt-2 text-primary-foreground/80">Tell us what you need — we'll come back with a plan and a price.</p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center rounded-md bg-background text-foreground px-6 py-3 font-medium hover:opacity-90"
          >
            Start a conversation
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
