const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const root = path.join(__dirname, '..')
const read = file => fs.readFileSync(path.join(root, file), 'utf8')

function loadWithDenylist() {
  const brokenList = JSON.parse(read('data/broken-external-images.json'))
  const broken = new Set(brokenList)
  const isBroken = url => typeof url === 'string' && broken.has(url)
  const imageSource = read('lib/getPropertyImage.js')
    .replace(/^import .*$/gm, '')
    .replace(/export /g, '')
  const sandbox = {
    isBrokenExternalImageUrlImported: isBroken,
    urlForImage: () => null,
    module: { exports: {} },
  }
  vm.runInNewContext(
    imageSource + '\nmodule.exports = { getPropertyImage, getPropertyImageList, hasUsablePropertyPhotos, hasUsablePropertyMedia, filterListableProperties, HIDE_PROPERTIES_WITHOUT_PHOTOS, PROPERTY_IMAGE_FALLBACK }',
    sandbox
  )
  return {
    ...sandbox.module.exports,
    isBrokenExternalImageUrl: isBroken,
    brokenExternalImageCount: () => broken.size,
  }
}

const images = loadWithDenylist()
const inventory = require('../data/local-properties.json')

test('does not use a stock Unsplash house as a property photo fallback', () => {
  assert.equal(images.PROPERTY_IMAGE_FALLBACK, null)
  assert.equal(images.getPropertyImage({ images: [] }), null)
  assert.equal(images.getPropertyImage({ images: [null, ''] }), null)
  for (const file of ['lib/getPropertyImage.js', 'components/PropertyImage.jsx']) {
    const source = read(file)
    assert.ok(!source.includes('images.unsplash.com'), file)
    assert.ok(!source.includes('photo-1564013799919'), file)
  }
})

test('known 404 CDN photos are dropped and the next real photo becomes the cover', () => {
  assert.ok(images.brokenExternalImageCount() > 0)
  const basilicata = inventory.find(p => p.slug?.current === 'basilicata-casa-singola')
  assert.ok(basilicata)
  assert.ok(basilicata.images.length > 0)
  assert.equal(images.getPropertyImageList(basilicata).length, 0)
  assert.equal(images.getPropertyImage(basilicata), null)
  assert.equal(images.hasUsablePropertyPhotos(basilicata), false)

  const campania = inventory.find(p => p.slug?.current === 'campania-appartamento')
  const kept = images.getPropertyImageList(campania)
  assert.ok(kept.length > 0)
  assert.ok(kept.every(url => typeof url === 'string' && url.startsWith('/uploads/properties/campania-appartamento/')))
  assert.ok(kept.every(url => !images.isBrokenExternalImageUrl(url)))
  assert.equal(images.getPropertyImage(campania), kept[0])
  assert.equal(kept[0], campania.images[0])
})

test('hiding listings without usable photos is on by default and can be turned off', () => {
  assert.equal(images.HIDE_PROPERTIES_WITHOUT_PHOTOS, true)
  const hidden = images.filterListableProperties(inventory)
  const shown = images.filterListableProperties(inventory, { hideWithoutPhotos: false })
  assert.equal(shown.length, inventory.length)
  assert.ok(hidden.length < inventory.length)
  const hiddenSlugs = new Set(
    inventory.filter(p => !images.hasUsablePropertyMedia(p)).map(p => p.slug.current)
  )
  assert.ok(hiddenSlugs.has('basilicata-casa-singola'))
  assert.ok(hiddenSlugs.has('toscana-terratetto-montelupo-fiorentino'))
  assert.ok(!hiddenSlugs.has('campania-appartamento'))
  assert.equal(hidden.length, inventory.length - hiddenSlugs.size)
  assert.ok(hidden.every(p => images.hasUsablePropertyMedia(p)))
})

test('local photos are kept and never treated as broken', () => {
  const local = inventory.find(p => (p.images || []).some(url => String(url).startsWith('/uploads/')))
  assert.ok(local)
  const list = images.getPropertyImageList(local)
  assert.ok(list.length > 0)
  assert.ok(list.every(url => url.startsWith('/uploads/') || url.startsWith('http')))
  assert.equal(images.hasUsablePropertyPhotos(local), true)
})
