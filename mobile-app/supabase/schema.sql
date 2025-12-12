-- Fashion Advisor - Supabase Database Schema
-- Създай този скрипт в Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USER PROFILES TABLE
-- ============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{
    "style_tags": [],
    "favorite_colors": [],
    "sizes": {}
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can only access their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. CLOTHING ITEMS TABLE
-- ============================================
CREATE TYPE clothing_category AS ENUM (
  'tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories'
);

CREATE TYPE season_type AS ENUM (
  'spring', 'summer', 'fall', 'winter'
);

CREATE TABLE public.clothing_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic info
  name TEXT NOT NULL,
  category clothing_category NOT NULL,
  subcategory TEXT,
  
  -- Appearance
  color TEXT NOT NULL,
  secondary_color TEXT,
  pattern TEXT, -- solid, striped, floral, etc.
  
  -- Details
  brand TEXT,
  material TEXT,
  size TEXT,
  
  -- Seasonality & occasions
  seasons season_type[] DEFAULT '{}',
  occasions TEXT[] DEFAULT '{}', -- work, casual, formal, sport, etc.
  
  -- Purchase info
  purchase_price DECIMAL(10,2),
  purchase_date DATE,
  purchase_location TEXT,
  
  -- Images
  image_url TEXT NOT NULL,
  image_no_bg_url TEXT, -- Image with background removed
  
  -- Usage tracking
  times_worn INTEGER DEFAULT 0,
  last_worn DATE,
  
  -- Organization
  favorite BOOLEAN DEFAULT FALSE,
  archived BOOLEAN DEFAULT FALSE,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_clothing_items_user ON public.clothing_items(user_id);
CREATE INDEX idx_clothing_items_category ON public.clothing_items(category);
CREATE INDEX idx_clothing_items_favorite ON public.clothing_items(favorite) WHERE favorite = true;

-- Enable RLS
ALTER TABLE public.clothing_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own items" ON public.clothing_items
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 3. OUTFITS TABLE
-- ============================================
CREATE TABLE public.outfits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  
  -- Items in outfit (array of clothing_item IDs)
  items UUID[] NOT NULL DEFAULT '{}',
  
  -- Preview (composite image)
  preview_image_url TEXT,
  
  -- Categorization
  occasions TEXT[] DEFAULT '{}',
  seasons season_type[] DEFAULT '{}',
  
  -- Usage tracking
  times_worn INTEGER DEFAULT 0,
  last_worn DATE,
  
  -- Organization
  favorite BOOLEAN DEFAULT FALSE,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_outfits_user ON public.outfits(user_id);
CREATE INDEX idx_outfits_favorite ON public.outfits(favorite) WHERE favorite = true;

-- Enable RLS
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own outfits" ON public.outfits
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 4. WEAR LOG TABLE (За Cost-Per-Wear)
-- ============================================
CREATE TABLE public.wear_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- What was worn
  clothing_item_id UUID REFERENCES public.clothing_items(id) ON DELETE CASCADE,
  outfit_id UUID REFERENCES public.outfits(id) ON DELETE CASCADE,
  
  -- When
  worn_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Context
  occasion TEXT,
  weather TEXT, -- sunny, rainy, cold, hot
  notes TEXT,
  
  -- Photo of the day (optional)
  photo_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Must have either item or outfit
  CONSTRAINT wear_log_item_or_outfit CHECK (
    clothing_item_id IS NOT NULL OR outfit_id IS NOT NULL
  )
);

-- Indexes
CREATE INDEX idx_wear_log_user ON public.wear_log(user_id);
CREATE INDEX idx_wear_log_date ON public.wear_log(worn_date);
CREATE INDEX idx_wear_log_item ON public.wear_log(clothing_item_id);

-- Enable RLS
ALTER TABLE public.wear_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own wear logs" ON public.wear_log
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 5. AI CHAT HISTORY TABLE
-- ============================================
CREATE TABLE public.ai_conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Conversation
  messages JSONB[] DEFAULT '{}',
  -- Each message: { role: 'user' | 'assistant', content: string, timestamp: string }
  
  -- Context (for AI to remember)
  context JSONB DEFAULT '{}',
  
  -- Metadata
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own conversations" ON public.ai_conversations
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 6. CALENDAR EVENTS TABLE
-- ============================================
CREATE TABLE public.calendar_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Event details
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  
  -- Associated outfit
  outfit_id UUID REFERENCES public.outfits(id) ON DELETE SET NULL,
  
  -- Or individual items
  items UUID[] DEFAULT '{}',
  
  -- Context
  occasion TEXT,
  location TEXT,
  notes TEXT,
  
  -- Reminder
  reminder_enabled BOOLEAN DEFAULT FALSE,
  reminder_time INTERVAL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_calendar_user ON public.calendar_events(user_id);
CREATE INDEX idx_calendar_date ON public.calendar_events(date);

-- Enable RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own events" ON public.calendar_events
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 7. HELPER FUNCTIONS
-- ============================================

-- Calculate Cost Per Wear for an item
CREATE OR REPLACE FUNCTION calculate_cpw(item_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  price DECIMAL;
  worn INTEGER;
BEGIN
  SELECT purchase_price, times_worn INTO price, worn
  FROM public.clothing_items
  WHERE id = item_id;
  
  IF worn = 0 OR price IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN ROUND(price / worn, 2);
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_clothing_items_updated_at
  BEFORE UPDATE ON public.clothing_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_outfits_updated_at
  BEFORE UPDATE ON public.outfits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 8. STORAGE BUCKETS
-- ============================================
-- Run these in Supabase Dashboard > Storage

-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('clothing-images', 'clothing-images', true);

-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('outfit-previews', 'outfit-previews', true);

-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('avatars', 'avatars', true);

-- Storage policies (run in SQL editor)
-- CREATE POLICY "Users can upload own images" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id IN ('clothing-images', 'outfit-previews', 'avatars') 
--     AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Public can view images" ON storage.objects
--   FOR SELECT USING (bucket_id IN ('clothing-images', 'outfit-previews', 'avatars'));

-- ============================================
-- DONE! 🎉
-- ============================================
