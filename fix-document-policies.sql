-- Add missing admin policies for premium_documents table
-- Run this SQL in your Supabase SQL Editor

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can insert documents" ON premium_documents;
DROP POLICY IF EXISTS "Admins can update documents" ON premium_documents;
DROP POLICY IF EXISTS "Admins can delete documents" ON premium_documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON premium_documents;

-- Policy: Admins can insert documents
CREATE POLICY "Admins can insert documents" ON premium_documents
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can update documents
CREATE POLICY "Admins can update documents" ON premium_documents
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can delete documents
CREATE POLICY "Admins can delete documents" ON premium_documents
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can view all documents (in addition to premium members)
CREATE POLICY "Admins can view all documents" ON premium_documents
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Verify the policies were created
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'premium_documents';
