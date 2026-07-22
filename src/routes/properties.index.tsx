import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { BedDouble, Bath, Users, MapPin, Search } from "lucide-react";
import { getSiteData, listProperties } from "@/lib/public-content.functions";
import { SiteLayout, useFlags } from "@/components/site/SiteLayout";
import { useSite } from "@/lib/site-context";
import { formatPrice } from "@/lib/currency";

const siteQuery = queryOptions({ queryKey: ["site-data"], queryFn: () => getSiteData(), staleTime: 60_000 });
const propsQuery = queryOptions({
  queryKey: ["properties", "all"],
  queryFn: () => listProperties({ data: {} }),
  staleTime: 30_000,
});

export const Route = createFileRoute("/properties/")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(siteQuery),
      context.queryClient.ensureQueryData(propsQuery),
    ]),
  head: () => ({
    meta: [
      { title: "Holiday homes & apartments — browse all stays" },
      { name: "description", content: "Browse every property in our Dubai collection. Filter by location, guests, and type." },
      { property: "og:title", content: "Browse holiday homes" },
      { property: "og:description", content: "Every apartment, villa, and studio in one place." },
      { property: "og:url", content: "/properties" },
    ],
    links: [{ rel: "canonical", href: "/properties" }],
  }),
  component: PropertiesPage,
});

function PropertiesPage() {
  const { data: site } = useSuspenseQuery(siteQuery);
  const { data: properties } = useSuspenseQuery(propsQuery);
  const flags = useFlags(site.settings);
  const { currency } = useSite();

  const [search, setSearch] = useState("");
  const [guests, setGuests] = useState(0);
  const [type, setType] = useState<string>("");

  const types = useMemo(
    () => Array.from(new Set(properties.map((p) => p.property_type).filter(Boolean) as string[])),
    [properties],
  );

  const filtered = properties.filter((p) => {
    if (guests && p.guests < guests) return false;
    if (type && p.property_type !== type) return false;
    if (search) {
      const s = search.toLowerCase();
      const hay = `${p.title} ${p.location ?? ""} ${p.property_type ?? ""}`.toLowerCase();
      if (!hay.includes(s)) return false;
    }
    return true;
  });

  return (
    <SiteLayout settings={site.settings} menu={site.menu}>
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 md:px-6 pt-12 pb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Find your next stay</h1>
          <p className="mt-2 text-muted-foreground">{filtered.length} homes available across Dubai.</p>

          {flags.properties_page.filters && (
            <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by neighbourhood, name, or type…"
                  className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2.5 text-sm"
                />
              </div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2.5 text-sm"
              >
                <option value="">Any type</option>
                {types.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="rounded-md border border-input bg-background px-3 py-2.5 text-sm"
              >
                <option value={0}>Any guests</option>
                {[1, 2, 3, 4, 5, 6, 8].map((n) => (
                  <option key={n} value={n}>{n}+ guests</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-6 py-10">
        <div className={flags.properties_page.map ? "grid gap-6 lg:grid-cols-[1fr_360px]" : ""}>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
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
                  </div>
                </div>
              </Link>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
                No stays match your filters yet.
              </div>
            )}
          </div>

          {flags.properties_page.map && (
            <aside className="hidden lg:block sticky top-24 h-[calc(100vh-8rem)] rounded-2xl border border-border bg-muted/40 overflow-hidden">
              <div className="grid h-full place-items-center p-6 text-center text-sm text-muted-foreground">
                <div>
                  <MapPin className="mx-auto h-8 w-8 text-primary/60" />
                  <div className="mt-3 font-semibold text-foreground">Map view</div>
                  <p className="mt-2">Interactive map is coming soon. Toggle this panel off from the admin panel.</p>
                  <ul className="mt-4 space-y-1 text-left">
                    {filtered.slice(0, 6).map((p) => (
                      <li key={p.id} className="text-xs">📍 {p.title} — {p.location}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
