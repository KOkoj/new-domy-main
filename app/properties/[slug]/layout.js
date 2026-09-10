import { getPropertyBySlug, getAllProperties } from '@/lib/propertyApi'
import JsonLd from '@/components/seo/JsonLd'
import { buildPropertyJsonLd } from '@/lib/seo/contentSeo'
import { buildPropertyMetadata } from '@/lib/seo/propertySeo'

// Re-fetch fresh listings every hour. Properties newly added after a deploy
// are still rendered on demand and then cached.
export const revalidate = 3600

export async function generateStaticParams() {
  try {
    const properties = await getAllProperties(new URLSearchParams())
    return properties
      .map((property) => property?.slug?.current)
      .filter(Boolean)
      .map((slug) => ({ slug }))
  } catch (error) {
    console.error('generateStaticParams (properties) failed:', error)
    return []
  }
}


export async function generateMetadata({ params }) {
  const resolved = typeof params?.then === 'function' ? await params : params
  const rawSlug = Array.isArray(resolved?.slug) ? resolved.slug[0] : resolved?.slug
  const property = rawSlug ? await getPropertyBySlug(rawSlug) : null

  if (!property) {
    return {
      description: null,
      alternates: null,
      openGraph: null,
      twitter: null,
      title: 'Nemovitost nenalezena | Domy v Itálii',
      robots: {
        index: false,
        follow: false
      }
    }
  }

  const canonicalPath = `/properties/${property?.slug?.current || rawSlug}`
  return buildPropertyMetadata(property, canonicalPath)
}

export default async function PropertyDetailLayout({ children, params }) {
  const resolved = typeof params?.then === 'function' ? await params : params
  const rawSlug = Array.isArray(resolved?.slug) ? resolved.slug[0] : resolved?.slug
  const property = rawSlug ? await getPropertyBySlug(rawSlug) : null
  const canonicalPath = property?.slug?.current
    ? `/properties/${property.slug.current}`
    : rawSlug
    ? `/properties/${rawSlug}`
    : null

  return (
    <>
      <JsonLd data={buildPropertyJsonLd(property, canonicalPath)} />
      {children}
    </>
  )
}
