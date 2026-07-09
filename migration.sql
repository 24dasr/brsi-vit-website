-- BRSI VIT Chapter - Blog Feature Migration
-- Run this in the Supabase SQL Editor to add the Blog feature to the live project

-- 1. Create blogs table
CREATE TABLE public.blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT,
    published_date DATE NOT NULL,
    cover_url TEXT,
    excerpt TEXT,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create storage bucket for blog cover images
INSERT INTO storage.buckets (id, name, public) VALUES 
('blog-covers', 'blog-covers', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Enable RLS with public access (matching existing pattern)
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.blogs FOR SELECT USING (true);
CREATE POLICY "Enable all access for all users" ON public.blogs FOR ALL USING (true);
