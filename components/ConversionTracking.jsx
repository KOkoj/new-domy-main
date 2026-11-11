'use client'

import { useEffect } from 'react'
import {
  resolveClickEvent
} from '@/lib/conversionTracking'
import { captureLandingCampaign, trackClientEvent } from '@/lib/trackClientEvent'

function isIgnoredClickTarget(target) {
  return Boolean(
    target.closest('[data-testid="favorite-button"], [data-no-track]')
  )
}

export default function ConversionTracking() {
  useEffect(() => {
    captureLandingCampaign()

    const handleClick = (event) => {
      try {
        const target = event.target instanceof Element ? event.target : null
        if (!target || isIgnoredClickTarget(target)) return

        const clickable = target.closest('a[href], [data-track-href]')
        if (!clickable) return

        const href = clickable.getAttribute('href') || clickable.getAttribute('data-track-href') || ''
        const resolved = resolveClickEvent({
          href,
          pathname: window.location.pathname,
          inConcierge: Boolean(target.closest('[data-testid="hero-concierge-contact"]')),
          inFooter: Boolean(target.closest('footer')),
          dataLocation: clickable.dataset.trackLocation || target.closest('[data-track-location]')?.dataset.trackLocation
        })
        if (!resolved) return

        trackClientEvent(resolved.name, { location: resolved.location })
      } catch {
        // Analytics must never interrupt the original click.
      }
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])

  return null
}
