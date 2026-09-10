// Read-only production HTTP regression check.
// node scripts/check-property-http.cjs http://localhost:3100 [--capture baseline.json | --compare baseline.json]
const assert = require('node:assert/strict')
const fs = require('node:fs')
const { randomUUID } = require('node:crypto')

const base = process.argv[2] || 'http://localhost:3100'
const mode = process.argv[3]
const baselinePath = process.argv[4]
const agents = ['Mozilla/5.0', 'Googlebot']
const official = 'https://www.domyvitalii.cz'

async function get(path, agent = agents[0], headers = {}) {
  const response = await fetch(new URL(path, base), {
    redirect: 'manual',
    headers: { 'user-agent': agent, ...headers },
    signal: AbortSignal.timeout(60000)
  })
  return { status: response.status, location: response.headers.get('location'), cache: response.headers.get('cache-control'), html: await response.text() }
}

function inspect(html) {
  const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)]
    .map(match => JSON.parse(match[1]))
  return {
    title: html.match(/<title>(.*?)<\/title>/s)?.[1] || null,
    canonical: [...html.matchAll(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/g)].map(m => m[1]),
    robots: [...html.matchAll(/<meta[^>]*name="robots"[^>]*content="([^"]*)"/g)].map(m => m[1]),
    descriptions: [...html.matchAll(/<meta[^>]*name="description"[^>]*content="([^"]*)"/g)].map(m => m[1]),
    headings: [...html.matchAll(/<h1\b[^>]*>(.*?)<\/h1>/gs)].map(m => m[1]),
    links: [...html.matchAll(/<a\b[^>]*href="([^"]*)"/g)].map(m => m[1]).sort(),
    images: [...html.matchAll(/<img\b[^>]*src="([^"]*)"/g)].map(m => m[1]).sort(),
    schemas
  }
}

async function main() {
  const inventoryResponse = await get('/api/properties')
  assert.equal(inventoryResponse.status, 200)
  const inventory = JSON.parse(inventoryResponse.html)
  const available = inventory.filter(p => p.status === 'available').slice(0, 20)
  const sold = inventory.filter(p => p.status === 'sold').slice(0, 2)
  assert.equal(available.length, 20)
  assert.equal(sold.length, 2)
  const snapshot = { inventory, pages: {}, api: {}, sitemap: [] }
  const rows = []

  for (const property of [...available, ...sold]) {
    const path = '/properties/' + property.slug.current
    for (const agent of agents) {
      const response = await get(path, agent)
      assert.equal(response.status, 200, `${agent} ${path}`)
      assert.equal(response.location, null, path)
      const tags = inspect(response.html)
      assert.deepEqual(tags.canonical, [official + path], path)
      assert.ok(!tags.robots.some(value => value.includes('noindex')), path)
      assert.ok(tags.title && tags.headings.length, path)
      assert.ok(JSON.stringify(tags.schemas).includes('RealEstateListing'), path)
      if (property.status === 'sold') assert.ok(JSON.stringify(tags.schemas).includes('SoldOut'), path)
      if (agent === agents[0]) snapshot.pages[path] = tags
      else assert.deepEqual(tags, snapshot.pages[path], `Browser/Googlebot ${path}`)
    }
    const api = await get('/api' + path)
    assert.equal(api.status, 200, path)
    snapshot.api[path] = JSON.parse(api.html)
    rows.push({ path, status: 200, state: property.status, title: snapshot.pages[path].title })
  }

  for (const path of ['/', '/properties', '/properties?region=toscana', '/properties?search=zzzz-audit-no-match']) {
    const response = await get(path)
    assert.equal(response.status, 200, path)
    snapshot.pages[path] = inspect(response.html)
  }
  const sitemap = await get('/sitemap.xml')
  assert.equal(sitemap.status, 200)
  snapshot.sitemap = [...sitemap.html.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]).sort()
  assert.ok(!snapshot.sitemap.some(url => url.includes('/property-not-found')))

  if (mode === '--capture') {
    assert.ok(baselinePath, 'A baseline path is required')
    fs.writeFileSync(baselinePath, JSON.stringify(snapshot))
    console.log(`Captured baseline: ${rows.length} properties, listing, filters, homepage, API and sitemap.`)
    return
  }
  if (mode === '--compare') {
    assert.deepEqual(snapshot, JSON.parse(fs.readFileSync(baselinePath, 'utf8')), 'Valid content changed from baseline')
  }

  const missing = ['seo-audit-final-5', 'seo-audit-final-6', '123456789',
    'questa-casa-non-esiste', 'nonexistent-property-test-92841',
    ...Array.from({ length: 5 }, () => 'missing-' + randomUUID()),
    'nonexistent-property-test-92841.jpg', '%E2%98%83-missing-property']
  for (const slug of missing) {
    const path = '/properties/' + slug
    for (const agent of agents) {
      const response = await get(path, agent)
      assert.equal(response.status, 404, `${agent} ${path}`)
      assert.match(response.cache || '', /no-store/, path)
      assert.equal(response.location, null, path)
      const tags = inspect(response.html)
      assert.deepEqual(tags.canonical, [], path)
      assert.deepEqual(tags.descriptions, [], path)
      assert.ok(tags.robots.some(value => value.includes('noindex')), path)
      assert.equal(tags.title, '404: This page could not be found.', path)
      assert.ok(!JSON.stringify(tags.schemas).includes('RealEstateListing'), path)
      const visibleHtml = response.html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '')
      assert.match(visibleHtml, /This page could not be found/, path)
    }
    assert.equal((await get('/api' + path)).status, 404, `API ${path}`)
    rows.push({ path, status: 404, canonical: null, noindex: true })
  }
  assert.equal((await get('/property-not-found')).status, 404)
  for (const path of ['/properties/seo-audit-final-5', '/properties/seo-audit-final-6']) {
    const response = await get(path + '?_rsc=property404test', agents[0], { RSC: '1' })
    assert.equal(response.status, 404, `RSC ${path}`)
  }
  console.log(JSON.stringify(rows, null, 2))
  console.log(`PASS: 20 available + 2 sold, ${missing.length} missing, browser/Googlebot, RSC, API, homepage, filters and sitemap${mode === '--compare' ? '; baseline unchanged' : ''}.`)
}

main().catch(error => { console.error(error); process.exitCode = 1 })
