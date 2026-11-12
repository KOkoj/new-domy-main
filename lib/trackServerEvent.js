import { track } from '@vercel/analytics/server'
import {
  buildEventData,
  inferLocationFromReferer,
  readUtmSourceFromCookieHeader
} from '@/lib/conversionTracking'

function utmSourceFromRequest(request) {
  try {
    const cookie = request?.cookies?.get?.('dvi_utm')?.value
    if (cookie) return cookie
    return readUtmSourceFromCookieHeader(request?.headers?.get?.('cookie'))
  } catch {
    return ''
  }
}

export async function trackServerEvent(request, name, { location, type } = {}) {
  try {
    const data = buildEventData({
      type,
      location: location || inferLocationFromReferer(request?.headers?.get?.('referer')),
      utm_source: utmSourceFromRequest(request)
    })
    if (!request?.headers) {
      console.error(`[TRACK] ${name}: no request headers available, event may be dropped`)
    }
    // Pass the request explicitly: without it the SDK depends on a global
    // request context and silently drops the event when that is missing.
    await track(
      name,
      Object.keys(data).length ? data : undefined,
      request?.headers ? { request } : undefined
    )
  } catch (error) {
    // A tracking failure must never fail the API response, but it must be
    // visible in the function logs.
    console.error(`[TRACK] ${name} failed:`, error?.message || error)
  }
}
