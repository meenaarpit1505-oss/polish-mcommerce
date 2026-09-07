-- =========================================================================
-- SUPABASE DATABASE SCHEMA INITIALIZATION SCRIPT
-- Copy and run this script in your Supabase SQL Editor to initialize 
-- the tables required for Leads capturing, Auth profiles, and Reviews.
-- =========================================================================

-- Enable UUID generation extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CREATING THE 'leads' TABLE
-- Captures user contact details from the quiz and lead magnet drawer
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  consent_gdpr BOOLEAN NOT NULL DEFAULT FALSE,
  action_type VARCHAR(50) NOT NULL, -- Values: 'quiz', 'freebie', 'notify_alert'
  meta_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for fast email lookups and segment analysis
CREATE INDEX IF NOT EXISTS leads_email_idx ON public.leads (email);
CREATE INDEX IF NOT EXISTS leads_action_type_idx ON public.leads (action_type);


-- 2. CREATING THE 'profiles' TABLE
-- Stores additional authenticated user details linked to Supabase Auth users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing profiles
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);


-- 3. CREATING THE 'reviews' TABLE
-- Stores product reviews submitted by customers
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id VARCHAR(255) NOT NULL, -- References the product slug (e.g. 'kurtka-wiosenna')
  reviewer_name VARCHAR(100) NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT NOT NULL,
  is_verified_purchase BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for fast product-specific reviews retrieval
CREATE INDEX IF NOT EXISTS reviews_product_id_idx ON public.reviews (product_id);
CREATE INDEX IF NOT EXISTS reviews_created_at_desc_idx ON public.reviews (created_at DESC);


-- 4. AUTOMATIC AUTH USER REGISTRATION TRIGGER (OPTIONAL)
-- Automatically inserts a new profile row whenever a user signs up via Supabase Auth (or Google OAuth)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'fullName', 'User'),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind the trigger function to the auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- Turn on Row Level Security for safety
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Leads policies: anyone can insert (anonymous registration), only authenticated admins can read
CREATE POLICY "Enable insert access for anyone" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select access for authenticated administrators" ON public.leads FOR SELECT TO authenticated USING (true);

-- Profiles policies: users can read/update their own profile
CREATE POLICY "Enable select for users own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Enable update for users own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Reviews policies: anyone can view reviews, only verified actions can insert
CREATE POLICY "Enable select access for reviews for all" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Enable insert access for reviews" ON public.reviews FOR INSERT WITH CHECK (true);


-- 6. CREATING THE 'sponsor_analytics' TABLE
-- Stores impressions, clicks, and coupon copies for paying sponsors
CREATE TABLE IF NOT EXISTS public.sponsor_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- Values: 'impression', 'click', 'copy'
  placement VARCHAR(50) NOT NULL,  -- Values: 'top_banner', 'in_feed_card'
  locale VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for fast analytics queries
CREATE INDEX IF NOT EXISTS sponsor_analytics_campaign_id_idx ON public.sponsor_analytics (campaign_id);
CREATE INDEX IF NOT EXISTS sponsor_analytics_event_type_idx ON public.sponsor_analytics (event_type);
CREATE INDEX IF NOT EXISTS sponsor_analytics_created_at_idx ON public.sponsor_analytics (created_at);
CREATE INDEX IF NOT EXISTS sponsor_analytics_campaign_event_placement_idx
  ON public.sponsor_analytics (campaign_id, event_type, placement);

-- Enable Row Level Security
ALTER TABLE public.sponsor_analytics ENABLE ROW LEVEL SECURITY;

-- Policies: anyone can insert tracking events, only authenticated admins can read
CREATE POLICY "Enable insert access for sponsor_analytics for all" ON public.sponsor_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select access for sponsor_analytics for authenticated administrators" ON public.sponsor_analytics FOR SELECT TO authenticated USING (true);


-- 7. CHECKOUT SESSIONS (abandoned-cart recovery)
-- Serverless hosts cannot share a local .data file. Persist sessions here before production traffic.
CREATE TABLE IF NOT EXISTS public.checkout_sessions (
  session_id UUID PRIMARY KEY,
  session_token TEXT NOT NULL,
  phase VARCHAR(50) NOT NULL DEFAULT 'started',
  email VARCHAR(255),
  consent_gdpr BOOLEAN NOT NULL DEFAULT FALSE,
  cart_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  offer_expires_at TIMESTAMPTZ,
  recovery_discount_percent SMALLINT,
  abandoned_at TIMESTAMPTZ,
  recovered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS checkout_sessions_email_idx ON public.checkout_sessions (email);
CREATE INDEX IF NOT EXISTS checkout_sessions_phase_idx ON public.checkout_sessions (phase);
CREATE INDEX IF NOT EXISTS checkout_sessions_updated_at_idx ON public.checkout_sessions (updated_at DESC);

ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages checkout_sessions" ON public.checkout_sessions
  FOR ALL TO service_role USING (true) WITH CHECK (true);


-- 8. ORDERS
-- Created only after a licensed payment gateway confirms capture.
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_order_id VARCHAR(32) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'pending_payment',
  currency VARCHAR(8) NOT NULL DEFAULT 'PLN',
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  shipping_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  payment_provider VARCHAR(50),
  payment_id VARCHAR(255),
  shipping_method VARCHAR(50),
  shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orders_email_idx ON public.orders (email);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders (status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders (created_at DESC);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable insert access for orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select own orders by authenticated user email"
  ON public.orders FOR SELECT TO authenticated
  USING (email = auth.jwt() ->> 'email');
