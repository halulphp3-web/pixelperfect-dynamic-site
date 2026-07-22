import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/CrudPage";

export const Route = createFileRoute("/_authenticated/admin/testimonials")({
  component: () => (
    <CrudPage
      title="Testimonials"
      table="testimonials"
      fields={[
        { key: "name", label: "Name", type: "text" },
        { key: "role", label: "Role", type: "text" },
        { key: "quote", label: "Quote", type: "textarea" },
        { key: "avatar_url", label: "Avatar URL", type: "url" },
        { key: "rating", label: "Rating (1-5)", type: "number" },
        { key: "sort", label: "Sort", type: "number" },
        { key: "active", label: "Active", type: "boolean" },
      ]}
    />
  ),
});
