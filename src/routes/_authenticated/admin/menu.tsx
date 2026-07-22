import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/CrudPage";

export const Route = createFileRoute("/_authenticated/admin/menu")({
  component: () => (
    <CrudPage
      title="Menu Items"
      table="menu_items"
      fields={[
        { key: "label", label: "Label", type: "text" },
        { key: "url", label: "URL", type: "text" },
        { key: "location", label: "Location", type: "select", options: [{ label: "Header", value: "header" }, { label: "Footer", value: "footer" }] },
        { key: "sort", label: "Sort", type: "number" },
        { key: "active", label: "Active", type: "boolean" },
      ]}
    />
  ),
});
