const test = require('node:test')
const assert = require('node:assert/strict')
const same = (actual, expected) => assert.equal(JSON.stringify(actual), JSON.stringify(expected))
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const root = path.join(__dirname, '..')
const read = file => fs.readFileSync(path.join(root, file), 'utf8')

function loadTracking() {
  const source = read('lib/conversionTracking.js').replace(/export /g, '')
  const sandbox = { URL, URLSearchParams, module: { exports: {} } }
  vm.runInNewContext(
    source + '\nmodule.exports = { CAMPAIGN_STORAGE_KEY, CAMPAIGN_COOKIE, MAX_CUSTOM_EVENT_PROPS, parseCampaignParams, captureFirstLanding, readStoredCampaign, readUtmSourceFromCookieHeader, campaignCookieOptions, shouldIgnoreTrackingPath, inferLocation, inferLocationFromReferer, isWhatsappUrl, isBookCallPath, isPropertyDetailPath, buildEventData, resolveClickEvent, emptyCampaign, clipEventValue }',
    sandbox
  )
  return sandbox.module.exports
}

const tracking = loadTracking()

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial))
  return {
    getItem: key => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, value),
    values
  }
}

test('Pro custom events keep at most two properties and prefer type plus utm_source', () => {
  assert.equal(tracking.MAX_CUSTOM_EVENT_PROPS, 2)
  same(tracking.buildEventData({ location: 'home', type: 'property', utm_source: 'instagram' }), { type: 'property', utm_source: 'instagram' })
  same(tracking.buildEventData({ location: 'footer', utm_source: 'instagram' }), { location: 'footer', utm_source: 'instagram' })
  same(tracking.buildEventData({ location: 'contact' }), { location: 'contact' })
  same(tracking.buildEventData({}), {})
  const long = 'x'.repeat(300)
  assert.equal(tracking.buildEventData({ location: long }).location.length, 255)
})

test('first landing UTM is stored once and later URLs do not overwrite it', () => {
  const storage = memoryStorage()
  const cookies = []
  const first = tracking.captureFirstLanding({
    url: 'https://www.domyvitalii.cz/blog/pribeh-lucie-benesove-1?utm_source=instagram&utm_campaign=lucie',
    storage,
    setCookie: value => cookies.push(value)
  })
  assert.equal(first.utm_source, 'instagram')
  assert.equal(first.utm_campaign, 'lucie')
  assert.equal(first.path, '/blog/pribeh-lucie-benesove-1')
  assert.deepEqual(cookies, ['instagram'])
  const second = tracking.captureFirstLanding({
    url: 'https://www.domyvitalii.cz/contact?utm_source=google',
    storage,
    setCookie: value => cookies.push(value)
  })
  assert.equal(second.utm_source, 'instagram')
  assert.equal(second.utm_campaign, 'lucie')
  assert.equal(cookies.length, 1)
  assert.equal(tracking.readUtmSourceFromCookieHeader('theme=light; dvi_utm=instagram; other=1'), 'instagram')
  assert.match(tracking.campaignCookieOptions('instagram'), /^dvi_utm=instagram; Path=\/; SameSite=Lax$/)
})

test('blocked storage during capture is safe and does not throw', () => {
  const blocked = {
    getItem() { throw new Error('Storage denied') },
    setItem() { throw new Error('Storage denied') }
  }
  assert.doesNotThrow(() => tracking.captureFirstLanding({
    url: 'https://www.domyvitalii.cz/?utm_source=instagram',
    storage: blocked
  }))
  assert.equal(
    tracking.captureFirstLanding({
      url: 'https://www.domyvitalii.cz/?utm_source=instagram',
      storage: blocked
    }).utm_source,
    ''
  )
})

test('click resolver maps public conversion links and ignores listing index, dashboard and favorites context is handled by location', () => {
  same(tracking.resolveClickEvent({ href: 'tel:+420731450001', pathname: '/', inConcierge: true }), { name: 'concierge_phone_click', location: 'concierge' })
  same(tracking.resolveClickEvent({ href: 'tel:+420720363136', pathname: '/', inFooter: true }), { name: 'phone_click', location: 'footer' })
  same(tracking.resolveClickEvent({ href: 'https://wa.me/420731450001', pathname: '/contact' }), { name: 'whatsapp_click', location: 'contact' })
  same(tracking.resolveClickEvent({ href: '/book-call', pathname: '/' }), { name: 'consult_cta_click', location: 'home' })
  assert.equal(tracking.resolveClickEvent({ href: '/book-call', pathname: '/book-call' }), null)
  same(tracking.resolveClickEvent({ href: '/properties/toscana-rustico-quiesa-massarosa-132061064', pathname: '/' }), { name: 'property_card_click', location: 'home' })
  same(tracking.resolveClickEvent({ href: '/properties/foo', pathname: '/blog/pribeh-lucie-benesove-1' }), { name: 'property_card_click', location: 'article' })
  assert.equal(tracking.resolveClickEvent({ href: '/properties', pathname: '/' }), null)
  assert.equal(tracking.resolveClickEvent({ href: '/properties?region=toscana', pathname: '/' }), null)
  assert.equal(tracking.resolveClickEvent({ href: 'tel:+420731450001', pathname: '/dashboard/concierge' }), null)
  assert.equal(tracking.resolveClickEvent({ href: '/about', pathname: '/' }), null)
  assert.equal(tracking.inferLocation('/clanky/pruvodce-italii/foo'), 'article')
  assert.equal(tracking.inferLocationFromReferer('https://www.domyvitalii.cz/login'), 'login')
})

test('layout, concierge, APIs and CTAs wire track() without changing existing behaviour hooks', () => {
  const layout = read('app/layout.js')
  assert.match(layout, /import ConversionTracking from '@\/components\/ConversionTracking'/)
  assert.match(layout, /<ConversionTracking \/>/)
  assert.match(layout, /<Analytics \/>/)

  const concierge = read('components/ConciergeContact.jsx')
  assert.match(concierge, /trackClientEvent\('concierge_open'/)
  assert.match(concierge, /trackClientEvent\('concierge_dismiss'/)
  assert.match(concierge, /tel:\+420731450001/)
  assert.match(concierge, /event.key === 'Escape'/)

  const listener = read('components/ConversionTracking.jsx')
  assert.match(listener, /captureLandingCampaign\(\)/)
  assert.match(listener, /addEventListener\('click', handleClick, true\)/)
  assert.match(listener, /favorite-button/)

  assert.match(read('app/HomePageClient.jsx'), /trackClientEvent\('consult_cta_click'/)
  assert.match(read('components/PropertyMap.js'), /trackClientEvent\('property_card_click'/)

  const inquiries = read('app/api/inquiries/route.js')
  assert.match(inquiries, /from '@\/lib\/trackServerEvent'/)
  assert.match(inquiries, /trackServerEvent\(request, 'inquiry_submit'/)
  assert.match(inquiries, /type: type \|\| 'property'/)

  const leads = read('app/api/leads/route.js')
  assert.equal(leads.split("trackServerEvent(request, 'lead_submit'").length - 1, 2)

  const signup = read('app/api/auth/signup/route.js')
  assert.match(signup, /trackServerEvent\(request, 'signup'/)
  assert.match(signup, /isLikelyNewUser && data\?\.user\?\.id/)

  const server = read('lib/trackServerEvent.js')
  assert.match(server, /from '@vercel\/analytics\/server'/)
  assert.match(server, /await track\(/)
  assert.match(server, /catch/)

  const client = read('lib/trackClientEvent.js')
  assert.match(client, /from '@vercel\/analytics'/)
  assert.match(client, /catch/)
})
