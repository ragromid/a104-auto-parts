-- ==============================================================
-- Schema backup for a104-auto-parts (KNK AVTO)
-- Compatible with PostgreSQL / Supabase
-- ==============================================================

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT,
    category TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    price NUMERIC DEFAULT 0,
    info TEXT,
    image TEXT,
    images TEXT[],
    recommended BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Site Settings Table (Global app configuration)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    about_title TEXT,
    about_heading TEXT,
    about_description TEXT,
    about_image TEXT,
    hero_slides JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Enable Row Level Security (RLS) & Public Read Access
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to everyone
CREATE POLICY "Allow public read access to categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public read access to site_settings" ON public.site_settings FOR SELECT USING (true);

-- Allow authenticated users to perform all operations
CREATE POLICY "Allow auth all categories" ON public.categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth all products" ON public.products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth all site_settings" ON public.site_settings FOR ALL USING (auth.role() = 'authenticated');

-- 5. Storage Bucket (product-images)
-- Note: In Supabase, you can create this via Dashboard > Storage > New bucket: "product-images" (Public).
