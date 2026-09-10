import { getStandalonePageMetadata } from '@/lib/seo/standalonePages'

export const metadata = getStandalonePageMetadata('/cookies')

export default function PageLayout({ children }) {
  return children
}
