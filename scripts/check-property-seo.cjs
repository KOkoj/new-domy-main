// Read-only checks against a production build. Optional baseline from the audit.
const fs = require('node:fs')
const assert = require('node:assert/strict')
const base = process.argv[2] || 'http://localhost:3100'
const baseline = process.argv[3] ? JSON.parse(fs.readFileSync(process.argv[3], 'utf8')) : null
const official = 'https://www.domyvitalii.cz'
const decode = s => s?.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
function inspect(html) {
  const body = html.replace(/<head>[\s\S]*?<\/head>/, '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, '').replace(/<title>[\s\S]*?<\/title>/g, '')
  return {
    lang: html.match(/<html[^>]*lang="([^"]+)"/)?.[1],
    title: decode(html.match(/<title>(.*?)<\/title>/s)?.[1]),
    meta: Object.fromEntries([...html.matchAll(/<meta (?:name|property)="([^"]+)" content="([^"]*)"/g)].map(m => [m[1], decode(m[2])])),
    canonical: [...html.matchAll(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/g)].map(m => decode(m[1])),
    schemas: [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map(m => JSON.parse(m[1])),
    visible: {
      text: body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      h1: [...body.matchAll(/<h1\b[^>]*>(.*?)<\/h1>/gs)].map(m => m[1]),
      links: [...body.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(m => m[1]),
      images: [...body.matchAll(/<img\b[^>]*>/g)].map(m => m[0]),
      fields: [...body.matchAll(/<(?:input|textarea|select)\b[^>]*>/g)].map(m => m[0])
    }
  }
}
function countType(value, type) {
  if (!value || typeof value !== 'object') return 0
  return (value['@type'] === type ? 1 : 0) + Object.values(value).reduce((n, v) => n + countType(v, type), 0)
}
async function get(path, agent = 'Mozilla/5.0') {
  const r = await fetch(new URL(path, base), { redirect: 'manual', headers: { 'user-agent': agent }, signal: AbortSignal.timeout(60000) })
  const html = await r.text()
  return { status: r.status, location: r.headers.get('location'), html, ...inspect(html) }
}
async function main() {
  const inventory = JSON.parse((await get('/api/properties')).html)
  if (baseline) assert.deepEqual(inventory, baseline.inventory)
  const available = inventory.filter(p => p.status === 'available').slice(0, 20)
  const sold = inventory.filter(p => p.status === 'sold').slice(0, 2)
  const edge = inventory.filter(p => !p.images?.length || p.specifications?.bedrooms === 0).slice(0, 2)
  assert.equal(available.length, 20)
  assert.equal(sold.length, 2)
  const samples = [...new Map([...available, ...sold, ...edge].map(p => [p._id, p])).values()]
  assert.ok(samples.filter(p => !p.images?.length || p.specifications?.rooms == null).length >= 2, 'At least two real incomplete records')
  const rows = []
  for (const p of samples) {
    const path = '/properties/' + p.slug.current
    let browser
    for (const agent of ['Mozilla/5.0', 'Googlebot']) {
      const r = await get(path, agent)
      assert.equal(r.status, 200, path)
      assert.equal(r.lang, 'cs', path)
      assert.equal(r.title, (p.seoTitle.cs || p.title.cs) + ' | Domy v Itálii', path)
      assert.ok(r.meta.description && r.meta.description.length <= 160, path)
      assert.deepEqual(r.canonical, [official + path], path)
      assert.ok(!r.meta.robots?.includes('noindex'), path)
      assert.equal(r.meta['og:title'], r.title)
      assert.equal(r.meta['og:description'], r.meta.description)
      assert.equal(r.meta['og:locale'], 'cs_CZ')
      assert.equal(r.meta['og:url'], official + path)
      assert.equal(r.meta['og:type'], 'website')
      assert.equal(r.meta['twitter:title'], r.title)
      assert.equal(r.meta['twitter:description'], r.meta.description)
      assert.equal(r.meta['twitter:image'], r.meta['og:image'])
      assert.equal(countType(r.schemas, 'ItemList'), 0, path)
      assert.equal(countType(r.schemas, 'BreadcrumbList'), 1, path)
      assert.equal(countType(r.schemas, 'RealEstateListing'), 1, path)
      assert.deepEqual(r.schemas.slice(0, 2).map(s => s['@type']), ['Organization', 'WebSite'])
      const listing = r.schemas.find(s => s['@type'] === 'RealEstateListing')
      assert.equal(listing.inLanguage, 'cs')
      assert.equal(listing.url, r.canonical[0])
      assert.equal(listing.description, r.meta.description)
      if (p.specifications?.rooms == null) assert.ok(!('numberOfRooms' in listing.about), path)
      if (p.specifications?.bedrooms === 0) assert.equal(listing.about.numberOfBedrooms, 0, path)
      assert.equal(listing.offers.price, p.price.amount)
      assert.equal(listing.offers.priceCurrency, 'EUR')
      assert.equal(listing.offers.availability, 'https://schema.org/' + (p.status === 'sold' ? 'SoldOut' : p.status === 'reserved' ? 'LimitedAvailability' : 'InStock'))
      assert.equal(listing.breadcrumb.itemListElement.at(-1).item, r.canonical[0])
      if (!p.images?.length) {
        assert.ok(!('image' in listing))
        assert.equal(r.meta['og:image'], official + '/hero-background.webp')
      } else assert.equal(r.meta['og:image'], new URL(p.images[p.mainImage || 0] || p.images[0], official).href)
      if (baseline?.pages[path]) assert.deepEqual(r.visible, inspect(baseline.pages[path].html).visible, 'Visible content changed: ' + path)
      if (browser) {
        assert.deepEqual(r.meta, browser.meta)
        assert.deepEqual(r.schemas, browser.schemas)
        assert.deepEqual(r.visible, browser.visible)
      } else browser = r
    }
    rows.push({ path, status: 200, title: browser.title, description: browser.meta.description, canonical: browser.canonical[0], robots: browser.meta.robots, lang: browser.lang, og: browser.meta, schemas: browser.schemas })
  }
  const alias = require('../data/property-aliases.json')[0]
  const redirected = await get('/properties/' + alias.secondarySlug)
  assert.equal(redirected.status, 301)
  assert.equal(new URL(redirected.location, base).pathname, '/properties/' + alias.primarySlug)
  assert.equal((await get('/properties/' + alias.primarySlug)).status, 200)
  for (const slug of ['seo-audit-final-5', 'seo-audit-final-6', '123456789', 'questa-casa-non-esiste', 'nonexistent-property-test-92841']) {
    for (const agent of ['Mozilla/5.0', 'Googlebot']) {
      const r = await get('/properties/' + slug, agent)
      assert.equal(r.status, 404)
      assert.equal(r.canonical.length, 0)
      assert.ok(r.meta.robots.includes('noindex'))
      assert.equal(countType(r.schemas, 'RealEstateListing'), 0)
      assert.equal(countType(r.schemas, 'ItemList'), 0)
    }
  }
  for (const path of ['/', '/regions', '/properties']) {
    const r = await get(path)
    assert.equal(r.status, 200)
    if (baseline?.pages[path]) {
      const old = inspect(baseline.pages[path].html)
      for (const key of ['title', 'meta', 'canonical', 'schemas', 'visible']) assert.deepEqual(r[key], old[key], path + ': ' + key)
    }
  }
  if (baseline) {
    // Existing sitemap generates lastmod at build time; compare all other data.
    const stableSitemap = xml => xml.replace(/<lastmod>[^<]*<\/lastmod>/g, '')
    assert.equal(stableSitemap((await get('/sitemap.xml')).html), stableSitemap(baseline.pages['/sitemap.xml'].html))
  }
  if (process.argv[4]) fs.writeFileSync(process.argv[4], JSON.stringify(rows, null, 2))
  console.log(`PASS: ${samples.length} real properties (20 available, 2 sold, image/zero-bedroom cases); Czech metadata/schema, one breadcrumb, no foreign ItemList; alias 301; 5 missing 404; visible content, controls, inventory and sitemap unchanged.`)
}
main().catch(error => { console.error(error); process.exitCode = 1 })
