import { REGION_DATA_OVERRIDES } from '../regionContent'
import { absoluteUrl, SITE_NAME, SITE_URL } from '@/lib/siteConfig'
import JsonLd from '@/components/seo/JsonLd'
import { buildBreadcrumbJsonLd } from '@/lib/seo/contentSeo'

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

function shortenForMeta(text = '', max = 160) {
  if (!text) return ''
  return text.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max)
}

// Pre-build every region page at deploy time. The list of valid slugs is
// known statically from REGION_DATA_OVERRIDES + the alias map, so Next.js
// can generate fully static HTML for each one and Googlebot gets real
// content on the first byte.
export async function generateStaticParams() {
  const canonicalSlugs = Object.keys(REGION_DATA_OVERRIDES)
  const aliasSlugs = Object.keys(BUYER_GUIDANCE_SLUG_ALIASES)
  return Array.from(new Set([...canonicalSlugs, ...aliasSlugs])).map((slug) => ({
    slug
  }))
}

export async function generateMetadata({ params }) {
  const resolved = typeof params?.then === 'function' ? await params : params
  const rawSlug = Array.isArray(resolved?.slug) ? resolved.slug[0] : resolved?.slug
  const canonicalSlug = BUYER_GUIDANCE_SLUG_ALIASES[rawSlug] || rawSlug
  const region = REGION_DATA_OVERRIDES[canonicalSlug]
  const nameCs = region?.name?.cs || region?.name?.en || formatSlugName(canonicalSlug || rawSlug)
  const nameEn = region?.name?.en || formatSlugName(canonicalSlug || rawSlug)
  const nameIt = region?.name?.it || nameEn

  const titleCs = `${nameCs}: pruvodce koupi nemovitosti v Italii | ${SITE_NAME}`
  const titleEn = `${nameEn}: buying guide and property strategy | ${SITE_NAME}`
  const titleIt = `${nameIt}: guida all'acquisto immobiliare in Italia | ${SITE_NAME}`

  const descriptionCs =
    shortenForMeta(region?.description?.cs) ||
    `Pruvodce koupi nemovitosti v regionu ${nameCs}: ceny, mesta, pravni kontrola a strategie nakupu v Italii.`
  const descriptionEn =
    shortenForMeta(region?.description?.en) ||
    `Regional buying guide for ${nameEn}: pricing, cities, checks, and strategy for buying property in Italy.`

  const image = region?.image || '/Toscana.png'
  const canonicalPath = `/regions/${canonicalSlug || rawSlug}`

  return {
    title: titleCs,
    description: descriptionCs,
    keywords: `nemovitosti ${nameCs}, koupit dum ${nameCs}, ${nameEn} real estate, property in ${nameEn}, vila ${nameCs}, byty ${nameCs}, ${nameIt} immobiliare`,
    alternates: {
      canonical: canonicalPath,
      languages: {
        'cs-CZ': canonicalPath,
        'en': canonicalPath,
        'it-IT': canonicalPath,
        'x-default': canonicalPath
      }
    },
    openGraph: {
      title: titleCs,
      description: descriptionCs,
      url: absoluteUrl(canonicalPath),
      type: 'article',
      locale: 'cs_CZ',
      alternateLocale: ['en_US', 'it_IT'],
      siteName: SITE_NAME,
      images: [{ url: image, alt: nameCs }]
    },
    twitter: {
      card: 'summary_large_image',
      title: titleEn,
      description: descriptionEn,
      images: [image]
    }
  }
}

export default async function RegionDetailLayout({ children, params }) {
  const resolved = typeof params?.then === 'function' ? await params : params
  const rawSlug = Array.isArray(resolved?.slug) ? resolved.slug[0] : resolved?.slug
  const canonicalSlug = BUYER_GUIDANCE_SLUG_ALIASES[rawSlug] || rawSlug
  const region = REGION_DATA_OVERRIDES[canonicalSlug]
  const nameCs = region?.name?.cs || region?.name?.en || formatSlugName(canonicalSlug || rawSlug)
  const description = shortenForMeta(region?.description?.cs || region?.description?.en, 320)
  const canonicalPath = `/regions/${canonicalSlug || rawSlug}`
  const url = absoluteUrl(canonicalPath)

  const placeJsonLd = region
    ? {
        '@context': 'https://schema.org',
        '@type': 'Place',
        '@id': url,
        name: nameCs,
        description,
        url,
        image: region.image ? absoluteUrl(region.image) : undefined,
        containedInPlace: {
          '@type': 'Country',
          name: 'Italy'
        }
      }
    : null

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': url,
    url,
    name: `${nameCs} - pruvodce koupi nemovitosti`,
    description,
    inLanguage: 'cs-CZ',
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL
    },
    breadcrumb: buildBreadcrumbJsonLd([
      { name: 'Domu', path: '/' },
      { name: 'Regiony', path: '/regions' },
      { name: nameCs, path: canonicalPath }
    ])
  }

  return (
    <>
      {placeJsonLd ? <JsonLd data={placeJsonLd} /> : null}
      <JsonLd data={webPageJsonLd} />
      {children}
    </>
  )
}
