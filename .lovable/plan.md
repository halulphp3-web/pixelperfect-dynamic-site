## Root cause

Admin list pages (Properties, Hero Slides, Services, etc.) return empty because every admin RLS policy on those tables uses `has_role(auth.uid(), 'admin')`, but `EXECUTE` on `public.has_role` was previously revoked from the `authenticated` role. When the admin's authenticated session evaluates the policy, the function call is denied and the policy filters out every row — so lists appear empty even though the data exists.

Current grants on `has_role`: only `postgres`, `service_role`, `sandbox_exec`. Missing: `authenticated`.

## Fix (single migration, no functionality changes)

Re-grant `EXECUTE` on `public.has_role(uuid, app_role)` to the `authenticated` role only. This is safe because:
- The function is `SECURITY DEFINER` and only reads `user_roles` for the passed `_user_id`.
- `anon` is intentionally not granted (public routes don't need it).
- No policies, tables, columns, or code paths change.

```sql
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
```

## Verification

After the migration, sign in as the admin and reload `/admin/properties`, `/admin/hero`, `/admin/services`, etc. — rows should render. No frontend edits.
