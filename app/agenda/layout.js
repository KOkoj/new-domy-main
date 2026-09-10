import { getStandalonePageMetadata } from '@/lib/seo/standalonePages'

export const metadata = getStandalonePageMetadata('/agenda')

export default function PageLayout({ children }) {
  return children
}
