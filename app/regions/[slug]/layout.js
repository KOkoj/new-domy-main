import { REGION_METADATA } from '../regionContent'

function slugToName(slug = '') {
  if (!slug || typeof slug !== 'string') return 'Italy Region'
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params
  const slug = Array.isArray(resolvedParams?.slug) ? resolvedParams.slug[0] : resolvedParams?.slug
  const metadata = REGION_METADATA[slug]

  if (metadata) {
    return metadata
  }

  if (slug) {
    const regionName = slugToName(slug)
    return {
      title: `Buy Property in ${regionName}: Prices, Areas, Legal Guide | Domy v Italii`,
      description: `Practical ${regionName} property guide for international buyers: real price ranges, best areas, taxes, legal checks, and due diligence before purchase in Italy.`
    }
  }

  return {
    title: 'Buy Property in Italy by Region | Domy v Italii',
    description: 'Practical regional guides for buying property in Italy: prices, best cities, legal checks, and market strategy for Czech buyers.'
  }
}

export default function RegionLayout({ children }) {
  return children
}
