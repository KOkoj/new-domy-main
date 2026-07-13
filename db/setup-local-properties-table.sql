-- ============================================================================
-- local_properties: backing store for lib/localPropertiesStore.js
-- ----------------------------------------------------------------------------
-- Replaces the per-instance /tmp/local-properties.json fallback that quietly
-- broke admin edits on Vercel (each serverless instance had its own /tmp,
-- so saved mainImage / status / price changes only stuck for whichever
-- instance handled the save and disappeared on cold starts).
--
-- One row per property. `data` holds the full property object as jsonb so
-- the existing JSON shape stays intact end-to-end; `id` and `slug` are
-- denormalised onto columns so the most common lookups stay indexed.
--
-- Run this once in the Supabase SQL editor. Idempotent.
-- ============================================================================

create table if not exists public.local_properties (
  id          text        primary key,
  slug        text        unique not null,
  data        jsonb       not null,
  updated_at  timestamptz not null default now()
);

create index if not exists local_properties_slug_idx
  on public.local_properties (slug);

-- RLS on, no public policies. The service-role key (used by
-- lib/supabaseAdmin.js on the server) bypasses RLS, so admin reads/writes
-- still work; anonymous and authenticated browser clients have no direct
-- access — they always go through our API routes.
alter table public.local_properties enable row level security;
