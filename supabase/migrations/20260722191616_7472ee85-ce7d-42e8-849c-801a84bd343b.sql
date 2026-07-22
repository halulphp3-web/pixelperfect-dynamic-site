
CREATE POLICY "Public read property-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated upload property-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Authenticated update property-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated delete property-images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-images');
