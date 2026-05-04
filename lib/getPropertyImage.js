import { urlForImage } from '@/lib/sanity'

// Generic fallback used when a property has no usable image at all.
export const PROPERTY_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop'

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

/**
 * Pick the cover image for a property, honouring `mainImage` when set, with
 * graceful fallthrough to the first usable image and finally the placeholder.
 */
export function getPropertyImage(property, { fallback = PROPERTY_IMAGE_FALLBACK } = {}) {
  const images = Array.isArray(property?.images) ? property.images : []

  if (images.length === 0) return fallback

  const rawIndex = Number.isInteger(property?.mainImage) ? property.mainImage : 0
  const mainIndex = rawIndex >= 0 && rawIndex < images.length ? rawIndex : 0

  const ordered = [images[mainIndex], ...images.filter((_, i) => i !== mainIndex)]

  for (const entry of ordered) {
    const url = resolveImageUrl(entry)
    if (url) return url
  }

  return fallback
}

/**
 * Resolve every image in a property to a URL string, dropping any entry that
 * cannot be turned into a URL. The main image (honoured via `mainImage` index)
 * is always placed first so callers can treat index 0 as the hero.
 */
export function getPropertyImageList(property) {
  const images = Array.isArray(property?.images) ? property.images : []
  if (images.length === 0) return []

  const rawIndex = Number.isInteger(property?.mainImage) ? property.mainImage : 0
  const mainIndex = rawIndex >= 0 && rawIndex < images.length ? rawIndex : 0

  const ordered = [images[mainIndex], ...images.filter((_, i) => i !== mainIndex)]
  return ordered.map(resolveImageUrl).filter(Boolean)
}
