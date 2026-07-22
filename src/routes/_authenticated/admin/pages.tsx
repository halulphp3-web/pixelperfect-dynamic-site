import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/CrudPage";

export const Route = createFileRoute("/_authenticated/admin/pages")({
  component: () => (
    <CrudPage
      title="Pages"
      table="pages"
      fields={[
        { key: "title", label: "Title", type: "text" },
        { key: "slug", label: "Slug", type: "text" },
        { key: "content", label: "Content", type: "textarea" },
        { key: "status", label: "Status", type: "select", options: [{ label: "Draft", value: "draft" }, { label: "Published", value: "published" }] },
        { key: "sort", label: "Sort", type: "number" },
      ]}
    />
  ),
});
