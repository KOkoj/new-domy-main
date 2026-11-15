// Shared marketing/analytics consent (Google Consent Mode v2 + Sklik SEM + Meta).
// Pure helpers, no imports (loaded by node:test through vm).
// Cookie values stay backward compatible: granted = both on, denied = both off.
// Partial choices use "analytics" or "marketing".

export const CONSENT_COOKIE = 'dvi_consent'
// The Meta-only prompt (never shown in production because the Pixel ID was
// never set) wrote this cookie. Honour it so nobody is asked twice.
export const LEGACY_META_CONSENT_COOKIE = 'domy_meta_consent'
export const CONSENT_MAX_AGE_SECONDS = 180 * 24 * 60 * 60 // re-ask after ~6 months

export function parseConsentCategories(value) {
  if (value === 'granted') return { analytics: true, marketing: true }
  if (value === 'denied') return { analytics: false, marketing: false }
  if (value === 'analytics') return { analytics: true, marketing: false }
  if (value === 'marketing') return { analytics: false, marketing: true }
  return null
}

export function serializeConsentCategories(categories) {
  if (!categories || typeof categories !== 'object') return null
  const analytics = Boolean(categories.analytics)
  const marketing = Boolean(categories.marketing)
  if (analytics && marketing) return 'granted'
  if (analytics) return 'analytics'
  if (marketing) return 'marketing'
  return 'denied'
}

export function normalizeConsent(value) {
  return value === 'granted' || value === 'denied' || value === 'analytics' || value === 'marketing'
    ? value
    : null
}

export function hasAnalyticsConsent(value) {
  return parseConsentCategories(value)?.analytics === true
}

export function hasMarketingConsent(value) {
  return parseConsentCategories(value)?.marketing === true
}

export function readConsentFromCookieHeader(cookieHeader) {
  if (!cookieHeader) return null
  const jar = {}
  for (const part of String(cookieHeader).split(';')) {
    const index = part.indexOf('=')
    if (index === -1) continue
    jar[part.slice(0, index).trim()] = part.slice(index + 1).trim()
  }
  return normalizeConsent(jar[CONSENT_COOKIE]) || normalizeConsent(jar[LEGACY_META_CONSENT_COOKIE])
}

export function consentCookieString(value, { secure = false } = {}) {
  const normalized = typeof value === 'object' && value
    ? serializeConsentCategories(value)
    : normalizeConsent(value)
  if (!normalized) return null
  return `${CONSENT_COOKIE}=${normalized}; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secure ? '; Secure' : ''}`
}

// Google Consent Mode v2. Defaults are denied until the visitor opts in
// per category: analytics_storage follows Analytické, ad_* follow Marketingové.
export function consentModeState(value) {
  const cats = value && typeof value === 'object' && ('analytics' in value || 'marketing' in value)
    ? value
    : parseConsentCategories(value)
  const analytics = cats?.analytics ? 'granted' : 'denied'
  const marketing = cats?.marketing ? 'granted' : 'denied'
  return {
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing,
    analytics_storage: analytics
  }
}

export function semConsentState(value) {
  return {
    consent_mode: {
      ...consentModeState(value),
      functionality_storage: 'denied'
    }
  }
}
