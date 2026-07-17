import { getPropertyImageList } from './getPropertyImage'

/**
 * Merge a Sanity/CMS record with a bundled local record for the same slug.
 * Local git JSON wins for marketing fields (badges, video, copy) while CMS
 * metadata fills gaps when the bundled import is incomplete.
 */
export function mergePropertyRecords(sanityProperty, localProperty) {
  if (!sanityProperty) return localProperty || null
  if (!localProperty) return sanityProperty

  const localVideo = localProperty.videoUrl || localProperty.video_url || ''
  const sanityVideo = sanityProperty.videoUrl || sanityProperty.video_url || ''

  return {
    ...sanityProperty,
    ...localProperty,
    title: localProperty.title || sanityProperty.title,
    description: localProperty.description || sanityProperty.description,
    seoTitle: localProperty.seoTitle || sanityProperty.seoTitle,
    seoDescription: localProperty.seoDescription || sanityProperty.seoDescription,
    images: (Array.isArray(localProperty.images) && localProperty.images.length > 0)
      ? localProperty.images
      : sanityProperty.images,
    isNew: Boolean(
      localProperty.isNew ||
      localProperty.newListing ||
      sanityProperty.isNew ||
      sanityProperty.newListing
    ),
    noAgency: Boolean(
      localProperty.noAgency ||
      localProperty.no_agency ||
      localProperty.badges?.includes('no-agency') ||
      sanityProperty.noAgency ||
      sanityProperty.no_agency ||
      sanityProperty.badges?.includes('no-agency')
    ),
    badges: (Array.isArray(localProperty.badges) && localProperty.badges.length > 0)
      ? localProperty.badges
      : sanityProperty.badges,
    videoUrl: localVideo || sanityVideo,
  }
}

/**
 * Normalize API/storage property shape for detail pages and client UI.
 */
export function transformPropertyForClient(rawProperty) {
  if (!rawProperty) return null

  return {
    _id: rawProperty._id,
    title: rawProperty.title,
    slug: rawProperty.slug,
    propertyType: rawProperty.propertyType,
    price: rawProperty.price,
    description: rawProperty.description,
    seoTitle: rawProperty.seoTitle,
    seoDescription: rawProperty.seoDescription,
    specifications: rawProperty.specifications,
    location: rawProperty.location,
    images: getPropertyImageList(rawProperty),
    mainImage: 0,
    amenities: rawProperty.amenities || [],
    developer: rawProperty.developer,
    status: rawProperty.status || 'available',
    featured: rawProperty.featured || false,
    pinnedRank: Number(rawProperty.pinnedRank) || 0,
    isNew: Boolean(rawProperty.isNew || rawProperty.newListing),
    noAgency: Boolean(
      rawProperty.noAgency ||
      rawProperty.no_agency ||
      rawProperty.badges?.includes('no-agency')
    ),
    videoUrl: rawProperty.videoUrl || rawProperty.video_url || '',
  }
}

/**
 * Build gallery media items: images first, optional video tour last.
 */
export function buildGalleryMedia(images = [], videoUrl = '') {
  const media = (Array.isArray(images) ? images : [])
    .filter(Boolean)
    .map((src) => ({ type: 'image', src }))

  const normalizedVideo = typeof videoUrl === 'string' ? videoUrl.trim() : ''
  if (normalizedVideo) {
    media.push({ type: 'video', src: normalizedVideo })
  }

  return media
}

/**
 * A property is listable when it has images, a video tour, or can fall back to
 * the shared placeholder image used by listing cards.
 */
export function isDisplayableProperty(property) {
  if (!property) return false

  const images = Array.isArray(property.images) ? property.images : []
  if (images.length > 0) return true

  const videoUrl = property.videoUrl || property.video_url
  if (typeof videoUrl === 'string' && videoUrl.trim()) return true

  // Empty images still render via getPropertyImage() fallback on cards/detail.
  return Boolean(property._id || property.slug?.current || property.slug)
}
