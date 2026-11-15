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

function Toggle({ id, label, description, checked, disabled, onChange, testId }) {
  return (
    <div className="dvi-consent__row">
      <label className="dvi-consent__row-copy" htmlFor={id}>
        <span className="dvi-consent__row-label">{label}</span>
        <span className="dvi-consent__row-desc">{description}</span>
      </label>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        data-testid={testId}
        className={`dvi-consent__switch${checked ? ' is-on' : ''}${disabled ? ' is-disabled' : ''}`}
        onClick={() => {
          if (!disabled) onChange(!checked)
        }}
      >
        <span className="dvi-consent__knob" />
      </button>
    </div>
  )
}

// Mounted once in the root layout. Renders nothing (and loads nothing) until an
// ID env var is set; tags load only after the visitor grants the matching category.
export default function AdsTracking() {
  const enabled = hasAnyAdsTag(ADS_CONFIG)
  const pathname = usePathname()
  const [consent, setConsentState] = useState('loading')
  const [promptOpen, setPromptOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [draft, setDraft] = useState({ analytics: false, marketing: false })
  const [language, setLanguage] = useState('cs')
  const firstPath = useRef(true)

  useEffect(() => {
    if (!enabled) return undefined
    const initial = getConsent()
    setConsentState(initial || 'unset')
    setPromptOpen(!initial)
    setSettingsOpen(false)
    setDraft(parseInitialDraft(initial))
    setLanguage(currentLanguage())

    const onConsent = (event) => setConsentState(event.detail || getConsent() || 'unset')
    const onLanguage = (event) => setLanguage(event.detail || currentLanguage())
    const onClick = (event) => {
      const target = event.target instanceof Element ? event.target.closest('[data-consent-open]') : null
      if (!target) return
      event.preventDefault()
      const current = getConsent()
      setDraft(parseInitialDraft(current))
      setSettingsOpen(true)
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
    setConsentState(typeof value === 'object' ? (value.analytics && value.marketing ? 'granted' : value.analytics ? 'analytics' : value.marketing ? 'marketing' : 'denied') : value)
    setPromptOpen(false)
    setSettingsOpen(false)
  }, [])

  const openSettings = useCallback(() => {
    setDraft(parseInitialDraft(consent === 'unset' ? null : consent))
    setSettingsOpen(true)
  }, [consent])

  if (!enabled || !ADS_CONFIG.consentPromptEnabled || !promptOpen || consent === 'loading') return null

  const copy = consentCopy(language)
  return (
    <aside
      className={`dvi-consent${settingsOpen ? ' is-expanded' : ''}`}
      role="dialog"
      aria-live="polite"
      aria-label={copy.label}
      data-testid="consent-prompt"
      data-no-track
    >
      <p className="dvi-consent__title" data-testid="consent-title">{copy.title}</p>
      <p className="dvi-consent__text">
        {copy.text}{' '}
        <a href="/cookies" className="dvi-consent__more">{copy.more}</a>
      </p>

      {settingsOpen ? (
        <div className="dvi-consent__settings" data-testid="consent-settings">
          <Toggle
            id="dvi-consent-necessary"
            label={copy.necessary}
            description={copy.necessaryDesc}
            checked
            disabled
            onChange={() => {}}
            testId="consent-toggle-necessary"
          />
          <Toggle
            id="dvi-consent-analytics"
            label={copy.analytics}
            description={copy.analyticsDesc}
            checked={draft.analytics}
            onChange={(value) => setDraft((current) => ({ ...current, analytics: value }))}
            testId="consent-toggle-analytics"
          />
          <Toggle
            id="dvi-consent-marketing"
            label={copy.marketing}
            description={copy.marketingDesc}
            checked={draft.marketing}
            onChange={(value) => setDraft((current) => ({ ...current, marketing: value }))}
            testId="consent-toggle-marketing"
          />
          <button
            type="button"
            onClick={() => choose(draft)}
            className="dvi-consent__btn dvi-consent__btn--primary dvi-consent__btn--save"
            data-testid="consent-save"
          >
            {copy.save}
          </button>
        </div>
      ) : (
        <div className="dvi-consent__actions">
          <button type="button" onClick={openSettings} className="dvi-consent__btn" data-testid="consent-customize">{copy.customize}</button>
          <button type="button" onClick={() => choose('denied')} className="dvi-consent__btn" data-testid="consent-decline">{copy.decline}</button>
          <button type="button" onClick={() => choose('granted')} className="dvi-consent__btn dvi-consent__btn--primary" data-testid="consent-accept">{copy.accept}</button>
        </div>
      )}
    </aside>
  )
}

function parseInitialDraft(consent) {
  if (consent === 'granted') return { analytics: true, marketing: true }
  if (consent === 'analytics') return { analytics: true, marketing: false }
  if (consent === 'marketing') return { analytics: false, marketing: true }
  if (consent === 'denied') return { analytics: false, marketing: false }
  return { analytics: false, marketing: false }
}
