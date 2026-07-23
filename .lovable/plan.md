## Issue
The `property-images` bucket is **private**, but the app uses `getPublicUrl(...)` which builds `/storage/v1/object/public/...` URLs. Private buckets reject those requests with `404 Bucket not found`, so every uploaded image (properties, banner, logo, favicon that use this bucket) fails to display.

## Fix
Flip the `property-images` bucket to public via `supabase--storage_update_bucket`. Existing admin-only INSERT/UPDATE/DELETE storage policies stay intact, so only admins can upload — but anyone can view images, which is what a public site needs.

No code changes required. Previously uploaded files will start resolving immediately once the bucket is public.

## Note
The `media` bucket is intentionally private (admin-only) and stays private.
