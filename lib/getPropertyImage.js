import { urlForImage } from '@/lib/sanity'
import { isBrokenExternalImageUrl as isBrokenExternalImageUrlImported } from './brokenExternalImages'

// Tests load this file in a VM after stripping import lines, so the binding
// above may be missing. Never throw, and never fall back to a stock photo.
const isBrokenExternalImageUrl = typeof isBrokenExternalImageUrlImported === 'function'
  ? isBrokenExternalImageUrlImported
  : () => false

/**
 * Intentionally null. A previous Unsplash villa was used as a generic
 * fallback and showed up as a fake photo on listings whose real images
 * had 404'd at the source CDN. Cards and galleries now use a clean
 * empty tile instead; do not point this at a stock photo.
 */
export const PROPERTY_IMAGE_FALLBACK = null

/**
 * When true, public listing surfaces (homepage, /properties, regions,
 * article cards, public API) omit properties that have no usable photo
 * and no video. Detail pages and the sitemap stay available so existing
 * links keep working. Flip to false to show those listings with a clean
 * empty tile instead of hiding them. No new site copy is added.
 */
export const HIDE_PROPERTIES_WITHOUT_PHOTOS = true

/**
 * Resolve a single image entry (string URL, Sanity asset object, or relative
 * upload path) to a renderable URL string. Returns null if nothing usable can
 * be derived from the input.
 */
export function resolveImageUrl(entry) {
  if (!entry) return null

  if (typeof entry === 'string') {
    const trimmed = entry.trim()
    return trimmed || null
  }

  if (typeof entry !== 'object') return null

  if (typeof entry.url === 'string' && entry.url) return entry.url
  if (typeof entry.asset?.url === 'string' && entry.asset.url) return entry.asset.url
  if (typeof entry.src === 'string' && entry.src) return entry.src

  // Sanity image with an asset reference but no expanded url — try the builder.
  if (entry.asset?._ref || entry._type === 'image') {
    try {
      const built = urlForImage(entry)?.url?.()
      if (typeof built === 'string' && built) return built
    } catch {
      // Builder unavailable (no Sanity config); fall through.
    }
  }

  return null
}

function isUsableImageUrl(url) {
  return Boolean(url) && !isBrokenExternalImageUrl(url)
}

/**
 * Pick the cover image for a property, honouring `mainImage` when set, with
 * fallthrough to the next usable image. Returns null when none remain.
 */
export function getPropertyImage(property, { fallback = PROPERTY_IMAGE_FALLBACK } = {}) {
  const images = getPropertyImageList(property)
  return images[0] || fallback || null
}

/**
 * Resolve every image in a property to a URL string, dropping entries that
 * cannot be turned into a URL or are known to 404 at the source CDN. The
 * main image (honoured via `mainImage` index) is always considered first
 * so callers can treat index 0 as the hero when the list is not empty.
 */
export function getPropertyImageList(property) {
  const images = Array.isArray(property?.images) ? property.images : []
  if (images.length === 0) return []

  const rawIndex = Number.isInteger(property?.mainImage) ? property.mainImage : 0
  const mainIndex = rawIndex >= 0 && rawIndex < images.length ? rawIndex : 0

  const ordered = [images[mainIndex], ...images.filter((_, i) => i !== mainIndex)]
  return ordered.map(resolveImageUrl).filter(isUsableImageUrl)
}

export function hasPropertyVideo(property) {
  const videoUrl = property?.videoUrl || property?.video_url
  return typeof videoUrl === 'string' && Boolean(videoUrl.trim())
}

export function hasUsablePropertyPhotos(property) {
  return getPropertyImageList(property).length > 0
}

export function hasUsablePropertyMedia(property) {
  return hasUsablePropertyPhotos(property) || hasPropertyVideo(property)
}

/**
 * Filter a property list for public listing surfaces. Detail pages should
 * not use this — a direct URL must still open when photos are missing.
 */
export function filterListableProperties(properties = [], { hideWithoutPhotos = HIDE_PROPERTIES_WITHOUT_PHOTOS } = {}) {
  const list = Array.isArray(properties) ? properties : []
  if (!hideWithoutPhotos) return list
  return list.filter(hasUsablePropertyMedia)
}
