
## Scope

Repurpose the site into a holiday-homes rental layout (inspired by the reference structure, original content and imagery). Keep everything CMS-driven and add admin toggles for every front-facing section and header feature.

No booking engine — a "Request availability" button on each property opens the existing contact form pre-filled with the property title.

## What gets built

### 1. New `properties` table
Columns (beyond id/created_at/updated_at):
- `title`, `slug` (unique), `summary`, `description` (long text)
- `location` (e.g. "Dubai Marina"), `property_type` ("Apartment", "Villa"…)
- `bedrooms`, `bathrooms`, `guests`, `beds` (ints)
- `price_per_night` (numeric), `currency` (default "AED")
- `check_in_time`, `check_out_time` (text)
- `cover_image_url`, `gallery_urls` (jsonb array)
- `amenities` (jsonb array of strings), `highlights` (jsonb array)
- `lat`, `lng` (numeric, for future map)
- `featured` (bool), `active` (bool), `sort` (int)

Public policy: `SELECT` where `active = true` for anon.
Admin policy: full access via `has_role(auth.uid(),'admin')`.
GRANTs per project rules.

### 2. `site_settings` extension — feature flags
Add a `feature_flags` jsonb column with defaults:
```
{
  "home": { "hero": true, "stats": true, "services": true, "features": true, "properties": true, "testimonials": true, "cta": true },
  "header": { "currency_switcher": true, "language_switcher": true, "dark_mode": true, "search_bar": false },
  "widgets": { "whatsapp": true, "back_to_top": true, "ai_chat": false },
  "properties_page": { "map": true, "filters": true }
}
```
Also add `default_currency` ("AED") and `supported_currencies` (jsonb, e.g. `["AED","USD","EUR","GBP"]`).

### 3. Public routes
- `/properties` — grid of active properties, search bar (destination + guests), optional map panel (toggle-driven). Uses static rates for currency conversion in a client helper — no live FX.
- `/properties/$slug` — hero gallery, key facts, description, amenities, highlights, "Request availability" CTA that deep-links to `/contact?property=<slug>`.
- `/contact` — read `?property=` search param, prefill subject/message.
- Home page: add a "Featured Properties" section (only if `home.properties` flag on). Every home section wrapped in its flag check.

### 4. Header enhancements (all flag-gated)
- Currency switcher (AED/USD/EUR/GBP) — stored in `localStorage`, provided via React context; prices reformat on the fly.
- Language switcher (EN/AR) — UI label only for now, sets `dir="rtl"` when AR.
- Dark mode toggle — toggles `class="dark"` on `html`, persisted.
- WhatsApp float + back-to-top — flag-gated in `FloatingWidgets`.

### 5. Admin panel
- New `/admin/properties` CRUD (extends existing `CrudPage`; adds an image-gallery + amenity chips editor via textarea → JSON parse).
- New `/admin/settings` extension: "Feature Toggles" tab with checkboxes for every key in `feature_flags`, plus currency defaults.
- Extend `admin.functions.ts` `tableSchema` enum with `"properties"`.

### 6. Server functions
- `getSiteData` → also return `feature_flags`, `default_currency`, `supported_currencies`, and `featuredProperties`.
- `listProperties({ search?, guests? })`, `getPropertyBySlug({ slug })` — public.
- `updateSettings` already exists; extend to accept the new jsonb field.

### 7. Seed content
Insert 6 original demo properties (generic Dubai holiday-home style, original titles/descriptions; images sourced via imagegen so no third-party assets).

## Technical details

- Migration order per project rules: CREATE TABLE → GRANT → ENABLE RLS → CREATE POLICY. Trigger `set_updated_at` on the new table.
- Feature flags read in `SiteLayout`, `Header`, `FloatingWidgets`, and home route via the `settings` object already threaded through.
- Currency context: `CurrencyProvider` in `__root.tsx`; conversion table is a plain constant map exported from `src/lib/currency.ts`. Clearly labelled "approx".
- Images: 6 generated JPGs saved under `src/assets/properties/` and one hero for the home page. All original.
- No new packages required.
- Auth-gated admin routes stay under `_authenticated/admin/…`.

## Out of scope (say-so needed)

- Real availability calendar, payments, live FX, real translations, real AI chat.
