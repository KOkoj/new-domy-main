
-- Check if document_access_logs table exists and has data
SELECT count(*) FROM document_access_logs;

-- Check table definition
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'document_access_logs';

-- Check policies
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'document_access_logs';
