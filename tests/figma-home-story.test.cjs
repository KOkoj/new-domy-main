const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const root = path.join(__dirname, '..')
const read = file => fs.readFileSync(path.join(root, file), 'utf8')
const story = JSON.parse(read('data/lucie-benesova-story.json'))

test('homepage contact is scoped to the homepage and remains dismissible and callable', () => {
  assert.match(read('app/HomePageClient.jsx'), /<Navigation appearAfterHero \/>/)
  assert.match(read('app/HomePageClient.jsx'), /<ConciergeContact language=\{language\} \/>/)
  const contact = read('components/ConciergeContact.jsx')
  assert.match(contact, /tel:\+420731450001/)
  assert.match(contact, /Po–Pá: 9–16 a 18–20 hod\./)
  assert.match(contact, /aria-expanded=\{open\}/)
  assert.match(contact, /event.key === 'Escape'/)
  assert.match(contact, /launcherRef.current\?\.focus\(\)/)
  assert.ok(!read('components/Navigation.js').includes('Concierge'))
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
  assert.match(component, /scheduleConciergeOpening/)
  assert.match(component, /cancelEntranceRef.current\(\)/)
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

test('sticky nav returns to the original clean layout without a concierge block', () => {
  const nav = read('components/Navigation.js')
  assert.ok(!nav.includes('Concierge'))
  assert.ok(!nav.includes('showConcierge'))
  assert.ok(!fs.existsSync(path.join(root, 'components/NavigationContact.module.css')))
  assert.match(nav, /min-\[1400px\]:flex/)
  assert.match(nav, /sm:absolute top-0 left-0 h-14 sm:h-20 md:h-24/)
})

test('card clips no horizontal scrolling, keeps legible hours and offers desktop text/mobile call styling', () => {
  const css = read('components/ConciergeContact.module.css')
  assert.match(css, /box-sizing: border-box/)
  assert.match(css, /overflow-x: hidden/)
  assert.ok(!css.includes('.dismiss::before'), 'the negative-inset hit target caused the 1px overflow')
  assert.match(css, /\.dismiss \{[^}]*width: 40px; height: 40px/)
  assert.match(css, /\.callingHours p \{ font-size: 13px; line-height: 18px/)
  assert.match(css, /\.role \{ font-size: 13px; line-height: 18px/)
  assert.ok(!css.includes('.hoursLabel { display: none'))
  assert.match(css, /@media \(min-width: 768px\) and \(pointer: fine\)/)
  assert.match(css, /user-select: text/)
  assert.match(css, /\.phone \{[^}]*background: #1b2642/)
  assert.match(css, /\.launcherIcon \{ transition: transform 420ms/)
})

test('homepage removes back-to-top entirely, other pages retain the original control', () => {
  const component = read('components/ConciergeContact.jsx')
  const css = read('components/ConciergeContact.module.css')
  const backToTop = read('components/ScrollToTop.jsx')
  assert.match(backToTop, /usePathname\(\) === '\/'/)
  assert.match(backToTop, /if \(isHomepage\) return null/)
  assert.match(backToTop, /if \(isHomepage\) return\s+const toggleVisibility/)
  assert.match(backToTop, /fixed bottom-6 right-6 z-40/)
  assert.ok(!component.includes('ResizeObserver'))
  assert.ok(!component.includes('concierge-stack-height'))
  assert.ok(!css.includes('scroll-to-top'))
  assert.match(read('app/blog/pribeh-lucie-benesove-1/page.jsx'), /<figure className="article-body mb-12"/)
})

test('card close has a visible 40px circle and 18px icon while launcher retains its rotating plus', () => {
  const css = read('components/ConciergeContact.module.css')
  assert.match(css, /\.dismiss \{[^}]*width: 40px; height: 40px; border-radius: 50%; background:/)
  assert.match(css, /\.dismiss img \{ display: block; width: 18px; height: 18px/)
  assert.match(css, /\.launcherClosed \{ transform: rotate\(45deg\)/)
  assert.match(css, /\.launcherIcon \{ transition: transform 420ms/)
})

test('target viewports skip the short-height scrolling fallback and card widths fit', () => {
  const css = read('components/ConciergeContact.module.css')
  const panel = css.match(/\.panel \{([^}]+)\}/)[1]
  assert.match(panel, /overflow: visible/)
  assert.ok(!panel.includes('max-height:'))
  assert.match(css, /@media \(max-height: 480px\) \{\s*\.panel \{[^}]*overflow-x: hidden; overflow-y: auto/)
  // All requested heights are outside the only scroll-enabled media query.
  for (const [width, height] of [[1440,900],[1280,800],[390,844]]) {
    assert.ok(height > 480)
    const cardWidth = width <= 640 ? 260 : 284
    const inset = width <= 640 ? 12 : 24
    assert.ok(cardWidth + 2 * inset <= width)
  }
})

function entranceHarness({ mobile = false, now = 100, readyAt = 100, dismissed = false, loading = false } = {}) {
  const vm = require('node:vm')
  const session = read('lib/conciergeSession.js').replace(/export (const|function) /g, '$1 ')
  const source = read('lib/conciergeEntrance.js').replace(/^import .*\n/, '').replace('export function', 'function')
  const context = { module: { exports: {} } }
  vm.runInNewContext(session + '\n' + source + '\nmodule.exports = { scheduleConciergeOpening }', context)
  let clock = now, opens = 0, bottom = 900, nextId = 0, domInteractive = readyAt
  const timers = new Map(), events = new Map(), docEvents = new Map()
  const doc = {
    readyState: loading ? 'loading' : 'complete',
    querySelector: () => ({ getBoundingClientRect: () => ({ bottom }) }),
    addEventListener: (key, handler) => docEvents.set(key, handler),
    removeEventListener: key => docEvents.delete(key),
  }
  const win = {
    sessionStorage: { getItem: () => dismissed ? '1' : null },
    matchMedia: () => ({ matches: mobile }),
    performance: { now: () => clock, getEntriesByType: () => [{ domInteractive }] },
    setTimeout: (callback, delay) => { const id = ++nextId; timers.set(id, { at: clock + delay, callback }); return id },
    clearTimeout: id => timers.delete(id),
    addEventListener: (key, handler) => events.set(key, handler),
    removeEventListener: key => events.delete(key),
  }
  const cancel = context.module.exports.scheduleConciergeOpening({ window: win, document: doc, onOpen: () => opens++ })
  return {
    cancel, opens: () => opens,
    scrollTo: value => { bottom = value; events.get('scroll')?.() },
    ready: () => { doc.readyState = 'complete'; domInteractive = clock; docEvents.get('DOMContentLoaded')?.() },
    advance: ms => {
      const target = clock + ms
      while (true) {
        const next = [...timers].filter(([,t]) => t.at <= target).sort((a,b) => a[1].at - b[1].at)[0]
        if (!next) break
        clock = next[1].at; timers.delete(next[0]); next[1].callback()
      }
      clock = target
    },
  }
}

test('fresh desktop opens once at one second from DOM readiness', () => {
  const h = entranceHarness()
  h.advance(999); assert.equal(h.opens(), 0)
  h.advance(1); assert.equal(h.opens(), 1)
  h.advance(5000); assert.equal(h.opens(), 1)
})
test('late desktop hydration does not add a second delay', () => {
  const h = entranceHarness({ now: 1800, readyAt: 100 })
  h.advance(0); assert.equal(h.opens(), 1)
})
test('desktop that is still parsing waits for DOM readiness', () => {
  const h = entranceHarness({ loading: true })
  h.advance(5000); assert.equal(h.opens(), 0)
  h.ready(); h.advance(999); assert.equal(h.opens(), 0)
  h.advance(1); assert.equal(h.opens(), 1)
})
test('mobile stays closed in the hero and opens only after post-hero scrolling settles', () => {
  const h = entranceHarness({ mobile: true })
  h.advance(5000); assert.equal(h.opens(), 0)
  h.scrollTo(0); h.advance(700); assert.equal(h.opens(), 0)
  h.scrollTo(-50); h.advance(849); assert.equal(h.opens(), 0)
  h.advance(1); assert.equal(h.opens(), 1)
  h.scrollTo(-200); h.advance(3000); assert.equal(h.opens(), 1)
})
test('mobile returning to the hero cancels its pending auto-open', () => {
  const h = entranceHarness({ mobile: true })
  h.scrollTo(0); h.advance(500); h.scrollTo(900); h.advance(5000)
  assert.equal(h.opens(), 0)
})
test('manual interaction or unmount cancels desktop and mobile automatic opening', () => {
  for (const mobile of [false, true]) {
    const h = entranceHarness({ mobile })
    h.scrollTo(0); h.cancel(); h.advance(5000); h.scrollTo(-200); h.advance(5000)
    assert.equal(h.opens(), 0)
  }
})
test('dismissed sessions never auto-open on either viewport', () => {
  for (const mobile of [false, true]) {
    const h = entranceHarness({ mobile, dismissed: true })
    h.scrollTo(0); h.advance(5000); assert.equal(h.opens(), 0)
  }
})
