-- Check if the test inquiry was actually saved
SELECT id, "userId", name, message, "createdAt" FROM inquiries ORDER BY "createdAt" DESC LIMIT 5;

-- Check your profile role
SELECT id, name, role FROM profiles;

-- Check RLS policies on inquiries table
SELECT policyname, cmd, roles, qual 
FROM pg_policies 
WHERE tablename = 'inquiries';
