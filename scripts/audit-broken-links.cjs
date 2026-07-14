#!/usr/bin/env node
/**
 * Crawls the local production build for broken internal links.
 *
 * Usage: node scripts/audit-broken-links.cjs [baseUrl]
 *
 * 1. Seeds the crawl queue from /sitemap.xml and the homepage.
 * 2. Fetches every discovered page (same-origin only), extracts <a href>
 *    links, and keeps crawling until the queue is exhausted.
 * 3. For every URL, records its final HTTP status (following redirects
 *    manually so 3xx chains that land on a 404 are visible).
 * 4. Prints a table of every broken URL (404, or 3xx -> 404) together with
 *    the page(s) it was found on, and a separate table for URLs containing
 *    Czech diacritics (which usually indicate an encoding bug in link
 *    generation, since this app's real routes are ASCII-only, e.g.
 *    /clanky/... not /články/...).
 *
 * No third-party dependencies: relies on Node's built-in fetch (Node >= 18).
 */

const fs = require('fs')
const path = require('path')

const BASE_URL = process.argv[2] || 'http://localhost:3000'
const REPORT_PATH = path.join(__dirname, '..', 'audit-broken-links-report.md')
const MAX_CONCURRENCY = 8
const REQUEST_TIMEOUT_MS = 15000

const origin = new URL(BASE_URL).origin

// Extensions we should not try to crawl as HTML pages (still checked for status,
// but we won't parse them for further links).
const NON_HTML_EXTENSIONS = /\.(pdf|jpg|jpeg|png|gif|svg|webp|ico|css|js|json|xml|txt|zip|mp4|woff2?|ttf)$/i

