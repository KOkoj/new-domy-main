-- Make inquiries table more flexible for General Contact messages
-- Run this in Supabase SQL Editor

-- 1. Make listingId optional (nullable) so we can store general messages
ALTER TABLE inquiries ALTER COLUMN "listingId" DROP NOT NULL;

-- 2. Add 'type' column to distinguish Property Inquiry vs General Contact
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'property';

-- 3. Add 'phone' column (Contact form has it)
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS phone TEXT;

-- 4. Ensure Admin Policy exists (re-run just in case)
DROP POLICY IF EXISTS "Admins can view all inquiries" ON inquiries;
CREATE POLICY "Admins can view all inquiries" ON inquiries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 5. Make sure your user is an admin (Safety net)
-- Only updates if you are currently logged in
UPDATE profiles 
SET role = 'admin' 
WHERE id = auth.uid();
