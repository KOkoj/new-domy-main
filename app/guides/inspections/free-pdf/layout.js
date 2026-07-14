import JsonLd from '@/components/seo/JsonLd'
import { getGuideSeo } from '@/lib/seo/contentPages'
import { buildArticleMetadata, buildBreadcrumbJsonLd, buildPaywalledArticleJsonLd } from '@/lib/seo/contentSeo'

const seo = getGuideSeo('inspections-free-pdf')

export const metadata = buildArticleMetadata(seo)

export default function InspectionsFreePdfLayout({ children }) {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Guides', path: '/guides' },
          { name: getGuideSeo('inspections').title, path: getGuideSeo('inspections').path },
          { name: seo.title, path: seo.path }
        ])}
      />
      <JsonLd data={buildPaywalledArticleJsonLd(seo)} />
      {children}
    </>
  )
}
