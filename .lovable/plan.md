## Goals
1. Add a real slider on the home hero when more than one active hero slide exists.
2. Fix the intermittent "white/empty banner" where the hero renders blank.

## Likely cause of the blank banner
The hero uses `hero[0]` and falls back to `/hero-stays.jpg` only when `first?.image_url` is missing. Two real cases produce a blank hero today:
- The active hero row exists but `image_url` is `null` / empty string → renders `<img src="">`, which shows nothing (white).
- `image_url` points at a legacy public URL on the private `property-images` bucket → 404, image area stays white until the browser gives up.

Both are data/URL problems, not layout. Fix by (a) treating empty strings as missing and (b) swapping to the local fallback on `onError`.

## Changes

**`src/routes/index.tsx` — hero section only**
- Compute `slides = hero.filter(h => h.image_url && h.image_url.trim())`. If none, use a single synthetic fallback slide `{ image_url: "/hero-stays.jpg", heading: settings?.tagline ?? "...", subheading: "..." }` so the hero is never empty.
- Render all slides stacked absolutely inside the hero, each an `<img>` with `opacity` transitioning based on the active index (crossfade, ~700ms).
- Text block (heading + subheading) reads from the active slide and crossfades with it.
- Add `onError={(e) => (e.currentTarget.src = "/hero-stays.jpg")}` on every hero `<img>` so a broken uploaded URL never leaves a white banner.
- When `slides.length > 1`:
  - Auto-advance every ~6s via `setInterval`, paused on hover and when `document.hidden`.
  - Prev / Next arrow buttons (left/right, subtle white-on-translucent, existing token colors).
  - Dot indicators centered near the bottom; click to jump.
  - Respect `prefers-reduced-motion` (no autoplay, instant swap).
- When `slides.length <= 1`: render exactly as today (no controls, no autoplay).
- Keep current hero height, container widths, gradient overlay, and typography.

## Leave untouched
- `getSiteData`, hero admin CRUD, image upload flow, `active`/`sort` filtering.
- All other home sections, SEO/head metadata, header search behavior.

## Technical notes
- Small local `useState` index + `useEffect` interval; no new dependency.
- Preload strategy: active slide `loading="eager" fetchpriority="high"`, others `loading="lazy"`.
- No changes to stored data — the `onError` fallback masks legacy broken URLs; admin can re-upload to permanently fix them.
