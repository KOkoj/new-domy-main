// Only same-site absolute paths are allowed as post-auth redirects.
// The value is parsed as a URL against a fixed fake origin and accepted only
// when the parsed origin stays the same. Control characters (tab, CR, LF,
// which URL parsers silently drop), backslashes and their percent-encoded
// forms are rejected up front, so "/\t/evil.com" or "/%09/evil.com" can never
// turn into "//evil.com".
const BASE_ORIGIN = 'http://local.invalid'
// eslint-disable-next-line no-control-regex
const FORBIDDEN_CHARS = /[\u0000-\u001f\u007f\\]/

function decodeSafely(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return null
  }
}

export function getSafeRedirectPath(value, fallback = '/dashboard') {
  if (typeof value !== 'string' || value.length === 0 || value.length > 512) return fallback
  if (FORBIDDEN_CHARS.test(value)) return fallback
  if (!value.startsWith('/') || value.startsWith('//')) return fallback

  const decoded = decodeSafely(value)
  if (decoded === null || FORBIDDEN_CHARS.test(decoded) || decoded.startsWith('//')) {
    return fallback
  }

  try {
    const parsed = new URL(value, BASE_ORIGIN)
    if (parsed.origin !== BASE_ORIGIN) return fallback
    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return fallback
  }
}
