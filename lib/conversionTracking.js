export const CAMPAIGN_STORAGE_KEY = 'dvi_campaign'
export const CAMPAIGN_COOKIE = 'dvi_utm'
export const MAX_CUSTOM_EVENT_PROPS = 2
const MAX_VALUE_LENGTH = 255

export function clipEventValue(value) {
  if (value == null) return ''
  return String(value).trim().slice(0, MAX_VALUE_LENGTH)
}

export function parseCampaignParams(search) {
  const query = String(search || '').startsWith('?') ? String(search).slice(1) : String(search || '')
  const params = new URLSearchParams(query)
  return {
    utm_source: clipEventValue(params.get('utm_source')),
    utm_medium: clipEventValue(params.get('utm_medium')),
    utm_campaign: clipEventValue(params.get('utm_campaign')),
    utm_content: clipEventValue(params.get('utm_content')),
    utm_term: clipEventValue(params.get('utm_term'))
  }
}

export function emptyCampaign() {
  return {
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_content: '',
    utm_term: '',
    path: ''
  }
}

export function readStoredCampaign(raw) {
  if (!raw) return emptyCampaign()
  try {
    const parsed = JSON.parse(raw)
    return {
      ...emptyCampaign(),
      utm_source: clipEventValue(parsed.utm_source),
      utm_medium: clipEventValue(parsed.utm_medium),
      utm_campaign: clipEventValue(parsed.utm_campaign),
      utm_content: clipEventValue(parsed.utm_content),
      utm_term: clipEventValue(parsed.utm_term),
      path: clipEventValue(parsed.path)
    }
  } catch {
    return emptyCampaign()
  }
}

export function captureFirstLanding({ url, storage, setCookie } = {}) {
  try {
    const existing = storage?.getItem?.(CAMPAIGN_STORAGE_KEY)
    if (existing) return readStoredCampaign(existing)

    const parsedUrl = new URL(url, 'https://www.domyvitalii.cz')
    const campaign = {
      ...parseCampaignParams(parsedUrl.search),
      path: clipEventValue(parsedUrl.pathname)
    }
    storage?.setItem?.(CAMPAIGN_STORAGE_KEY, JSON.stringify(campaign))
    if (campaign.utm_source && typeof setCookie === 'function') {
      setCookie(campaign.utm_source)
    }
    return campaign
  } catch {
    return emptyCampaign()
  }
}

export function campaignCookieOptions(utmSource) {
  const value = clipEventValue(utmSource)
  if (!value) return null
  return `${CAMPAIGN_COOKIE}=${encodeURIComponent(value)}; Path=/; SameSite=Lax`
}

export function readUtmSourceFromCookieHeader(cookieHeader) {
  if (!cookieHeader) return ''
  const parts = String(cookieHeader).split(';')
  for (const part of parts) {
    const separator = part.indexOf('=')
    if (separator === -1) continue
    const name = part.slice(0, separator).trim()
    if (name !== CAMPAIGN_COOKIE) continue
    try {
      return clipEventValue(decodeURIComponent(part.slice(separator + 1).trim()))
    } catch {
      return clipEventValue(part.slice(separator + 1).trim())
    }
  }
  return ''
}

export function shouldIgnoreTrackingPath(pathname) {
  const path = String(pathname || '')
  return path.startsWith('/dashboard') || path.startsWith('/admin') || path.startsWith('/api/')
}

export function inferLocation(pathname) {
  const path = String(pathname || '')
  if (!path || path === '/') return 'home'
  if (path.startsWith('/blog') || path.startsWith('/clanky')) return 'article'
  if (
    path === '/properties' ||
    path === '/nemovitosti' ||
    path.startsWith('/properties/') ||
    path.startsWith('/nemovitosti/')
  ) {
    return 'listing'
  }
  if (path.startsWith('/regions')) return 'region'
  if (path === '/contact') return 'contact'
  if (path === '/process') return 'process'
  if (path === '/book-call') return 'book-call'
  if (path.startsWith('/guides')) return 'guide'
  if (path === '/faq') return 'faq'
  if (path === '/about') return 'about'
  if (path === '/reference') return 'reference'
  if (path === '/premium') return 'premium'
  if (path === '/login') return 'login'
  return 'other'
}

export function inferLocationFromReferer(referer, fallback = 'other') {
  try {
    if (!referer) return fallback
    return inferLocation(new URL(referer).pathname) || fallback
  } catch {
    return fallback
  }
}

function resolveHref(href, currentPathname = '/') {
  if (!href) return null
  const value = String(href).trim()
  if (!value || value.startsWith('javascript:') || value.startsWith('mailto:')) return null
  try {
    return new URL(value, `https://www.domyvitalii.cz${currentPathname || '/'}`)
  } catch {
    return null
  }
}

export function isWhatsappUrl(url) {
  const hostname = String(url?.hostname || '').replace(/^www\./, '').toLowerCase()
  return hostname === 'wa.me' || hostname === 'whatsapp.com' || hostname === 'api.whatsapp.com'
}

export function isBookCallPath(pathname) {
  return String(pathname || '').replace(/\/+$/, '') === '/book-call'
}

export function isPropertyDetailPath(pathname) {
  const match = String(pathname || '').match(/^\/(?:properties|nemovitosti)\/([^/]+)\/?$/)
  return Boolean(match?.[1])
}

export function buildEventData({ location, type, utm_source } = {}) {
  const data = {}
  const primaryKey = clipEventValue(type) ? 'type' : 'location'
  const primaryValue = clipEventValue(type || location)
  if (primaryValue) data[primaryKey] = primaryValue
  const source = clipEventValue(utm_source)
  if (source) data.utm_source = source
  const keys = Object.keys(data)
  if (keys.length > MAX_CUSTOM_EVENT_PROPS) {
    return Object.fromEntries(keys.slice(0, MAX_CUSTOM_EVENT_PROPS).map((key) => [key, data[key]]))
  }
  return data
}

export function resolveClickEvent({ href, pathname, inConcierge = false, inFooter = false, dataLocation } = {}) {
  if (shouldIgnoreTrackingPath(pathname)) return null

  const url = resolveHref(href, pathname)
  if (!url) return null

  const location = clipEventValue(
    dataLocation || (inConcierge ? 'concierge' : inFooter ? 'footer' : inferLocation(pathname))
  ) || 'other'

  if (url.protocol === 'tel:') {
    return {
      name: inConcierge ? 'concierge_phone_click' : 'phone_click',
      location
    }
  }

  if (isWhatsappUrl(url)) {
    return { name: 'whatsapp_click', location }
  }

  if (isBookCallPath(url.pathname) && !isBookCallPath(pathname)) {
    return { name: 'consult_cta_click', location }
  }

  if (isPropertyDetailPath(url.pathname)) {
    return { name: 'property_card_click', location }
  }

  return null
}
