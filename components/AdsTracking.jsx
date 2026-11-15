'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ADS_CONFIG, hasAnyAdsTag } from '@/lib/adsConfig'
import {
  CONSENT_EVENT,
  applyGoogleConsent,
  applySklikConsent,
  getConsent,
  setConsent,
  syncAttributionStorage,
  trackSklikPageView
} from '@/lib/adsTracking'
import { consentCopy } from '@/lib/consentCopy'

function currentLanguage() {
  try {
    return localStorage.getItem('preferred-language') || document.documentElement.lang || 'cs'
  } catch {
    return 'cs'
  }
}

// Mounted once in the root layout. Renders nothing (and loads nothing) until an
// ID env var is set; tags load only after the visitor clicks "allow".
export default function AdsTracking() {
  const enabled = hasAnyAdsTag(ADS_CONFIG)
  const pathname = usePathname()
  const [consent, setConsentState] = useState('loading')
  const [promptOpen, setPromptOpen] = useState(false)
  const [language, setLanguage] = useState('cs')
  const firstPath = useRef(true)

  useEffect(() => {
    if (!enabled) return undefined
    const initial = getConsent()
    setConsentState(initial || 'unset')
    setPromptOpen(!initial)
    setLanguage(currentLanguage())

    const onConsent = (event) => setConsentState(event.detail || getConsent() || 'unset')
    const onLanguage = (event) => setLanguage(event.detail || currentLanguage())
    // Any element with data-consent-open (e.g. a future "Nastavení cookies"
    // footer link) reopens the prompt so consent can be withdrawn.
    const onClick = (event) => {
      const target = event.target instanceof Element ? event.target.closest('[data-consent-open]') : null
      if (!target) return
      event.preventDefault()
      setPromptOpen(true)
    }
    window.addEventListener(CONSENT_EVENT, onConsent)
    window.addEventListener('languageChange', onLanguage)
    document.addEventListener('click', onClick)
    return () => {
      window.removeEventListener(CONSENT_EVENT, onConsent)
      window.removeEventListener('languageChange', onLanguage)
      document.removeEventListener('click', onClick)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled || consent === 'loading') return
    applyGoogleConsent(consent)
    applySklikConsent(consent)
    syncAttributionStorage()
  }, [enabled, consent])

  useEffect(() => {
    if (!enabled) return
    if (firstPath.current) {
      firstPath.current = false
      return
    }
    trackSklikPageView()
  }, [enabled, pathname])

  const choose = useCallback((value) => {
    setConsent(value)
    setConsentState(value)
    setPromptOpen(false)
  }, [])

  if (!enabled || !ADS_CONFIG.consentPromptEnabled || !promptOpen || consent === 'loading') return null

  const copy = consentCopy(language)
  return (
    <aside className="dvi-consent" role="dialog" aria-live="polite" aria-label={copy.label} data-testid="consent-prompt" data-no-track>
      <p className="dvi-consent__text">
        {copy.text}{' '}
        <a href="/cookies" className="dvi-consent__more">{copy.more}</a>
      </p>
      <div className="dvi-consent__actions">
        <button type="button" onClick={() => choose('denied')} className="dvi-consent__btn" data-testid="consent-decline">{copy.decline}</button>
        <button type="button" onClick={() => choose('granted')} className="dvi-consent__btn dvi-consent__btn--primary" data-testid="consent-accept">{copy.accept}</button>
      </div>
    </aside>
  )
}
