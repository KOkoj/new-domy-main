-- Email-only lead capture for gated free PDFs.
-- Run after the core auth and email notification migrations.

CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT NOT NULL UNIQUE,
  source TEXT NOT NULL CHECK (source IN ('pdf_inspections', 'pdf_mistakes')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
  confirm_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  consent_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Intentionally no anon/authenticated policies. All lead access goes through
-- server API routes using SUPABASE_SERVICE_ROLE_KEY.
REVOKE ALL ON TABLE public.leads FROM anon, authenticated;

COMMENT ON TABLE public.leads IS 'Double-opt-in leads for protected free PDF assets';
COMMENT ON COLUMN public.leads.consent_text IS 'Exact consent wording shown; NULL for authenticated Klub bypasses';
