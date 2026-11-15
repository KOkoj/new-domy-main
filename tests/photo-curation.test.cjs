const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const root = path.join(__dirname, '..')
const read = file => fs.readFileSync(path.join(root, file), 'utf8')

function load() {
  const curation = JSON.parse(read('data/photo-curation.json'))
  const src = read('lib/photoCuration.js').replace(/^import .*$/gm, '').replace(/export /g, '')
  const sandbox = { photoCurationData: curation, module: { exports: {} } }
  vm.runInNewContext(src + '\nmodule.exports = { curatePropertyImages, orderGalleryImages }', sandbox)
  return sandbox.module.exports
}

const { curatePropertyImages, orderGalleryImages } = load()
const P = '/uploads/properties/x/'

test('gallery files are ordered numerically, not alphabetically', () => {
  const input = ['01-gallery-1.jpg', '02-gallery-10.jpg', '03-gallery-11.jpg', '04-gallery-2.jpg', '05-gallery-3.jpg', '06-main.jpg', '07-plan.jpg'].map(f => P + f)
  assert.deepEqual(Array.from(orderGalleryImages(input)).map(s => s.replace(P, '')),
    ['01-gallery-1.jpg', '04-gallery-2.jpg', '05-gallery-3.jpg', '02-gallery-10.jpg', '03-gallery-11.jpg', '06-main.jpg', '07-plan.jpg'])
})

test('hand-ordered descriptive names keep their order; plans go last', () => {
  const input = ['01-terrazzo.jpg', '04-plan.jpg', '02-cucina.jpg'].map(f => P + f)
  assert.deepEqual(Array.from(orderGalleryImages(input)).map(s => s.replace(P, '')), ['01-terrazzo.jpg', '02-cucina.jpg', '04-plan.jpg'])
})

test('explicit mainImage still wins', () => {
  const input = ['01-gallery-1.jpg', '02-gallery-2.jpg', '03-gallery-3.jpg'].map(f => P + f)
  assert.equal(curatePropertyImages(input, { mainIndex: 2 })[0], P + '03-gallery-3.jpg')
})

test('no listing shows the same photo twice or a plan before a photo', () => {
  const curation = JSON.parse(read('data/photo-curation.json')).listings
  const inventory = JSON.parse(read('data/local-properties.json'))
  for (const p of inventory) {
    const slug = p.slug?.current
    const images = (p.images || []).filter(x => typeof x === 'string')
    if (!images.length) continue
    const out = Array.from(curatePropertyImages(images, { slug, mainIndex: p.mainImage || 0 }))
    assert.equal(new Set(out).size, out.length, slug)
    const hidden = new Set(curation[slug]?.hide || [])
    assert.ok(out.every(x => !hidden.has(x)), slug)
    const firstPlan = out.findIndex(x => /(^|[-_])plan/i.test(x.split('/').pop().replace(/^(\d+-)+/, '')))
    if (firstPlan >= 0) assert.ok(out.slice(firstPlan).every(x => /plan/i.test(x)), slug)
  }
})

test('every curated image file exists', () => {
  const inventory = JSON.parse(read('data/local-properties.json'))
  for (const p of inventory) for (const x of p.images || []) {
    if (typeof x === 'string' && x.startsWith('/uploads/')) assert.ok(fs.existsSync(path.join(root, 'public', x)), x)
  }
})
