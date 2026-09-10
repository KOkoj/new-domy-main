import JsonLd from '@/components/seo/JsonLd'
import { getGuideSeo } from '@/lib/seo/contentPages'
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo/contentSeo'
import MistakesGuideClient from './MistakesGuideClient'

const seo = getGuideSeo('mistakes')

// Article markup belongs to this page, not to its free-PDF child landing.
export default function MistakesGuidePage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Guides', path: '/guides' },
          { name: seo.title, path: seo.path }
        ])}
      />
      <JsonLd data={buildArticleJsonLd(seo)} />
      <MistakesGuideClient />
    </>
  )
}
