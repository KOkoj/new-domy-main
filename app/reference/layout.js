import { getStandalonePageMetadata } from '@/lib/seo/standalonePages'

export const metadata = getStandalonePageMetadata('/reference')

export default function ReferenceLayout({ children }) {
  return children
}
