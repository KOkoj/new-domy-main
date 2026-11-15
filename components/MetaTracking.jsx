'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { CONSENT_EVENT, getConsent } from '@/lib/adsTracking'

function cookieValue(name) {
  return document.cookie.split('; ').find((item) => item.startsWith(`${name}=`))?.split('=')[1]
}

function newEventId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function PageTracker({ enabled }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!enabled || typeof window.fbq !== 'function') return
    const eventId = newEventId()
    window.fbq('track', 'PageView', {}, { eventID: eventId })
    fetch('/api/meta/events', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        eventName: 'PageView',
        eventId,
        eventSourceUrl: window.location.href,
        fbp: cookieValue('_fbp'),
        fbc: cookieValue('_fbc')
      }),
      keepalive: true
    }).catch(() => {})
  }, [enabled, pathname, searchParams])

  return null
}

// Meta stays switched off for the 3k plan (NEXT_PUBLIC_META_PIXEL_ID is empty).
// When it is ever set, it uses the shared consent from components/AdsTracking
// (one prompt for every tag); the Lead event is prepared in lib/adsTracking.
export default function MetaTracking() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  const [consent, setConsentState] = useState(null)
  const [pixelReady, setPixelReady] = useState(false)

  useEffect(() => {
    if (!pixelId) return undefined
    setConsentState(getConsent())
    const onConsent = (event) => setConsentState(event.detail || getConsent())
    window.addEventListener(CONSENT_EVENT, onConsent)
    return () => window.removeEventListener(CONSENT_EVENT, onConsent)
  }, [pixelId])

  if (!pixelId || consent !== 'granted') return null

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive" onReady={() => setPixelReady(true)}>
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');`}
      </Script>
      <Suspense fallback={null}><PageTracker enabled={pixelReady} /></Suspense>
    </>
  )
}
