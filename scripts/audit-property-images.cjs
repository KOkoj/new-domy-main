#!/usr/bin/env node
/**
 * Audit every property's image URLs and prune dead ones.
 *
 * Walks the local_properties table, HEAD-checks every URL in each property's
 * `images` array, drops any URL that doesn't return 2xx/3xx, and rewrites
 * `mainImage` so it still points at a surviving photo (or 0 if the marked
 * main was the one that died). Properties whose every image is dead end up
 * with `images: []`; the public propertyApi filters those out so the site
 * neither lists nor serves them.
 *
 * Local /uploads/... paths are assumed alive (we'd need the live host's URL
 * to HEAD them and the script doesn't know it; failures there would be a
 * different bug entirely).
 *
 * Usage:
 *   npm run audit:images                  # live run, persists changes
 *   npm run audit:images -- --dry-run     # report only, don't write
 *   npm run audit:images -- --limit 25    # first 25 properties only
 *   npm run audit:images -- --slug X      # just one property by slug
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local
 * or the shell. Uses the service-role key so RLS doesn't reject the writes.
 */

const fs = require('fs/promises')
const path = require('path')

const PROJECT_ROOT = process.cwd()
const ENV_FILE = path.join(PROJECT_ROOT, '.env.local')
const TABLE = 'local_properties'

const HEAD_TIMEOUT_MS = 8000
const URL_CONCURRENCY = 8       // simultaneous URL checks within a property
const PROPERTY_CONCURRENCY = 4   // simultaneous properties in flight

const argv = process.argv.slice(2)
const DRY_RUN = argv.includes('--dry-run')
const LIMIT_IDX = argv.indexOf('--limit')
const LIMIT = LIMIT_IDX !== -1 ? parseInt(argv[LIMIT_IDX + 1], 10) : null
const SLUG_IDX = argv.indexOf('--slug')
const SLUG_FILTER = SLUG_IDX !== -1 ? argv[SLUG_IDX + 1] : null

// ---------------------------------------------------------------------------

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

function hostOf(url) {
  try {
    return new URL(url).host
  } catch {
    return '<unparseable>'
  }
}

function isLocalAsset(url) {
  return typeof url === 'string' && url.startsWith('/')
}

async function checkUrl(url) {
  // Local uploads (served by Next.js itself) — assume alive. We can't
  // meaningfully HEAD them without knowing the deployed host, and if those
  // ever 404 it'll be a different (deployment) bug, not stale CDN data.
  if (isLocalAsset(url)) return { url, ok: true, status: 'local' }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), HEAD_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: {
        // Idealista's CDN sometimes refuses default fetch UAs. Pretending to
        // be a real browser keeps it happy; this only runs from your laptop.
        'User-Agent': 'Mozilla/5.0 (compatible; domyvitalii-audit/1.0)',
        Accept: 'image/*,*/*;q=0.8'
      },
      signal: controller.signal
    })

    // 2xx is alive. 3xx with redirect:'follow' should already resolve, so any
    // 3xx that reached us means the redirect chain itself failed — count as
    // dead. 4xx/5xx are dead. 405 (method not allowed) is the one ambiguous
    // case where the resource may exist but doesn't accept HEAD — fall back
    // to a tiny GET to confirm.
    if (res.ok) return { url, ok: true, status: res.status }
    if (res.status === 405) {
      return checkUrlViaGet(url, controller, timer)
    }
    return { url, ok: false, status: res.status }
  } catch (err) {
    return { url, ok: false, status: err?.name === 'AbortError' ? 'timeout' : (err?.code || 'error') }
  } finally {
    clearTimeout(timer)
  }
}

async function checkUrlViaGet(url, parentController, parentTimer) {
  // Reuse parent timer; it's already running.
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; domyvitalii-audit/1.0)',
        Range: 'bytes=0-0'
      },
      signal: parentController.signal
    })
    // Don't read the body; we only care whether the request succeeded.
    if (res.body && typeof res.body.cancel === 'function') {
      try { await res.body.cancel() } catch { /* ignore */ }
    }
    return { url, ok: res.ok || res.status === 206, status: res.status }
  } catch (err) {
    return { url, ok: false, status: err?.code || 'error' }
  }
}

async function mapWithConcurrency(items, concurrency, fn) {
  const results = new Array(items.length)
  let next = 0

  async function worker() {
    while (true) {
      const i = next++
      if (i >= items.length) return
      results[i] = await fn(items[i], i)
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker))
  return results
}

function pickNewMainIndex(originalImages, originalMainIndex, survivors) {
  if (survivors.length === 0) return 0
  const previousMainUrl = originalImages[originalMainIndex]
  const stillThere = survivors.indexOf(previousMainUrl)
  if (stillThere !== -1) return stillThere
  // Original main died — fall back to first surviving photo.
  return 0
}

