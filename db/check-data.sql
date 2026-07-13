-- Check actual inquiry data and table structure
-- Run this in Supabase SQL Editor to verify data exists

SELECT * FROM inquiries ORDER BY "createdAt" DESC;

-- Check profiles to verify admin status
SELECT id, email, role FROM profiles WHERE id = auth.uid();
