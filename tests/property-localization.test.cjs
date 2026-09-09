const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')
const root = path.resolve(__dirname, '..')
const display = fs.readFileSync(path.join(root, 'lib/propertyDisplay.js'), 'utf8').replaceAll('export ', '')
const helpers = vm.runInNewContext(display + '\n;({getPropertyRegionName, getPropertyRegionTranslations, getLocalizedValue})')
const inventory = JSON.parse(fs.readFileSync(path.join(root, 'data/local-properties.json'), 'utf8'))

test('all inventory regions follow the selected language', () => {
  const properties = Array.isArray(inventory) ? inventory : inventory.properties
  assert.ok(properties.length)
  for (const property of properties) {
    const translations = helpers.getPropertyRegionTranslations(property)
    for (const language of ['cs', 'it', 'en']) {
      const expected = property.location?.city?.region?.name?.[language]
      if (expected) assert.equal(translations[language], expected, property.slug?.current)
      assert.equal(typeof translations[language], 'string')
    }
  }
})

test('switching language preserves each region translation', () => {
  const property = { location: { city: { region: { name: { cs: 'Toskánsko', it: 'Toscana', en: 'Tuscany' } } } } }
  const translations = helpers.getPropertyRegionTranslations(property)
  for (const language of ['it', 'en', 'cs', 'it']) {
    assert.equal(helpers.getLocalizedValue(translations, language), property.location.city.region.name[language])
  }
})

test('location fallback handles cities, strings, missing and partial records', () => {
  assert.equal(helpers.getPropertyRegionName({}, 'it'), 'Italia')
  assert.equal(helpers.getPropertyRegionName(null, 'en'), 'Italy')
  assert.equal(helpers.getPropertyRegionName({ location: { city: { name: { en: 'Rome', it: 'Roma' } } } }, 'it'), 'Roma')
  assert.equal(helpers.getPropertyRegionName({ location: { city: { region: { name: 'Abruzzo' } } } }, 'en'), 'Abruzzo')
  assert.equal(helpers.getPropertyRegionName({ location: { city: { region: { name: { it: 'Liguria' } } } } }, 'en'), 'Liguria')
})

const config = fs.readFileSync(path.join(root, 'app/properties/filterConfig.js'), 'utf8')
  .replace(/^import .*$/gm, '').replaceAll('export ', '')
const listing = fs.readFileSync(path.join(root, 'lib/propertyListing.js'), 'utf8')
  .replace(/^import .*$/gm, '').replaceAll('export ', '')
const api = vm.runInNewContext(display + '\n' + config + '\n' + listing + '\n;({transformPropertyListing, REGION_LABELS, toRegionSlug})', {
  Home: null, Building: null, Castle: null, Building2: null, getPropertyImage: () => '/placeholder-property.jpg',
})
test('listing transformation retains translations and stable region filters', () => {
  const property = { title: { cs: 'Byt', it: 'Appartamento', en: 'Apartment' }, location: { city: { region: { name: { cs: 'Tosk\u00e1nsko', it: 'Toscana', en: 'Tuscany' } } } } }
  const result = api.transformPropertyListing(property)
  assert.equal(result.regionSlug, 'toscana')
  assert.equal(result.regionI18n.it, 'Toscana')
  assert.equal(result.regionI18n.en, 'Tuscany')
  assert.equal(api.REGION_LABELS[result.regionSlug].it, 'Toscana')
  for (const [slug, names] of Object.entries(api.REGION_LABELS)) {
    for (const language of ['cs', 'it', 'en']) {
      assert.ok(names[language])
      assert.ok(!names[language].includes('?'), slug)
    }
    assert.equal(api.toRegionSlug(slug), slug)
  }
})
