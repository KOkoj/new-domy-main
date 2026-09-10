// Keep error metadata above the page that calls notFound(), so Next.js does
// not fall back to the homepage metadata when it renders the 404 boundary.
export const metadata = {
  title: '404: This page could not be found.',
  description: null,
  alternates: null,
  openGraph: null,
  twitter: null,
  robots: { index: false, follow: false }
}

export default function PropertyNotFoundLayout({ children }) {
  return children
}
