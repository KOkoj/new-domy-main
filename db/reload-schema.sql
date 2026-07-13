-- Reload Schema Cache Trigger
-- Run this in your Supabase SQL Editor to force the API to refresh its cache
NOTIFY pgrst, 'reload schema';
