// Read-only production verification. Optional third argument: pre-change HTTP snapshot.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const base = process.argv[2] || 'http://localhost:3100'
const baseline = process.argv[3] ? JSON.parse(fs.readFileSync(process.argv[3], 'utf8')) : null
const [alias] = require('../data/property-aliases.json')
const primary = '/properties/' + alias.primarySlug
const secondary = '/properties/' + alias.secondarySlug
const official = 'https://www.domyvitalii.cz'
async function get(path, agent = 'Mozilla/5.0') {
  const r = await fetch(new URL(path, base), { redirect: 'manual', headers: { 'user-agent': agent }, signal: AbortSignal.timeout(60000) })
  return { status: r.status, location: r.headers.get('location'), html: await r.text() }
}
async function main() {
  const inventory = JSON.parse((await get('/api/properties')).html)
  assert.equal(inventory.filter(p => p.sourceUrl === alias.sourceUrl).length, 1)
  assert.ok(!inventory.some(p => p.slug.current === alias.secondarySlug || p._id === alias.secondaryId))
  const current = inventory.find(p => p._id === alias.primaryId)
  assert.equal(current.images.length, 13)
  if (baseline) {
    assert.equal(inventory.length, baseline.inventory.length - 1)
    for (const p of inventory) {
      const old = baseline.inventory.find(old => old._id === p._id)
      assert.ok(old, p._id)
      assert.deepEqual(p._id === alias.primaryId ? { ...p, images: old.images } : p, old, p.slug.current)
    }
  }
  for (const agent of ['Mozilla/5.0', 'Googlebot']) {
    for (const path of [secondary, secondary + '/', secondary + '?utm_source=audit', secondary + '/?utm_source=audit',
      '/properties/' + alias.secondaryId, secondary.replace('abruzzo', '%61bruzzo')]) {
      const r = await get(path, agent)
      assert.equal(r.status, 301, path)
      assert.ok(!/http-equiv=["']refresh/i.test(r.html), path)
      const destination = new URL(r.location, base)
      assert.equal(destination.pathname, primary, path)
      assert.equal(destination.search, new URL(path, base).search, path)
      assert.equal((await get(destination.pathname + destination.search, agent)).status, 200, path)
    }
    const r = await get(primary, agent)
    assert.equal(r.status, 200)
    assert.deepEqual([...r.html.matchAll(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/g)].map(m => m[1]), [official + primary])
    assert.ok(!/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/.test(r.html))
    assert.ok(/<title>.+?<\/title>/.test(r.html))
    assert.ok(/<meta name="description" content="[^"]+"/.test(r.html))
    const schemas = [...r.html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map(m => JSON.parse(m[1]))
    const listing = schemas.find(s => s['@type'] === 'RealEstateListing')
    assert.ok(listing)
    assert.ok(JSON.stringify(listing).includes(official + primary))
    assert.ok(!JSON.stringify(listing).includes(alias.secondarySlug))
    console.log(agent, primary, 200, r.html.match(/<title>(.*?)<\/title>/)?.[1])
  }
  for (const key of [alias.secondarySlug, alias.secondaryId]) {
    const r = await get('/api/properties/' + key)
    assert.equal(r.status, 200)
    assert.equal(JSON.parse(r.html)._id, alias.primaryId)
  }
  for (const query of ['', '?city=pescara', '?search=Pescara', '?type=apartment', '?featured=true', '?minPrice=250000&maxPrice=270000']) {
    const result = JSON.parse((await get('/api/properties' + query)).html)
    assert.ok(!result.some(p => p.slug.current === alias.secondarySlug), query)
  }
  for (const path of ['/', '/properties', '/properties?search=Pescara', '/properties?region=abruzzo', '/regions', '/regions/abruzzo']) {
    const r = await get(path)
    assert.equal(r.status, 200, path)
    assert.ok(!r.html.includes(secondary), 'Public URL leaked: ' + path)
  }
  for (const image of current.images) assert.equal((await get(image)).status, 200, image)
  const sitemap = (await get('/sitemap.xml')).html
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1])
  assert.equal(urls.filter(u => u === official + primary).length, 1)
  assert.ok(!urls.includes(official + secondary))
  if (baseline) {
    const before = [...baseline.sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1])
    assert.deepEqual([...urls].sort(), before.filter(u => u !== official + secondary).sort())
  }
  // Moving slash normalization must preserve the existing behavior elsewhere.
  for (const path of ['/about/', '/properties/', '/regions/toscana/', primary + '/', '/robots.txt/', current.images[0] + '/']) {
    const r = await get(path)
    assert.equal(r.status, 308, path)
    assert.equal(new URL(r.location, base).pathname, path.slice(0, -1), path)
  }
  console.log(`PASS: direct alias 301s including slash/query/ID/encoded variants; browser = Googlebot; ${inventory.length} public properties; ${urls.length} sitemap URLs; gallery and historical API references; other records unchanged.`)
}
main().catch(error => { console.error(error); process.exitCode = 1 })
