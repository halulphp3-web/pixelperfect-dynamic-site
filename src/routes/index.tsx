import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import * as Icons from "lucide-react";
import { ArrowRight, BedDouble, Bath, Users, MapPin, Quote, Star } from "lucide-react";
import { getSiteData, listProperties } from "@/lib/public-content.functions";
import { SiteLayout, useFlags } from "@/components/site/SiteLayout";
import { SearchBar } from "@/components/site/SearchBar";
import { useSite } from "@/lib/site-context";
import { formatPrice } from "@/lib/currency";

const siteQuery = queryOptions({
  queryKey: ["site-data"],
  queryFn: () => getSiteData(),
  staleTime: 60_000,
});
const allPropsQuery = queryOptions({
  queryKey: ["properties", "all"],
  queryFn: () => listProperties({ data: {} }),
  staleTime: 30_000,
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(siteQuery),
  head: () => ({
    meta: [
      { title: "Curated holiday homes in Dubai — book with confidence" },
      {
        name: "description",
        content:
          "Hand-picked apartments, villas, and studios across Dubai. Verified hosts, 24/7 support, easy check-in.",
      },
      { property: "og:title", content: "Curated holiday homes in Dubai — book with confidence" },
      { property: "og:description", content: "Hand-picked apartments, villas, and studios across Dubai. Verified hosts, 24/7 support, easy check-in." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { property: "og:image", content: "/hero-stays.jpg" },
      { name: "twitter:image", content: "/hero-stays.jpg" },
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
  const { settings, menu, hero, services, features, stats, testimonials, featuredProperties } = data;
  const flags = useFlags(settings);
  const first = hero[0];
  const { currency } = useSite();

  return (
    <SiteLayout
      settings={settings}
      menu={menu}
      locations={featuredProperties.map((p) => p.location).filter(Boolean) as string[]}
    >


      {/* HERO */}
      {flags.home.hero && (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <img
              src={first?.image_url ?? "/hero-stays.jpg"}
              alt=""
              width={1920}
              height={1080}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
          </div>
          <div className="mx-auto max-w-7xl px-4 md:px-6 pt-24 md:pt-36 pb-28 md:pb-40 text-white">
            <div className="max-w-3xl animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                {first?.heading ?? settings?.tagline ?? "Feel at home, wherever you land."}
              </h1>
              <p className="mt-5 text-lg text-white/85 max-w-xl">
                {first?.subheading ??
                  "Design-led apartments and villas across Dubai's best neighbourhoods."}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* STATS */}
      {flags.home.stats && stats.length > 0 && (
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

      {/* FEATURED PROPERTIES */}
      {flags.home.properties && featuredProperties.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 md:px-6 py-20">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div className="max-w-2xl">
              <div className="text-sm font-medium text-primary">Featured stays</div>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">Handpicked homes, ready when you are</h2>
              <p className="mt-3 text-muted-foreground">
                Every property is inspected, styled, and supported by a real team on the ground.
              </p>
            </div>
            <Link to="/properties" className="text-sm font-medium text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProperties.map((p) => (
              <Link
                key={p.id}
                to="/properties/$slug"
                params={{ slug: p.slug }}
                className="group overflow-hidden rounded-2xl border border-border bg-card hover:shadow-lg transition"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  {p.cover_image_url && (
                    <img
                      src={p.cover_image_url}
                      alt={p.title}
                      loading="lazy"
                      width={1600}
                      height={1067}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {p.location}
                  </div>
                  <div className="mt-1.5 font-semibold line-clamp-1">{p.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.summary}</div>
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />{p.bedrooms}</span>
                    <span className="inline-flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{p.bathrooms}</span>
                    <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{p.guests}</span>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-lg font-bold">{formatPrice(Number(p.price_per_night), currency)}</span>
                      <span className="text-xs text-muted-foreground"> / night</span>
                    </div>
                    <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition">View →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* SERVICES */}
      {flags.home.services && services.length > 0 && (
        <section className="bg-muted/30 border-y border-border">
          <div className="mx-auto max-w-7xl px-4 md:px-6 py-20">
            <div className="max-w-2xl">
              <div className="text-sm font-medium text-primary">Concierge</div>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">Everything taken care of</h2>
              <p className="mt-3 text-muted-foreground">
                From arrival to checkout, our team is one message away.
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
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURES */}
      {flags.home.features && features.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 md:px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-sm font-medium text-primary">Why book with us</div>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">Comfort, without surprises</h2>
            <p className="mt-3 text-muted-foreground">
              Real photos, honest descriptions, and hosts who actually pick up the phone.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((f) => (
              <div key={f.id} className="rounded-xl bg-card border border-border p-5">
                <Icon name={f.icon} className="h-5 w-5 text-primary" />
                <div className="mt-3 font-semibold">{f.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {flags.home.testimonials && testimonials.length > 0 && (
        <section className="bg-muted/30 border-y border-border">
          <div className="mx-auto max-w-7xl px-4 md:px-6 py-20">
            <div className="max-w-2xl">
              <div className="text-sm font-medium text-primary">Guest reviews</div>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">Loved by travellers</h2>
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
          </div>
        </section>
      )}

      {/* CTA */}
      {flags.home.cta && (
        <section className="mx-auto max-w-7xl px-4 md:px-6 py-24">
          <div className="rounded-2xl bg-primary text-primary-foreground p-10 md:p-14 grid md:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold">Not sure where to stay?</h3>
              <p className="mt-2 text-primary-foreground/85">
                Share your dates and vibe — we'll suggest three homes that fit.
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-md bg-background text-foreground px-6 py-3 font-medium hover:opacity-90"
            >
              Get recommendations
            </Link>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
