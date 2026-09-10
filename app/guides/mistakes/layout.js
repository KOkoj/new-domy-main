import { getGuideSeo } from '@/lib/seo/contentPages'
import { buildArticleMetadata } from '@/lib/seo/contentSeo'

const seo = getGuideSeo('mistakes')

export const metadata = buildArticleMetadata(seo)

export default function MistakesGuideLayout({ children }) {
  return children
}
