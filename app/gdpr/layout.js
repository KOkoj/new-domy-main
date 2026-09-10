// Keep this existing sitemap page canonical without changing its content.
export const metadata = {
  alternates: { canonical: '/gdpr' }
}

export default function PageLayout({ children }) {
  return children
}
