// First-touch / last-touch attribution for inquiries (UTM + ad click ids).
// Pure helpers without imports so they run in the browser, in API routes and
// in node:test (tests load this file through vm with `export` stripped).

export const ATTRIBUTION_STORAGE_KEY = 'dvi_attr'
export const ATTRIBUTION_TTL_MS = 90 * 24 * 60 * 60 * 1000 // gclid is valid 90 days
export const ATTRIBUTION_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'utm_id',
  'gclid',
  'gbraid',
  'wbraid',
  'sznclid',
  'fbclid'
]
const MAX_LEN = 255

function clip(value, max = MAX_LEN) {
  if (value == null) return ''
  return String(value).trim().slice(0, max)
}

function cleanTouch(raw) {
  if (!raw || typeof raw !== 'object') return null
  const touch = {}
  for (const key of ATTRIBUTION_PARAMS) {
    const value = clip(raw[key])
    if (value) touch[key] = value
  }
  const landing = clip(raw.landing_path, 500)
  if (landing) touch.landing_path = landing
  const referrer = clip(raw.referrer_host, 255)
  if (referrer) touch.referrer_host = referrer
  const ts = Number(raw.ts)
  if (Number.isFinite(ts) && ts > 0) touch.ts = Math.floor(ts)
  return Object.keys(touch).length ? touch : null
}

export function hasCampaignParams(touch) {
  return Boolean(touch && ATTRIBUTION_PARAMS.some((key) => touch[key]))
}

function hostOf(value) {
  try {
    return value ? new URL(value).hostname.replace(/^www\./, '').toLowerCase() : ''
  } catch {
    return ''
  }
}

// Builds the touch for the current page load. Internal navigations (same host
// referrer, no params) return null so they never overwrite the last touch.
export function touchFromUrl(url, referrer, now = Date.now()) {
  let parsed
  try {
    parsed = new URL(url, 'https://www.domyvitalii.cz')
  } catch {
    return null
  }
  const touch = {}
  for (const key of ATTRIBUTION_PARAMS) {
    const value = clip(parsed.searchParams.get(key))
    if (value) touch[key] = value
  }
  const ownHost = parsed.hostname.replace(/^www\./, '').toLowerCase()
  const refHost = hostOf(referrer)
  const external = refHost && refHost !== ownHost
  if (!hasCampaignParams(touch) && !external) return null
  if (external) touch.referrer_host = refHost
  touch.landing_path = clip(parsed.pathname, 500)
  touch.ts = Math.floor(now)
  return touch
}

export function readAttribution(raw, now = Date.now()) {
  if (!raw) return { first: null, last: null }
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    const first = cleanTouch(parsed?.first)
    const last = cleanTouch(parsed?.last)
    const fresh = (touch) => (touch && (!touch.ts || now - touch.ts <= ATTRIBUTION_TTL_MS) ? touch : null)
    return { first: fresh(first), last: fresh(last) }
  } catch {
    return { first: null, last: null }
  }
}

// First touch is kept until it expires; last touch follows the newest
// campaign or external-referrer visit. A direct first visit is still recorded
// as first touch (landing page only) so we know the entry page.
export function mergeAttribution(existing, touch, { landingPath = '', now = Date.now() } = {}) {
  const current = readAttribution(existing, now)
  const first = current.first || touch || (landingPath ? { landing_path: clip(landingPath, 500), ts: Math.floor(now) } : null)
  const last = touch || current.last
  return { first, last }
}

// Server side: whitelist + clip whatever the browser sent.
export function sanitizeAttribution(input) {
  if (!input || typeof input !== 'object') return null
  const first = cleanTouch(input.first)
  const last = cleanTouch(input.last)
  if (!first && !last) return null
  return { first, last }
}

// Flat columns for easy filtering in the admin / Supabase. Last touch wins,
// falls back to first touch. gclid also falls back to first touch because
// Google Ads offline import accepts any click within 90 days.
export function attributionColumns(attribution) {
  const clean = sanitizeAttribution(attribution)
  if (!clean) return {}
  const pick = (key) => clean.last?.[key] || clean.first?.[key] || null
  return {
    attribution: clean,
    gclid: pick('gclid') || pick('gbraid') || pick('wbraid'),
    utmSource: pick('utm_source'),
    utmMedium: pick('utm_medium'),
    utmCampaign: pick('utm_campaign')
  }
}

export const ATTRIBUTION_COLUMN_NAMES = ['attribution', 'gclid', 'utmSource', 'utmMedium', 'utmCampaign']
