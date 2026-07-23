## Goal
Replace the current OpenStreetMap iframe on the properties listing page with an interactive map that shows a "View" pill marker for each property, matching the reference.

## Changes

**1. New component: `src/components/site/PropertyMap.tsx`**
- Client-only Leaflet map (dynamic import behind `ClientOnly`/`useEffect` to avoid SSR issues — Leaflet touches `window`).
- Props: `properties` (id, slug, title, lat, lng, price, cover_image_url).
- Custom `L.divIcon` renders a white rounded "View" pill (shadcn styling, subtle shadow) as the marker.
- On marker click: open a Leaflet popup with property title (+ small thumbnail/price) and a link to `/properties/$slug`.
- Auto-fit bounds to all markers; fallback to Dubai center when no coords.
- OSM tile layer; zoom controls top-left; scroll-wheel zoom enabled.

**2. Dependency**
- Add `leaflet` and `@types/leaflet`. Import `leaflet/dist/leaflet.css` in the component.

**3. `src/routes/properties.index.tsx`**
- Swap `MapEmbed` for `PropertyMap` in the right-hand aside; pass filtered properties.
- Keep `MapEmbed` in place for the detail page (unchanged).

**4. Leave untouched**
- `MapEmbed.tsx`, detail page map, gallery lightbox, filters, search, admin.

## Technical notes
- Leaflet must not run in SSR. Wrap with a `useEffect` mount + `ClientOnly` gate, or `React.lazy` + `<ClientOnly>`.
- Marker pill via `L.divIcon({ html: '<div class="...">View</div>', className: '' })` so Tailwind classes apply.
- Bounds: `L.latLngBounds(points).pad(0.15)`; if 1 point, `setView` with zoom ~13.
