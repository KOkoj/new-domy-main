// Read-only checks against a running production build.
// Usage: node scripts/check-technical-seo.cjs http://localhost:3100
const assert = require('node:assert/strict')

const base = process.argv[2] || 'http://localhost:3100'
const official = 'https://www.domyvitalii.cz'

async function get(path, headers = {}) {
  const response = await fetch(new URL(path, base), {
    redirect: 'manual', headers, signal: AbortSignal.timeout(30000)
  })
  return {
    status: response.status,
    location: response.headers.get('location'),
    html: await response.text()
  }
}

function metadata(html) {
  const canonical = [...html.matchAll(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"[^>]*>/g)].map(m => m[1])
  const meta = Object.fromEntries([...html.matchAll(/<meta (?:name|property)="([^"]+)" content="([^"]*)"/g)].map(m => [m[1], m[2]]))
  return { canonical, meta, title: html.match(/<title>(.*?)<\/title>/s)?.[1] }
}

function normalize(url) {
  return url.replace(/\/$/, '')
}

async function checkCanonical(path) {
  const response = await get(path)
  assert.equal(response.status, 200, path)
  const tags = metadata(response.html)
  assert.equal(tags.canonical.length, 1, path)
  assert.equal(normalize(tags.canonical[0]), normalize(official + path), path)
  assert.ok(!tags.meta.robots?.includes('noindex'), path)
  return tags
}

async function main() {
  const titles = new Set()
  const descriptions = new Set()
  for (const path of ['/about', '/contact', '/guides', '/faq']) {
    const tags = await checkCanonical(path)
    assert.ok(tags.title && tags.meta.description, path)
    assert.ok(tags.title.includes('Domy v Itálii'), path)
    assert.ok(!tags.title.includes('?'), path)
    assert.equal(tags.meta['og:title'], tags.title, path)
    assert.equal(tags.meta['og:description'], tags.meta.description, path)
    assert.equal(tags.meta['og:url'], official + path, path)
    titles.add(tags.title)
    descriptions.add(tags.meta.description)
  }
  assert.equal(titles.size, 4)
  assert.equal(descriptions.size, 4)
  for (const path of ['/', '/guides/costs', '/guides/real-estate-purchase-system-italy',
    '/regions/toscana', '/regions/lombardia', '/regions/sicilia', '/regions/veneto',
    '/regions', '/process', '/terms', '/gdpr', '/blog/regions/tuscany', '/blog/regions/lake-como']) {
    await checkCanonical(path)
  }
  for (const [path, target] of [
    ['/?s=373', '/guides/costs'],
    ['/?s=373&utm_source=test', '/guides/costs'],
    ['/regions/lombardy', '/regions/lombardia']
  ]) {
    const response = await get(path)
    assert.equal(response.status, 301, path)
    const destination = new URL(response.location, base)
    assert.equal(destination.pathname, target, path)
    assert.equal(destination.search, '', path)
    assert.equal((await get(destination.pathname)).status, 200, path)
  }
  for (const path of ['/?s=360', '/?s=372', '/?s=999999']) {
    assert.equal((await get(path)).status, 410, path)
  }
  for (const path of ['/regions/seo-audit-nonexistent-92841', '/regions/questa-regione-non-esiste', '/blog/regions/toscana']) {
    for (const userAgent of ['Mozilla/5.0', 'Googlebot']) {
      assert.equal((await get(path, { 'user-agent': userAgent })).status, 404, path)
    }
  }
  // Previously supported region aliases must remain usable.
  for (const slug of ['tuscany', 'piedmont', 'sicily', 'sardinia', 'trentinoaltoadige',
    'trentino-south-tyrol', 'valledaosta', 'aosta-valley']) {
    assert.equal((await get('/regions/' + slug)).status, 200, slug)
  }
  const robots = await get('/robots.txt')
  assert.equal(robots.status, 200)
  assert.ok(robots.html.includes('Allow: /'))
  assert.ok(!/^Disallow:\s*\/\s*$/m.test(robots.html))
  assert.ok(robots.html.includes(official + '/sitemap.xml'))

  const sitemap = await get('/sitemap.xml')
  assert.equal(sitemap.status, 200)
  const urls = [...sitemap.html.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1])
  assert.ok(urls.length > 0)
  assert.equal(new Set(urls).size, urls.length)
  assert.ok(!urls.includes(official + '/regions/lombardy'))
  let index = 0
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (index < urls.length) {
      const url = urls[index++]
      assert.ok(url.startsWith(official + '/'), url)
      assert.equal(new URL(url).search, '', url)
      await checkCanonical(new URL(url).pathname)
    }
  }))
  console.log(`PASS: metadata, direct 301 redirects, retained 410s, real 404s, valid regions and aliases, robots, ${urls.length} canonical sitemap URLs.`)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
