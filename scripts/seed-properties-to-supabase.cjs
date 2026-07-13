#!/usr/bin/env node
/**
 * One-time seed: copy data/local-properties.json into the
 * `local_properties` Supabase table so admin edits made on Vercel
 * stop disappearing into per-instance /tmp.
 *
 * Usage:
 *   node scripts/seed-properties-to-supabase.cjs            # upsert all
 *   node scripts/seed-properties-to-supabase.cjs --dry-run  # preview only
 *   node scripts/seed-properties-to-supabase.cjs --only=slug-a,slug-b
 *   node scripts/seed-properties-to-supabase.cjs --truncate # wipe table first
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from the
 * shell or from .env.local at the project root. The service role key is
 * required so RLS doesn't reject the writes.
 */

const fs = require('fs/promises')
const path = require('path')

const PROJECT_ROOT = process.cwd()
const DATA_FILE = path.join(PROJECT_ROOT, 'data', 'local-properties.json')
const ENV_FILE = path.join(PROJECT_ROOT, '.env.local')
const TABLE = 'local_properties'
const BATCH_SIZE = 100

const argv = process.argv.slice(2)
const DRY_RUN = argv.includes('--dry-run')
const TRUNCATE = argv.includes('--truncate')
const ONLY_SLUGS = new Set(
  (argv.find((arg) => arg.startsWith('--only=')) || '')
    .slice('--only='.length)
    .split(',')
    .map((slug) => slug.trim())
    .filter(Boolean)
)

async function loadDotEnvLocal() {
  let raw
  try {
    raw = await fs.readFile(ENV_FILE, 'utf8')
  } catch {
    return
  }

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const eq = trimmed.indexOf('=')
    if (eq === -1) continue

    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

function rowFor(property) {
  if (!property || typeof property !== 'object') return null
  const id = property._id
  const slug = property?.slug?.current || property._id
  if (!id || !slug) return null
  return {
    id,
    slug,
    data: property,
    updated_at: new Date().toISOString()
  }
}

async function readProperties() {
  const raw = await fs.readFile(DATA_FILE, 'utf8')
  const parsed = JSON.parse(raw.replace(/^\uFEFF/, ''))
  if (!Array.isArray(parsed)) {
    throw new Error(`Expected ${DATA_FILE} to contain a JSON array`)
  }
  return parsed
}

async function main() {
  await loadDotEnvLocal()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    console.error('Missing env vars:')
    console.error('  NEXT_PUBLIC_SUPABASE_URL =', url ? 'set' : 'MISSING')
    console.error('  SUPABASE_SERVICE_ROLE_KEY =', serviceKey ? 'set' : 'MISSING')
    console.error('')
    console.error('Set them in .env.local or in your shell, then rerun.')
    process.exit(1)
  }

  const { createClient } = require('@supabase/supabase-js')
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  let properties = await readProperties()
  if (ONLY_SLUGS.size > 0) {
    properties = properties.filter((property) => ONLY_SLUGS.has(property?.slug?.current || property?._id))
  }
  const rows = properties.map(rowFor).filter(Boolean)
  const skipped = properties.length - rows.length

  console.log(`Loaded ${properties.length} properties from ${path.relative(PROJECT_ROOT, DATA_FILE)}`)
  if (skipped) {
    console.log(`  ${skipped} skipped (missing _id or slug)`)
  }

  if (DRY_RUN) {
    console.log('\n--dry-run: would upsert these rows (showing first 3):')
    for (const row of rows.slice(0, 3)) {
      console.log({ id: row.id, slug: row.slug, _updatedAt: row.data._updatedAt })
    }
    console.log(`\nTotal rows that would be upserted: ${rows.length}`)
    return
  }

  if (TRUNCATE) {
    console.log(`\nTruncating ${TABLE} (--truncate)...`)
    const { error } = await supabase.from(TABLE).delete().neq('id', '__never_matches__')
    if (error) {
      console.error('Truncate failed:', error)
      process.exit(1)
    }
    console.log('  table cleared.')
  }

  console.log(`\nUpserting ${rows.length} properties in batches of ${BATCH_SIZE}...`)
  let done = 0
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)
    const { error } = await supabase.from(TABLE).upsert(batch, { onConflict: 'id' })
    if (error) {
      console.error(`\nBatch starting at ${i} failed:`, error)
      process.exit(1)
    }
    done += batch.length
    process.stdout.write(`  ${done}/${rows.length}\r`)
  }
  console.log(`  ${done}/${rows.length}`)

  const { count, error: countError } = await supabase
    .from(TABLE)
    .select('id', { head: true, count: 'exact' })

  if (countError) {
    console.warn('\nUpsert succeeded but verification count failed:', countError)
  } else {
    console.log(`\nDone. ${TABLE} now contains ${count} rows.`)
  }
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
