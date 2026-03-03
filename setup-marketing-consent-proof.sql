-- Marketing consent proof (GDPR-friendly audit trail)
-- Run this in Supabase SQL editor before enabling marketing email automations in production.

-- 1) Extend notification_preferences with current consent proof snapshot
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS marketing_consent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS marketing_consent_revoked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS marketing_consent_source VARCHAR(120),
ADD COLUMN IF NOT EXISTS marketing_consent_source_path VARCHAR(200),
ADD COLUMN IF NOT EXISTS marketing_consent_language VARCHAR(5),
ADD COLUMN IF NOT EXISTS marketing_consent_version VARCHAR(80),
ADD COLUMN IF NOT EXISTS marketing_consent_text TEXT,
ADD COLUMN IF NOT EXISTS marketing_consent_ip_hash VARCHAR(128),
ADD COLUMN IF NOT EXISTS marketing_consent_user_agent TEXT;

COMMENT ON COLUMN notification_preferences.marketing_consent_at IS 'Timestamp of latest explicit marketing email consent grant';
COMMENT ON COLUMN notification_preferences.marketing_consent_revoked_at IS 'Timestamp of latest explicit marketing email consent revocation';
COMMENT ON COLUMN notification_preferences.marketing_consent_source IS 'Where the consent was collected (e.g. free-pdf-popup)';
COMMENT ON COLUMN notification_preferences.marketing_consent_source_path IS 'Page path where consent was collected';
COMMENT ON COLUMN notification_preferences.marketing_consent_language IS 'Language used for the consent text';
COMMENT ON COLUMN notification_preferences.marketing_consent_version IS 'Internal version of the consent wording';
COMMENT ON COLUMN notification_preferences.marketing_consent_text IS 'Consent wording snapshot shown to the user';
COMMENT ON COLUMN notification_preferences.marketing_consent_ip_hash IS 'SHA-256 hash of IP address (salted)';
COMMENT ON COLUMN notification_preferences.marketing_consent_user_agent IS 'User agent string at the time of consent';

-- 2) Append-only audit table for all consent changes (grant/revoke)
CREATE TABLE IF NOT EXISTS consent_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type VARCHAR(80) NOT NULL,
  granted BOOLEAN NOT NULL,
  source VARCHAR(120),
  source_path VARCHAR(200),
  language VARCHAR(5),
  consent_version VARCHAR(80),
  consent_text TEXT,
  ip_hash VARCHAR(128),
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE consent_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own consent events" ON consent_events;
CREATE POLICY "Users can view their own consent events" ON consent_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_consent_events_user_id ON consent_events(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_events_type_created_at ON consent_events(consent_type, created_at DESC);

GRANT ALL ON public.consent_events TO anon, authenticated;
