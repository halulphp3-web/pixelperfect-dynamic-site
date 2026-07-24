import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { BedDouble, Bath, Users, MapPin, Check, Clock, CalendarDays, MessageCircle, ShieldCheck } from "lucide-react";
import { format, differenceInCalendarDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { getPropertyBySlug, getSiteData, listProperties } from "@/lib/public-content.functions";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useSite } from "@/lib/site-context";
import { formatPrice, convertFromAED, CURRENCY_SYMBOL } from "@/lib/currency";
import { MapEmbed } from "@/components/site/MapEmbed";
import { GalleryLightbox } from "@/components/site/GalleryLightbox";

const siteQuery = queryOptions({ queryKey: ["site-data"], queryFn: () => getSiteData(), staleTime: 60_000 });
const propsListQuery = queryOptions({
  queryKey: ["properties", "all"],
  queryFn: () => listProperties({ data: {} }),
  staleTime: 30_000,
});

export const Route = createFileRoute("/properties/$slug")({
  loader: async ({ context, params }) => {
    const [_, __, prop] = await Promise.all([
      context.queryClient.ensureQueryData(siteQuery),
      context.queryClient.ensureQueryData(propsListQuery),
      context.queryClient.ensureQueryData(
        queryOptions({
          queryKey: ["property", params.slug],
          queryFn: () => getPropertyBySlug({ data: { slug: params.slug } }),
          staleTime: 60_000,
        }),
      ),
    ]);
    if (!prop) throw notFound();
    return prop;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Stay unavailable" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    return {
      meta: [
        { title: `${loaderData.title} — book this stay` },
        { name: "description", content: loaderData.summary ?? "" },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.summary ?? "" },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/properties/${params.slug}` },
        ...(loaderData.cover_image_url
          ? [
              { property: "og:image", content: loaderData.cover_image_url },
              { name: "twitter:image", content: loaderData.cover_image_url },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: `/properties/${params.slug}` }],
    };
  },
  component: PropertyDetail,
});

function PropertyDetail() {
  const { data: site } = useSuspenseQuery(siteQuery);
  const { data: allProps } = useSuspenseQuery(propsListQuery);
  const p = Route.useLoaderData();
  const { currency } = useSite();
  const toList = (v: any): string[] => {
    if (Array.isArray(v)) return v.filter(Boolean).map(String);
    if (typeof v === "string" && v.trim()) {
      try {
        const j = JSON.parse(v);
        if (Array.isArray(j)) return j.filter(Boolean).map(String);
      } catch {}
      return v.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };
  const gallery = toList(p.gallery_urls);
  const amenities = toList(p.amenities);
  const highlights = toList(p.highlights);

  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState<number>(p.guests ?? 2);
  const [openDates, setOpenDates] = useState(false);
  const [openGuests, setOpenGuests] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const lightboxImages = [p.cover_image_url, ...gallery].filter(Boolean) as string[];
  const relatedList = allProps.filter((x) => x.id !== p.id && x.location === p.location).slice(0, 3);

  const nights = range?.from && range?.to ? Math.max(0, differenceInCalendarDays(range.to, range.from)) : 0;
  const pricePerNight = Number(p.price_per_night ?? 0);
  const feesAed = 310;
  const stayTotalAed = pricePerNight * nights + (nights > 0 ? feesAed : 0);
  const sym = CURRENCY_SYMBOL[currency] ?? currency;
  const fmt = (aed: number) => `${sym} ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(convertFromAED(aed, currency))}`;

  const waNumber = site.settings?.whatsapp?.replace(/\D/g, "");
  const waText = encodeURIComponent(
    `Hi! I'd like to book ${p.title}${range?.from && range?.to ? ` from ${format(range.from, "yyyy-MM-dd")} to ${format(range.to, "yyyy-MM-dd")}` : ""} for ${guests} guest${guests === 1 ? "" : "s"}.`,
  );


  return (
    <SiteLayout settings={site.settings} menu={site.menu}>
      <section className="mx-auto max-w-7xl px-4 md:px-6 pt-8">
        <div className="text-sm text-muted-foreground">
          <Link to="/properties" className="hover:text-foreground">Stays</Link> / <span>{p.location}</span>
        </div>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">{p.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {p.location}</span>
          <span className="inline-flex items-center gap-1"><BedDouble className="h-4 w-4" /> {p.bedrooms} bed</span>
          <span className="inline-flex items-center gap-1"><Bath className="h-4 w-4" /> {p.bathrooms} bath</span>
          <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" /> {p.guests} guests</span>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-6 mt-6">
        <div className="grid gap-2 sm:gap-3 grid-cols-2 md:grid-cols-4 md:grid-rows-2 md:h-[480px]">
          <button
            type="button"
            onClick={() => setLightboxIndex(0)}
            className="col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto overflow-hidden rounded-2xl bg-muted text-left"
          >
            {p.cover_image_url && (
              <img
                src={p.cover_image_url}
                alt={p.title}
                width={1600}
                height={1067}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            )}
          </button>
          {gallery.slice(0, 4).map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setLightboxIndex(i + 1)}
              className={`overflow-hidden rounded-2xl bg-muted aspect-[4/3] md:aspect-auto ${i >= 2 ? "hidden sm:block" : ""}`}
            >
              <img src={src} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
            </button>
          ))}
        </div>
      </section>


      <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-bold">About this stay</h2>
            <p className="mt-3 text-muted-foreground whitespace-pre-line">{p.description ?? p.summary}</p>
          </div>

          {highlights.length > 0 && (
            <div className="mt-6 rounded-2xl border border-border bg-card p-6">
              <h2 className="text-xl font-bold">Highlights</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 text-primary" /> {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {amenities.length > 0 && (
            <div className="mt-6 rounded-2xl border border-border bg-card p-6">
              <h2 className="text-xl font-bold">Amenities</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {amenities.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary" /> {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-border bg-card p-6 grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <div>
                <div className="font-medium">Check-in</div>
                <div className="text-muted-foreground">{p.check_in_time ?? "15:00"}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <div>
                <div className="font-medium">Check-out</div>
                <div className="text-muted-foreground">{p.check_out_time ?? "11:00"}</div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Location</h2>
              {p.location && (
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {p.location}
                </span>
              )}
            </div>
            <div className="mt-4">
              <MapEmbed points={[{ lat: Number(p.lat), lng: Number(p.lng) }]} height={360} />
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 h-fit rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-primary">Best available rate</div>
          <h3 className="mt-1 text-2xl font-bold">Reserve your stay</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose your dates to see live availability and pricing.
          </p>

          <div className="mt-5 space-y-3">
            <Popover open={openDates} onOpenChange={setOpenDates}>
              <PopoverTrigger asChild>
                <button type="button" className="flex w-full items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-left hover:border-primary/60 transition">
                  <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Check-in / Check-out</div>
                    <div className="mt-0.5 text-sm font-medium">
                      {range?.from
                        ? range.to
                          ? `${format(range.from, "MMM dd")} → ${format(range.to, "MMM dd")}`
                          : format(range.from, "MMM dd, yyyy")
                        : "Choose the date"}
                    </div>
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 pointer-events-auto bg-white" align="start">
                <div className="p-2">
                  <Calendar
                    mode="range"
                    numberOfMonths={2}
                    selected={range}
                    onSelect={setRange}
                    disabled={{ before: new Date() }}
                    className="p-3 pointer-events-auto"
                  />
                  <div className="flex items-center justify-between border-t border-border px-3 py-2">
                    <button type="button" onClick={() => setRange(undefined)} className="text-xs font-medium text-muted-foreground hover:text-foreground">Clear</button>
                    <button type="button" onClick={() => setOpenDates(false)} className="rounded-md bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90">Done</button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover open={openGuests} onOpenChange={setOpenGuests}>
              <PopoverTrigger asChild>
                <button type="button" className="flex w-full items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-left hover:border-primary/60 transition">
                  <Users className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Guests</div>
                    <div className="mt-0.5 text-sm font-medium">{guests} guest{guests === 1 ? "" : "s"}</div>
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3 pointer-events-auto bg-white" align="start">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Guests</div>
                    <div className="text-xs text-slate-500">Max {p.guests ?? 16}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} className="h-8 w-8 rounded-full border border-border text-lg leading-none hover:bg-accent">−</button>
                    <span className="w-6 text-center text-sm font-medium text-slate-900">{guests}</span>
                    <button type="button" onClick={() => setGuests((g) => Math.min(p.guests ?? 16, g + 1))} className="h-8 w-8 rounded-full border border-border text-lg leading-none hover:bg-accent">+</button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {!showAvailability ? (
            <>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-2xl font-bold">{formatPrice(pricePerNight, currency)}</span>
                <span className="text-xs text-muted-foreground">/ night · from</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAvailability(true)}
                style={{ backgroundColor: "#c9a15a" }}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold text-white hover:brightness-110 transition"
              >
                Check live availability
              </button>
            </>
          ) : (
            <div className="mt-4 rounded-xl border border-border bg-background p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                <Check className="h-4 w-4" /> Available for your dates
              </div>
              {range?.from && range?.to ? (
                <div className="mt-1 text-xs text-muted-foreground">
                  {format(range.from, "yyyy-MM-dd")} → {format(range.to, "yyyy-MM-dd")} · {nights} night{nights === 1 ? "" : "s"}
                </div>
              ) : (
                <div className="mt-1 text-xs text-muted-foreground">Select your dates above to see totals.</div>
              )}

              {nights > 0 && (
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Average nightly rate</span>
                    <span className="font-medium">{fmt(pricePerNight)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Fees</span>
                    <span className="font-medium">{fmt(feesAed)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
                    <span className="font-semibold">Stay total</span>
                    <span className="text-lg font-bold">{fmt(stayTotalAed)}</span>
                  </div>
                </div>
              )}

              {waNumber && (
                <a
                  href={`https://wa.me/${waNumber}?text=${waText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700"
                >
                  <MessageCircle className="h-4 w-4" /> Book on WhatsApp
                </a>
              )}
              <p className="mt-3 text-[11px] text-muted-foreground text-center">
                Availability and pricing are checked live. Final confirmation is completed by the booking team.
              </p>
            </div>
          )}

          {waNumber && !showAvailability && (
            <a
              href={`https://wa.me/${waNumber}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700"
            >
              <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
            </a>
          )}

          <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> Your booking request is handled securely.
          </p>
        </aside>

      </section>

      {relatedList.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 md:px-6 pb-16">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Related stays</h2>
            <Link to="/properties" className="text-sm font-medium text-primary hover:underline">View all →</Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedList.map((r) => (
              <Link
                key={r.id}
                to="/properties/$slug"
                params={{ slug: r.slug }}
                className="group overflow-hidden rounded-2xl border border-border bg-card hover:shadow-lg transition"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  {r.cover_image_url && (
                    <img src={r.cover_image_url} alt={r.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {r.location}
                  </div>
                  <div className="mt-1.5 font-semibold line-clamp-1">{r.title}</div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-lg font-bold">{formatPrice(Number(r.price_per_night), currency)}</span>
                      <span className="text-xs text-muted-foreground"> / night</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <GalleryLightbox
        images={lightboxImages}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
      />
    </SiteLayout>
  );
}
