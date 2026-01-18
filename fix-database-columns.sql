-- Safe Database Fix Script
-- This adds missing columns to 'profiles' and 'client_intake_forms' if they don't exist.
-- It works safely even if you've already run previous scripts.

-- 1. Ensure 'profiles' table has phone and preferences columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- 2. Ensure 'client_intake_forms' has 'extra_data' column
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'client_intake_forms') THEN
        ALTER TABLE client_intake_forms ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 3. If 'client_intake_forms' doesn't exist, create it (safe version)
CREATE TABLE IF NOT EXISTS client_intake_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Information
  full_name TEXT,
  phone TEXT,
  email TEXT,
  nationality TEXT,
  current_location TEXT,
  
  -- Property Preferences
  property_types TEXT[],
  preferred_regions TEXT[],
  budget_range TEXT,
  min_bedrooms INTEGER,
  min_bathrooms INTEGER,
  min_square_meters INTEGER,
  
  -- Purchase Details
  timeline TEXT,
  purchase_reason TEXT,
  financing_needed TEXT,
  additional_requirements TEXT,
  
  -- Special Preferences
  must_have_features TEXT[],
  lifestyle_preferences TEXT,
  
  -- Additional Information
  how_did_you_hear TEXT,
  additional_notes TEXT,
  
  -- Metadata
  status TEXT DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Extra data
  extra_data JSONB DEFAULT '{}'::jsonb,

  UNIQUE(user_id)
);

-- 4. Enable RLS on client_intake_forms
ALTER TABLE client_intake_forms ENABLE ROW LEVEL SECURITY;

-- 5. Policies (Only create if they don't exist to avoid errors)
DO $$
BEGIN
    -- Check and create Select policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'client_intake_forms' AND policyname = 'Users can view their own intake form'
    ) THEN
        CREATE POLICY "Users can view their own intake form" ON client_intake_forms
        FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Check and create Insert policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'client_intake_forms' AND policyname = 'Users can insert their own intake form'
    ) THEN
        CREATE POLICY "Users can insert their own intake form" ON client_intake_forms
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Check and create Update policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'client_intake_forms' AND policyname = 'Users can update their own intake form'
    ) THEN
        CREATE POLICY "Users can update their own intake form" ON client_intake_forms
        FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 6. Index (Safe)
CREATE INDEX IF NOT EXISTS idx_client_intake_forms_user_id ON client_intake_forms(user_id);

-- 7. Success Check
SELECT 'Database columns and tables verified successfully' as status;
