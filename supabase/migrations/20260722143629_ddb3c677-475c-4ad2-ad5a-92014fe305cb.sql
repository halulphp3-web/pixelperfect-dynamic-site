
-- 1) properties table
CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  summary text,
  description text,
  location text,
  property_type text,
  bedrooms int NOT NULL DEFAULT 1,
  bathrooms int NOT NULL DEFAULT 1,
  guests int NOT NULL DEFAULT 2,
  beds int NOT NULL DEFAULT 1,
  price_per_night numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'AED',
  check_in_time text DEFAULT '15:00',
  check_out_time text DEFAULT '11:00',
  cover_image_url text,
  gallery_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  amenities jsonb NOT NULL DEFAULT '[]'::jsonb,
  highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  lat numeric(9,6),
  lng numeric(9,6),
  featured boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  sort int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.properties TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active properties"
  ON public.properties FOR SELECT
  USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage properties"
  ON public.properties FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER properties_set_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX properties_active_sort_idx ON public.properties (active, sort);
CREATE INDEX properties_featured_idx ON public.properties (featured) WHERE featured = true;

-- 2) site_settings feature flags + currency
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS feature_flags jsonb NOT NULL DEFAULT '{
    "home": {"hero": true, "stats": true, "services": true, "features": true, "properties": true, "testimonials": true, "cta": true},
    "header": {"currency_switcher": true, "language_switcher": true, "dark_mode": true, "search_bar": false},
    "widgets": {"whatsapp": true, "back_to_top": true, "ai_chat": false},
    "properties_page": {"map": true, "filters": true}
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS default_currency text NOT NULL DEFAULT 'AED',
  ADD COLUMN IF NOT EXISTS supported_currencies jsonb NOT NULL DEFAULT '["AED","USD","EUR","GBP"]'::jsonb;

-- 3) seed 6 properties
INSERT INTO public.properties (title, slug, summary, description, location, property_type, bedrooms, bathrooms, guests, beds, price_per_night, currency, cover_image_url, gallery_urls, amenities, highlights, lat, lng, featured, sort)
VALUES
('Marina Skyline Two-Bedroom Retreat', 'marina-skyline-two-bedroom', 'Bright two-bedroom apartment with panoramic marina views, walking distance to the beach.', 'Wake up to golden-hour views over the harbour from this design-led two-bedroom home. The open living space flows onto a wraparound balcony, the kitchen is fully equipped, and both bedrooms feature premium linens and blackout curtains for restful sleep.', 'Dubai Marina', 'Apartment', 2, 2, 4, 3, 780, 'AED', '/property-1.jpg', '["/property-1.jpg","/property-1-b.jpg"]'::jsonb, '["High-speed Wi-Fi","Infinity pool","Gym access","Smart TV","Nespresso machine","Washer & dryer","Air conditioning","24/7 security"]'::jsonb, '["Balcony with marina view","2 minute walk to the beach","Dedicated workspace"]'::jsonb, 25.0805, 55.1403, true, 10),
('Palm Jumeirah Beachfront Villa', 'palm-jumeirah-beachfront-villa', 'Four-bedroom villa on the Palm with private beach access and a heated pool.', 'A serene beachfront villa on the fronds of the Palm, offering direct sand access, a heated infinity pool, and a shaded outdoor lounge. Perfect for families or groups looking for privacy without leaving the city.', 'Palm Jumeirah', 'Villa', 4, 4, 8, 6, 2850, 'AED', '/property-2.jpg', '["/property-2.jpg"]'::jsonb, '["Private pool","Direct beach access","BBQ area","Chef on request","4K home cinema","Kids play area","Free parking","Housekeeping"]'::jsonb, '["Sunset-facing terrace","Steps from the water","Chef service available"]'::jsonb, 25.1121, 55.1391, true, 20),
('Downtown Boulevard Studio', 'downtown-boulevard-studio', 'Cosy studio with a Burj Khalifa view, ideal for solo travellers and couples.', 'Compact but thoughtfully arranged, this studio puts you at the centre of Downtown. Enjoy fountain views from the living area and a short stroll to the mall, metro, and Old Town.', 'Downtown', 'Studio', 0, 1, 2, 1, 420, 'AED', '/property-3.jpg', '["/property-3.jpg"]'::jsonb, '["Wi-Fi","Rooftop pool","Gym","Self check-in","Fully equipped kitchenette","Metro access"]'::jsonb, '["Burj Khalifa view","Walk to Dubai Mall","Self check-in 24/7"]'::jsonb, 25.1972, 55.2744, true, 30),
('JBR Beachwalk One-Bedroom', 'jbr-beachwalk-one-bedroom', 'Modern one-bedroom steps from JBR beach with a sea-view balcony.', 'Sunset dinners on your private balcony, morning swims in the sea, and easy access to the buzz of The Walk. This one-bedroom has been styled for comfort and slow mornings.', 'Jumeirah Beach Residence', 'Apartment', 1, 1, 3, 2, 620, 'AED', '/property-4.jpg', '["/property-4.jpg"]'::jsonb, '["Sea-view balcony","Beach access","Shared pool","Wi-Fi","Netflix","Washer"]'::jsonb, '["30 seconds to the beach","Sunset balcony","Vibrant neighbourhood"]'::jsonb, 25.0785, 55.1345, false, 40),
('Business Bay Executive Suite', 'business-bay-executive-suite', 'Two-bedroom serviced apartment tailored for longer stays and remote work.', 'Purpose-built for extended stays: an ergonomic desk in each bedroom, fibre internet, a full kitchen, and daily housekeeping options. Canal-facing living room with a quiet, work-friendly atmosphere.', 'Business Bay', 'Serviced Apartment', 2, 2, 4, 3, 690, 'AED', '/property-5.jpg', '["/property-5.jpg"]'::jsonb, '["Fibre internet","Dual workspaces","Housekeeping","Gym","Pool","Kitchen","Laundry"]'::jsonb, '["Two dedicated desks","Canal views","Ideal for long stays"]'::jsonb, 25.1857, 55.2645, false, 50),
('Al Barsha Family Townhouse', 'al-barsha-family-townhouse', 'Three-bedroom townhouse with garden, a short drive from Mall of the Emirates.', 'A relaxed family base with a private garden, generous living areas, and a well-equipped kitchen. Close to schools, parks, and the city''s main attractions.', 'Al Barsha', 'Townhouse', 3, 3, 6, 4, 950, 'AED', '/property-6.jpg', '["/property-6.jpg"]'::jsonb, '["Private garden","Free parking","Kids-friendly","Wi-Fi","Full kitchen","Washer & dryer"]'::jsonb, '["Peaceful residential street","Family-friendly layout","10 min to Mall of the Emirates"]'::jsonb, 25.1108, 55.2000, false, 60);
