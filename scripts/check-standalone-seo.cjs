// Read-only check against a production build. Optional baseline from the audit.
// node scripts/check-standalone-seo.cjs http://localhost:3100 [baseline.json]
const assert = require('node:assert/strict')
const fs = require('node:fs')
const base = process.argv[2] || 'http://localhost:3100'
const baseline = process.argv[3] ? JSON.parse(fs.readFileSync(process.argv[3], 'utf8')) : null
const official = 'https://www.domyvitalii.cz'
const policy = {
  '/reference': [true, true], '/book-call': [true, true], '/cookies': [true, false],
  '/guides/mistakes/free-pdf': [true, true], '/agenda': [false, false],
  '/login': [false, false], '/dekujeme': [false, false],
  '/premium': [false, false], '/premium/success': [false, false], '/maintenance': [false, false]
}
const strip = html => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

function inspect(html) {
  const body = html.replace(/<head>[\s\S]*?<\/head>/, '')
  return {
    title: html.match(/<title>(.*?)<\/title>/s)?.[1] || null,
    meta: Object.fromEntries([...html.matchAll(/<meta (?:name|property)="([^"]+)" content="([^"]*)"/g)].map(m => [m[1], m[2]])),
    canonical: [...html.matchAll(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/g)].map(m => m[1]),
    schema: [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map(m => JSON.parse(m[1])),
    features: {
      text: strip(body.replace(/<title>[\s\S]*?<\/title>/g, '')),
      links: [...body.matchAll(/<a\b[^>]*href="([^"]*)"/g)].map(m => m[1]).sort(),
      images: [...body.matchAll(/<img\b[^>]*src="([^"]*)"/g)].map(m => m[1]).sort(),
      fields: [...body.matchAll(/<(?:input|textarea|select)\b[^>]*>/g)].map(m => m[0])
    }
  }
}

async function get(path, agent = 'Mozilla/5.0') {
  const r = await fetch(new URL(path, base), { redirect: 'manual', headers: { 'user-agent': agent }, signal: AbortSignal.timeout(60000) })
  const html = await r.text()
  return { html, status: r.status, location: r.headers.get('location'), xrobots: r.headers.get('x-robots-tag'), ...inspect(html) }
}

async function main() {
  const sitemap = await get('/sitemap.xml')
  assert.equal(sitemap.status, 200)
  const urls = [...sitemap.html.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1])
  assert.equal(new Set(urls).size, urls.length)
  if (baseline) assert.deepEqual([...urls].sort(), [...new Set([...baseline.urls,
    official + '/reference', official + '/book-call', official + '/guides/mistakes/free-pdf'])].sort())
  const rows = []
  for (const [path, [index, inSitemap]] of Object.entries(policy)) {
    for (const agent of ['Mozilla/5.0', 'Googlebot']) {
      const r = await get(path, agent)
      assert.equal(r.status, 200, path)
      assert.equal(r.location, null, path)
      assert.equal(r.xrobots, null, path)
      assert.deepEqual(r.canonical, [official + path], path)
      assert.equal(r.meta.robots, index ? 'index, follow' : 'noindex, follow', path)
      assert.ok(r.title && r.meta.description, path)
      assert.ok(!r.title.startsWith('Domy v Itálii -'), path)
      assert.equal(r.meta['og:title'], r.title, path)
      assert.equal(r.meta['og:description'], r.meta.description, path)
      assert.equal(r.meta['og:url'], official + path, path)
      assert.equal(r.meta['og:type'], 'website', path)
      assert.equal(r.meta['twitter:title'], r.title, path)
      assert.equal(r.meta['twitter:description'], r.meta.description, path)
      assert.deepEqual(r.schema.map(s => s['@type']), ['Organization', 'WebSite'], path)
      assert.equal(urls.includes(official + path), inSitemap, path)
      if (baseline) assert.deepEqual(r.features, baseline.pages[path].features, `Visible content, fields or links changed: ${path}`)
      if (agent === 'Mozilla/5.0') rows.push({ path, status: r.status, title: r.title,
        description: r.meta.description, canonical: r.canonical[0], robots: r.meta.robots, sitemap: inSitemap })
    }
  }
  for (const path of ['/login?tab=signup', '/dekujeme?asset=mistakes&token=seo-test', '/premium/success?session_id=seo-test', '/premium?product=premium-domy']) {
    const r = await get(path)
    assert.equal(r.status, 200, path)
    assert.equal(r.meta.robots, 'noindex, follow', path)
    assert.deepEqual(r.canonical, [official + path.split('?')[0]], path)
  }
  const paths = new Set([...urls.map(u => new URL(u).pathname), ...Object.keys(baseline?.pages || {})])
  const pages = {}; let cursor = 0; const queue = [...paths]
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (cursor < queue.length) {
      const path = queue[cursor++]; const r = await get(path); pages[path] = r
      assert.equal(r.status, 200, path)
      if (urls.includes(official + path)) {
        assert.deepEqual(r.canonical.map(u => u.replace(/\/$/, '')), [(official + path).replace(/\/$/, '')], path)
        assert.ok(!r.meta.robots?.includes('noindex'), path)
        assert.equal(new URL(official + path).search, '')
      }
      if (baseline?.pages[path]) {
        assert.deepEqual(r.features, baseline.pages[path].features, `Rendered content changed: ${path}`)
        if (path !== '/guides/mistakes/free-pdf') assert.deepEqual(r.schema, baseline.pages[path].schema, `Schema changed: ${path}`)
        if (!(path in policy)) {
          assert.equal(r.title, baseline.pages[path].title, path)
          assert.deepEqual(r.meta, baseline.pages[path].meta, path)
          assert.deepEqual(r.canonical, baseline.pages[path].canonical, path)
        }
      }
    }
  }))
  let links = 0
  for (const r of Object.values(pages)) for (const href of r.features.links) {
    let u; try { u = new URL(href, official) } catch { continue }
    if (u.origin !== official || /\.[a-z0-9]+$/i.test(u.pathname) || /^\/(api|admin|dashboard|auth)(\/|$)/.test(u.pathname)) continue
    links++
    if (pages[u.pathname]) assert.equal(pages[u.pathname].status, 200, href)
    else assert.equal((await get(u.pathname + u.search)).status, 200, href)
  }
  const robots = await get('/robots.txt')
  assert.equal(robots.status, 200)
  assert.ok(robots.html.includes('Allow: /'))
  assert.ok(!/^Disallow:\s*\/\s*$/m.test(robots.html))
  for (const path of Object.keys(policy)) assert.ok(!robots.html.includes('Disallow: ' + path), path)
  console.log(JSON.stringify(rows, null, 2))
  console.log(`PASS: 10 standalone policies, query variants, ${urls.length} sitemap URLs, ${queue.length} pages, ${links} internal links${baseline ? ', unchanged visible content and unaffected metadata/schema' : ''}.`)
}
main().catch(error => { console.error(error); process.exitCode = 1 })
