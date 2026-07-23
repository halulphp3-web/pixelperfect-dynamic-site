
DROP POLICY IF EXISTS "Authenticated upload property-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update property-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete property-images" ON storage.objects;

CREATE POLICY "Only admins insert user_roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins update user_roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins delete user_roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
