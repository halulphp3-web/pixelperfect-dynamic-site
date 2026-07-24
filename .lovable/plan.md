# Mobile Responsiveness Pass

Goal: make the public site and admin panel usable on phones (≤640px) and tablets (≤1024px). No functional/behavioral changes — only layout, spacing, and overflow fixes.

## Scope

### Public site
- **Header (`src/components/site/Header.tsx`)**: stack rows on mobile — Logo + currency/lang on row 1, SearchBar full-width on row 2. Prevent horizontal overflow.
- **SearchBar (`src/components/site/SearchBar.tsx`)**: on mobile, collapse the 3-field inline layout into a stacked vertical form (Destination → Dates → Guests → Search button full-width). Keep the same popovers/state. Dual-calendar popover switches to single-month on <640px.
- **Home hero (`src/routes/index.tsx`)**: reduce hero height on mobile, scale heading typography (`text-3xl sm:text-5xl lg:text-6xl`), ensure slider arrows/dots don't overlap text.
- **Property listing (`src/routes/properties.index.tsx`)**: grid → 1 col mobile / 2 col md / 3 col lg. Map moves below listings on mobile with reduced height; filter row wraps.
- **Property details (`src/routes/properties.$slug.tsx`)**: gallery becomes 1 large + swipeable thumbs on mobile; sidebar "Reserve your stay" drops below content on mobile (it may already stack — verify); amenities grid 2-col on mobile; map full width.
- **Footer (`src/components/site/Footer.tsx`)**: 4 columns → 2 col sm → 1 col xs, keep dark styling.
- **Why-book / Testimonials / Stats sections**: verify grid collapses to 1–2 col and padding shrinks.

### Admin panel
- **AdminShell**: sidebar becomes a Sheet (drawer) opened by a hamburger in a top bar on <lg screens; main content full-width. Desktop unchanged.
- **CrudPage (`src/components/admin/CrudPage.tsx`)**: table wraps in `overflow-x-auto`; modal switches to full-screen sheet on mobile (max-h-[90vh], scrollable, padded); action buttons stack.
- **Forms/ImageUploadField**: inputs full-width on mobile, preview image caps at container width.

## Technical approach

- Pure Tailwind responsive utilities (`sm:`, `md:`, `lg:`). No new deps.
- Apply the grid + `min-w-0` + `shrink-0` + `truncate` pattern for any row mixing text and fixed widgets.
- Use existing shadcn `Sheet` for the admin drawer.
- Add `overflow-x-hidden` on `<body>`/root layout to kill stray horizontal scroll.
- No changes to server functions, RLS, data shape, routes, or component APIs — only className and small JSX wrapper changes.

## Verification

- Playwright script at viewports 375×812 (mobile), 768×1024 (tablet), 1440×900 (desktop): screenshot Home, Properties list, Property detail, Admin dashboard, Admin properties edit modal.
- Confirm: no horizontal scroll, all CTAs reachable, search flow works on mobile, admin drawer opens/closes, edit modal scrollable.

## Out of scope

- No visual redesign, no new features, no copy changes, no data model changes.
