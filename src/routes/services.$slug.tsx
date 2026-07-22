import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import * as Icons from "lucide-react";
import { getServiceBySlug, getSiteData } from "@/lib/public-content.functions";
import { SiteLayout } from "@/components/site/SiteLayout";

const siteQuery = queryOptions({ queryKey: ["site-data"], queryFn: () => getSiteData(), staleTime: 60_000 });

export const Route = createFileRoute("/services/$slug")({
  loader: async ({ context, params }) => {
    const [service] = await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: ["service", params.slug],
        queryFn: () => getServiceBySlug({ data: { slug: params.slug } }),
      }),
      context.queryClient.ensureQueryData(siteQuery),
    ]);
    if (!service) throw notFound();
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    return {
      meta: [
        { title: `Service — Northline` },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/services/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/services/${params.slug}` }],
    };
  },
  component: ServiceDetail,
});

function ServiceDetail() {
  const { slug } = Route.useParams();
  const { data: site } = useSuspenseQuery(siteQuery);
  const { data: service } = useSuspenseQuery(
    queryOptions({
      queryKey: ["service", slug],
      queryFn: () => getServiceBySlug({ data: { slug } }),
    }),
  );
  const Icon = service?.icon ? ((Icons as any)[service.icon] as any) : null;

  return (
    <SiteLayout settings={site.settings} menu={site.menu}>
      <article className="mx-auto max-w-3xl px-4 md:px-6 py-20">
        <Link to="/services" className="text-sm text-muted-foreground hover:text-foreground">← All services</Link>
        <div className="mt-4 flex items-center gap-3">
          {Icon && (
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </div>
          )}
          <h1 className="text-4xl font-bold tracking-tight">{service?.title}</h1>
        </div>
        {service?.summary && <p className="mt-4 text-lg text-muted-foreground">{service.summary}</p>}
        <div className="mt-8 whitespace-pre-wrap text-muted-foreground leading-relaxed">{service?.body}</div>
        <div className="mt-10">
          <Link to="/contact" className="inline-flex rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground">
            Get a quote for {service?.title}
          </Link>
        </div>
      </article>
    </SiteLayout>
  );
}
