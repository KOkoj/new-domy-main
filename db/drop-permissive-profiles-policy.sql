-- Remove the over-permissive "any authenticated user can read all profiles" policy.
--
-- Why this is safe to drop:
-- Every client-side query against `profiles` in the codebase either:
--   1. Filters by `.eq('id', user.id)` (own profile only) -> already covered by
--      "Users can read own profile" (USING auth.uid() = id), or
--   2. Is an admin-only page/widget (app/admin/page.js "recent users" widget,
--      app/admin/users/page.js) -> already covered by the existing
--      "Admins can read all profiles" (is_admin()) policy.
-- No legitimate feature relies on a non-admin, non-owner reading another
-- user's profile row. See chat/PR notes for the full audit.
--
-- Run this manually in the Supabase SQL editor (production) after confirming
-- the audit above still holds.

DROP POLICY IF EXISTS "Authenticated users can read profiles" ON profiles;
