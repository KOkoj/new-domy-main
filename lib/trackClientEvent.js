'use client'

import { track } from '@vercel/analytics'
import {
  CAMPAIGN_STORAGE_KEY,
  buildEventData,
  campaignCookieOptions,
  captureFirstLanding,
  inferLocation,
  readStoredCampaign,
  readUtmSourceFromCookieHeader
} from '@/lib/conversionTracking'

function safeStorage() {
  try {
    return window.sessionStorage
  } catch {
    return {
      getItem() { return null },
      setItem() {}
    }
  }
}

function writeCampaignCookie(utmSource) {
  const parts = campaignCookieOptions(utmSource)
  if (!parts) return
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${parts}${secure}`
}

export function captureLandingCampaign() {
  try {
    return captureFirstLanding({
      url: window.location.href,
      storage: safeStorage(),
      setCookie: writeCampaignCookie
    })
  } catch {
    return readClientCampaign()
  }
}

export function readClientCampaign() {
  try {
    const stored = readStoredCampaign(safeStorage().getItem(CAMPAIGN_STORAGE_KEY))
    if (stored.utm_source) return stored
    const cookieSource = readUtmSourceFromCookieHeader(document.cookie)
    return { ...stored, utm_source: cookieSource }
  } catch {
    return { utm_source: '' }
  }
}

export function trackClientEvent(name, { location, type } = {}) {
  try {
    const campaign = readClientCampaign()
    const data = buildEventData({
      type,
      location: location || inferLocation(window.location.pathname),
      utm_source: campaign.utm_source
    })
    track(name, Object.keys(data).length ? data : undefined)
  } catch {
    // Tracking must never interrupt navigation or form submissions.
  }
}
