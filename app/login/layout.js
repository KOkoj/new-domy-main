import { getStandalonePageMetadata } from '@/lib/seo/standalonePages'

export const metadata = getStandalonePageMetadata('/login')

export default function PageLayout({ children }) {
  return children
}
