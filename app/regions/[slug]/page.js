import { getAllProperties } from '@/lib/propertyApi'
import { getListingRegionSlug } from '@/lib/propertyListing'
import RegionDetailClient from './RegionDetailClient'

export const revalidate = 3600

const REGION_ALIASES = {
  lombardy: 'lombardia',
  tuscany: 'toscana',
  piedmont: 'piemonte',
  sicily: 'sicilia',
  sardinia: 'sardegna',
  trentinoaltoadige: 'trentino-alto-adige',
  'trentino-south-tyrol': 'trentino-alto-adige',
  valledaosta: 'valle-d-aosta',
  'aosta-valley': 'valle-d-aosta',
}

async function getRegionProperties(slug) {
  try {
    const properties = await getAllProperties(new URLSearchParams())
    const canonicalSlug = REGION_ALIASES[slug] || slug
    const matchingProperties = properties.filter(
      (property) => getListingRegionSlug(property) === canonicalSlug
    )

    return matchingProperties.length > 0 ? matchingProperties : properties.slice(0, 12)
  } catch (error) {
    console.error(`Region properties server fetch failed for ${slug}:`, error)
    return []
  }
}

export default async function RegionDetailPage({ params }) {
  const { slug = '' } = await params
  const initialProperties = await getRegionProperties(slug)

  return <RegionDetailClient initialProperties={initialProperties} />
}
