import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/CrudPage";

export const Route = createFileRoute("/_authenticated/admin/services")({
  component: () => (
    <CrudPage
      title="Services"
      table="services"
      fields={[
        { key: "title", label: "Title", type: "text" },
        { key: "slug", label: "Slug", type: "text" },
        { key: "icon", label: "Icon (lucide name)", type: "text" },
        { key: "summary", label: "Summary", type: "textarea" },
        { key: "body", label: "Body", type: "textarea" },
        { key: "image_url", label: "Image URL", type: "url" },
        { key: "sort", label: "Sort", type: "number" },
        { key: "active", label: "Active", type: "boolean" },
      ]}
    />
  ),
});
