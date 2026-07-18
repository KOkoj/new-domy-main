'use client'

import { useEffect } from 'react'
import { track } from '@vercel/analytics'

const CJ_CAMPAIGN_PARTNERS = Object.freeze({
  '15735418': 'booking',
  '17122732': 'car_rental',
  '17053224': 'flights',
  '13328896': 'insurance',
  '13502304': 'insurance',
  '17061697': 'travel',
  '17227946': 'accommodation',
  '17227920': 'holiday_budget',
  '17122710': 'villages'
})

function inferAffiliatePartner(href) {
  if (!href) return null

  try {
    const url = new URL(href, window.location.origin)
    const hostname = url.hostname.replace(/^www\./, '')

    if (hostname === 'booking.com') return 'booking'
    if (hostname === 'getyourguide.com' || hostname === 'gyg.me' || hostname === 'widget.getyourguide.com') {
      return 'getyourguide'
    }

    const campaignId = Object.keys(CJ_CAMPAIGN_PARTNERS).find((id) => url.pathname.includes(id))
    return campaignId ? CJ_CAMPAIGN_PARTNERS[campaignId] : null
  } catch {
    return null
  }
}

function getRegionFromPath(pathname) {
  const match = pathname.match(/^\/regions\/([^/?#]+)/)
  return match?.[1] || 'none'
}

export default function AffiliateClickAnalytics() {
  useEffect(() => {
    const handleClick = (event) => {
      const target = event.target instanceof Element
        ? event.target.closest('a[href], [data-affiliate-partner]')
        : null

      if (!target) return

      const href = target.getAttribute('href') || target.dataset.affiliateHref || ''
      const partner = target.dataset.affiliatePartner || inferAffiliatePartner(href)
      if (!partner) return

      try {
        track('affiliate_click', {
          partner,
          placement: target.dataset.affiliatePlacement || 'content-link',
          page: window.location.pathname,
          region: target.dataset.affiliateRegion || getRegionFromPath(window.location.pathname)
        })
      } catch {
        // Analytics must never interrupt the outbound affiliate navigation.
      }
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])

  return null
}
