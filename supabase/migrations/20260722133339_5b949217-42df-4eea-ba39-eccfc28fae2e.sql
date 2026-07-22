
-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles select own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles insert own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles update own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============ UPDATED_AT HELPER ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ HANDLE NEW USER (profile + first-user-is-admin) ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_count INT;
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));

  SELECT COUNT(*) INTO user_count FROM auth.users;
  IF user_count <= 1 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ SITE SETTINGS (singleton) ============
CREATE TABLE public.site_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  site_name TEXT NOT NULL DEFAULT 'My Company',
  tagline TEXT DEFAULT 'Professional services for modern businesses',
  logo_url TEXT,
  favicon_url TEXT,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  address TEXT,
  google_map_embed TEXT,
  socials JSONB NOT NULL DEFAULT '{}'::jsonb,
  seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  scripts JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings public read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "settings admin write" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER site_settings_updated BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- ============ Generic content helper ============
-- Repeated: SELECT (public if active), admin full write
CREATE OR REPLACE FUNCTION public.apply_content_rls(_table regclass, _has_active BOOLEAN DEFAULT TRUE)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', _table);
  IF _has_active THEN
    EXECUTE format('CREATE POLICY "public read active" ON %s FOR SELECT USING (active = true)', _table);
  ELSE
    EXECUTE format('CREATE POLICY "public read" ON %s FOR SELECT USING (true)', _table);
  END IF;
  EXECUTE format('CREATE POLICY "admin all" ON %s FOR ALL TO authenticated USING (public.has_role(auth.uid(), ''admin'')) WITH CHECK (public.has_role(auth.uid(), ''admin''))', _table);
END; $$;

-- ============ MENU ITEMS ============
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  sort INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  location TEXT NOT NULL DEFAULT 'header',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.menu_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.menu_items TO authenticated;
GRANT ALL ON public.menu_items TO service_role;
SELECT public.apply_content_rls('public.menu_items'::regclass, true);
CREATE TRIGGER menu_items_updated BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ HERO SLIDES ============
CREATE TABLE public.hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT,
  heading TEXT NOT NULL,
  subheading TEXT,
  cta_label TEXT,
  cta_url TEXT,
  sort INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hero_slides TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.hero_slides TO authenticated;
GRANT ALL ON public.hero_slides TO service_role;
SELECT public.apply_content_rls('public.hero_slides'::regclass, true);
CREATE TRIGGER hero_slides_updated BEFORE UPDATE ON public.hero_slides FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ SERVICES ============
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  icon TEXT,
  summary TEXT,
  body TEXT,
  image_url TEXT,
  seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
SELECT public.apply_content_rls('public.services'::regclass, true);
CREATE TRIGGER services_updated BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ TESTIMONIALS ============
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  avatar_url TEXT,
  quote TEXT NOT NULL,
  rating INT DEFAULT 5,
  sort INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
SELECT public.apply_content_rls('public.testimonials'::regclass, true);
CREATE TRIGGER testimonials_updated BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ STATS ============
CREATE TABLE public.stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  suffix TEXT,
  icon TEXT,
  sort INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.stats TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.stats TO authenticated;
GRANT ALL ON public.stats TO service_role;
SELECT public.apply_content_rls('public.stats'::regclass, true);
CREATE TRIGGER stats_updated BEFORE UPDATE ON public.stats FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ FEATURES ============
CREATE TABLE public.features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.features TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.features TO authenticated;
GRANT ALL ON public.features TO service_role;
SELECT public.apply_content_rls('public.features'::regclass, true);
CREATE TRIGGER features_updated BEFORE UPDATE ON public.features FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ PAGES ============
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT,
  seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  sort INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pages TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.pages TO authenticated;
GRANT ALL ON public.pages TO service_role;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pages public read published" ON public.pages FOR SELECT USING (status = 'published');
CREATE POLICY "pages admin read all" ON public.pages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "pages admin write" ON public.pages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER pages_updated BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ CONTACT MESSAGES ============
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact anyone can submit" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "contact admin read" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "contact admin update" ON public.contact_messages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "contact admin delete" ON public.contact_messages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ MEDIA ============
CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  url TEXT NOT NULL,
  mime TEXT,
  size BIGINT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.media TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.media TO authenticated;
GRANT ALL ON public.media TO service_role;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "media public read" ON public.media FOR SELECT USING (true);
CREATE POLICY "media admin write" ON public.media FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
