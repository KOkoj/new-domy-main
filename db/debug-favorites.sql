-- DEBUG FAVORITES SCRIPT
-- Run this script to verify the favorites table status and check for issues

-- 1. Check table existence and columns
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name = 'favorites';

-- 2. Check if there are any existing favorites
SELECT count(*) as total_favorites FROM favorites;

-- 3. Check RLS status
SELECT 
    tablename, 
    rowsecurity 
FROM 
    pg_tables 
WHERE 
    tablename = 'favorites';

-- 4. Verify user can access favorites (Simulation not easy here, but we can check policies)
SELECT * FROM pg_policies WHERE tablename = 'favorites';

-- 5. Force update permissions just in case (Safe to run)
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

GRANT ALL ON favorites TO authenticated;
GRANT ALL ON favorites TO service_role;

-- 6. Insert a dummy favorite for testing (OPTIONAL - Comment out if not needed)
-- Note: You need a valid user UUID for this to work.
-- INSERT INTO favorites (user_id, listing_id) 
-- VALUES ('YOUR_USER_UUID_HERE', 'test-property-123')
-- ON CONFLICT DO NOTHING;
