import { getStandalonePageMetadata } from '@/lib/seo/standalonePages'

export const metadata = getStandalonePageMetadata('/premium')

export default function PageLayout({ children }) {
  return children
}
