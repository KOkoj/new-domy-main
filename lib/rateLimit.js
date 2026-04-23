const globalStore = globalThis.__domyRateLimitStore || new Map()
globalThis.__domyRateLimitStore = globalStore

function getClientIp(request) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  return request.headers.get('x-real-ip') || 'unknown'
}

export function checkRateLimit({
  request,
  bucket,
  limit,
  windowMs,
  identifier
}) {
  const key = `${bucket}:${identifier || getClientIp(request)}`
  const now = Date.now()
  const current = globalStore.get(key)

  if (!current || current.expiresAt <= now) {
    globalStore.set(key, {
      count: 1,
      expiresAt: now + windowMs
    })
    return { allowed: true, remaining: limit - 1 }
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((current.expiresAt - now) / 1000))
    }
  }

  current.count += 1
  globalStore.set(key, current)
  return { allowed: true, remaining: Math.max(0, limit - current.count) }
}
