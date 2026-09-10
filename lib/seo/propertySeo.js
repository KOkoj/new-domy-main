import { absoluteUrl, SITE_NAME, SITE_URL } from '@/lib/siteConfig'
import { getLocalizedValue } from '@/lib/propertyDisplay'
import { getPropertyImageList } from '@/lib/getPropertyImage'

const TYPES_CS = { apartment: 'Byt', house: 'Dům', villa: 'Vila', rustic: 'Rustikální nemovitost', rustico: 'Rustikální nemovitost', land: 'Pozemek' }

function text(value) {
  return typeof value === 'string' ? value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : ''
}

export function finitePropertyNumber(value, minimum = 0) {
  if (!['number', 'string'].includes(typeof value) || (typeof value === 'string' && !value.trim())) return undefined
  const number = Number(value)
  return Number.isFinite(number) && number >= minimum ? number : undefined
}

function snippet(value) {
  if (value.length <= 160) return value
  const shortened = value.slice(0, 157)
  const boundary = shortened.lastIndexOf(' ')
  return shortened.slice(0, boundary > 100 ? boundary : 157).replace(/[.,;:]$/, '') + '…'
}

export function getPropertySeo(property) {
  const city = text(getLocalizedValue(property?.location?.city?.name, 'cs'))
  const region = text(getLocalizedValue(property?.location?.city?.region?.name, 'cs'))
  const address = text(getLocalizedValue(property?.location?.address, 'cs'))
  const type = TYPES_CS[property?.propertyType] || 'Nemovitost'
  const place = address || [city, region].filter(Boolean).join(', ') || 'Itálie'
  // Do not silently fall back to English prose when a Czech translation is absent.
  const title = text(property?.seoTitle?.cs) || text(property?.title?.cs) || `${type} – ${place}`
  const area = finitePropertyNumber(property?.specifications?.squareFootage, Number.MIN_VALUE)
  const price = finitePropertyNumber(property?.price?.amount, Number.MIN_VALUE)
  const fallback = [
    `${type} – ${place}.`,
    area !== undefined ? `Plocha ${new Intl.NumberFormat('cs-CZ').format(area)} m².` : '',
    price !== undefined && (!property?.price?.currency || property.price.currency === 'EUR')
      ? `Cena ${new Intl.NumberFormat('cs-CZ').format(price)} EUR.` : '',
    'Podrobnosti o nemovitosti najdete na Domy v Itálii.'
  ].filter(Boolean).join(' ')
  const description = snippet(text(property?.seoDescription?.cs) || text(property?.description?.cs) || fallback)
  const images = getPropertyImageList(property).flatMap(image => {
    try {
      const url = new URL(image, SITE_URL)
      return ['https:', 'http:'].includes(url.protocol) ? [url.href] : []
    } catch { return [] }
  }).slice(0, 8)
  return { title, description, city, region, address, images }
}

export function buildPropertyMetadata(property, canonicalPath) {
  const seo = getPropertySeo(property)
  const title = seo.title.endsWith(`| ${SITE_NAME}`) ? seo.title : `${seo.title} | ${SITE_NAME}`
  const url = absoluteUrl(canonicalPath)
  // Existing site hero: a site-level social fallback, never a different listing.
  const image = seo.images[0] || absoluteUrl('/hero-background.webp')
  return {
    title,
    description: seo.description,
    alternates: { canonical: url },
    openGraph: {
      title, description: seo.description, url, type: 'website',
      siteName: SITE_NAME, locale: 'cs_CZ',
      images: [{ url: image, alt: seo.images.length ? seo.title : SITE_NAME }]
    },
    twitter: { card: 'summary_large_image', title, description: seo.description, images: [image] },
    ...(seo.city ? { other: { 'geo.placename': seo.city } } : {})
  }
}
