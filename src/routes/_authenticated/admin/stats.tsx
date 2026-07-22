import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/CrudPage";

export const Route = createFileRoute("/_authenticated/admin/stats")({
  component: () => (
    <CrudPage
      title="Stats / Counters"
      table="stats"
      fields={[
        { key: "label", label: "Label", type: "text" },
        { key: "value", label: "Value", type: "text" },
        { key: "suffix", label: "Suffix", type: "text" },
        { key: "icon", label: "Icon", type: "text" },
        { key: "sort", label: "Sort", type: "number" },
        { key: "active", label: "Active", type: "boolean" },
      ]}
    />
  ),
});
