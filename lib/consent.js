// Shared marketing/analytics consent (Google Consent Mode v2 + Sklik SEM + Meta).
// Pure helpers, no imports (loaded by node:test through vm).

export const CONSENT_COOKIE = 'dvi_consent'
// The Meta-only prompt (never shown in production because the Pixel ID was
// never set) wrote this cookie. Honour it so nobody is asked twice.
export const LEGACY_META_CONSENT_COOKIE = 'domy_meta_consent'
export const CONSENT_MAX_AGE_SECONDS = 180 * 24 * 60 * 60 // re-ask after ~6 months

export function normalizeConsent(value) {
  return value === 'granted' || value === 'denied' ? value : null
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
  const normalized = normalizeConsent(value)
  if (!normalized) return null
  return `${CONSENT_COOKIE}=${normalized}; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secure ? '; Secure' : ''}`
}

// Google Consent Mode v2 state. Everything is denied until the visitor
// explicitly agrees; one choice covers analytics + ads (the prompt has one
// "allow" and one "decline" button).
export function consentModeState(value) {
  const state = normalizeConsent(value) === 'granted' ? 'granted' : 'denied'
  return {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: state
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
