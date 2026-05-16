-- BRSI VIT Chapter - Supabase Schema
-- Run this entire script in the Supabase SQL Editor

-- 1. Create Tables
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    image_url TEXT,
    is_upcoming BOOLEAN DEFAULT TRUE,
    extra_photos JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.biobuzz (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    edition_name TEXT NOT NULL,
    release_date DATE NOT NULL,
    cover_url TEXT,
    description TEXT,
    read_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.board_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year TEXT NOT NULL,
    position TEXT NOT NULL,
    position_order INTEGER NOT NULL DEFAULT 0,
    member_name TEXT NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.team_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    image_url TEXT,
    result TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.settings (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- 2. Insert Default Settings (Admin passwords and Theme)
-- Default passwords: "brsi2025admin1" and "brsi2025admin2"
-- SHA-256 hashes generated for the above passwords:
INSERT INTO public.settings (key, value) VALUES
('admin1_hash', '98ed6ad7427a148287d22195477e70f7eb57a3ada85c5390dfd59e5075cabe86'),
('admin2_hash', '9612e691104e9bec47a56cf952230c30f8134ad5d8416ac35a64bb4fd23e9263'),
('whatsapp_number', '+910000000000'),
('logo_url', ''),
('theme_bg', '#f2e8c8'),
('theme_card', '#161616'),
('theme_accent', '#6bbfaa'),
('theme_brand', '#d4af37'),
('theme_heading', '#ffffff'),
('theme_text', '#e0e0e0');

-- 3. Storage Buckets
-- Note: It's recommended to create these from the Supabase Dashboard UI under "Storage".
-- Alternatively, if your SQL editor allows system inserts:
INSERT INTO storage.buckets (id, name, public) VALUES 
('events-images', 'events-images', true),
('biobuzz-covers', 'biobuzz-covers', true),
('board-photos', 'board-photos', true),
('team-images', 'team-images', true),
('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies (Allow public read, allow public upload since we use anon auth)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (true);
CREATE POLICY "Allow Public Uploads" ON storage.objects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Public Update" ON storage.objects FOR UPDATE USING (true);
CREATE POLICY "Allow Public Delete" ON storage.objects FOR DELETE USING (true);

-- 4. Enable RLS but allow anonymous access (since we are doing custom JS hashing auth)
-- WARNING: This means anyone with your anon key can write to the database.
-- For a production site, consider migrating to Supabase Auth.
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biobuzz ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.events FOR SELECT USING (true);
CREATE POLICY "Enable all access for all users" ON public.events FOR ALL USING (true);

CREATE POLICY "Enable read access for all users" ON public.biobuzz FOR SELECT USING (true);
CREATE POLICY "Enable all access for all users" ON public.biobuzz FOR ALL USING (true);

CREATE POLICY "Enable read access for all users" ON public.board_members FOR SELECT USING (true);
CREATE POLICY "Enable all access for all users" ON public.board_members FOR ALL USING (true);

CREATE POLICY "Enable read access for all users" ON public.team_events FOR SELECT USING (true);
CREATE POLICY "Enable all access for all users" ON public.team_events FOR ALL USING (true);

CREATE POLICY "Enable read access for all users" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Enable all access for all users" ON public.settings FOR ALL USING (true);