// Czech diacritic characters (lower + upper case).
const CZECH_DIACRITICS_RE = /[áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/

/** URLs are percent-encoded by the URL class, so diacritics like "č" become
 * "%C4%8D". Decode before testing/display so the bug is actually visible. */
function hasCzechDiacritics(url) {
  let decoded = url
  try {
    decoded = decodeURIComponent(url)
  } catch {
    // malformed percent-encoding; fall back to raw string
  }
  return CZECH_DIACRITICS_RE.test(decoded)
}

function decodeForDisplay(url) {
  try {
    return decodeURIComponent(url)
  } catch {
    return url
  }
}

/** Normalizes a discovered href against a base page URL. Returns null if
 * it's not a same-origin, crawlable link (mailto:, tel:, javascript:, hash-only, etc). */
function normalizeLink(href, baseUrl) {
  if (!href) return null
  const trimmed = href.trim()
  if (!trimmed) return null
  if (/^(mailto:|tel:|javascript:|data:)/i.test(trimmed)) return null

  let resolved
  try {
    resolved = new URL(trimmed, baseUrl)
  } catch {
    return null
  }

  if (resolved.origin !== origin) return null

  resolved.hash = ''
  return resolved.toString()
}

/** Extracts href values from <a> tags in raw HTML via regex (no DOM deps). */
function extractHrefs(html) {
  const hrefs = []
  const anchorRe = /<a\b[^>]*>/gi
  let match
  while ((match = anchorRe.exec(html)) !== null) {
    const tag = match[0]
    const hrefMatch = tag.match(/\shref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i)
    if (!hrefMatch) continue
    const raw = hrefMatch[1] ?? hrefMatch[2] ?? hrefMatch[3]
    hrefs.push(decodeHtmlEntities(raw))
  }
  return hrefs
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

/** Extracts <loc> entries from a sitemap.xml body. */
function extractSitemapLocs(xml) {
  const locs = []
  const locRe = /<loc>([^<]+)<\/loc>/gi
  let match
  while ((match = locRe.exec(xml)) !== null) {
    locs.push(decodeHtmlEntities(match[1].trim()))
  }
  return locs
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await fetch(url, { ...options, signal: controller.signal, redirect: 'manual' })
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Follows redirects manually so we can report the full chain and detect
 * "3xx -> 404" cases explicitly. Returns { finalStatus, chain, error }.
 */
async function resolveStatus(url) {
  const chain = []
  let current = url
  for (let i = 0; i < 10; i++) {
    let res
    try {
      res = await fetchWithTimeout(current, { method: 'GET' })
    } catch (err) {
      return { finalStatus: null, chain, error: err.message }
    }
    chain.push({ url: current, status: res.status })

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location')
      if (!location) return { finalStatus: res.status, chain, error: null, body: '' }
      const next = new URL(location, current).toString()
      if (chain.some((c) => c.url === next)) {
        return { finalStatus: res.status, chain, error: 'redirect loop' }
      }
      current = next
      continue
    }

    let body = ''
    try {
      body = await res.text()
    } catch {
      body = ''
    }
    return { finalStatus: res.status, chain, error: null, body }
  }
  return { finalStatus: null, chain, error: 'too many redirects' }
}

async function main() {
  console.log(`Auditing internal links starting from ${BASE_URL}\n`)

  const visited = new Map() // url -> { status, chain, error }
  const foundOn = new Map() // url -> Set(sourcePages)
  const queue = []
  const queued = new Set()

  function enqueue(url, source) {
    if (!url) return
    if (!foundOn.has(url)) foundOn.set(url, new Set())
    if (source) foundOn.get(url).add(source)
    if (queued.has(url)) return
    queued.add(url)
    queue.push(url)
  }

  // Seed 1: sitemap.xml
  const sitemapUrl = new URL('/sitemap.xml', origin).toString()
  enqueue(sitemapUrl, '(seed: sitemap.xml)')

  // Seed 2: homepage
  enqueue(new URL('/', origin).toString(), '(seed: homepage)')

  let active = 0
  let resolveIdle
  const idle = new Promise((resolve) => {
    resolveIdle = resolve
  })

  async function worker() {
    while (queue.length > 0) {
      const url = queue.shift()
      active++
      try {
        const result = await resolveStatus(url)
        visited.set(url, result)

        if (result.error) {
          console.log(`  [ERROR] ${url} -> ${result.error}`)
        } else {
          console.log(`  [${result.finalStatus}] ${url}`)
        }

        if (url === sitemapUrl && result.body) {
          const locs = extractSitemapLocs(result.body)
          for (const loc of locs) {
            const normalized = normalizeLink(loc, origin)
            if (normalized) enqueue(normalized, 'sitemap.xml')
          }
        } else if (result.finalStatus === 200 && result.body) {
          const isHtml = !NON_HTML_EXTENSIONS.test(new URL(url).pathname)
          if (isHtml) {
            const hrefs = extractHrefs(result.body)
            for (const href of hrefs) {
              const normalized = normalizeLink(href, url)
              if (normalized) enqueue(normalized, url)
            }
          }
        }
      } finally {
        active--
      }
    }
    if (active === 0 && queue.length === 0) resolveIdle()
  }

  const workers = Array.from({ length: MAX_CONCURRENCY }, () => worker())
  await Promise.all(workers)
  await idle

  console.log(`\nCrawled ${visited.size} URLs total.\n`)

  // Determine broken links: final status 404, or a redirect chain that ends in 404.
  const broken = []
  for (const [url, result] of visited.entries()) {
    if (url === sitemapUrl) continue // don't report the seed itself as a "found on" target
    const is404 = result.finalStatus === 404
    const chainHadRedirect = result.chain.length > 1
    if (is404) {
      broken.push({
        url,
        status: chainHadRedirect
          ? `${result.chain[0].status} -> 404`
          : '404',
        sources: Array.from(foundOn.get(url) || [])
      })
    } else if (result.error) {
      broken.push({
        url,
        status: `ERROR (${result.error})`,
        sources: Array.from(foundOn.get(url) || [])
      })
    }
  }

  const diacriticBroken = broken.filter((b) => hasCzechDiacritics(b.url))
  const regularBroken = broken.filter((b) => !hasCzechDiacritics(b.url))

  // Also flag diacritic URLs even if they resolved OK-ish but via redirect (informational),
  // and any diacritic URL encountered at all, broken or not, since they're suspicious by nature.
  const allDiacriticUrls = Array.from(visited.keys()).filter((u) => hasCzechDiacritics(u))

  const reportLines = []
  function report(line = '') {
    reportLines.push(line)
  }

  function buildTable(rows) {
    if (rows.length === 0) {
      report('_(none found)_')
      report('')
      return
    }
    report('| Broken URL | Status | Found on page(s) |')
    report('|---|---|---|')
    for (const row of rows) {
      const sources = row.sources.length ? row.sources.join('<br>') : '(unknown)'
      report(`| ${row.url} (decoded: ${decodeForDisplay(row.url)}) | ${row.status} | ${sources} |`)
    }
    report('')
  }

  report('# Broken Internal Links Audit')
  report('')
  report(`Base URL: ${BASE_URL}`)
  report(`Total URLs crawled: ${visited.size}`)
  report('')

  report('## Broken Links (regular)')
  report('')
  buildTable(regularBroken)

  report('## Broken Links With Czech Diacritics (likely encoding bugs)')
  report('')
  buildTable(diacriticBroken)

  report('## All URLs Containing Czech Diacritics Discovered During Crawl')
  report('')
  if (allDiacriticUrls.length === 0) {
    report('_(none found)_')
    report('')
  } else {
    report('| URL (decoded) | Status | Found on page(s) |')
    report('|---|---|---|')
    for (const u of allDiacriticUrls) {
      const result = visited.get(u)
      const status = result.error ? `ERROR (${result.error})` : result.finalStatus
      const sources = Array.from(foundOn.get(u) || []).join('<br>') || '(unknown)'
      report(`| ${decodeForDisplay(u)} | ${status} | ${sources} |`)
    }
    report('')
  }

  const reportText = reportLines.join('\n')
  console.log('\n' + reportText)
  fs.writeFileSync(REPORT_PATH, reportText, 'utf8')
  console.log(`\n(Full UTF-8 report also written to ${REPORT_PATH})`)

  const exitCode = broken.length > 0 ? 1 : 0
  process.exitCode = exitCode
}

main().catch((err) => {
  console.error('Fatal error during crawl:', err)
  process.exitCode = 1
})
