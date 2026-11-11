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


test('contact closed state survives remounts, reopening resets it, and blocked storage is safe', () => {
  const vm = require('node:vm')
  const source = read('lib/conciergeSession.js').replace(/export (const|function) /g, '$1 ')
  const context = { module: { exports: {} } }
  vm.runInNewContext(source + '\nmodule.exports = { isConciergeDismissed, rememberConciergeDismissal }', context)
  const { isConciergeDismissed, rememberConciergeDismissal } = context.module.exports
  const values = new Map()
  const getStorage = () => ({ getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) })
  assert.equal(isConciergeDismissed(getStorage), false)
  rememberConciergeDismissal(getStorage, true)
  assert.equal(isConciergeDismissed(getStorage), true)
  assert.equal(isConciergeDismissed(getStorage), true, 'navigation/remount must keep it closed')
  rememberConciergeDismissal(getStorage, false)
  assert.equal(isConciergeDismissed(getStorage), false)
  const blocked = () => { throw new Error('Storage denied') }
  assert.equal(isConciergeDismissed(blocked), false)
  assert.doesNotThrow(() => rememberConciergeDismissal(blocked, true))
})

test('contact is viewport-fixed via a body portal, enters after a delay, and rotates the same launcher', () => {
  const component = read('components/ConciergeContact.jsx')
  const css = read('components/ConciergeContact.module.css')
  assert.match(component, /return createPortal\(/)
  assert.match(component, /document.body/)
  assert.match(component, /if \(!mounted\) return null/)
  assert.match(component, /const \[open, setOpen\] = useState\(false\)/)
  assert.match(component, /\? 2400 : 1000/)
  assert.match(component, /window.clearTimeout\(entranceTimerRef.current\)/)
  assert.ok(!component.includes('launcherPortrait'))
  assert.match(css, /\.floating \{\s*position: fixed/)
  assert.match(css, /\.launcherClosed \{ transform: rotate\(45deg\)/)
  assert.match(css, /@keyframes conciergePop/)
  assert.match(css, /prefers-reduced-motion: reduce/)
  assert.match(css, /\.panel \{ animation: none; \}/)
  assert.match(css, /\.launcherIcon \{ transition: none; \}/)
  assert.match(css, /safe-area-inset-bottom/)
})

test('editorial width is an explicit readable column, unaffected by the public canvas override', () => {
  const css = read('app/globals.css')
  assert.match(css, /\.site-page \.article-body \{[\s\S]*?max-width: min\(72ch, 720px\) !important/)
  assert.ok(css.indexOf('.site-page .article-body') > css.indexOf('max-width: none !important'))
  assert.match(read('app/blog/pribeh-lucie-benesove-1/page.jsx'), /className="article-body space-y-5"/)
  for (const name of ['jak-cestovat-po-italii-levne', 'kde-se-ubytovat-v-italii-levne', 'kolik-stoji-dovolena-v-italii-v-roce-2026', 'kolik-stoji-jidlo-v-italii-v-roce-2026', 'nejkrasnejsi-mala-mesta-v-italii']) {
    assert.match(read(`app/clanky/pruvodce-italii/${name}/page.js`), /<article className="article-body/)
  }
})

test('sticky nav has balanced grid grouping, compact call pill, and responsive identity', () => {
  const nav = read('components/Navigation.js')
  const css = read('components/NavigationContact.module.css')
  const contact = read('components/ConciergeContact.module.css')
  assert.match(nav, /data-testid="nav-right-group"/)
  assert.match(css, /grid-template-columns: auto minmax\(0, 1fr\) auto/)
  assert.match(css, /justify-self: center/)
  assert.match(nav, /relative block h-14 w-14 shrink-0 sm:h-16 sm:w-16/)
  assert.match(nav, /min-\[1280px\]:flex/)
  assert.match(contact, /@media \(min-width: 1440px\) \{\s*\.compactIdentity \{ display: flex/)
  assert.match(contact, /\.compactPhone \{[^}]*min-height: 32px[^}]*background: #1b2642/)
})
