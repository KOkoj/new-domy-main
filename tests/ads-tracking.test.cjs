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
  'readConsentFromCookieHeader', 'consentCookieString', 'consentModeState', 'semConsentState',
  'parseConsentCategories', 'serializeConsentCategories', 'hasAnalyticsConsent', 'hasMarketingConsent'
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
  // gtag.js / sul.js are injected only after the matching category is granted.
  assert.match(tracking, /hasAnalyticsConsent/)
  assert.match(tracking, /hasMarketingConsent/)
  assert.match(tracking, /wait_for_update: 500/)
  assert.match(tracking, /l\.seznam\.cz\/sul\.js/)
  assert.match(tracking, /googletagmanager\.com\/gtag\/js/)
  assert.match(tracking, /if \(analytics && config\.ga4Id && !loaded\.ga4Configured\)/)
  assert.match(tracking, /if \(marketing && config\.gadsId && !loaded\.gadsConfigured\)/)
})

test('every inquiry form sends attribution and fires the Lead conversion after success', () => {
  for (const file of [
    'app/contact/page.js',
    'app/book-call/page.js',
    'app/properties/[slug]/PropertyDetailClient.jsx',
    'components/zone/ZoneSidebar.jsx'
  ]) {
    const source = read(file)
    assert.match(source, /attribution: readAttributionForSubmit\(\)/, file)
    assert.match(source, /trackLead\(\{ type: '[a-z_]+', email: /, file)
  }
  const api = read('app/api/inquiries/route.js')
  assert.match(api, /\.\.\.attributionColumns\(attribution\)/)
  assert.match(api, /insertInquiryWithFallback\(supabase, insertPayload\)/)
  assert.ok(fs.existsSync(path.join(root, 'db/add-inquiry-attribution-columns.sql')))
})

test('Meta stays consent-gated and has the Lead event prepared', () => {
  assert.match(read('lib/metaConversions.js'), /'Lead'/)
  const meta = read('components/MetaTracking.jsx')
  assert.match(meta, /if \(!pixelId \|\| !hasMarketingConsent\(consent\)\) return null/)
  assert.match(read('app/api/meta/events/route.js'), /readConsentFromCookieHeader/)
})


test('Czech consent prompt uses the approved sentence and cookies §4 names Google and Seznam', () => {
  const copy = load('lib/consentCopy.js', ['CONSENT_COPY', 'consentCopy'])
  assert.equal(copy.consentCopy('cs').text, 'Používáme cookies k měření návštěvnosti a reklam.')
  assert.equal(copy.consentCopy('cs').title, 'Cookies na tomto webu')
  assert.equal(copy.consentCopy('cs').accept, 'Přijmout vše')
  assert.equal(copy.consentCopy('cs').decline, 'Odmítnout vše')
  assert.equal(copy.consentCopy('cs').customize, 'Přizpůsobit')
  assert.equal(copy.consentCopy('cs').save, 'Uložit výběr')
  assert.equal(copy.consentCopy('cs').more, 'Více informací')
  assert.equal(copy.consentCopy('cs').necessary, 'Nezbytné')
  assert.equal(copy.consentCopy('cs').necessaryDesc, 'Potřebné pro fungování webu.')
  assert.equal(copy.consentCopy('cs').analytics, 'Analytické')
  assert.equal(copy.consentCopy('cs').analyticsDesc, 'Pomáhají nám pochopit, jak web používáte.')
  assert.equal(copy.consentCopy('cs').marketing, 'Marketingové')
  assert.equal(copy.consentCopy('cs').marketingDesc, 'Slouží k měření a zobrazování reklam.')
  assert.equal(copy.consentCopy('en').title, 'Cookies on this site')
  assert.equal(copy.consentCopy('it').title, 'Cookie su questo sito')
  const cookies = read('app/cookies/page.js')
  const csSection = cookies.slice(cookies.indexOf("cs: {"), cookies.indexOf('export default'))
  const analytics = csSection.slice(csSection.indexOf("4. Analytika a marketing"))
  assert.match(analytics, /Google/)
  assert.match(analytics, /Seznam/)
  assert.equal(copy.CONSENT_COPY.cs.text.includes('Google'), false)
  assert.equal(copy.CONSENT_COPY.cs.text.includes('Seznam'), false)
})

test('inquiry insert retries without attribution columns when they are missing', async () => {
  const { insertInquiryWithFallback } = await import('../lib/insertInquiry.js')
  const calls = []
  const supabase = {
    from(table) {
      assert.equal(table, 'inquiries')
      return {
        insert(rows) {
          calls.push({ ...rows[0] })
          return {
            select() {
              return {
                async single() {
                  if (calls.length === 1) {
                    return {
                      data: null,
                      error: {
                        code: 'PGRST204',
                        message: "Could not find the 'attribution' column of 'inquiries' in the schema cache"
                      }
                    }
                  }
                  return { data: { id: 'inq_1', name: rows[0].name }, error: null }
                }
              }
            }
          }
        }
      }
    }
  }
  const payload = {
    name: 'Test',
    email: 'test@example.com',
    message: 'Hello',
    attribution: { first: { utm_source: 'google' } },
    gclid: 'g1',
    utmSource: 'google',
    utmMedium: 'cpc',
    utmCampaign: 'toskansko'
  }
  const { data, error } = await insertInquiryWithFallback(supabase, payload)
  assert.equal(error, null)
  assert.equal(data.id, 'inq_1')
  assert.equal(calls.length, 2)
  assert.equal(calls[0].gclid, 'g1')
  assert.equal('attribution' in calls[1], false)
  assert.equal('gclid' in calls[1], false)
  assert.equal('utmSource' in calls[1], false)
  assert.equal(calls[1].name, 'Test')
  assert.equal(calls[1].email, 'test@example.com')
  // Original payload must not be mutated if the caller retries something else.
  assert.equal(payload.gclid, 'g1')
})

test('inquiry insert succeeds on the first try when attribution columns exist', async () => {
  const { insertInquiryWithFallback } = await import('../lib/insertInquiry.js')
  let inserts = 0
  const supabase = {
    from() {
      return {
        insert(rows) {
          inserts += 1
          return {
            select() {
              return {
                async single() {
                  return { data: { id: 'inq_2', gclid: rows[0].gclid }, error: null }
                }
              }
            }
          }
        }
      }
    }
  }
  const { data, error } = await insertInquiryWithFallback(supabase, { name: 'A', gclid: 'abc' })
  assert.equal(error, null)
  assert.equal(data.id, 'inq_2')
  assert.equal(inserts, 1)
})


test('consent categories stay backward compatible and drive Consent Mode v2', () => {
  same(consent.parseConsentCategories('granted'), { analytics: true, marketing: true })
  same(consent.parseConsentCategories('denied'), { analytics: false, marketing: false })
  same(consent.parseConsentCategories('analytics'), { analytics: true, marketing: false })
  same(consent.parseConsentCategories('marketing'), { analytics: false, marketing: true })
  assert.equal(consent.parseConsentCategories('maybe'), null)
  assert.equal(consent.serializeConsentCategories({ analytics: true, marketing: true }), 'granted')
  assert.equal(consent.serializeConsentCategories({ analytics: false, marketing: false }), 'denied')
  assert.equal(consent.serializeConsentCategories({ analytics: true, marketing: false }), 'analytics')
  assert.equal(consent.serializeConsentCategories({ analytics: false, marketing: true }), 'marketing')
  assert.equal(consent.readConsentFromCookieHeader('dvi_consent=analytics'), 'analytics')
  assert.equal(consent.readConsentFromCookieHeader('dvi_consent=marketing'), 'marketing')
  assert.match(consent.consentCookieString({ analytics: true, marketing: false }), /^dvi_consent=analytics;/)
  assert.equal(consent.hasAnalyticsConsent('analytics'), true)
  assert.equal(consent.hasMarketingConsent('analytics'), false)
  assert.equal(consent.hasAnalyticsConsent('marketing'), false)
  assert.equal(consent.hasMarketingConsent('marketing'), true)
  assert.equal(consent.hasMarketingConsent('granted'), true)
  assert.equal(consent.hasAnalyticsConsent('denied'), false)
  same(consent.consentModeState('analytics'), {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted'
  })
  same(consent.consentModeState('marketing'), {
    ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'denied'
  })
  same(consent.consentModeState({ analytics: true, marketing: false }), {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted'
  })
})

test('consent UI has customize/settings and the footer reopens them', () => {
  const component = read('components/AdsTracking.jsx')
  assert.match(component, /data-testid="consent-customize"/)
  assert.match(component, /data-testid="consent-settings"/)
  assert.match(component, /data-testid="consent-save"/)
  assert.match(component, /testId="consent-toggle-necessary"/)
  assert.match(component, /testId="consent-toggle-analytics"/)
  assert.match(component, /testId="consent-toggle-marketing"/)
  assert.match(component, /setSettingsOpen\(true\)/)
  const footer = read('components/Footer.jsx')
  assert.match(footer, /testId: 'footer-cookie-settings'/)
  assert.match(footer, /data-consent-open/)
  assert.match(footer, /consentCopy\(language\)\.footerSettings/)
})
