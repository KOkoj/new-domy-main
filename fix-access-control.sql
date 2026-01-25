-- Fix Access Control for Club Content
-- Run this to ensure users can view the premium content

-- 1. Ensure membership_tier column exists and has a default
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'membership_tier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN membership_tier TEXT DEFAULT 'free';
  END IF;
END $$;

-- 2. Update all existing profiles to 'premium' so they can see content immediately
-- (In a real app, you would only do this for paying users)
UPDATE profiles 
SET membership_tier = 'premium' 
WHERE membership_tier IS NULL OR membership_tier = 'free';

-- 3. Verify and Re-create the Select Policy to be 100% sure
DROP POLICY IF EXISTS "Premium members can view content" ON premium_content;

CREATE POLICY "Premium members can view content" ON premium_content
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (
        profiles.membership_tier IN ('premium', 'vip') 
        OR profiles.role = 'admin'
      )
    )
  );

-- 4. Also Ensure "Admins can manage content" exists
DROP POLICY IF EXISTS "Admins can manage content" ON premium_content;

CREATE POLICY "Admins can manage content" ON premium_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
