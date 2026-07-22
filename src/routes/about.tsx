import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getPageBySlug, getSiteData } from "@/lib/public-content.functions";
import { SiteLayout } from "@/components/site/SiteLayout";

const siteQuery = queryOptions({ queryKey: ["site-data"], queryFn: () => getSiteData(), staleTime: 60_000 });
const aboutQuery = queryOptions({
  queryKey: ["page", "about"],
  queryFn: () => getPageBySlug({ data: { slug: "about" } }),
  staleTime: 60_000,
});

export const Route = createFileRoute("/about")({
  loader: async ({ context }) => {
    await Promise.all([context.queryClient.ensureQueryData(siteQuery), context.queryClient.ensureQueryData(aboutQuery)]);
  },
  head: () => ({
    meta: [
      { title: "About — Northline Services" },
      { name: "description", content: "Who we are and how we work with the businesses we serve." },
      { property: "og:title", content: "About — Northline Services" },
      { property: "og:description", content: "Who we are and how we work with the businesses we serve." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  const { data: site } = useSuspenseQuery(siteQuery);
  const { data: page } = useSuspenseQuery(aboutQuery);
  return (
    <SiteLayout settings={site.settings} menu={site.menu}>
      <section className="mx-auto max-w-3xl px-4 md:px-6 py-20">
        <div className="text-sm font-medium text-primary">About us</div>
        <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight">{page?.title ?? "About"}</h1>
        <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none whitespace-pre-wrap text-muted-foreground leading-relaxed">
          {page?.content}
        </div>
      </section>
    </SiteLayout>
  );
}
