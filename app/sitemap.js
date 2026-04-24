import { PUBLIC_SITE_STANDBY } from '@/lib/featureFlags'
import { absoluteUrl } from '@/lib/siteConfig'

const STATIC_ROUTES = [
  '/',
  '/about',
  '/blog',
  '/contact',
  '/faq',
  '/gdpr',
  '/guides',
  '/guides/costs',
  '/guides/inspections',
  '/guides/mistakes',
  '/guides/notary',
  '/guides/offerta-compromesso-registrazione',
  '/guides/real-estate-purchase-system-italy',
  '/guides/rekonstrukce-domu-v-italii',
  '/process',
  '/properties',
  '/regions',
  '/terms'
]

export default function sitemap() {
  if (PUBLIC_SITE_STANDBY) {
    return []
  }

  const now = new Date()

  return STATIC_ROUTES.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.7
  }))
}
