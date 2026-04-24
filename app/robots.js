import { PUBLIC_SITE_STANDBY } from '@/lib/featureFlags'
import { SITE_URL } from '@/lib/siteConfig'

export default function robots() {
  if (PUBLIC_SITE_STANDBY) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/'
      }
    }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/'
    },
    sitemap: `${SITE_URL}/sitemap.xml`
  }
}
