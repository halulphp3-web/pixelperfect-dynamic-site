import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/CrudPage";

export const Route = createFileRoute("/_authenticated/admin/hero")({
  component: () => (
    <CrudPage
      title="Hero Slides"
      table="hero_slides"
      fields={[
        { key: "heading", label: "Heading", type: "text" },
        { key: "subheading", label: "Subheading", type: "textarea" },
        { key: "cta_label", label: "CTA Label", type: "text" },
        { key: "cta_url", label: "CTA URL", type: "text" },
        { key: "image_url", label: "Banner image", type: "image" },
        { key: "sort", label: "Sort", type: "number" },
        { key: "active", label: "Active", type: "boolean" },
      ]}
    />
  ),
});
