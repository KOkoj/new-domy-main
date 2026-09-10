const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { NextRequest, NextResponse } = require('next/server')

// Execute the real Proxy with isolated data sources; no database writes are
// needed to verify that an announcement added after build remains reachable.
function loadProxy(liveProperties = {}) {
  const calls = []
  const source = fs.readFileSync(path.join(__dirname, '../proxy.js'), 'utf8')
    .replace(/^import .* from .*$/gm, '')
    .replace(/export async function proxy/, 'async function proxy')
    .replace(/export const config/, 'const config')
  const context = {
    module: { exports: {} }, NextResponse,
    process: { env: {} },
    PUBLIC_SITE_STANDBY: false,
    SITE_HOST: 'www.domyvitalii.cz',
    bundledProperties: [
      { _id: 'available-id', slug: { current: 'available-home' }, status: 'available' },
      { _id: 'sold-id', slug: { current: 'sold-home' }, status: 'sold' }
    ],
    isDisplayableProperty: property => Boolean(property?.slug?.current),
    resolvePropertySlug: slug => slug,
    getPropertyBySlug: async slug => { calls.push(slug); return liveProperties[slug] || null },
    createServerClient: () => { throw new Error('Unexpected auth call') }
  }
  vm.runInNewContext(source + '\nmodule.exports = proxy', context)
  return { proxy: context.module.exports, calls }
}

test('bundled available, sold and ID aliases remain reachable without a live lookup', async () => {
  const { proxy, calls } = loadProxy()
  for (const slug of ['available-home', 'sold-home', 'available-id', 'sold-id', '%61vailable-home']) {
    const response = await proxy(new NextRequest('http://localhost/properties/' + slug))
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('x-middleware-next'), '1')
  }
  assert.deepEqual(calls, [])
})

test('property created after build uses live lookup and is not rejected by the bundled inventory', async () => {
  const { proxy, calls } = loadProxy({ 'new-home': { _id: 'new-id', slug: { current: 'new-home' } } })
  const response = await proxy(new NextRequest('http://localhost/properties/new-home'))
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('x-middleware-next'), '1')
  assert.deepEqual(calls, ['new-home'])
})

test('missing and numeric property slugs rewrite to the 404 route without redirecting', async () => {
  const { proxy, calls } = loadProxy()
  for (const slug of ['missing-home', '123456789', 'missing.jpg']) {
    const response = await proxy(new NextRequest('http://localhost/properties/' + slug + '?test=1'))
    assert.equal(response.status, 404)
    assert.equal(response.headers.get('cache-control'), 'private, no-store')
    assert.equal(response.headers.get('location'), null)
    const destination = new URL(response.headers.get('x-middleware-rewrite'))
    assert.equal(destination.pathname, '/property-not-found')
    assert.equal(destination.search, '')
  }
  assert.deepEqual(calls, ['missing-home', '123456789', 'missing.jpg'])
})

test('homepage, listing, filters and API bypass the property existence check', async () => {
  const { proxy, calls } = loadProxy()
  for (const route of ['/', '/properties', '/properties?region=toscana', '/api/properties/missing']) {
    const response = await proxy(new NextRequest('http://localhost' + route))
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('x-middleware-next'), '1')
  }
  assert.deepEqual(calls, [])
})
