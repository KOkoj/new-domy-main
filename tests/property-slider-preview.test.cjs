const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')

function load(file, context, names) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
    .replace(/^import .* from .*$/gm, '').replace(/export /g, '')
  const sandbox = { ...context, module: { exports: {} } }
  vm.runInNewContext(source + '\nmodule.exports = {' + names.join(',') + '}', sandbox)
  return sandbox.module.exports
}
const display = load('lib/propertyDisplay.js', {}, ['getPropertyRegionTranslations'])
const images = load('lib/getPropertyImage.js', { urlForImage: () => null }, ['getPropertyImage'])
const { prepareProperties, preparePropertySliderPreview } = load('lib/propertySliderData.js', { ...display, ...images }, ['prepareProperties', 'preparePropertySliderPreview'])

test('preview preserves pinned/new/date ordering and the first twelve full carousel cards', () => {
  const inventory = require('../data/local-properties.json')
  const before = JSON.stringify(inventory)
  const preview = preparePropertySliderPreview(inventory)
  assert.equal(preview.length, 12)
  const full = prepareProperties(inventory).slice(0, 12)
  preview.forEach((card, i) => {
    const { createdAt, updatedAt, pinnedRank, ...expected } = full[i]
    assert.deepEqual(JSON.parse(JSON.stringify(card)), JSON.parse(JSON.stringify(expected)))
    assert.ok(card.image && card.slug && card.titleI18n.cs && card.regionI18n.cs)
    for (const key of ['description', 'images', 'location', 'amenities', 'sourceUrl', 'createdAt', 'updatedAt', 'pinnedRank']) assert.ok(!(key in card), key)
  })
  assert.equal(JSON.stringify(inventory), before)
  assert.ok(Buffer.byteLength(JSON.stringify(preview)) < Buffer.byteLength(before) / 20)
})

test('small inventories and sold cards retain their existing behavior', () => {
  const fixture = [
    { _id: 'ordinary', _createdAt: '2026-09-01', status: 'sold' },
    { _id: 'new', isNew: true, _createdAt: '2026-01-01' },
    { _id: 'pinned-two', pinnedRank: 2 },
    { _id: 'pinned-one', pinnedRank: 1 }
  ]
  assert.equal(preparePropertySliderPreview([]).length, 0)
  const preview = preparePropertySliderPreview(fixture)
  assert.deepEqual(Array.from(preview, card => card.id), ['pinned-one', 'pinned-two', 'new', 'ordinary'])
  assert.equal(preview[3].status, 'sold')
})
