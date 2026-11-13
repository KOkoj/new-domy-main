import brokenExternalImageList from '../data/broken-external-images.json'

const broken = new Set(Array.isArray(brokenExternalImageList) ? brokenExternalImageList : [])

/**
 * External listing photos that returned 404 from their CDN (immobiliare.it /
 * idealista.it) when last checked. Kept as a denylist so the original URLs
 * stay in the inventory and can be recovered if the source listing returns.
 *
 * Refresh with: node scripts/refresh-broken-external-images.cjs
 */
export function isBrokenExternalImageUrl(url) {
  return typeof url === 'string' && broken.has(url)
}

export function brokenExternalImageCount() {
  return broken.size
}
