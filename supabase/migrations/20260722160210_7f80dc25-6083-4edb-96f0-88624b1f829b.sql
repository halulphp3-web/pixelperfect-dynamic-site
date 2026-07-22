
-- Revoke EXECUTE on SECURITY DEFINER functions from anon/authenticated.
-- Policies invoke has_role via SECURITY DEFINER regardless of grants (postgres owns it),
-- so RLS keeps working.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;

-- Restrict media bucket reads to admins (bucket is private; was fully public via policy).
DROP POLICY IF EXISTS "media public read" ON storage.objects;
CREATE POLICY "media admin read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Restrict media metadata table reads to admins.
DROP POLICY IF EXISTS "media public read" ON public.media;
CREATE POLICY "media admin read"
  ON public.media FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
REVOKE SELECT ON public.media FROM anon;

-- Site settings: keep public read but exclude the `scripts` column from anon/authenticated.
REVOKE SELECT ON public.site_settings FROM anon, authenticated;
GRANT SELECT (
  id, site_name, tagline, logo_url, favicon_url, email, phone, whatsapp, address,
  google_map_embed, socials, default_currency, supported_currencies, seo,
  feature_flags, updated_at
) ON public.site_settings TO anon, authenticated;
