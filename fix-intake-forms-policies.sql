-- Fix RLS Policies for Client Intake Forms
-- Run this to allow Admins to view and manage intake forms

-- 1. Drop existing admin policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can view all intake forms" ON client_intake_forms;
DROP POLICY IF EXISTS "Admins can update intake forms" ON client_intake_forms;

-- 2. Create Policy: Admins can view all intake forms
CREATE POLICY "Admins can view all intake forms" ON client_intake_forms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 3. Create Policy: Admins can update intake forms (e.g. status)
CREATE POLICY "Admins can update intake forms" ON client_intake_forms
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
