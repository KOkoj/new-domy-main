-- Fix for Client Intake Form
-- Run this in your Supabase SQL Editor

-- 1. Ensure profiles table has correct columns (just in case)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
-- Note: 'preferences' column is no longer needed if we use client_intake_forms, 
-- but we can add it for backward compatibility if needed.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- 2. Create client_intake_forms table
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
  
  -- Add extra_data for fields that don't match specific columns
  extra_data JSONB DEFAULT '{}'::jsonb,

  UNIQUE(user_id)
);

-- 3. Enable RLS
ALTER TABLE client_intake_forms ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies (Drop first to avoid errors)
DROP POLICY IF EXISTS "Users can view their own intake form" ON client_intake_forms;
DROP POLICY IF EXISTS "Users can insert their own intake form" ON client_intake_forms;
DROP POLICY IF EXISTS "Users can update their own intake form" ON client_intake_forms;

CREATE POLICY "Users can view their own intake form" ON client_intake_forms
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own intake form" ON client_intake_forms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own intake form" ON client_intake_forms
  FOR UPDATE USING (auth.uid() = user_id);

-- 5. Create index for performance
CREATE INDEX IF NOT EXISTS idx_client_intake_forms_user_id ON client_intake_forms(user_id);
