-- Ads attribution for inquiries (Google Ads / Sklik, 3k CZK plan).
-- Stores where the lead came from: UTM parameters and ad click ids
-- (gclid / gbraid / wbraid / sznclid / fbclid), first touch + last touch.
-- The API (/api/inquiries) works without these columns (it retries the insert
-- without them), so this can be run any time.
-- Run manually in the Supabase SQL Editor. Additive only, safe to re-run.

ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS attribution JSONB;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS gclid TEXT;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS "utmSource" TEXT;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS "utmMedium" TEXT;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS "utmCampaign" TEXT;

COMMENT ON COLUMN inquiries.attribution IS '{"first": {...}, "last": {...}} – utm_*, gclid, gbraid, wbraid, sznclid, fbclid, landing_path, referrer_host, ts (ms). Collected in the browser, whitelisted by lib/attribution.js.';
COMMENT ON COLUMN inquiries.gclid IS 'Google Ads click id (or gbraid/wbraid) – last touch, falls back to first touch. For Google Ads offline conversion import (valid 90 days).';
COMMENT ON COLUMN inquiries."utmSource" IS 'Last-touch utm_source (fallback first touch), e.g. google, seznam.';
COMMENT ON COLUMN inquiries."utmMedium" IS 'Last-touch utm_medium (fallback first touch), e.g. cpc.';
COMMENT ON COLUMN inquiries."utmCampaign" IS 'Last-touch utm_campaign (fallback first touch).';

CREATE INDEX IF NOT EXISTS inquiries_utm_source_idx ON inquiries ("utmSource");

-- Make PostgREST pick up the new columns immediately.
NOTIFY pgrst, 'reload schema';
