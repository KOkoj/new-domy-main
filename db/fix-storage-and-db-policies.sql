-- Fix Storage and Database Policies for Documents
-- Run this in Supabase SQL Editor

-- 1. Allow authenticated users to upload/manage files in 'documents' storage bucket
BEGIN;
  -- Insert policy (Upload)
  DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
  CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK ( bucket_id = 'documents' );

  -- Select policy (Read/Download)
  DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
  CREATE POLICY "Allow authenticated reads" ON storage.objects
  FOR SELECT TO authenticated
  USING ( bucket_id = 'documents' );

  -- Update policy (Replace file)
  DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
  CREATE POLICY "Allow authenticated updates" ON storage.objects
  FOR UPDATE TO authenticated
  USING ( bucket_id = 'documents' );

  -- Delete policy (Remove file)
  DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
  CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE TO authenticated
  USING ( bucket_id = 'documents' );
COMMIT;

-- 2. Ensure Database Policies are correct (just to be safe)
BEGIN;
  -- Insert
  DROP POLICY IF EXISTS "Authenticated users can insert documents" ON premium_documents;
  CREATE POLICY "Authenticated users can insert documents" ON premium_documents
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

  -- Update
  DROP POLICY IF EXISTS "Authenticated users can update documents" ON premium_documents;
  CREATE POLICY "Authenticated users can update documents" ON premium_documents
    FOR UPDATE 
    USING (auth.role() = 'authenticated');

  -- Delete
  DROP POLICY IF EXISTS "Authenticated users can delete documents" ON premium_documents;
  CREATE POLICY "Authenticated users can delete documents" ON premium_documents
    FOR DELETE 
    USING (auth.role() = 'authenticated');

  -- Select (Read)
  DROP POLICY IF EXISTS "Authenticated users can view all documents" ON premium_documents;
  CREATE POLICY "Authenticated users can view all documents" ON premium_documents
    FOR SELECT 
    USING (auth.role() = 'authenticated');
COMMIT;
