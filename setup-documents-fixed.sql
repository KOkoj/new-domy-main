
-- Setup Documents Tables
-- Run this in Supabase SQL Editor to enable the Documents feature

-- 1. Create Premium Documents Table
CREATE TABLE IF NOT EXISTS premium_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size TEXT,
  category TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Document Access Log Table
CREATE TABLE IF NOT EXISTS document_access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES premium_documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('view', 'download', 'preview')),
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE premium_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
-- Allow everyone to view documents (for demo purposes) or restrict to authenticated
DROP POLICY IF EXISTS "Authenticated users can view premium documents" ON premium_documents;
CREATE POLICY "Authenticated users can view premium documents" ON premium_documents
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow users to manage their own access logs
DROP POLICY IF EXISTS "Users can view their own access logs" ON document_access_logs;
CREATE POLICY "Users can view their own access logs" ON document_access_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own access logs" ON document_access_logs;
CREATE POLICY "Users can insert their own access logs" ON document_access_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Insert Sample Data (if empty)
INSERT INTO premium_documents (name, description, file_type, file_url, file_size, category, is_public)
SELECT 'Italian Property Buying Guide 2025', 'Comprehensive guide to buying property in Italy', 'PDF', 'https://example.com/guide.pdf', '2.4 MB', 'Guides', true
WHERE NOT EXISTS (SELECT 1 FROM premium_documents);

INSERT INTO premium_documents (name, description, file_type, file_url, file_size, category, is_public)
SELECT 'Tax Implications for Foreign Buyers', 'Detailed breakdown of taxes and fees', 'PDF', 'https://example.com/tax.pdf', '1.1 MB', 'Legal', true
WHERE NOT EXISTS (SELECT 1 FROM premium_documents WHERE name = 'Tax Implications for Foreign Buyers');

INSERT INTO premium_documents (name, description, file_type, file_url, file_size, category, is_public)
SELECT 'Renovation Cost Estimator', 'Excel template for estimating renovation costs', 'XLSX', 'https://example.com/calculator.xlsx', '0.5 MB', 'Tools', true
WHERE NOT EXISTS (SELECT 1 FROM premium_documents WHERE name = 'Renovation Cost Estimator');
