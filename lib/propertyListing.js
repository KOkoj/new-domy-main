import { getPropertyImage } from '@/lib/getPropertyImage'
import { resolvePropertyType } from '@/lib/propertyDisplay'
import { toRegionSlug } from '@/app/properties/filterConfig'

export function getListingRegionName(property) {
  return (
    property?.location?.city?.region?.name?.cs ||
    property?.location?.city?.region?.name?.en ||
    property?.location?.city?.region?.name?.it ||
    property?.location?.city?.name?.cs ||
    property?.location?.city?.name?.en ||
    property?.location?.city?.name?.it ||
    property?.location?.city?.name ||
    'Itálie'
  )
}

export function getListingRegionSlug(property) {
  return (
    property?.location?.city?.region?.slug?.current ||
    toRegionSlug(getListingRegionName(property))
  )
}

export function transformPropertyListing(property, index = 0) {
  const titleI18n = {
    cs: property?.title?.cs || property?.title?.en || property?.title?.it || (typeof property?.title === 'string' ? property.title : ''),
    en: property?.title?.en || property?.title?.it || property?.title?.cs || (typeof property?.title === 'string' ? property.title : ''),
    it: property?.title?.it || property?.title?.en || property?.title?.cs || (typeof property?.title === 'string' ? property.title : ''),
  }
  const slug = property?.slug?.current || property?.slug || ''
  const typeContext = [property?.propertyType, slug, ...Object.values(titleI18n)].filter(Boolean).join(' ')

  return {
    id: property?._id || `property-${index}`,
    title: titleI18n.cs || titleI18n.en || 'Nemovitost v Itálii',
    titleI18n,
    type: resolvePropertyType(property?.propertyType, typeContext),
    region: getListingRegionName(property),
    regionSlug: getListingRegionSlug(property),
    price: property?.price?.amount || 0,
    currency: property?.price?.currency || 'EUR',
    rooms: property?.specifications?.rooms || property?.specifications?.bedrooms || 0,
    bedrooms: property?.specifications?.bedrooms || 0,
    bathrooms: property?.specifications?.bathrooms || 0,
    area: property?.specifications?.squareFootage || 0,
    image: getPropertyImage(property),
    location: property?.location?.coordinates
      ? [
          property.location.coordinates.lat || property.location.coordinates[1],
          property.location.coordinates.lng || property.location.coordinates[0],
        ]
      : [42.8333, 12.8333],
    views: 0,
    terrain: 'mountains',
    amenities: property?.amenities?.map((amenity) =>
      (amenity?.name?.en || amenity?.name?.it || amenity?.name?.cs || amenity || '')
        .toLowerCase()
        .replace(/\s+/g, '_')
    ) || [],
    description: property?.description?.cs || property?.description?.en || property?.description?.it || property?.description || '',
    slug,
    sanityId: property?._id,
    status: property?.status || 'available',
    sourceUrl: property?.sourceUrl || '',
    createdAt: property?._createdAt || property?.createdAt || '',
    updatedAt: property?._updatedAt || property?.updatedAt || '',
    isNew: Boolean(property?.isNew || property?.newListing),
    noAgency: Boolean(
      property?.noAgency ||
      property?.no_agency ||
      property?.badges?.includes('no-agency')
    ),
    featured: Boolean(property?.featured),
  }
}

export function transformPropertyListings(properties = []) {
  return (Array.isArray(properties) ? properties : []).map(transformPropertyListing)
}
