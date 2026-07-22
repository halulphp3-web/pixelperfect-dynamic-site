
DROP POLICY IF EXISTS "contact anyone can submit" ON public.contact_messages;
CREATE POLICY "contact anyone can submit" ON public.contact_messages FOR INSERT
  WITH CHECK (
    length(trim(name)) BETWEEN 1 AND 200
    AND length(trim(email)) BETWEEN 3 AND 320
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(trim(message)) BETWEEN 1 AND 5000
    AND (phone IS NULL OR length(phone) <= 40)
    AND (subject IS NULL OR length(subject) <= 200)
  );

REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_updated_at() TO service_role;
