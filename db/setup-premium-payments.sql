-- Premium PDF payments schema
-- Run this in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS premium_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_key TEXT NOT NULL CHECK (product_key IN ('premium-notary', 'premium-domy')),
  stripe_session_id TEXT NOT NULL UNIQUE,
  stripe_payment_intent TEXT,
  stripe_customer_id TEXT,
  stripe_customer_email TEXT,
  amount_total INTEGER,
  currency TEXT,
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'refunded', 'disputed')),
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_premium_purchases_user_product_status
  ON premium_purchases(user_id, product_key, status);

CREATE INDEX IF NOT EXISTS idx_premium_purchases_purchased_at
  ON premium_purchases(purchased_at DESC);

ALTER TABLE premium_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own premium purchases" ON premium_purchases;
CREATE POLICY "Users can view own premium purchases" ON premium_purchases
  FOR SELECT USING (auth.uid() = user_id);

-- Updates/inserts are managed server-side with service-role key.
