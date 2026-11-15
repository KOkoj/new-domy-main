const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const root = path.join(__dirname, '..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const same = (actual, expected) => assert.equal(JSON.stringify(actual), JSON.stringify(expected))

function load(file, names) {
  const source = read(file).replace(/^export /gm, '')
  const sandbox = { URL, URLSearchParams, JSON, Date, Number, module: { exports: {} } }
  vm.runInNewContext(`${source}\nmodule.exports = { ${names.join(', ')} }`, sandbox)
  return sandbox.module.exports
}

const attr = load('lib/attribution.js', [
  'ATTRIBUTION_TTL_MS', 'touchFromUrl', 'mergeAttribution', 'readAttribution',
  'sanitizeAttribution', 'attributionColumns', 'ATTRIBUTION_COLUMN_NAMES'
])
const consent = load('lib/consent.js', [
  'readConsentFromCookieHeader', 'consentCookieString', 'consentModeState', 'semConsentState'
])

const NOW = 1_800_000_000_000

test('touchFromUrl captures UTM and click ids, ignores internal navigation', () => {
  const touch = attr.touchFromUrl(
    'https://www.domyvitalii.cz/properties?utm_source=google&utm_medium=cpc&utm_campaign=toskansko&gclid=abc123&x=1',
    'https://www.google.com/',
    NOW
  )
  same(touch, {
    utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'toskansko', gclid: 'abc123',
    referrer_host: 'google.com', landing_path: '/properties', ts: NOW
  })
  assert.equal(attr.touchFromUrl('https://www.domyvitalii.cz/contact', 'https://www.domyvitalii.cz/', NOW), null)
  assert.equal(attr.touchFromUrl('https://www.domyvitalii.cz/contact', '', NOW), null)
  same(attr.touchFromUrl('https://www.domyvitalii.cz/?sznclid=s1', '', NOW), { sznclid: 's1', landing_path: '/', ts: NOW })
})

test('first touch is kept, last touch follows the newest campaign visit', () => {
  const google = attr.touchFromUrl('https://www.domyvitalii.cz/?utm_source=google&gclid=g1', '', NOW)
  let state = attr.mergeAttribution(null, google, { now: NOW })
  same(state.first, google)
  same(state.last, google)

  // Internal page view: nothing changes.
  state = attr.mergeAttribution(JSON.stringify(state), null, { landingPath: '/contact', now: NOW + 1000 })
  same(state.first, google)
  same(state.last, google)

  const seznam = attr.touchFromUrl('https://www.domyvitalii.cz/regions?utm_source=seznam&utm_medium=cpc', '', NOW + 2000)
  state = attr.mergeAttribution(JSON.stringify(state), seznam, { now: NOW + 2000 })
  same(state.first, google)
  same(state.last, seznam)
})

test('a direct first visit records the landing page as first touch', () => {
  const state = attr.mergeAttribution(null, null, { landingPath: '/properties', now: NOW })
  same(state, { first: { landing_path: '/properties', ts: NOW }, last: null })
})

test('touches older than 90 days expire', () => {
  const old = { first: { utm_source: 'google', ts: NOW - attr.ATTRIBUTION_TTL_MS - 1 }, last: { utm_source: 'seznam', ts: NOW } }
  same(attr.readAttribution(JSON.stringify(old), NOW), { first: null, last: { utm_source: 'seznam', ts: NOW } })
  same(attr.readAttribution('not json', NOW), { first: null, last: null })
})

test('server sanitizes attribution and maps flat columns', () => {
  assert.equal(attr.sanitizeAttribution(null), null)
  assert.equal(attr.sanitizeAttribution({ first: { evil: 'x' } }), null)
  const cols = attr.attributionColumns({
    first: { utm_source: 'google', gclid: 'g1', evil: '<script>', ts: NOW },
    last: { utm_source: 'seznam', utm_medium: 'cpc', utm_campaign: 'x'.repeat(400), ts: NOW + 1 }
  })
  same(cols.attribution.first, { utm_source: 'google', gclid: 'g1', ts: NOW })
  assert.equal(cols.attribution.last.utm_campaign.length, 255)
  assert.equal(cols.gclid, 'g1')
  assert.equal(cols.utmSource, 'seznam')
  assert.equal(cols.utmMedium, 'cpc')
  same(attr.attributionColumns(undefined), {})
  same(Array.from(attr.ATTRIBUTION_COLUMN_NAMES), ['attribution', 'gclid', 'utmSource', 'utmMedium', 'utmCampaign'])
})

test('consent: shared cookie, legacy Meta cookie, Consent Mode v2 state', () => {
  assert.equal(consent.readConsentFromCookieHeader('a=1; dvi_consent=granted'), 'granted')
  assert.equal(consent.readConsentFromCookieHeader('domy_meta_consent=denied'), 'denied')
  assert.equal(consent.readConsentFromCookieHeader('dvi_consent=maybe'), null)
  assert.equal(consent.readConsentFromCookieHeader(''), null)
  assert.match(consent.consentCookieString('granted', { secure: true }), /^dvi_consent=granted; Path=\/; Max-Age=\d+; SameSite=Lax; Secure$/)
  assert.equal(consent.consentCookieString('yes'), null)
  same(consent.consentModeState(null), { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' })
  same(consent.consentModeState('granted'), { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' })
  assert.equal(consent.semConsentState('granted').consent_mode.functionality_storage, 'denied')
})

test('IDs only come from env vars and the prompt is behind a flag', () => {
  const config = read('lib/adsConfig.js')
  for (const name of ['NEXT_PUBLIC_GA4_ID', 'NEXT_PUBLIC_GADS_ID', 'NEXT_PUBLIC_GADS_LEAD_LABEL', 'NEXT_PUBLIC_SKLIK_ID', 'NEXT_PUBLIC_CONSENT_PROMPT']) {
    assert.match(config, new RegExp(`process\\.env\\.${name}\\b`))
  }
  assert.ok(!/G-[A-Z0-9]*[0-9][A-Z0-9]*|AW-\d{6,}/.test(config), 'no hard-coded IDs')
  const component = read('components/AdsTracking.jsx')
  assert.match(component, /if \(!enabled \|\| !ADS_CONFIG\.consentPromptEnabled/)
  const tracking = read('lib/adsTracking.js')
  // Scripts are injected only inside the consent === 'granted' branches.
  assert.match(tracking, /if \(consent !== 'granted'\) \{[\s\S]*?return\s*\}\s*ensureGtagStub\(\)/)
  assert.match(tracking, /wait_for_update: 500/)
  assert.match(tracking, /l\.seznam\.cz\/sul\.js/)
  assert.match(tracking, /googletagmanager\.com\/gtag\/js/)
})

test('every inquiry form sends attribution and fires the Lead conversion after success', () => {
  for (const file of [
    'app/contact/page.js',
    'app/book-call/page.js',
    'app/properties/[slug]/PropertyDetailClient.jsx',
    'app/dashboard/concierge/page.js'
  ]) {
    const source = read(file)
    assert.match(source, /attribution: readAttributionForSubmit\(\)/, file)
    assert.match(source, /trackLead\(\{ type: '[a-z_]+', email: /, file)
  }
  const api = read('app/api/inquiries/route.js')
  assert.match(api, /\.\.\.attributionColumns\(attribution\)/)
  assert.match(api, /add-inquiry-attribution-columns\.sql/)
  assert.ok(fs.existsSync(path.join(root, 'db/add-inquiry-attribution-columns.sql')))
})

test('Meta stays consent-gated and has the Lead event prepared', () => {
  assert.match(read('lib/metaConversions.js'), /'Lead'/)
  const meta = read('components/MetaTracking.jsx')
  assert.match(meta, /if \(!pixelId \|\| consent !== 'granted'\) return null/)
  assert.match(read('app/api/meta/events/route.js'), /readConsentFromCookieHeader/)
})
