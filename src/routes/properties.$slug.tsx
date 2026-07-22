import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { BedDouble, Bath, Users, MapPin, Check, ArrowRight, Clock } from "lucide-react";
import { getPropertyBySlug, getSiteData } from "@/lib/public-content.functions";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useSite } from "@/lib/site-context";
import { formatPrice } from "@/lib/currency";

const siteQuery = queryOptions({ queryKey: ["site-data"], queryFn: () => getSiteData(), staleTime: 60_000 });

export const Route = createFileRoute("/properties/$slug")({
  loader: async ({ context, params }) => {
    const [_, prop] = await Promise.all([
      context.queryClient.ensureQueryData(siteQuery),
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
  const p = Route.useLoaderData();
  const { currency } = useSite();
  const gallery = (Array.isArray(p.gallery_urls) ? (p.gallery_urls as any[]) : []).filter(Boolean) as string[];
  const amenities = (Array.isArray(p.amenities) ? (p.amenities as any[]) : []) as string[];
  const highlights = (Array.isArray(p.highlights) ? (p.highlights as any[]) : []) as string[];

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
        <div className="grid gap-3 md:grid-cols-4 md:grid-rows-2 md:h-[480px]">
          <div className="md:col-span-2 md:row-span-2 overflow-hidden rounded-2xl bg-muted">
            {p.cover_image_url && (
              <img
                src={p.cover_image_url}
                alt={p.title}
                width={1600}
                height={1067}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          {gallery.slice(0, 4).map((src, i) => (
            <div key={i} className="hidden md:block overflow-hidden rounded-2xl bg-muted">
              <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
            </div>
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
        </div>

        <aside className="lg:sticky lg:top-24 h-fit rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{formatPrice(Number(p.price_per_night), currency)}</span>
            <span className="text-sm text-muted-foreground">/ night</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Approximate — final quote confirmed by the host.</p>

          <Link
            to="/contact"
            search={{ property: p.slug } as any}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Request availability <ArrowRight className="h-4 w-4" />
          </Link>

          {site.settings?.whatsapp && (
            <a
              href={`https://wa.me/${site.settings.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
                `Hi! I'd like to check availability for ${p.title}.`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-border px-5 py-3 text-sm font-medium hover:bg-accent"
            >
              Chat on WhatsApp
            </a>
          )}

          <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs text-muted-foreground">
            <div><div className="text-lg font-semibold text-foreground">{p.bedrooms}</div>Bedrooms</div>
            <div><div className="text-lg font-semibold text-foreground">{p.bathrooms}</div>Bathrooms</div>
            <div><div className="text-lg font-semibold text-foreground">{p.guests}</div>Guests</div>
          </div>
        </aside>
      </section>
    </SiteLayout>
  );
}
