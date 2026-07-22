import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/CrudPage";

export const Route = createFileRoute("/_authenticated/admin/properties")({
  component: () => (
    <CrudPage
      title="Properties"
      table="properties"
      fields={[
        { key: "title", label: "Title", type: "text" },
        { key: "slug", label: "Slug (URL)", type: "text" },
        { key: "location", label: "Location / Neighbourhood", type: "text" },
        { key: "property_type", label: "Property type (Apartment, Villa…)", type: "text" },
        { key: "summary", label: "Short summary", type: "textarea" },
        { key: "description", label: "Full description", type: "textarea" },
        { key: "bedrooms", label: "Bedrooms", type: "number" },
        { key: "bathrooms", label: "Bathrooms", type: "number" },
        { key: "guests", label: "Max guests", type: "number" },
        { key: "beds", label: "Beds", type: "number" },
        { key: "price_per_night", label: "Price per night (AED)", type: "number" },
        { key: "currency", label: "Currency code", type: "text" },
        { key: "check_in_time", label: "Check-in time", type: "text" },
        { key: "check_out_time", label: "Check-out time", type: "text" },
        { key: "cover_image_url", label: "Cover image", type: "image" },
        { key: "gallery_urls", label: "Gallery images", type: "images" },
        { key: "amenities", label: "Amenities — JSON array of strings", type: "textarea" },
        { key: "highlights", label: "Highlights — JSON array of strings", type: "textarea" },
        { key: "lat", label: "Latitude", type: "number" },
        { key: "lng", label: "Longitude", type: "number" },
        { key: "sort", label: "Sort order", type: "number" },
        { key: "featured", label: "Featured on home", type: "boolean" },
        { key: "active", label: "Active (visible)", type: "boolean" },
      ]}
    />
  ),
});
