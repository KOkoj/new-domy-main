import { getPropertyBySlug } from '@/lib/propertyApi'
import { absoluteUrl } from '@/lib/siteConfig'

function getLocalizedValue(value, language = 'en', fallback = '') {
  if (value && typeof value === 'object') {
    return value[language] || value.en || value.it || value.cs || fallback
  }
  return value || fallback
}

function buildDescription(property) {
  const localized =
    getLocalizedValue(property?.seoDescription, 'en') ||
    getLocalizedValue(property?.description, 'en')

  if (localized) {
    return localized.replace(/\s+/g, ' ').trim().slice(0, 160)
  }

  const city = getLocalizedValue(property?.location?.city?.name, 'en', 'Italy')
  return `Property for sale in ${city}, Italy. Review photos, pricing, property type, and practical buying context.`
}

function getImage(property) {
  const images = Array.isArray(property?.images) ? property.images : []
  const mainImageIndex = Number.isInteger(property?.mainImage) ? property.mainImage : 0
  return images[mainImageIndex] || images[0] || null
}

export async function generateMetadata({ params }) {
  const rawSlug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug
  const property = rawSlug ? await getPropertyBySlug(rawSlug) : null

  if (!property) {
    return {
      title: 'Property not found | Domy v Italii',
      robots: {
        index: false,
        follow: false
      }
    }
  }

  const title =
    getLocalizedValue(property?.seoTitle, 'en') ||
    getLocalizedValue(property?.title, 'en', 'Property in Italy')
  const city = getLocalizedValue(property?.location?.city?.name, 'en', 'Italy')
  const image = getImage(property)
  const canonicalPath = `/properties/${property?.slug?.current || rawSlug}`
  const description = buildDescription(property)

  return {
    title: `${title} | Domy v Italii`,
    description,
    alternates: {
      canonical: canonicalPath
    },
    openGraph: {
      title: `${title} | Domy v Italii`,
      description,
      url: absoluteUrl(canonicalPath),
      type: 'article',
      images: image ? [{ url: image, alt: title }] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Domy v Italii`,
      description,
      images: image ? [image] : undefined
    },
    other: {
      'geo.placename': city
    }
  }
}

export default function PropertyDetailLayout({ children }) {
  return children
}
