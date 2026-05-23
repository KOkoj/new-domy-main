-- Add persistent response status for admin inquiry replies.
-- Run this in the Supabase SQL Editor if admin replies show:
-- "Could not find the 'responded' column of 'inquiries' in the schema cache"

ALTER TABLE inquiries
ADD COLUMN IF NOT EXISTS responded BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_inquiries_responded ON inquiries(responded);

-- Refresh PostgREST schema cache so the API sees the new column immediately.
NOTIFY pgrst, 'reload schema';
