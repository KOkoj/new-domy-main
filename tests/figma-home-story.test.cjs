const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const root = path.join(__dirname, '..')
const read = file => fs.readFileSync(path.join(root, file), 'utf8')
const story = JSON.parse(read('data/lucie-benesova-story.json'))

test('homepage contact is scoped to the homepage and remains dismissible and callable', () => {
  assert.match(read('app/HomePageClient.jsx'), /<Navigation appearAfterHero showConcierge \/>/)
  assert.match(read('app/HomePageClient.jsx'), /<ConciergeContact language=\{language\} \/>/)
  const contact = read('components/ConciergeContact.jsx')
  assert.match(contact, /tel:\+420731450001/)
  assert.match(contact, /Po–Pá: 9–16 a 18–20 hod\./)
  assert.match(contact, /aria-expanded=\{open\}/)
  assert.match(contact, /event.key === 'Escape'/)
  assert.match(contact, /launcherRef.current\?\.focus\(\)/)
  assert.match(read('components/Navigation.js'), /showConcierge = false/)
})

test('homepage uses the supplied new photo and links to the public first story installment', () => {
  const component = read('components/stories/LucieBenesovaCard.jsx')
  assert.match(component, /benesova-story-card.webp/)
  assert.ok(component.includes(`href="${story.path}"`))
  assert.ok(!component.includes('lucie-benesova-story.json'), 'do not ship the complete article in the homepage client bundle')
  assert.ok(!read('app/HomePageClient.jsx').includes('data-testid="process-photo"'))
  assert.match(read('components/stories/LucieBenesovaCard.module.css'), /\.description \{ color: #fff/)
  assert.ok(read('app/blog/page.js').includes(story.path))
  assert.ok(read('app/sitemap.js').includes(story.path))
})

test('story preserves all 73 public source blocks and does not publish the administrative note', () => {
  assert.equal(story.blocks.length, 73)
  assert.equal(story.blocks.filter(block => block.style === 'Heading1').length, 7)
  assert.equal(story.blocks[0].id, 'p3')
  assert.equal(story.blocks.at(-1).id, 'p75')
  assert.equal(story.title, 'Jak jsme pomohli Lucii Benešové splnit její italský sen')
  assert.match(story.subtitle, /^1\. díl:/)
  assert.ok(!JSON.stringify(story).includes('Poznámka pro správce webu'))
  const page = read('app/blog/pribeh-lucie-benesove-1/page.jsx')
  assert.match(page, /buildArticleMetadata\(seo\)/)
  assert.match(page, /buildArticleJsonLd\(seo\)/)
  assert.match(page, /buildBreadcrumbJsonLd/)
  assert.ok(!page.includes('ArticlePaywallGate'))
})

test('every supplied concierge asset and optimized story image is a nonempty local file', () => {
  for (const name of ['lucie-portrait.png', 'lucie-nav-portrait.png', 'status-floating.svg', 'status-nav.svg', 'close.svg', 'phone.svg', 'launcher.svg', 'benesova-story-card.webp']) {
    assert.ok(fs.statSync(path.join(root, 'public/images/home-concierge', name)).size > 0, name)
  }
  for (const name of ['hero.webp', 'og.jpg']) {
    assert.ok(fs.statSync(path.join(root, 'public/articles/lucie-benesova', name)).size > 0, name)
  }
  for (const file of ['components/ConciergeContact.jsx', 'components/stories/LucieBenesovaCard.jsx']) {
    assert.ok(!read(file).includes('figma.com/api/mcp/asset'))
  }
})
