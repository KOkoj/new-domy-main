import { SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/siteConfig'
import { getPropertySeo, finitePropertyNumber } from '@/lib/seo/propertySeo'

function normalizeImage(url) {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return absoluteUrl(url)
}

export function buildArticleMetadata(entry) {
  if (!entry) return {}

  const image = normalizeImage(entry.image)

  return {
    title: `${entry.title} | ${SITE_NAME}`,
    description: entry.description,
    alternates: {
      canonical: entry.path
    },
    openGraph: {
      title: `${entry.title} | ${SITE_NAME}`,
      description: entry.description,
      url: absoluteUrl(entry.path),
      type: 'article',
      siteName: SITE_NAME,
      publishedTime: entry.datePublished,
      images: image ? [{ url: image, alt: entry.title }] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title: `${entry.title} | ${SITE_NAME}`,
      description: entry.description,
      images: image ? [image] : undefined
    }
  }
}

export function buildBreadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  }
}

/** CSS selector for paywalled body sections — must match `id` on guide page wrappers. */
export const PAYWALLED_CONTENT_CSS_SELECTOR = '#paywalled-content'

export function buildArticleJsonLd(entry) {
  if (!entry) return null

  const image = normalizeImage(entry.image)

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: entry.title,
    description: entry.description,
    datePublished: entry.datePublished,
    dateModified: entry.datePublished,
    inLanguage: 'cs-CZ',
    mainEntityOfPage: absoluteUrl(entry.path),
    articleSection: entry.articleSection,
    image: image ? [image] : undefined,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/logo domy.svg')
      }
    }
  }
}

/**
 * Article JSON-LD for Klub-gated buying guides (Google paywalled content guidelines).
 * @see https://developers.google.com/search/docs/appearance/structured-data/paywalled-content
 */
export function buildPaywalledArticleJsonLd(entry) {
  const base = buildArticleJsonLd(entry)
  if (!base) return null

  return {
    ...base,
    isAccessibleForFree: false,
    hasPart: {
      '@type': 'WebPageElement',
      isAccessibleForFree: false,
      cssSelector: PAYWALLED_CONTENT_CSS_SELECTOR
    }
  }
}

function mapPropertyTypeToSchemaType(propertyType) {
  const normalized = String(propertyType || '').toLowerCase()
  if (normalized === 'apartment') return 'Apartment'
  if (normalized === 'house' || normalized === 'villa') return 'House'
  if (normalized === 'rustic') return 'Residence'
  if (normalized === 'land') return 'Place'
  return 'Residence'
}

function mapAvailability(status) {
  if (status === 'sold') return 'https://schema.org/SoldOut'
  if (status === 'reserved') return 'https://schema.org/LimitedAvailability'
  return status === 'available' ? 'https://schema.org/InStock' : undefined
}


export function buildPropertyJsonLd(property, canonicalPath) {
  if (!property || !canonicalPath) return null

  const { title, description, images: imageList, city, region, address } = getPropertySeo(property)
  const url = absoluteUrl(canonicalPath)
  const coordinates = property?.location?.coordinates || {}
  const schemaType = mapPropertyTypeToSchemaType(property?.propertyType)
  const specifications = property?.specifications || {}

  const aboutEntity = {
    '@type': schemaType,
    name: title,
    description,
    ...(imageList.length ? { image: imageList } : {}),
    url,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address || undefined,
      addressLocality: city || undefined,
      addressRegion: region || undefined,
      addressCountry: 'IT'
    }
  }

  const latitude = finitePropertyNumber(coordinates.lat, -90)
  const longitude = finitePropertyNumber(coordinates.lng, -180)
  if (latitude !== undefined && latitude <= 90 && longitude !== undefined && longitude <= 180) {
    aboutEntity.geo = { '@type': 'GeoCoordinates', latitude, longitude }
  }
  const area = finitePropertyNumber(specifications.squareFootage, Number.MIN_VALUE)
  if (area !== undefined) {
    aboutEntity.floorSize = { '@type': 'QuantitativeValue', value: area, unitCode: 'MTK' }
  }
  for (const [field, source] of [['numberOfRooms', 'rooms'], ['numberOfBedrooms', 'bedrooms'], ['numberOfBathroomsTotal', 'bathrooms']]) {
    const value = finitePropertyNumber(specifications[source])
    if (value !== undefined) aboutEntity[field] = value
  }
  const price = finitePropertyNumber(property?.price?.amount, Number.MIN_VALUE)
  const hasEuroPrice = price !== undefined && (!property?.price?.currency || property.price.currency === 'EUR')

  // The listing describes this page; its about entity describes the dwelling.
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    '@id': url,
    url,
    name: title,
    description,
    ...(imageList.length ? { image: imageList } : {}),
    datePosted: property?._createdAt || property?.createdAt || undefined,
    inLanguage: 'cs',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    },
    breadcrumb: buildBreadcrumbJsonLd([
      { name: 'Domů', path: '/' },
      { name: 'Nemovitosti', path: '/properties' },
      { name: title, path: canonicalPath }
    ]),
    about: aboutEntity,
    ...(hasEuroPrice ? { offers: {
      '@type': 'Offer',
      url,
      price,
      priceCurrency: 'EUR',
      availability: mapAvailability(property?.status),
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL
      }
    } } : {})
  }
}
