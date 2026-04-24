import { absoluteUrl } from '@/lib/siteConfig'

export const metadata = {
  title: 'Properties in Italy | Domy v Italii',
  description:
    'Browse selected properties in Italy: apartments, villas, houses, and rustic homes across the most relevant Italian regions for Czech buyers.',
  alternates: {
    canonical: '/properties'
  },
  openGraph: {
    title: 'Properties in Italy | Domy v Italii',
    description:
      'Browse selected properties in Italy: apartments, villas, houses, and rustic homes across the most relevant Italian regions for Czech buyers.',
    url: absoluteUrl('/properties'),
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Properties in Italy | Domy v Italii',
    description:
      'Browse selected properties in Italy: apartments, villas, houses, and rustic homes across the most relevant Italian regions for Czech buyers.'
  }
}

export default function PropertiesLayout({ children }) {
  return children
}
