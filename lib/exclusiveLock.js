// Pure helpers for the soft lock on exclusive listings (feature flag
// NEXT_PUBLIC_EXCLUSIVE_GALLERY_LOCK, default OFF). The lock is marketing
// only: files stay public under /uploads, this is not an access control.

// Title photo + 2 more stay visible before the e-mail.
export const EXCLUSIVE_PUBLIC_PHOTO_COUNT = 3

export function isExclusiveListing(property) {
  if (!property) return false
  return Boolean(
    property.exclusive ||
    (Array.isArray(property.badges) && property.badges.includes('exclusive'))
  )
}

export function shouldLockExclusive({ enabled, property, user, unlocked }) {
  return Boolean(enabled && !user && !unlocked && isExclusiveListing(property))
}

export function getPublicGallery(images = [], videoUrl = '', locked = false) {
  const list = Array.isArray(images) ? images : []
  if (!locked) {
    return { images: list, videoUrl, hiddenPhotoCount: 0, hiddenVideo: false }
  }
  const hiddenVideo = typeof videoUrl === 'string' && Boolean(videoUrl.trim())
  return {
    images: list.slice(0, EXCLUSIVE_PUBLIC_PHOTO_COUNT),
    videoUrl: '',
    hiddenPhotoCount: Math.max(0, list.length - EXCLUSIVE_PUBLIC_PHOTO_COUNT),
    hiddenVideo
  }
}

// ~1 km precision: shows the area, not the house.
export function approximateLatLng(location) {
  if (!Array.isArray(location) || location.length < 2) return location
  const [lat, lng] = location.map(Number)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return location
  return [Math.round(lat * 100) / 100, Math.round(lng * 100) / 100]
}
