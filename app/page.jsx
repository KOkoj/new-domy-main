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

const HERO_AVIF_SRCSET = '/hero-mlha-1280.avif 1280w, /hero-mlha-1920.avif 1920w, /hero-mlha-2560.avif 2560w, /hero-mlha.avif 3840w'

export default async function HomePage() {
  const properties = await fetchPropertiesSafely()

  return (
    <>
      <link
        rel="preload"
        as="image"
        type="image/avif"
        href="/hero-mlha-1920.avif"
        imageSrcSet={HERO_AVIF_SRCSET}
        imageSizes="150vw"
        fetchPriority="high"
      />
      <JsonLd data={buildWebsiteWithSearchJsonLd()} />
      <HomePageClient sliderProperties={preparePropertySliderPreview(properties)} />
    </>
  )
}
