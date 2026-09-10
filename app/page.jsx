import { getAllProperties } from '@/lib/propertyApi'
import { absoluteUrl, SITE_NAME, SITE_URL } from '@/lib/siteConfig'
import JsonLd from '@/components/seo/JsonLd'
import HomePageClient from './HomePageClient'
import { preparePropertySliderPreview } from '@/lib/propertySliderData'

export const revalidate = 3600

async function fetchPropertiesSafely() {
  try {
    return await getAllProperties(new URLSearchParams())
  } catch (error) {
    console.error('Homepage server fetch failed:', error)
    return []
  }
}

function buildWebsiteWithSearchJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'cs-CZ',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: absoluteUrl('/properties?search={search_term_string}')
      },
      'query-input': 'required name=search_term_string'
    }
  }
}

export default async function HomePage() {
  const properties = await fetchPropertiesSafely()

  return (
    <>
      <JsonLd data={buildWebsiteWithSearchJsonLd()} />
      <HomePageClient sliderProperties={preparePropertySliderPreview(properties)} />
    </>
  )
}
