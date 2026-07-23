## Goal
When the user hovers a property card in the listing grid, the corresponding marker on the map should highlight and expand to show that property's name (same hover state that currently activates when hovering the marker directly).

## Changes

**1. `src/components/site/PropertyMap.tsx`**
- Accept a new prop `activeId?: string | null`.
- Keep a `markersRef` map of `{ [propertyId]: L.Marker }` so we can address markers by id.
- Extract the hover styling logic into a helper that toggles the dark pill + name on a given marker element.
- Add an effect that watches `activeId`: when it changes, apply the hover style + `openPopup()` on the matching marker, and reset all others.

**2. `src/routes/properties.index.tsx`**
- Add `const [hoverId, setHoverId] = useState<string | null>(null)`.
- On each property card `<Link>`, add `onMouseEnter={() => setHoverId(p.id)}` and `onMouseLeave={() => setHoverId(null)}`.
- Pass `activeId={hoverId}` to `<PropertyMap ... />`.

## Leave untouched
- Marker mouseover/mouseout behavior (still works when hovering the map).
- Popup content, bounds fitting, filtering, SSR/lazy wrapping.

## Technical notes
- Guard against markers being recreated: rebuild `markersRef` inside the same effect that creates markers, and re-run the `activeId` effect when the marker set changes.
- Do not pan/zoom on hover — just style + open popup — to avoid disorienting the user while scanning the grid.
