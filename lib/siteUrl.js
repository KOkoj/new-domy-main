import { SITE_URL } from '@/lib/siteConfig'

function stripTrailingSlash(value) {
  return String(value || '').trim().replace(/\/$/, '')
}

function parseUrl(value) {
  try {
    return value ? new URL(value) : null
  } catch {
    return null
  }
}

function isLocalHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

function isCanonicalHost(hostname) {
  return hostname === 'www.domyvitalii.cz' || hostname === 'domyvitalii.cz'
}

function isPreviewHost(hostname) {
  return /\.vercel\.app$/i.test(hostname || '') || /new-domy-main/i.test(hostname || '')
}

function canonicalFrom(url) {
  if (!url) return SITE_URL
  if (url.hostname === 'domyvitalii.cz') return SITE_URL
  return `${url.protocol}//${url.host}`
}

function pickPublicUrl(candidate) {
  const parsed = parseUrl(candidate)
  if (!parsed) return null
  if (isLocalHost(parsed.hostname)) return stripTrailingSlash(parsed.origin)
  if (isPreviewHost(parsed.hostname)) return null
  if (isCanonicalHost(parsed.hostname)) return canonicalFrom(parsed)
  return null
}

export function getPublicSiteUrl(request) {
  const fromEnv = pickPublicUrl(process.env.NEXT_PUBLIC_BASE_URL)
  if (fromEnv) return fromEnv

  if (request) {
    try {
      const origin = request.headers?.get?.('origin') || new URL(request.url).origin
      const fromRequest = pickPublicUrl(origin)
      if (fromRequest) return fromRequest
    } catch {
      // Ignore malformed request URLs and fall back to the canonical domain.
    }
  }

  return SITE_URL
}

export function getPublicAbsoluteUrl(path = '/', request) {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${getPublicSiteUrl(request)}${normalized}`
}
