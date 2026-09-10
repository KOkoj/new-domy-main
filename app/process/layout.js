// Keep this existing sitemap page canonical without changing its content.
export const metadata = {
  alternates: { canonical: '/process' }
}

export default function PageLayout({ children }) {
  return children
}
