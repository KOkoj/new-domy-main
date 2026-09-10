const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

function loadPolicy(premiumEnabled) {
  const source = fs.readFileSync(path.join(__dirname, '../lib/seo/standalonePages.js'), 'utf8')
    .replace(/^import .* from .*$/gm, '')
    .replace(/export (const|function) /g, '$1 ')
  const context = {
    module: { exports: {} }, PREMIUM_PDFS_ENABLED: premiumEnabled,
    SITE_NAME: 'Domy v Itálii', absoluteUrl: route => 'https://www.domyvitalii.cz' + route
  }
  vm.runInNewContext(source + '\nmodule.exports = { getStandalonePageMetadata, getStandaloneSitemapPaths }', context)
  return context.module.exports
}

test('public standalone pages have self-canonicals and matching sharing metadata', () => {
  const { getStandalonePageMetadata } = loadPolicy(false)
  for (const route of ['/reference', '/book-call', '/cookies', '/guides/mistakes/free-pdf']) {
    const meta = getStandalonePageMetadata(route)
    assert.equal(meta.alternates.canonical, route)
    assert.equal(meta.robots.index, true)
    assert.equal(meta.robots.follow, true)
    assert.equal(meta.openGraph.url, 'https://www.domyvitalii.cz' + route)
    assert.equal(meta.openGraph.title, meta.title)
    assert.equal(meta.openGraph.description, meta.description)
    assert.equal(meta.openGraph.type, 'website')
  }
})

test('utilities stay noindex, follow and outside sitemap even when premium is enabled', () => {
  for (const enabled of [false, true]) {
    const { getStandalonePageMetadata, getStandaloneSitemapPaths } = loadPolicy(enabled)
    for (const route of ['/agenda', '/login', '/dekujeme', '/premium/success', '/maintenance']) {
      const meta = getStandalonePageMetadata(route)
      assert.equal(meta.robots.index, false)
      assert.equal(meta.robots.follow, true)
      assert.equal(meta.alternates.canonical, route)
      assert.ok(!getStandaloneSitemapPaths().includes(route))
    }
  }
})

test('premium indexability and sitemap follow the existing activation flag together', () => {
  for (const enabled of [false, true]) {
    const policy = loadPolicy(enabled)
    assert.equal(policy.getStandalonePageMetadata('/premium').robots.index, enabled)
    assert.equal(policy.getStandaloneSitemapPaths().includes('/premium'), enabled)
  }
  const routes = Array.from(loadPolicy(false).getStandaloneSitemapPaths())
  assert.deepEqual(routes, ['/reference', '/book-call', '/guides/mistakes/free-pdf'])
})
