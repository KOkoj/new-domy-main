const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const root = path.join(__dirname, '..')
const read = file => fs.readFileSync(path.join(root, file), 'utf8')
function load(file, context, names) {
  const source = read(file).replace(/^import .*$/gm, '').replace(/export /g, '')
  const sandbox = { ...context, URLSearchParams, module: { exports: {} } }
  vm.runInNewContext(source + '\nmodule.exports = {' + names.join(',') + '}', sandbox)
  return sandbox.module.exports
}
const display = load('lib/propertyDisplay.js', {}, ['getPropertyRegionTranslations', 'resolvePropertyType'])
const images = load('lib/getPropertyImage.js', { urlForImage: () => null }, ['getPropertyImage', 'getPropertyImageList'])
const slider = load('lib/propertySliderData.js', { ...display, ...images }, ['preparePropertySliderPreview'])
const inventory = require('../data/local-properties.json')
const build = context => load('lib/articleProperties.js', { ...slider, ...context }, ['prepareArticleProperties', 'getArticleProperties'])

test('article selection uses three real available listings in existing homepage order', () => {
  const before = JSON.stringify(inventory)
  const { prepareArticleProperties } = build({})
  const cards = prepareArticleProperties(inventory)
  const expected = slider.preparePropertySliderPreview(inventory.filter(p => !p.status || p.status === 'available')).slice(0, 3)
  assert.equal(cards.length, 3)
  assert.deepEqual(Array.from(cards, p => p.id), Array.from(expected, p => p.id))
  for (const card of cards) {
    const real = inventory.find(p => p._id === card.id)
    assert.ok(real)
    assert.equal(card.price, real.price.amount)
    assert.equal(card.slug, real.slug.current)
    assert.equal(card.titleI18n.cs, real.title.cs)
    assert.ok(card.image)
    assert.equal(card.status, 'available')
    assert.ok(!('description' in card))
  }
  assert.equal(JSON.stringify(inventory), before)
})

test('article cards do not invent fill-ins for empty, sold-only, or small inventories', () => {
  const { prepareArticleProperties } = build({})
  assert.equal(prepareArticleProperties([]).length, 0)
  assert.equal(prepareArticleProperties(inventory.filter(p => p.status === 'sold')).length, 0)
  assert.equal(prepareArticleProperties(inventory.filter(p => p.status === 'available').slice(0, 1)).length, 1)
})

test('server loader calls the same inventory API as homepage and safely omits failed data', async () => {
  let called = false
  const { getArticleProperties } = build({ getListableProperties: async params => {
    called = true
    assert.equal(params.toString(), '')
    return inventory
  } })
  assert.equal((await getArticleProperties()).length, 3)
  assert.equal(called, true)
  const failing = build({ getListableProperties: async () => { throw new Error('Inventory offline') }, console: { error() {} } })
  assert.equal((await failing.getArticleProperties()).length, 0)
})

test('shared article section reuses the homepage card, real server data and wider responsive site container', () => {
  const component = read('components/articles/ArticleProperties.jsx')
  assert.match(component, /import PropertyPreviewCard from '@\/components\/PropertyPreviewCard'/)
  assert.match(component, /await getArticleProperties\(\)/)
  assert.match(component, /if \(properties.length === 0\) return null/)
  assert.match(component, /Vybrané nemovitosti/)
  assert.match(component, /href="\/nemovitosti"/)
  assert.match(component, /max-w-\[1800px\].*xl:px-\[10rem\]/)
  assert.match(component, /grid-cols-1.*lg:grid-cols-3/)
  assert.ok(!component.includes('article-body'))
  assert.match(read('components/PropertySlider.jsx'), /<PropertyPreviewCard/)
  assert.match(read('lib/articleProperties.js'), /import 'server-only'/)
})

test('story and shared region-blog post template render the server section before footer', () => {
  const story = read('app/blog/pribeh-lucie-benesove-1/page.jsx')
  assert.match(story, /<\/article>\s*<Suspense fallback=\{null\}>\s*<ArticleProperties \/>/)
  const page = read('app/blog/regions/[slug]/page.js')
  assert.match(page, /relatedProperties=.*<ArticleProperties \/>/)
  const client = read('app/blog/regions/[slug]/RegionBlogClient.jsx')
  assert.match(client, /\{relatedProperties\}\s*<Footer/)
})

test('requested Czech property link redirects to the existing canonical inventory route', async () => {
  const redirects = await require('../next.config.js').redirects()
  for (const source of ['/nemovitosti', '/nemovitosti/']) {
    const redirect = redirects.find(rule => rule.source === source)
    assert.equal(redirect.destination, '/properties')
    assert.equal(redirect.statusCode, 301)
  }
})

test('extracted preview card keeps the original working property URL resolver', () => {
  const source = read('components/PropertyPreviewCard.jsx')
  const helper = source.match(/export function getPropertyHref\(property\) \{[\s\S]*?\n\}/)[0].replace('export ', '')
  const sandbox = { module: { exports: {} } }
  vm.runInNewContext(helper + '\nmodule.exports = getPropertyHref', sandbox)
  const href = sandbox.module.exports
  assert.equal(href({ slug: { current: 'actual-slug' } }), '/properties/actual-slug')
  assert.equal(href({ slug: 'actual-slug' }), '/properties/actual-slug')
  assert.equal(href({ _id: 'actual-id' }), '/properties/actual-id')
  assert.equal(href({}), '/properties')
  assert.match(read('components/PropertySlider.jsx'), /PropertyPreviewCard, \{ getPropertyHref \}/)
})
