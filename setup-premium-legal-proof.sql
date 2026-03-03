-- Premium purchase legal proof (EU digital content compliance)
-- Run in Supabase SQL Editor.

ALTER TABLE public.premium_purchases
ADD COLUMN IF NOT EXISTS checkout_language VARCHAR(5),
ADD COLUMN IF NOT EXISTS legal_version VARCHAR(80),
ADD COLUMN IF NOT EXISTS legal_acceptance_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS legal_source VARCHAR(120),
ADD COLUMN IF NOT EXISTS legal_source_path VARCHAR(200),
ADD COLUMN IF NOT EXISTS legal_terms_accepted BOOLEAN,
ADD COLUMN IF NOT EXISTS legal_privacy_accepted BOOLEAN,
ADD COLUMN IF NOT EXISTS legal_digital_waiver_accepted BOOLEAN,
ADD COLUMN IF NOT EXISTS legal_terms_text TEXT,
ADD COLUMN IF NOT EXISTS legal_privacy_text TEXT,
ADD COLUMN IF NOT EXISTS legal_digital_waiver_text TEXT,
ADD COLUMN IF NOT EXISTS legal_ip_hash VARCHAR(128),
ADD COLUMN IF NOT EXISTS legal_user_agent TEXT;

COMMENT ON COLUMN public.premium_purchases.checkout_language IS 'Checkout UI language used when legal confirmations were accepted';
COMMENT ON COLUMN public.premium_purchases.legal_version IS 'Internal legal copy version accepted by the buyer';
COMMENT ON COLUMN public.premium_purchases.legal_acceptance_at IS 'Timestamp of legal confirmations acceptance before checkout';
COMMENT ON COLUMN public.premium_purchases.legal_source IS 'Where legal confirmations were collected';
COMMENT ON COLUMN public.premium_purchases.legal_source_path IS 'Page path where legal confirmations were collected';
COMMENT ON COLUMN public.premium_purchases.legal_terms_accepted IS 'Buyer accepted terms of sale';
COMMENT ON COLUMN public.premium_purchases.legal_privacy_accepted IS 'Buyer acknowledged privacy/GDPR notice';
COMMENT ON COLUMN public.premium_purchases.legal_digital_waiver_accepted IS 'Buyer requested immediate digital supply and acknowledged withdrawal-right loss';
COMMENT ON COLUMN public.premium_purchases.legal_terms_text IS 'Terms confirmation text snapshot shown to buyer';
COMMENT ON COLUMN public.premium_purchases.legal_privacy_text IS 'Privacy confirmation text snapshot shown to buyer';
COMMENT ON COLUMN public.premium_purchases.legal_digital_waiver_text IS 'Digital waiver confirmation text snapshot shown to buyer';
COMMENT ON COLUMN public.premium_purchases.legal_ip_hash IS 'Salted SHA-256 hash of buyer IP address';
COMMENT ON COLUMN public.premium_purchases.legal_user_agent IS 'User agent at legal confirmation time';

CREATE TABLE IF NOT EXISTS public.purchase_legal_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_key TEXT NOT NULL CHECK (product_key IN ('premium-notary', 'premium-domy')),
  stripe_session_id TEXT NOT NULL UNIQUE,
  legal_version VARCHAR(80),
  language VARCHAR(5),
  acceptance_at TIMESTAMP WITH TIME ZONE,
  source VARCHAR(120),
  source_path VARCHAR(200),
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  privacy_accepted BOOLEAN NOT NULL DEFAULT false,
  digital_waiver_accepted BOOLEAN NOT NULL DEFAULT false,
  terms_text TEXT,
  privacy_text TEXT,
  digital_waiver_text TEXT,
  ip_hash VARCHAR(128),
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.purchase_legal_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own purchase legal events" ON public.purchase_legal_events;
CREATE POLICY "Users can view own purchase legal events" ON public.purchase_legal_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_purchase_legal_events_user_id
  ON public.purchase_legal_events(user_id);

CREATE INDEX IF NOT EXISTS idx_purchase_legal_events_created_at
  ON public.purchase_legal_events(created_at DESC);

GRANT ALL ON public.purchase_legal_events TO anon, authenticated;