async function auditProperty(property, summary) {
  const originalImages = Array.isArray(property.images) ? property.images : []
  const rawMain = Number.isInteger(property.mainImage) ? property.mainImage : 0
  const originalMainIndex = rawMain >= 0 && rawMain < originalImages.length ? rawMain : 0

  if (originalImages.length === 0) {
    summary.alreadyEmpty += 1
    return { changed: false, next: property, deadCount: 0 }
  }

  const checks = await mapWithConcurrency(originalImages, URL_CONCURRENCY, checkUrl)
  const survivors = checks.filter((c) => c.ok).map((c) => c.url)
  const deadChecks = checks.filter((c) => !c.ok)

  for (const c of deadChecks) {
    const host = hostOf(c.url)
    summary.deadByHost[host] = (summary.deadByHost[host] || 0) + 1
    summary.deadByStatus[c.status] = (summary.deadByStatus[c.status] || 0) + 1
  }

  if (deadChecks.length === 0) {
    summary.allAlive += 1
    return { changed: false, next: property, deadCount: 0 }
  }

  const newMainIndex = pickNewMainIndex(originalImages, originalMainIndex, survivors)
  const next = {
    ...property,
    images: survivors,
    mainImage: newMainIndex,
    _updatedAt: new Date().toISOString()
  }

  if (survivors.length === 0) {
    summary.fullyDead += 1
  } else if (deadChecks.length > 0) {
    summary.partiallyDead += 1
  }

  return { changed: true, next, deadCount: deadChecks.length, survivors: survivors.length }
}

// ---------------------------------------------------------------------------

async function main() {
  await loadDotEnvLocal()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    console.error('Missing env vars:')
    console.error('  NEXT_PUBLIC_SUPABASE_URL =', url ? 'set' : 'MISSING')
    console.error('  SUPABASE_SERVICE_ROLE_KEY =', serviceKey ? 'set' : 'MISSING')
    process.exit(1)
  }

  const { createClient } = require('@supabase/supabase-js')
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  let query = supabase.from(TABLE).select('id, slug, data')
  if (SLUG_FILTER) query = query.eq('slug', SLUG_FILTER)
  if (LIMIT) query = query.limit(LIMIT)

  const { data: rows, error } = await query
  if (error) {
    console.error('Failed to load properties:', error)
    process.exit(1)
  }
  if (!rows || rows.length === 0) {
    console.log('No properties found to audit.')
    return
  }

  console.log(
    `Auditing ${rows.length} properties` +
    (DRY_RUN ? ' (dry run — no writes)' : '') +
    (SLUG_FILTER ? ` (slug=${SLUG_FILTER})` : '') +
    (LIMIT ? ` (limit ${LIMIT})` : '')
  )
  console.log('')

  const summary = {
    total: rows.length,
    alreadyEmpty: 0,
    allAlive: 0,
    partiallyDead: 0,
    fullyDead: 0,
    deadByHost: {},
    deadByStatus: {}
  }
  const updates = []

  let processed = 0
  await mapWithConcurrency(rows, PROPERTY_CONCURRENCY, async (row) => {
    const result = await auditProperty(row.data, summary)
    processed += 1
    process.stdout.write(`  [${processed}/${rows.length}] ${row.slug}: `)
    if (!result.changed) {
      console.log('ok')
    } else {
      console.log(
        `${result.deadCount} dead, ${result.survivors} survivors` +
        (result.survivors === 0 ? ' (will be hidden)' : '')
      )
      updates.push({
        id: row.id,
        slug: row.slug,
        data: result.next,
        updated_at: new Date().toISOString()
      })
    }
  })

  console.log('')
  console.log('Summary:')
  console.log(`  Properties scanned:      ${summary.total}`)
  console.log(`  Already empty (no imgs): ${summary.alreadyEmpty}`)
  console.log(`  All images alive:        ${summary.allAlive}`)
  console.log(`  Some dead, some alive:   ${summary.partiallyDead}`)
  console.log(`  Every image dead:        ${summary.fullyDead}  (will be hidden from the site)`)

  const hostEntries = Object.entries(summary.deadByHost).sort((a, b) => b[1] - a[1])
  if (hostEntries.length) {
    console.log('')
    console.log('  Dead URLs by host:')
    for (const [host, count] of hostEntries) {
      console.log(`    ${host.padEnd(28)} ${count}`)
    }
  }
  const statusEntries = Object.entries(summary.deadByStatus).sort((a, b) => b[1] - a[1])
  if (statusEntries.length) {
    console.log('')
    console.log('  Dead URLs by status:')
    for (const [status, count] of statusEntries) {
      console.log(`    ${String(status).padEnd(8)} ${count}`)
    }
  }

  if (DRY_RUN) {
    console.log('')
    console.log(`--dry-run: would persist ${updates.length} updated rows. Re-run without --dry-run to apply.`)
    return
  }

  if (updates.length === 0) {
    console.log('')
    console.log('Nothing to update.')
    return
  }

  console.log('')
  console.log(`Writing ${updates.length} updated rows back to ${TABLE}...`)
  const BATCH = 100
  for (let i = 0; i < updates.length; i += BATCH) {
    const batch = updates.slice(i, i + BATCH)
    const { error: upsertError } = await supabase.from(TABLE).upsert(batch, { onConflict: 'id' })
    if (upsertError) {
      console.error(`  batch starting at ${i} failed:`, upsertError)
      process.exit(1)
    }
    process.stdout.write(`  ${Math.min(i + BATCH, updates.length)}/${updates.length}\r`)
  }
  console.log(`  ${updates.length}/${updates.length}`)
  console.log('Done.')
}

main().catch((err) => {
  console.error('Audit failed:', err)
  process.exit(1)
})
