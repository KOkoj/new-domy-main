import crypto from 'node:crypto'

export const META_GRAPH_VERSION = 'v23.0'
export const META_ALLOWED_EVENTS = new Set([
  'PageView',
  'ViewContent',
  'Search',
  'Contact',
  'CompleteRegistration',
  'InitiateCheckout',
  'Purchase'
])

function firstForwardedIp(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || undefined
}

function cleanString(value, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : undefined
}

export function sha256(value) {
  const normalized = cleanString(value)?.toLowerCase()
  return normalized ? crypto.createHash('sha256').update(normalized).digest('hex') : undefined
}

export async function sendMetaEvent({ request, event }) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  const accessToken = process.env.META_CONVERSIONS_API_TOKEN

  if (!pixelId || !accessToken || !META_ALLOWED_EVENTS.has(event?.eventName)) {
    return { sent: false, reason: 'not_configured_or_invalid' }
  }

  const userData = {
    client_ip_address: firstForwardedIp(request),
    client_user_agent: cleanString(request.headers.get('user-agent')),
    fbp: cleanString(event.fbp, 255),
    fbc: cleanString(event.fbc, 255),
    em: event.email ? [sha256(event.email)] : undefined,
    external_id: event.externalId ? [sha256(event.externalId)] : undefined
  }

  Object.keys(userData).forEach((key) => userData[key] === undefined && delete userData[key])

  const payload = {
    data: [{
      event_name: event.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: cleanString(event.eventId, 100),
      event_source_url: cleanString(event.eventSourceUrl, 1000),
      action_source: 'website',
      user_data: userData,
      custom_data: event.customData && typeof event.customData === 'object'
        ? event.customData
        : undefined
    }]
  }

  if (process.env.META_TEST_EVENT_CODE) {
    payload.test_event_code = process.env.META_TEST_EVENT_CODE
  }

  const response = await fetch(
    `https://graph.facebook.com/${META_GRAPH_VERSION}/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store'
    }
  )

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Meta CAPI rejected event (${response.status}): ${detail.slice(0, 500)}`)
  }

  return { sent: true }
}
