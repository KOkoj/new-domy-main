-- Add columns for property alert functionality to saved_searches table
-- Run this in your Supabase SQL Editor to enable the cron job alerts feature

-- Add alertsEnabled column (default true for existing searches)
ALTER TABLE saved_searches 
ADD COLUMN IF NOT EXISTS "alertsEnabled" BOOLEAN DEFAULT true;

-- Add lastAlertSent column to track when we last sent an alert
ALTER TABLE saved_searches 
ADD COLUMN IF NOT EXISTS "lastAlertSent" TIMESTAMP WITH TIME ZONE;

-- Add lastMatchCount to track how many properties matched last time
ALTER TABLE saved_searches 
ADD COLUMN IF NOT EXISTS "lastMatchCount" INTEGER DEFAULT 0;

-- Add index for efficient cron queries
CREATE INDEX IF NOT EXISTS idx_saved_searches_alerts_enabled 
ON saved_searches("alertsEnabled") 
WHERE "alertsEnabled" = true;

-- Update existing searches to enable alerts by default
UPDATE saved_searches 
SET "alertsEnabled" = true 
WHERE "alertsEnabled" IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN saved_searches."alertsEnabled" IS 'Whether to send email alerts when new properties match this search';
COMMENT ON COLUMN saved_searches."lastAlertSent" IS 'Timestamp of the last time an alert was sent for this search';
COMMENT ON COLUMN saved_searches."lastMatchCount" IS 'Number of properties that matched in the last alert';

-- Display success message
SELECT 'Alert columns added successfully to saved_searches table!' AS message;
