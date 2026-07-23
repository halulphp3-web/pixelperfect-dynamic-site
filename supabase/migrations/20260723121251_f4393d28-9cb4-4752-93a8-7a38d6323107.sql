-- Remove the single legacy public-style property-images URL from gallery.
-- The bucket is private (workspace policy blocks public buckets), so those
-- URLs 404. New uploads use long-lived signed URLs instead.
UPDATE public.properties
SET gallery_urls = (
  SELECT COALESCE(jsonb_agg(x), '[]'::jsonb)
  FROM jsonb_array_elements(gallery_urls) AS x
  WHERE x::text NOT LIKE '%/storage/v1/object/public/property-images/%'
)
WHERE gallery_urls::text LIKE '%/storage/v1/object/public/property-images/%';

UPDATE public.properties
SET cover_image_url = NULL
WHERE cover_image_url LIKE '%/storage/v1/object/public/property-images/%';

UPDATE public.hero_slides
SET image_url = NULL
WHERE image_url LIKE '%/storage/v1/object/public/property-images/%';

UPDATE public.site_settings
SET logo_url = NULL
WHERE logo_url LIKE '%/storage/v1/object/public/property-images/%';

UPDATE public.site_settings
SET favicon_url = NULL
WHERE favicon_url LIKE '%/storage/v1/object/public/property-images/%';