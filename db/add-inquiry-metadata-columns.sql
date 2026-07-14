-- Fixes two data-loss bugs in /api/inquiries: the contact form's
-- `inquiryType` field and the property inquiry form's `propertyTitle` were
-- both accepted by the API but silently dropped before the INSERT.
-- Run this in the Supabase SQL Editor.

ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS "inquiryType" TEXT;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS "propertyTitle" TEXT;

COMMENT ON COLUMN inquiries."inquiryType" IS 'Free-text inquiry type selected in the contact form (e.g. buying, selling, legal advice).';
COMMENT ON COLUMN inquiries."propertyTitle" IS 'Human-readable label for the inquiry subject (property title, "Call booking", "Concierge Request", etc). Used in admin/notification emails.';
