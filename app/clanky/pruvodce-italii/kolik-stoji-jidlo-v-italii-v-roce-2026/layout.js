import JsonLd from '@/components/seo/JsonLd'
import { getTravelArticleSeo } from '@/lib/seo/contentPages'
import { buildArticleJsonLd, buildArticleMetadata, buildBreadcrumbJsonLd } from '@/lib/seo/contentSeo'

const seo = getTravelArticleSeo('kolik-stoji-jidlo-v-italii-v-roce-2026')

export const metadata = buildArticleMetadata(seo)

export default function FoodCostsItaly2026Layout({ children }) {
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
