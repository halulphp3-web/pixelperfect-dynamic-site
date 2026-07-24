import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import * as Icons from "lucide-react";
import { ArrowRight, BedDouble, Bath, Users, MapPin, Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";
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

const HERO_FALLBACK_IMAGE = "/hero-stays.jpg";

function getHeroImageUrl(value: unknown) {
  if (typeof value !== "string") return HERO_FALLBACK_IMAGE;
  const url = value.trim();
  if (!url || url === "null" || url === "undefined") return HERO_FALLBACK_IMAGE;
  return url;
}

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
  const { currency } = useSite();
  const { data: allProps = [] } = useQuery(allPropsQuery);
  const [filter, setFilter] = useState<{ destination: string; guests: number } | null>(null);

  // Hero slides — normalize image URLs and keep a local fallback behind them.
  const heroSlides = (hero ?? [])
    .map((h) => ({
      image_url: getHeroImageUrl(h.image_url),
      heading: h.heading ?? settings?.tagline ?? "Feel at home, wherever you land.",
      subheading: h.subheading ?? "Design-led apartments and villas across Dubai's best neighbourhoods.",
    }));
  const slides = heroSlides.length
    ? heroSlides
    : [{
        image_url: HERO_FALLBACK_IMAGE,
        heading: hero[0]?.heading ?? settings?.tagline ?? "Feel at home, wherever you land.",
        subheading: hero[0]?.subheading ?? "Design-led apartments and villas across Dubai's best neighbourhoods.",
      }];
  const [slideIdx, setSlideIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useRef(false);
  useEffect(() => {
    reducedMotion.current = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  }, []);
  useEffect(() => {
    if (slides.length <= 1 || paused || reducedMotion.current) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setSlideIdx((i) => (i + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, [slides.length, paused]);
  const goPrev = () => setSlideIdx((i) => (i - 1 + slides.length) % slides.length);
  const goNext = () => setSlideIdx((i) => (i + 1) % slides.length);
  const active = slides[slideIdx] ?? slides[0];


  const results = filter
    ? allProps.filter((p) => {
        if (filter.guests && p.guests < filter.guests) return false;
        if (filter.destination) {
          const s = filter.destination.toLowerCase();
          const hay = `${p.title} ${p.location ?? ""} ${p.property_type ?? ""}`.toLowerCase();
          if (!hay.includes(s)) return false;
        }
        return true;
      })
    : [];

  const allLocations = (allProps.length ? allProps : featuredProperties)
    .map((p) => p.location)
    .filter(Boolean) as string[];

  return (
    <SiteLayout
      settings={settings}
      menu={menu}
      locations={allLocations}
      onHeaderSearch={(v) => {
        setFilter({ destination: v.destination, guests: v.guests });
        setTimeout(() => document.getElementById("home-results")?.scrollIntoView({ behavior: "smooth" }), 50);
      }}
    >
      {/* HERO */}
      {flags.home.hero && (
        <section
          className="relative isolate overflow-hidden bg-muted"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="absolute inset-0 z-0">
            <img
              src={HERO_FALLBACK_IMAGE}
              alt=""
              width={1920}
              height={1080}
              loading="eager"
              className="absolute inset-0 h-full w-full object-cover"
            />
            {slides.map((s, i) => (
              <img
                key={i}
                src={s.image_url}
                alt=""
                width={1920}
                height={1080}
                loading={i === slideIdx ? "eager" : "lazy"}
                {...(i === slideIdx ? { fetchPriority: "high" as const } : {})}
                onError={(e) => {
                  const t = e.currentTarget;
                  if (!t.src.endsWith(HERO_FALLBACK_IMAGE)) t.src = HERO_FALLBACK_IMAGE;
                }}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                  i === slideIdx ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 pt-20 sm:pt-28 md:pt-36 pb-20 sm:pb-28 md:pb-40 text-white">
            <div key={slideIdx} className="max-w-3xl animate-fade-in">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                {active.heading}
              </h1>
              <p className="mt-4 sm:mt-5 text-base sm:text-lg text-white/85 max-w-xl">
                {active.subheading}
              </p>
            </div>
          </div>


          {slides.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous slide"
                onClick={goPrev}
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 grid place-items-center h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm transition"
              >
                <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={goNext}
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 grid place-items-center h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm transition"
              >
                <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
              </button>
              <div className="absolute bottom-6 md:bottom-10 left-0 right-0 z-20 flex justify-center gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => setSlideIdx(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === slideIdx ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
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

      {/* FEATURED PROPERTIES / SEARCH RESULTS */}
      {flags.home.properties && (featuredProperties.length > 0 || filter) && (
        <section id="home-results" className="mx-auto max-w-7xl px-4 md:px-6 py-20">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div className="max-w-2xl">
              <div className="text-sm font-medium text-primary">{filter ? "Search results" : "Featured stays"}</div>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">
                {filter
                  ? `${results.length} stay${results.length === 1 ? "" : "s"} match your search`
                  : "Handpicked homes, ready when you are"}
              </h2>
              <p className="mt-3 text-muted-foreground">
                {filter
                  ? "Refine your dates and guests to see more options."
                  : "Every property is inspected, styled, and supported by a real team on the ground."}
              </p>
            </div>
            {filter ? (
              <button onClick={() => setFilter(null)} className="text-sm font-medium text-primary hover:underline">
                Clear search
              </button>
            ) : (
              <Link to="/properties" className="text-sm font-medium text-primary hover:underline">
                View all →
              </Link>
            )}
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(filter ? results : featuredProperties).map((p) => (
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
            {filter && results.length === 0 && (
              <div className="col-span-full rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
                No stays match. Try different filters.
              </div>
            )}
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
