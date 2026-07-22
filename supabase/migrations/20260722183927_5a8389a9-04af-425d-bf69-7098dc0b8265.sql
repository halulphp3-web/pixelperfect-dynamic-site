
-- Restore EXECUTE on has_role for authenticated (needed by RLS policies and admin check).
-- Keep anon without execute (security scanner requirement); public routes don't need it now.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Simplify public properties SELECT so anonymous users don't trigger has_role.
DROP POLICY IF EXISTS "Public can view active properties" ON public.properties;
CREATE POLICY "Public can view active properties"
  ON public.properties FOR SELECT
  USING (active = true);
