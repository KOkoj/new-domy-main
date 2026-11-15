'use client'

// Consent-aware ad / analytics tags (GA4, Google Ads, Sklik SEM, Meta Lead).
// Nothing is downloaded until the visitor grants the matching category AND
// the matching ID env var is set. Every function is a silent no-op otherwise
// and never throws: tracking must not break a form submit or a click.

import { ADS_CONFIG, hasGoogleTags } from '@/lib/adsConfig'
import {
  CONSENT_COOKIE,
  consentCookieString,
  consentModeState,
  hasAnalyticsConsent,
  hasMarketingConsent,
  parseConsentCategories,
  readConsentFromCookieHeader,
  semConsentState,
  serializeConsentCategories
} from '@/lib/consent'
import {
  ATTRIBUTION_STORAGE_KEY,
  mergeAttribution,
  readAttribution,
  sanitizeAttribution,
  touchFromUrl
} from '@/lib/attribution'

export const CONSENT_EVENT = 'dvi-consent-change'
const loaded = { gtagScript: false, ga4Configured: false, gadsConfigured: false, sklikScript: false, sklikReady: false }

function storage(kind) {
  try {
    return window[kind]
  } catch {
    return null
  }
}

// ---------- consent ----------

export function getConsent() {
  try {
    return readConsentFromCookieHeader(document.cookie)
  } catch {
    return null
  }
}

export function getConsentCategories() {
  return parseConsentCategories(getConsent())
}

export function setConsent(value) {
  try {
    const serialized = typeof value === 'object' && value ? serializeConsentCategories(value) : value
    const cookie = consentCookieString(serialized, { secure: window.location.protocol === 'https:' })
    if (!cookie) return
    document.cookie = cookie
    // Keep the Meta Conversions API route (reads the legacy cookie) in sync.
    // Marketing consent maps to the old "granted" Meta cookie; anything else is denied.
    const metaValue = hasMarketingConsent(serialized) ? 'granted' : 'denied'
    document.cookie = cookie.replace(`${CONSENT_COOKIE}=${serialized}`, `domy_meta_consent=${metaValue}`)
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: serialized }))
  } catch {
    // ignore
  }
}

// ---------- Google (gtag.js, Consent Mode v2) ----------

function gtag() {
  window.dataLayer = window.dataLayer || []
  // gtag.js expects the Arguments object, not an array.
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments)
}

function ensureGtagStub() {
  if (typeof window.gtag === 'function') return
  window.dataLayer = window.dataLayer || []
  window.gtag = gtag
  window.gtag('consent', 'default', { ...consentModeState('denied'), wait_for_update: 500 })
  window.gtag('set', 'ads_data_redaction', true)
}

function loadScript(src, id) {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) return resolve()
    const script = document.createElement('script')
    script.id = id
    script.async = true
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(script)
  })
}

export function applyGoogleConsent(consent, config = ADS_CONFIG) {
  try {
    if (!hasGoogleTags(config)) return
    const cats = typeof consent === 'object' && consent && ('analytics' in consent || 'marketing' in consent)
      ? consent
      : parseConsentCategories(consent)
    const analytics = Boolean(cats?.analytics)
    const marketing = Boolean(cats?.marketing)

    if (!analytics && !marketing) {
      // Only tell an already loaded tag that consent was withdrawn.
      if (typeof window.gtag === 'function') window.gtag('consent', 'update', consentModeState('denied'))
      return
    }

    ensureGtagStub()
    window.gtag('consent', 'update', consentModeState(cats))

    if (analytics && config.ga4Id && !loaded.ga4Configured) {
      if (!loaded.ga4Configured && !loaded.gadsConfigured) window.gtag('js', new Date())
      loaded.ga4Configured = true
      window.gtag('config', config.ga4Id)
    }
    if (marketing && config.gadsId && !loaded.gadsConfigured) {
      if (!loaded.ga4Configured && !loaded.gadsConfigured) window.gtag('js', new Date())
      // ga4 may have just been marked configured above; still fire js once.
      loaded.gadsConfigured = true
      window.gtag('config', config.gadsId, { allow_enhanced_conversions: true })
    }

    if (!loaded.gtagScript) {
      const primary = (analytics && config.ga4Id) || (marketing && config.gadsId)
      if (!primary) return
      loaded.gtagScript = true
      loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(primary)}`, 'dvi-gtag').catch(() => {
        loaded.gtagScript = false
      })
    }
  } catch {
    // ignore
  }
}

function analyticsReady() {
  return loaded.ga4Configured && typeof window.gtag === 'function' && hasAnalyticsConsent(getConsent())
}

function adsReady() {
  return loaded.gadsConfigured && typeof window.gtag === 'function' && hasMarketingConsent(getConsent())
}

function googleTagReady() {
  return (loaded.ga4Configured || loaded.gadsConfigured) && typeof window.gtag === 'function'
}

// ---------- Sklik (Seznam Event Measurement, sul.js) ----------

export function applySklikConsent(consent, config = ADS_CONFIG) {
  try {
    if (!config.sklikId) return
    const allowed = typeof consent === 'object' && consent
      ? Boolean(consent.marketing)
      : hasMarketingConsent(consent)
    if (!allowed) {
      if (typeof window.SEM === 'function') window.SEM('updateConsent', semConsentState('denied'))
      return
    }
    if (loaded.sklikReady && typeof window.SEM === 'function') {
      window.SEM('updateConsent', semConsentState(consent))
      return
    }
    if (loaded.sklikScript) return
    loaded.sklikScript = true
    loadScript(`https://l.seznam.cz/sul.js?id=${encodeURIComponent(config.sklikId)}`, 'dvi-sklik-sem')
      .then(() => {
        if (typeof window.SEM !== 'function') return
        loaded.sklikReady = true
        // Consent must precede PageView (Sklik docs), otherwise no `sid` cookie.
        window.SEM('updateConsent', semConsentState(consent))
        window.SEM('track', 'PageView')
      })
      .catch(() => {
        loaded.sklikScript = false
      })
  } catch {
    // ignore
  }
}

