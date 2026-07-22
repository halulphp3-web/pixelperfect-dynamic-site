import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/CrudPage";

export const Route = createFileRoute("/_authenticated/admin/features")({
  component: () => (
    <CrudPage
      title="Features"
      table="features"
      fields={[
        { key: "title", label: "Title", type: "text" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "icon", label: "Icon (lucide name)", type: "text" },
        { key: "sort", label: "Sort", type: "number" },
        { key: "active", label: "Active", type: "boolean" },
      ]}
    />
  ),
});
