import JsonLd from '@/components/seo/JsonLd'
import { getTravelArticleSeo } from '@/lib/seo/contentPages'
import { buildArticleJsonLd, buildArticleMetadata, buildBreadcrumbJsonLd } from '@/lib/seo/contentSeo'

const seo = getTravelArticleSeo('nejkrasnejsi-mala-mesta-v-italii')

export const metadata = buildArticleMetadata(seo)

export default function MostBeautifulSmallTownsItalyLayout({ children }) {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Průvodce Itálií', path: '/clanky/pruvodce-italii' },
          { name: seo.title, path: seo.path }
        ])}
      />
      <JsonLd data={buildArticleJsonLd(seo)} />
      {children}
    </>
  )
}
