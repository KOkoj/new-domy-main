import { absoluteUrl, SITE_NAME, SITE_URL } from '@/lib/siteConfig'
import { getAllProperties } from '@/lib/propertyApi'
import JsonLd from '@/components/seo/JsonLd'
import { buildBreadcrumbJsonLd } from '@/lib/seo/contentSeo'

const TITLE_CS = 'Nemovitosti v Itálii - byty, vily, domy a statky | ' + SITE_NAME
const DESCRIPTION_CS =
  'Aktuální nabídka nemovitostí v Itálii pro české kupující. Byty, vily, rodinne domy a rustikalni statky napric italskymi regiony s právní a technickou kontrolou.'

export const metadata = {
  title: TITLE_CS,
  description: DESCRIPTION_CS,
  keywords:
    'nemovitostí Itálie, koupit dum v Itálii, byty Itálie, vily Itálie, statky Itálie, real estate Italy, properties Italy, immobiliare Italia',
  alternates: {
    canonical: '/properties',
    languages: {
      'cs-CZ': '/properties',
      en: '/properties',
      'it-IT': '/properties',
      'x-default': '/properties'
    }
  },
  openGraph: {
    title: TITLE_CS,
    description: DESCRIPTION_CS,
    url: absoluteUrl('/properties'),
    type: 'website',
    siteName: SITE_NAME,
    locale: 'cs_CZ',
    alternateLocale: ['en_US', 'it_IT']
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE_CS,
    description: DESCRIPTION_CS
  }
}

export const revalidate = 3600

function getLocalized(value, language = 'cs', fallback = '') {
  if (!value) return fallback
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    return value[language] || value.cs || value.en || value.it || Object.values(value)[0] || fallback
  }
  return fallback
}

async function fetchPropertiesSafely() {
  try {
    return await getAllProperties(new URLSearchParams())
  } catch (error) {
    console.error('Properties listing layout: failed to load properties', error)
    return []
  }
}

export default async function PropertiesLayout({ children }) {
  const properties = await fetchPropertiesSafely()
  const url = absoluteUrl('/properties')

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': url,
    name: 'Nemovitosti v Itálii',
    description: DESCRIPTION_CS,
    numberOfItems: properties.length,
    itemListElement: properties.slice(0, 50).map((property, index) => {
      const slug = property?.slug?.current
      const title = getLocalized(property?.title, 'cs', 'Nemovitost v Itálii')
      return {
        '@type': 'ListItem',
        position: index + 1,
        url: slug ? absoluteUrl(`/properties/${slug}`) : undefined,
        name: title
      }
    })
  }

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: 'Domu', path: '/' },
    { name: 'Nemovitosti', path: '/properties' }
  ])

  return (
    <>
      <JsonLd data={itemList} />
      <JsonLd data={breadcrumb} />
      {children}
    </>
  )
}
