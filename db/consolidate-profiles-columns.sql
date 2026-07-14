-- Consolidate `profiles` onto ONE convention: snake_case timestamps
-- (created_at/updated_at) + first_name/last_name.
--
-- Confirmed via information_schema.columns that profiles currently has BOTH
-- sets of columns:
--   legacy (no longer written to after this migration): name, "createdAt", "updatedAt"
--   canonical (already used by the current signup trigger for new rows):
--     first_name, last_name, created_at, updated_at
--
-- This script only COPIES data forward into the canonical columns where the
-- canonical column is still empty (i.e. legacy rows created before the
-- canonical columns existed). It never touches rows that already have
-- canonical data, and it does NOT drop the legacy columns -- that's a
-- separate later cleanup once the app has run on the canonical columns for
-- a while.
--
-- Run this in the Supabase SQL editor (production) after the code deploy
-- that stops writing to name/createdAt/updatedAt.

-- 1. Backfill first_name/last_name from `name`, but only for legacy rows
--    where the canonical field is empty AND `name` looks like a real name
--    (contains a space). Single-word values are usually username-like junk
--    (e.g. an email local-part fallback) and are intentionally skipped --
--    see the review query at the bottom.
UPDATE profiles
SET
  first_name = split_part(trim(name), ' ', 1),
  last_name = NULLIF(trim(regexp_replace(trim(name), '^\S+\s*', '')), '')
WHERE
  (first_name IS NULL OR trim(first_name) = '')
  AND name IS NOT NULL
  AND trim(name) <> ''
  AND position(' ' IN trim(name)) > 0;

-- 2. Backfill created_at/updated_at from the legacy camelCase columns where
--    the canonical column is still empty.
UPDATE profiles
SET created_at = "createdAt"
WHERE created_at IS NULL AND "createdAt" IS NOT NULL;

UPDATE profiles
SET updated_at = "updatedAt"
WHERE updated_at IS NULL AND "updatedAt" IS NOT NULL;

-- 3. Review: rows that still have no first_name after the backfill.
--    These have a single-word (or empty) `name` and need a manual decision
--    (e.g. treat the whole value as first_name, or look up the real name
--    from auth.users / support records).
SELECT id, name, first_name, last_name, "createdAt", created_at
FROM profiles
WHERE first_name IS NULL OR trim(first_name) = '';

-- 4. Sanity check: canonical timestamp coverage after backfill.
SELECT
  count(*) AS total_rows,
  count(*) FILTER (WHERE created_at IS NULL) AS missing_created_at,
  count(*) FILTER (WHERE updated_at IS NULL) AS missing_updated_at,
  count(*) FILTER (WHERE first_name IS NULL OR trim(first_name) = '') AS missing_first_name
FROM profiles;
