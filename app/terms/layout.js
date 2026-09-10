// Keep this existing sitemap page canonical without changing its content.
export const metadata = {
  alternates: { canonical: '/terms' }
}

export default function PageLayout({ children }) {
  return children
}
