import { transformPropertyListing } from '@/lib/propertyListing'

export function localizedField(value, language, fallback = '') {
  if (!value) return fallback
  if (typeof value === 'string') return value
  return value[language] || value.cs || value.en || value.it || fallback
}

export function mapApiPropertyForDashboard(property, index = 0) {
  const listing = transformPropertyListing(property, index)
  return {
    _id: listing.sanityId || listing.id,
    slug: listing.slug,
    titleI18n: listing.titleI18n,
    regionI18n: listing.regionI18n,
    type: listing.type,
    price: listing.price,
    currency: listing.currency,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    area: listing.area,
    image: listing.image,
    featured: listing.featured,
    isNew: listing.isNew,
    status: listing.status,
    createdAt: listing.createdAt,
    pinnedRank: listing.pinnedRank
  }
}

export function selectDashboardRecommendations(properties = [], { limit = 8 } = {}) {
  const mapped = (Array.isArray(properties) ? properties : [])
    .map(mapApiPropertyForDashboard)
    .filter((property) => property.slug && property.status !== 'sold')

  const score = (property) => {
    if (property.pinnedRank > 0) return 400 + property.pinnedRank
    if (property.featured) return 300
    if (property.isNew) return 200
    const timestamp = Date.parse(property.createdAt || '')
    return Number.isFinite(timestamp) ? timestamp / 1_000_000_000 : 0
  }

  return [...mapped]
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit)
}

export function toDashboardCard(mapped) {
  if (!mapped) return null
  return {
    _id: mapped._id,
    titleI18n: mapped.titleI18n,
    propertyType: mapped.type,
    price: { amount: mapped.price, currency: mapped.currency },
    specifications: {
      bedrooms: mapped.bedrooms,
      bathrooms: mapped.bathrooms,
      squareFootage: mapped.area
    },
    locationI18n: mapped.regionI18n,
    image: mapped.image,
    slug: { current: mapped.slug },
    featured: mapped.featured,
    isNew: mapped.isNew,
    status: mapped.status,
    createdAt: mapped.createdAt
  }
}

export function unknownDashboardProperty(listingId) {
  return {
    _id: listingId || 'unknown',
    titleI18n: {
      cs: 'Nemovitost nenalezena',
      en: 'Property not found',
      it: 'Immobile non trovato'
    },
    propertyType: 'unknown',
    price: { amount: 0, currency: 'EUR' },
    specifications: { bedrooms: 0, bathrooms: 0, squareFootage: 0 },
    locationI18n: { cs: '', en: '', it: '' },
    image: '/placeholder-property.jpg',
    slug: { current: '' },
    featured: false,
    isNew: false
  }
}

export function findDashboardProperty(properties, listingId) {
  const needle = String(listingId || '').trim()
  if (!needle) return null
  return properties.find((property) => (
    property._id === needle ||
    property.slug === needle ||
    property.slug?.current === needle ||
    property.sanityId === needle
  )) || null
}
