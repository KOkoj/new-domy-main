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
    await track(name, Object.keys(data).length ? data : undefined)
  } catch {
    // Fire-and-forget: a tracking failure must never fail the API response.
  }
}
