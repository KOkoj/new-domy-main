import { absoluteUrl, SITE_NAME, SITE_URL } from '@/lib/siteConfig'
import { getAllProperties } from '@/lib/propertyApi'
import { getPropertyImageList } from '@/lib/getPropertyImage'
import JsonLd from '@/components/seo/JsonLd'
import { buildBreadcrumbJsonLd } from '@/lib/seo/contentSeo'

const TITLE_CS = 'Nemovitosti v Italii - byty, vily, domy a statky | ' + SITE_NAME
const DESCRIPTION_CS =
  'Aktualni nabidka nemovitosti v Italii pro ceske kupujici. Byty, vily, rodinne domy a rustikalni statky napric italskymi regiony s pravni a technickou kontrolou.'

export const metadata = {
  title: TITLE_CS,
  description: DESCRIPTION_CS,
  keywords:
    'nemovitosti Italie, koupit dum v Italii, byty Italie, vily Italie, statky Italie, real estate Italy, properties Italy, immobiliare Italia',
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
    name: 'Nemovitosti v Italii',
    description: DESCRIPTION_CS,
    numberOfItems: properties.length,
    itemListElement: properties.slice(0, 50).map((property, index) => {
      const slug = property?.slug?.current
      const title = getLocalized(property?.title, 'cs', 'Nemovitost v Italii')
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
      <PropertiesSeoContent properties={properties} />
      {children}
    </>
  )
}

function PropertiesSeoContent({ properties }) {
  if (!properties || properties.length === 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        left: '-10000px',
        top: 'auto',
        width: '1px',
        height: '1px',
        overflow: 'hidden'
      }}
    >
      <h1>Nemovitosti v Italii</h1>
      <p>{DESCRIPTION_CS}</p>
      <ul>
        {properties.map((property) => {
          const slug = property?.slug?.current
          if (!slug) return null
          const title = getLocalized(property?.title, 'cs', 'Nemovitost v Italii')
          const city = getLocalized(property?.location?.city?.name, 'cs', '')
          const region = getLocalized(property?.location?.city?.region?.name, 'cs', '')
          const description = getLocalized(property?.description, 'cs', '').slice(0, 200)
          const images = getPropertyImageList(property)
          const heroImage = images[0]
          return (
            <li key={slug}>
              <a href={`/properties/${slug}`}>
                <strong>{title}</strong>
                {city ? `, ${city}` : ''}
                {region ? `, ${region}` : ''}
              </a>
              {heroImage ? <img src={heroImage} alt={title} /> : null}
              {description ? <p>{description}</p> : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
