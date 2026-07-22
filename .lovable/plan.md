# Plan — Phase 1 (of a multi-phase build)

An original business/services marketing site (same *category* as the reference, not a visual copy) plus the foundation of an admin CMS. Later phases layer on the rest of the modules you listed.

## Ground rules

- Original design and original copy. No assets, layouts, or text copied from venduras.com or tadabeerhomes.com. I'll draft placeholder copy in a "professional home services / facility management" tone that you can edit.
- Backend uses Lovable Cloud (Postgres + Auth + Storage + server functions). Admin roles live in a separate `user_roles` table.
- Everything on the public site in Phase 1 is already DB-driven — no hardcoded strings in components. Later phases add more editable modules.

## Phase 1 scope (this plan)

Public site (all routes SSR, SEO metadata per route):
- `/` Home — hero, services grid, features, industries, stats, testimonials, CTA
- `/about`
- `/services` + `/services/$slug`
- `/contact` (form → `contact_messages` table)
- Shared header (logo + nav from DB) and footer (columns, social links, newsletter signup)

Admin (`/admin`, gated by `_authenticated` + `admin` role):
- Login / logout, profile, change password
- Dashboard (counts + recent messages)
- Website Settings (name, logo, favicon, email, phone, WhatsApp, address, social links, SEO defaults, GA/GTM/Pixel IDs, custom head/footer scripts)
- Pages CMS (title, slug, sections JSON, SEO fields, draft/publish, active)
- Services CRUD (title, slug, icon, summary, body, order, active)
- Menu builder (header nav items: label, url, order, active)
- Hero slides CRUD (image, heading, subheading, CTA, order, active)
- Testimonials CRUD
- Stats/Counters CRUD
- Contact messages inbox (list, view, mark read, delete)
- Media library (upload to Storage bucket, list, delete)
- Each list view: search, active/inactive filter, sort, pagination

Cross-cutting in Phase 1:
- Per-route `head()` metadata (title, description, canonical, OG, Twitter)
- Sitemap + robots
- Back-to-top, scroll animations, skeleton loading, lazy images
- Cookie consent banner
- WhatsApp floating button (uses number from settings)
- Form validation with zod
- Responsive/mobile-first, dark/light toggle
- Basic schema.org markup (Organization on root, Service on service pages)

## Deferred to later phases (not in Phase 1)

Role & permission management UI, redirect manager, popup manager, mega menu builder, analytics dashboard, backup/restore, activity logs, SMTP settings UI, advanced global live search, multi-language, AI chatbot, recently-viewed, comments, scheduled publishing, Google Maps embed manager, related posts, SEO manager beyond per-page fields, image WebP pipeline. All possible on this foundation — just separate deliverables.

## Data model (Phase 1)

```
profiles (id, full_name, avatar_url)
user_roles (user_id, role: 'admin'|'editor'|'user')      -- has_role() SECURITY DEFINER
site_settings (singleton row: name, logo_url, favicon_url, email, phone, whatsapp,
               address, socials jsonb, seo jsonb, scripts jsonb)
menu_items (id, label, url, parent_id, sort, active)
hero_slides (id, image_url, heading, subheading, cta_label, cta_url, sort, active)
services (id, slug, title, icon, summary, body, sort, active, seo jsonb)
testimonials (id, name, role, avatar_url, quote, sort, active)
stats (id, label, value, suffix, sort, active)
pages (id, slug, title, sections jsonb, seo jsonb, status: draft|published, sort)
contact_messages (id, name, email, phone, message, read, created_at)
media (id, path, url, mime, size, uploaded_by, created_at)
```
Every table: RLS on. Public tables get `TO anon SELECT` where `active = true`. Writes restricted to `has_role(auth.uid(),'admin')`. `contact_messages` allows `TO anon INSERT` only.

## Tech notes

- TanStack Start file routes; public loaders use publishable-key server client, admin loaders under `_authenticated/admin/` use `requireSupabaseAuth`.
- shadcn/ui + Tailwind v4 tokens in `src/styles.css`. I'll pick one distinctive visual direction (not the generic purple-on-white default) — happy to run design directions first if you want to pick the look.
- Storage bucket `media` (public) for uploads.
- First admin: after signup, I'll insert an `admin` role row for the first user via migration seed you specify, or add a one-time "claim admin" flow.

## Open questions before I build

1. **Design direction** — want me to generate 2–3 rendered design directions to pick from, or should I just commit to one clean modern direction and go?
2. **First admin user** — give me the email you'll sign up with so the migration can grant it the admin role, or I'll add a one-time bootstrap page.
3. **Brand basics** — site name, tagline, primary color preference (or "you choose"). Placeholder copy is fine for everything else.

Reply with answers to those three and I'll switch to build mode and start Phase 1.
