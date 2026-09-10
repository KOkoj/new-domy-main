const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')

function load(file, context, names) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
    .replace(/^import .* from .*$/gm, '').replace(/export /g, '')
  const sandbox = { ...context, module: { exports: {} }, URL }
  vm.runInNewContext(source + '\nmodule.exports = {' + names.join(',') + '}', sandbox)
  return sandbox.module.exports
}
const site = load('lib/siteConfig.js', {}, ['SITE_NAME', 'SITE_URL', 'absoluteUrl'])
const display = load('lib/propertyDisplay.js', {}, ['getLocalizedValue'])
const images = load('lib/getPropertyImage.js', { urlForImage: () => null }, ['getPropertyImageList'])
const seo = load('lib/seo/propertySeo.js', { ...site, ...display, ...images }, ['getPropertySeo', 'buildPropertyMetadata', 'finitePropertyNumber'])
const { buildPropertyJsonLd } = load('lib/seo/contentSeo.js', { ...site, ...seo }, ['buildPropertyJsonLd'])

test('existing Czech titles stay unique and consistent across property metadata and schema', () => {
  const inventory = require('../data/local-properties.json')
  const before = JSON.stringify(inventory)
  const titles = new Set()
  for (const p of inventory) {
    const route = '/properties/' + p.slug.current
    const metadata = seo.buildPropertyMetadata(p, route)
    const schema = buildPropertyJsonLd(p, route)
    assert.equal(metadata.title, (p.seoTitle.cs || p.title.cs) + ' | ' + site.SITE_NAME)
    assert.ok(!titles.has(metadata.title), p.slug.current)
    titles.add(metadata.title)
    assert.ok(metadata.description.length > 0 && metadata.description.length <= 160)
    assert.equal(schema.description, metadata.description)
    assert.equal(schema.inLanguage, 'cs')
    assert.equal(schema.url, metadata.alternates.canonical)
    assert.equal(metadata.openGraph.locale, 'cs_CZ')
    assert.equal(metadata.openGraph.title, metadata.twitter.title)
    assert.equal(schema.breadcrumb.itemListElement[1].name, 'Nemovitosti')
    assert.equal(schema.offers.priceCurrency, 'EUR')
    if (p.status === 'sold') assert.equal(schema.offers.availability, 'https://schema.org/SoldOut')
  }
  assert.equal(JSON.stringify(inventory), before)
})

test('two incomplete fixtures omit unavailable facts and keep Czech metadata', () => {
  for (const p of [
    { slug: { current: 'missing-fields' }, title: { en: 'English only' }, status: 'sold' },
    { slug: { current: 'invalid-fields' }, price: { amount: 'NaN' }, images: [null, {}],
      description: { en: 'Discover this amazing property' }, specifications: { squareFootage: -5, bedrooms: null, bathrooms: ' ' },
      location: { coordinates: { lat: 200, lng: 'invalid' } } }
  ]) {
    const route = '/properties/' + p.slug.current
    const metadata = seo.buildPropertyMetadata(p, route)
    const schema = JSON.parse(JSON.stringify(buildPropertyJsonLd(p, route)))
    assert.ok(metadata.title.startsWith('Nemovitost'))
    assert.ok(!/undefined|NaN|null|Discover|English only/.test(JSON.stringify({ metadata, schema })))
    assert.equal(metadata.openGraph.images[0].url, site.absoluteUrl('/hero-background.webp'))
    for (const key of ['offers', 'image']) assert.ok(!(key in schema), key)
    for (const key of ['geo', 'floorSize', 'numberOfBedrooms', 'numberOfBathroomsTotal']) assert.ok(!(key in schema.about), key)
    assert.equal(schema.inLanguage, 'cs')
  }
  assert.equal(buildPropertyJsonLd(null, '/properties/missing'), null)
})

test('main image, expanded image objects, explicit zero values and reservation are preserved', () => {
  const p = { title: { cs: 'Byt v Pescare' }, price: { amount: 123000, currency: 'EUR' },
    images: ['/one.jpg', { asset: { url: '/two.jpg' } }], mainImage: 1, status: 'reserved',
    specifications: { bedrooms: 0, rooms: 1 }, location: { coordinates: { lat: 0, lng: 0 } } }
  const metadata = seo.buildPropertyMetadata(p, '/properties/example')
  const schema = buildPropertyJsonLd(p, '/properties/example')
  assert.equal(metadata.openGraph.images[0].url, site.absoluteUrl('/two.jpg'))
  assert.equal(schema.image[0], metadata.openGraph.images[0].url)
  assert.equal(schema.about.numberOfBedrooms, 0)
  assert.equal(schema.about.geo.latitude, 0)
  assert.equal(schema.offers.availability, 'https://schema.org/LimitedAvailability')
})
