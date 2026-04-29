import { notFound } from 'next/navigation'
import { getPropertyBySlug } from '@/lib/propertyApi'
import { getPropertyImageList, PROPERTY_IMAGE_FALLBACK } from '@/lib/getPropertyImage'
import PropertyDetailClient from './PropertyDetailClient'

export const revalidate = 3600

function getLocalized(value, language = 'cs', fallback = '') {
  if (!value) return fallback
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    return value[language] || value.cs || value.en || value.it || Object.values(value)[0] || fallback
  }
  return fallback
}

const PROPERTY_TYPE_LABELS_CS = {
  apartment: 'Byt',
  house: 'Dum',
  villa: 'Vila',
  rustic: 'Rustikalni nemovitost',
  land: 'Pozemek'
}

function formatPriceForSeo(price) {
  if (!price?.amount) return null
  const currency = price.currency || 'EUR'
  try {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(price.amount)
  } catch {
    return `${price.amount} ${currency}`
  }
}

// Server-rendered SEO content. Googlebot sees this on first byte even before
// the interactive client component hydrates. Visually identical content is
// rendered by the client below; this block is positioned off-screen so it
// does not duplicate the visible UI but is still in the DOM for crawlers.
function PropertySeoContent({ property }) {
  if (!property) return null

  const title = getLocalized(property.title, 'cs', 'Nemovitost v Italii')
  const description =
    getLocalized(property.description, 'cs', '') ||
    getLocalized(property.seoDescription, 'cs', '')
  const propertyType = String(property.propertyType || '').toLowerCase()
  const propertyTypeLabel = PROPERTY_TYPE_LABELS_CS[propertyType] || 'Nemovitost'
  const city = getLocalized(property?.location?.city?.name, 'cs', '')
  const region = getLocalized(property?.location?.city?.region?.name, 'cs', '')
  const address = getLocalized(property?.location?.address, 'cs', '')
  const formattedPrice = formatPriceForSeo(property.price)
  const specs = property.specifications || {}
  const images = getPropertyImageList(property)
  const heroImage = images[0] || PROPERTY_IMAGE_FALLBACK

  return (
    <div
      aria-hidden="false"
      style={{
        position: 'absolute',
        left: '-10000px',
        top: 'auto',
        width: '1px',
        height: '1px',
        overflow: 'hidden'
      }}
    >
      <article>
        <h1>{title}</h1>
        {(city || region) ? (
          <p>
            <strong>{propertyTypeLabel}</strong>
            {address ? `, ${address}` : ''}
            {city ? `, ${city}` : ''}
            {region ? `, ${region}` : ''}
            , Italie
          </p>
        ) : null}
        {formattedPrice ? <p>Cena: {formattedPrice}</p> : null}
        {description ? <p>{description}</p> : null}
        <ul>
          {specs.bedrooms ? <li>Loznice: {specs.bedrooms}</li> : null}
          {specs.bathrooms ? <li>Koupelny: {specs.bathrooms}</li> : null}
          {specs.rooms ? <li>Mistnosti: {specs.rooms}</li> : null}
          {specs.squareFootage ? <li>Plocha: {specs.squareFootage} m2</li> : null}
          {specs.parking ? <li>Parkovani: {specs.parking}</li> : null}
        </ul>
        {Array.isArray(property.amenities) && property.amenities.length > 0 ? (
          <>
            <h2>Vybaveni</h2>
            <ul>
              {property.amenities.map((amenity, index) => (
                <li key={index}>{getLocalized(amenity, 'cs', String(amenity))}</li>
              ))}
            </ul>
          </>
        ) : null}
        {images.length > 0 ? (
          <>
            <h2>Fotografie</h2>
            <img src={heroImage} alt={title} />
          </>
        ) : null}
      </article>
    </div>
  )
}

export default async function PropertyDetailPage({ params }) {
  const resolved = typeof params?.then === 'function' ? await params : params
  const rawSlug = Array.isArray(resolved?.slug) ? resolved.slug[0] : resolved?.slug

  if (!rawSlug) {
    notFound()
  }

  const sanityProperty = await getPropertyBySlug(rawSlug)

  if (!sanityProperty) {
    notFound()
  }

  // Mirror the transform the client component used to do on mount, so the
  // shape passed in matches what the existing UI expects.
  const property = {
    _id: sanityProperty._id,
    title: sanityProperty.title,
    slug: sanityProperty.slug,
    propertyType: sanityProperty.propertyType,
    price: sanityProperty.price,
    description: sanityProperty.description,
    seoTitle: sanityProperty.seoTitle,
    seoDescription: sanityProperty.seoDescription,
    specifications: sanityProperty.specifications,
    location: sanityProperty.location,
    images: getPropertyImageList(sanityProperty),
    amenities: sanityProperty.amenities || [],
    developer: sanityProperty.developer,
    status: sanityProperty.status || 'available',
    featured: sanityProperty.featured || false
  }

  return (
    <>
      <PropertySeoContent property={property} />
      <PropertyDetailClient initialProperty={property} />
    </>
  )
}
