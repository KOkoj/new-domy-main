const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')

const source = fs.readFileSync(path.join(__dirname, '../app/properties/listingQuery.js'), 'utf8')
  .replace(/export /g, '')
const sandbox = { module: { exports: {} } }
vm.runInNewContext(source + '\nmodule.exports = { isListingQueryActive, moveNewListingsLast }', sandbox)
const { isListingQueryActive, moveNewListingsLast } = sandbox.module.exports

test('default listing view is not an active query', () => {
  assert.equal(isListingQueryActive(), false)
  assert.equal(isListingQueryActive({ search: '  ', sortBy: 'newest' }), false)
})

test('filter, search or a non-default sort is an active query', () => {
  assert.equal(isListingQueryActive({ region: 'toscana' }), true)
  assert.equal(isListingQueryActive({ search: 'Puglia' }), true)
  assert.equal(isListingQueryActive({ propertyType: 'villa' }), true)
  assert.equal(isListingQueryActive({ rooms: '4' }), true)
  assert.equal(isListingQueryActive({ priceFrom: '100000' }), true)
  assert.equal(isListingQueryActive({ priceTo: '300000' }), true)
  assert.equal(isListingQueryActive({ amenities: ['pool'] }), true)
  assert.equal(isListingQueryActive({ sortBy: 'cheapest' }), true)
})

test('new listings stay first until a query is active, then move below the rest', () => {
  const list = [
    { id: 'n1', isNew: true },
    { id: 'a', isNew: false },
    { id: 'n2', isNew: true },
    { id: 'b' },
  ]
  assert.equal(list.map((p) => p.id).join(','), 'n1,a,n2,b')
  assert.equal(moveNewListingsLast(list).map((p) => p.id).join(','), 'a,b,n1,n2')
})
