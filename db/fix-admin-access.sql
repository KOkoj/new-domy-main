-- 1. Make all existing users admins (so you can access admin features)
UPDATE profiles SET role = 'admin';

-- 2. Allow admins to view all profiles (needed for User Management page)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT 
  USING (
    role = 'admin' OR id = auth.uid()
  );

-- 3. Allow admins to insert/update/delete documents
-- (Re-applying these to be sure)
DROP POLICY IF EXISTS "Admins can insert documents" ON premium_documents;
CREATE POLICY "Admins can insert documents" ON premium_documents
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update documents" ON premium_documents;
CREATE POLICY "Admins can update documents" ON premium_documents
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete documents" ON premium_documents;
CREATE POLICY "Admins can delete documents" ON premium_documents
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view all documents" ON premium_documents;
CREATE POLICY "Admins can view all documents" ON premium_documents
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
