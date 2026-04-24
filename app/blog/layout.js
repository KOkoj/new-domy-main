import { absoluteUrl } from '@/lib/siteConfig'

export const metadata = {
  title: 'Italy guides and articles | Domy v Italii',
  description:
    'Guides and articles about Italy for buyers and travelers: costs, regions, legal process, practical planning, and local context.',
  alternates: {
    canonical: '/blog'
  },
  openGraph: {
    title: 'Italy guides and articles | Domy v Italii',
    description:
      'Guides and articles about Italy for buyers and travelers: costs, regions, legal process, practical planning, and local context.',
    url: absoluteUrl('/blog'),
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Italy guides and articles | Domy v Italii',
    description:
      'Guides and articles about Italy for buyers and travelers: costs, regions, legal process, practical planning, and local context.'
  }
}

export default function BlogLayout({ children }) {
  return children
}
