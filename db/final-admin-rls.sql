-- CANONICAL RLS for premium_documents, premium_content, and the 'documents'
-- storage bucket. Run this in the Supabase SQL Editor.
--
-- This script supersedes and replaces ALL of the following (now deleted from
-- the repo), which repeatedly redefined the same policies with contradictory
-- intent (admin-only vs any-authenticated-user):
--   db/fix-document-policies.sql
--   db/fix-document-upload-permissive.sql
--   db/fix-storage-and-db-policies.sql
--   db/fix-admin-access.sql   (also contained an unscoped
--                              "UPDATE profiles SET role='admin'" -- never run it)
--
-- Design after this script:
--   * All admin WRITES to premium_documents / premium_content / storage go
--     through server API routes using the service-role key (bypasses RLS),
--     so NO client-side write policy is needed or created for admins.
--   * Client-side READS remain for the member-facing dashboard pages.
--   * Idempotent: drops every existing policy on the affected tables first.

-- ============================================================
-- 1. Drop ALL existing policies on the affected tables
-- ============================================================
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('premium_documents', 'premium_content')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- Drop the known policies on the 'documents' storage bucket created by the
-- superseded scripts and by the manual hotfix, so exactly one canonical set
-- remains. (We do not drop unrelated storage policies for other buckets.)
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON storage.objects;
-- Manually created hotfix policies:
DROP POLICY IF EXISTS "Authenticated can read documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admins can write documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete documents bucket" ON storage.objects;

-- ============================================================
-- 2. premium_documents
-- ============================================================
ALTER TABLE public.premium_documents ENABLE ROW LEVEL SECURITY;

-- Public docs (is_public = true) readable without auth, preserving the
-- original semantics. Everything else: members (premium/vip) and admins.
-- Writes: service-role only (no policy).
CREATE POLICY "premium_documents_select" ON public.premium_documents
  FOR SELECT
  USING (
    is_public = true
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND (
          profiles.membership_tier IN ('premium', 'vip')
          OR profiles.role = 'admin'
        )
    )
  );

-- ============================================================
-- 3. premium_content
-- ============================================================
ALTER TABLE public.premium_content ENABLE ROW LEVEL SECURITY;

-- Members (premium/vip) and admins can read. Writes: service-role only.
CREATE POLICY "premium_content_select" ON public.premium_content
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND (
          profiles.membership_tier IN ('premium', 'vip')
          OR profiles.role = 'admin'
        )
    )
  );

-- ============================================================
-- 4. Storage: 'documents' bucket
-- ============================================================
-- Reads stay allowed for authenticated users (dashboard signed-URL
-- downloads). The bucket itself is public, so public URLs continue to work
-- either way. No INSERT/UPDATE/DELETE policies are created: all admin writes
-- go through /api/admin/documents and /api/admin/club-content/upload, which
-- use the service-role client and bypass RLS.
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view documents" ON storage.objects;
CREATE POLICY "documents_bucket_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents');

-- ============================================================
-- 5. Verify
-- ============================================================
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE (schemaname = 'public' AND tablename IN ('premium_documents', 'premium_content'))
   OR (schemaname = 'storage' AND tablename = 'objects')
ORDER BY schemaname, tablename, policyname;