function sklikReady() {
  return loaded.sklikReady && typeof window.SEM === 'function' && hasMarketingConsent(getConsent())
}

// SPA route change. The first PageView is sent right after sul.js loads.
export function trackSklikPageView() {
  try {
    if (sklikReady()) window.SEM('track', 'PageView')
  } catch {
    // ignore
  }
}

// ---------- attribution (UTM + click ids, first + last touch) ----------

function readStored() {
  const local = readAttribution(storage('localStorage')?.getItem(ATTRIBUTION_STORAGE_KEY))
  const session = readAttribution(storage('sessionStorage')?.getItem(ATTRIBUTION_STORAGE_KEY))
  const newest = (a, b) => (!a ? b : !b ? a : (b.ts || 0) > (a.ts || 0) ? b : a)
  const oldest = (a, b) => (!a ? b : !b ? a : (b.ts || 0) < (a.ts || 0) ? b : a)
  return { first: oldest(local.first, session.first), last: newest(local.last, session.last) }
}

function writeStored(value) {
  const raw = JSON.stringify(value)
  // Session storage is first-party, ends with the tab and is only ever sent to
  // our own inquiry API. The 90-day copy needs at least one optional category.
  storage('sessionStorage')?.setItem(ATTRIBUTION_STORAGE_KEY, raw)
  const cats = getConsentCategories()
  if (cats?.analytics || cats?.marketing) storage('localStorage')?.setItem(ATTRIBUTION_STORAGE_KEY, raw)
  else storage('localStorage')?.removeItem(ATTRIBUTION_STORAGE_KEY)
}

export function captureAttribution() {
  try {
    const touch = touchFromUrl(window.location.href, document.referrer)
    const merged = mergeAttribution(readStored(), touch, { landingPath: window.location.pathname })
    writeStored(merged)
    return merged
  } catch {
    return { first: null, last: null }
  }
}

export function syncAttributionStorage() {
  try {
    writeStored(readStored())
  } catch {
    // ignore
  }
}

// Payload for POST /api/inquiries (server whitelists it again).
export function readAttributionForSubmit() {
  try {
    return sanitizeAttribution(readStored())
  } catch {
    return null
  }
}

// ---------- conversions ----------

async function sha256Hex(value) {
  const normalized = String(value || '').trim().toLowerCase()
  if (!normalized || !window.crypto?.subtle) return ''
  const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalized))
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function eventId() {
  return window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// Successful inquiry (property detail / "Mám zájem", contact, book-call,
// concierge). Fires GA4 generate_lead when Analytické is on, Google Ads Lead
// and Sklik Lead when Marketingové is on, and – once the Pixel is ever
// switched on – Meta Lead (browser + Conversions API, same event id).
export async function trackLead({ type = 'property', email = '', inquiryId = '' } = {}, config = ADS_CONFIG) {
  try {
    const cats = getConsentCategories()
    if (!cats?.analytics && !cats?.marketing) return
    const leadType = String(type || 'property').slice(0, 100)

    if (googleTagReady() && (analyticsReady() || adsReady())) {
      if (adsReady()) {
        const hashedEmail = await sha256Hex(email).catch(() => '')
        if (hashedEmail) window.gtag('set', 'user_data', { sha256_email_address: hashedEmail })
      }
      if (analyticsReady() && config.ga4Id) {
        window.gtag('event', 'generate_lead', { lead_type: leadType, send_to: config.ga4Id })
      }
      if (adsReady() && config.gadsId && config.gadsLeadLabel) {
        window.gtag('event', 'conversion', {
          send_to: `${config.gadsId}/${config.gadsLeadLabel}`,
          transaction_id: inquiryId ? String(inquiryId) : undefined
        })
      }
    }

    if (sklikReady()) {
      if (email) window.SEM('updateUserData', { em: String(email).trim() })
      window.SEM('track', 'Lead')
    }

    if (cats.marketing && config.metaPixelId && typeof window.fbq === 'function') {
      const id = eventId()
      window.fbq('track', 'Lead', { lead_type: leadType }, { eventID: id })
      fetch('/api/meta/events', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          eventName: 'Lead',
          eventId: id,
          eventSourceUrl: window.location.href,
          email: email || undefined,
          customData: { lead_type: leadType }
        }),
        keepalive: true
      }).catch(() => {})
    }
  } catch {
    // ignore
  }
}

const CONTACT_EVENTS = new Set(['phone_click', 'email_click', 'whatsapp_click'])

// Phone / e-mail / WhatsApp clicks: GA4 event when Analytické is on, Google
// Ads only if a separate "Contact" conversion label is configured and
// Marketingové is on, Sklik Contact event when Marketingové is on.
export function trackContactClick(name, { location = '' } = {}, config = ADS_CONFIG) {
  try {
    if (!CONTACT_EVENTS.has(name)) return
    const cats = getConsentCategories()
    if (!cats?.analytics && !cats?.marketing) return
    if (analyticsReady() && config.ga4Id) {
      window.gtag('event', name, { location, send_to: config.ga4Id })
    }
    if (adsReady() && config.gadsId && config.gadsContactLabel) {
      window.gtag('event', 'conversion', { send_to: `${config.gadsId}/${config.gadsContactLabel}` })
    }
    if (sklikReady()) window.SEM('track', 'Contact')
  } catch {
    // ignore
  }
}
