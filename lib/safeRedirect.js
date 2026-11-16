// Only same-site absolute paths are allowed as post-auth redirects.
// Rejects protocol-relative ("//evil.com") and backslash tricks ("/\evil.com").
export function getSafeRedirectPath(value, fallback = '/dashboard') {
  if (typeof value !== 'string') return fallback
  const path = value.trim()
  if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) {
    return fallback
  }
  return path
}
