import { REGION_DATA_OVERRIDES } from '../regionContent'
import { absoluteUrl } from '@/lib/siteConfig'

const BUYER_GUIDANCE_SLUG_ALIASES = {
  lombardy: 'lombardia',
  tuscany: 'toscana',
  piedmont: 'piemonte',
  trentinoaltoadige: 'trentino-alto-adige',
  'trentino-south-tyrol': 'trentino-alto-adige',
  valledaosta: 'valle-d-aosta',
  'aosta-valley': 'valle-d-aosta',
  sicily: 'sicilia',
  sardinia: 'sardegna'
}

function formatSlugName(slug = '') {
  if (typeof slug !== 'string' || slug.trim().length === 0) return 'Region'
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export async function generateMetadata({ params }) {
  const rawSlug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug
  const canonicalSlug = BUYER_GUIDANCE_SLUG_ALIASES[rawSlug] || rawSlug
  const region = REGION_DATA_OVERRIDES[canonicalSlug]
  const name = region?.name?.en || formatSlugName(canonicalSlug || rawSlug)
  const description =
    region?.description?.en?.replace(/\s+/g, ' ').trim().slice(0, 160) ||
    `Regional buying guide for ${name}: pricing, cities, checks, and strategy for buying property in Italy.`
  const image = region?.image || '/Toscana.png'
  const canonicalPath = `/regions/${canonicalSlug || rawSlug}`

  return {
    title: `${name}: buying guide and property strategy | Domy v Italii`,
    description,
    alternates: {
      canonical: canonicalPath
    },
    openGraph: {
      title: `${name}: buying guide and property strategy | Domy v Italii`,
      description,
      url: absoluteUrl(canonicalPath),
      type: 'article',
      images: [{ url: image, alt: name }]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name}: buying guide and property strategy | Domy v Italii`,
      description,
      images: [image]
    }
  }
}

export default function RegionDetailLayout({ children }) {
  return children
}
