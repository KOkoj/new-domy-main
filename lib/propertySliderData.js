import { getPropertyImage } from '@/lib/getPropertyImage'
import { getPropertyRegionTranslations } from '@/lib/propertyDisplay'

function transformProperty(prop, index) {
  const titleI18n = {
    en: prop.title?.en || prop.title?.it || prop.title?.cs || (typeof prop.title === 'string' ? prop.title : 'Property'),
    it: prop.title?.it || prop.title?.en || prop.title?.cs || (typeof prop.title === 'string' ? prop.title : 'Property'),
    cs: prop.title?.cs || prop.title?.en || prop.title?.it || (typeof prop.title === 'string' ? prop.title : 'Property'),
  }

  return {
    id: prop._id || `prop-${index}`,
    titleI18n,
    regionI18n: getPropertyRegionTranslations(prop),
    price: prop.price?.amount || 0,
    currency: prop.price?.currency || 'EUR',
    bedrooms: prop.specifications?.bedrooms || 0,
    bathrooms: prop.specifications?.bathrooms || 0,
    area: prop.specifications?.squareFootage || 0,
    image: getPropertyImage(prop),
    status: prop.status || 'available',
    slug: prop.slug?.current || prop.slug || prop._id || '',
    featured: prop.featured || false,
    createdAt: prop._createdAt || prop.createdAt || '',
    updatedAt: prop._updatedAt || prop.updatedAt || '',
    pinnedRank: Number(prop.pinnedRank) || 0,
    isNew: Boolean(prop.isNew || prop.newListing),
    noAgency: Boolean(prop.noAgency || prop.no_agency || prop.badges?.includes('no-agency')),
  }
}

function getPropertyTimestamp(property) {
  const timestamp = Date.parse(property?.createdAt || property?.updatedAt || '')
  return Number.isFinite(timestamp) ? timestamp : 0
}

export function prepareProperties(rawProperties = []) {
  const transformed = rawProperties.map(transformProperty)
  const pinnedProperties = transformed
    .filter((property) => property.pinnedRank > 0)
    .sort((a, b) => a.pinnedRank - b.pinnedRank)
  const newProperties = transformed
    .filter((property) => property.pinnedRank === 0 && property.isNew)
    .sort((a, b) => getPropertyTimestamp(b) - getPropertyTimestamp(a))
  const otherProperties = transformed
    .filter((property) => property.pinnedRank === 0 && !property.isNew)
    .sort((a, b) => getPropertyTimestamp(b) - getPropertyTimestamp(a))

  return [...pinnedProperties, ...newProperties, ...otherProperties]
}

// Keep ordering identical to the full carousel; serialize only visible card data.
export const PROPERTY_PREVIEW_LIMIT = 12

export function preparePropertySliderPreview(properties = []) {
  return prepareProperties(properties).slice(0, PROPERTY_PREVIEW_LIMIT).map(({ createdAt, updatedAt, pinnedRank, ...card }) => card)
}
