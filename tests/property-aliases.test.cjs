const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')
const aliases = require('../data/property-aliases.json')
const inventory = require('../data/local-properties.json')

function load(file, context, names) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
    .replace(/^import .* from .*$/gm, '').replace(/export /g, '')
  const sandbox = { ...context, module: { exports: {} } }
  vm.runInNewContext(source + '\nmodule.exports = {' + names.join(',') + '}', sandbox)
  return sandbox.module.exports
}
const helpers = load('lib/propertyAliases.js', { aliases }, ['isPropertyAlias', 'resolvePropertySlug', 'resolvePropertyId'])
const [alias] = aliases

test('verified alias preserves historical IDs and resolves to an existing primary', () => {
  for (const a of aliases) {
    const primary = inventory.find(p => p._id === a.primaryId)
    const secondary = inventory.find(p => p._id === a.secondaryId)
    assert.equal(primary.slug.current, a.primarySlug)
    assert.equal(secondary.slug.current, a.secondarySlug)
    assert.equal(primary.sourceUrl, secondary.sourceUrl)
    assert.equal(helpers.isPropertyAlias(primary), false)
    assert.equal(helpers.resolvePropertySlug(a.secondaryId), a.primarySlug)
    assert.equal(helpers.resolvePropertySlug(a.secondarySlug), a.primarySlug)
    assert.equal(helpers.resolvePropertyId(a.secondaryId), a.primaryId)
    assert.equal(helpers.resolvePropertySlug(a.primarySlug), a.primarySlug)
    for (const image of primary.images) assert.ok(fs.existsSync(path.join(__dirname, '../public', image)), image)
  }
})

test('public data excludes only the verified duplicate, including reimports and filters', async () => {
  const secondary = inventory.find(p => p._id === alias.secondaryId)
  const api = load('lib/propertyApi.js', {
    ...helpers, process: { env: {} }, console,
    getLocalProperties: async () => [...inventory, { ...secondary, _id: 'reimported-id' }],
    getLocalPropertyBySlug: async key => inventory.find(p => p.slug.current === key || p._id === key),
    isDisplayableProperty: p => Boolean(p?.slug?.current),
    mergePropertyRecords: (a, b) => b || a
  }, ['getAllProperties', 'getPropertyBySlug'])
  const all = await api.getAllProperties(new URLSearchParams())
  assert.equal(all.length, inventory.length - 1)
  assert.equal(all.filter(p => p.sourceUrl === alias.sourceUrl).length, 1)
  for (const query of ['city=pescara', 'search=Pescara', 'type=apartment', 'minPrice=250000&maxPrice=270000', 'featured=true']) {
    const result = await api.getAllProperties(new URLSearchParams(query))
    assert.ok(result.every(p => !helpers.isPropertyAlias(p)), query)
  }
  for (const key of [alias.secondarySlug, alias.secondaryId, encodeURIComponent(alias.secondarySlug)]) {
    assert.equal((await api.getPropertyBySlug(key))._id, alias.primaryId)
  }
  assert.equal(await api.getPropertyBySlug('nonexistent-property-test-92841'), null)
  const sold = inventory.find(p => p.status === 'sold')
  assert.equal((await api.getPropertyBySlug(sold.slug.current))._id, sold._id)
})
