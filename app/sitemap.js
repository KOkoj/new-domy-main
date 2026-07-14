import { PUBLIC_SITE_STANDBY } from '@/lib/featureFlags'
import { absoluteUrl } from '@/lib/siteConfig'
import { REGION_DATA_OVERRIDES } from '@/app/regions/regionContent'
import { getAllProperties } from '@/lib/propertyApi'
import { GUIDE_PAGE_SEO, TRAVEL_ARTICLE_SEO } from '@/lib/seo/contentPages'

const STATIC_ROUTES = [
  '/',
  '/about',
  '/blog',
  '/clanky/pruvodce-italii',
  '/contact',
  '/faq',
  '/gdpr',
  '/guides',
  '/process',
  '/properties',
  '/regions',
  '/terms'
]

export default async function sitemap() {
  if (PUBLIC_SITE_STANDBY) {
    return []
  }

  const now = new Date()
  const properties = await getAllProperties(new URLSearchParams())
  const propertyRoutes = properties
    .map((property) => property?.slug?.current)
    .filter(Boolean)
    .map((slug) => `/properties/${slug}`)
  const regionRoutes = Object.keys(REGION_DATA_OVERRIDES).map((slug) => `/regions/${slug}`)
  const guideRoutes = Object.values(GUIDE_PAGE_SEO).map((entry) => entry.path)
  const travelRoutes = Object.values(TRAVEL_ARTICLE_SEO).map((entry) => entry.path)
  const allRoutes = Array.from(
    new Set([...STATIC_ROUTES, ...guideRoutes, ...travelRoutes, ...regionRoutes, ...propertyRoutes])
  )

  return allRoutes.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency:
      path === '/'
        ? 'daily'
        : path.startsWith('/properties/')
        ? 'weekly'
        : path.startsWith('/regions/')
        ? 'weekly'
        : 'monthly',
    priority:
      path === '/'
        ? 1
        : path === '/properties' || path === '/regions'
        ? 0.9
        : path.startsWith('/properties/')
        ? 0.8
        : 0.7
  }))
}
