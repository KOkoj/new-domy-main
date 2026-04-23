'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getMarketingConsentUiCopy } from '@/lib/marketingConsent'
import { supabase } from '@/lib/supabase'

export default function FreePdfUpsellModal({
  open,
  onOpenChange,
  language = 'it',
  copy,
  user,
  premiumProductKey = 'premium-domy',
  sourcePath
}) {
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(false)
  const [hasMarketingConsent, setHasMarketingConsent] = useState(false)
  const [consentChecked, setConsentChecked] = useState(false)
  const [isSavingConsent, setIsSavingConsent] = useState(false)
  const [consentError, setConsentError] = useState('')
  const [comingSoonMessage, setComingSoonMessage] = useState('')

  const legalCopy = useMemo(() => getMarketingConsentUiCopy(language), [language])
  useEffect(() => {
    if (!open) {
      setConsentChecked(false)
      setConsentError('')
      setComingSoonMessage('')
      return
    }

    if (!user?.id) {
      setHasMarketingConsent(false)
      setIsLoadingPrefs(false)
      return
    }

    let cancelled = false
    const loadPreferences = async () => {
      try {
        setIsLoadingPrefs(true)
        setConsentError('')
        if (!supabase) throw new Error('Supabase client not available')
        const { data } = await supabase
          .from('notification_preferences')
          .select('marketing_emails')
          .eq('user_id', user.id)
          .maybeSingle()

        if (!cancelled) setHasMarketingConsent(data?.marketing_emails === true)
      } catch {
        if (!cancelled) {
          setHasMarketingConsent(false)
        }
      } finally {
        if (!cancelled) setIsLoadingPrefs(false)
      }
    }

    loadPreferences()
    return () => {
      cancelled = true
    }
  }, [open, user?.id])

  const shouldShowConsentCheckbox = Boolean(user?.id) && !isLoadingPrefs && !hasMarketingConsent

  const handleContinue = async () => {
    setConsentError('')

    if (shouldShowConsentCheckbox && consentChecked) {
      try {
        setIsSavingConsent(true)
        const response = await fetch('/api/marketing-consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            granted: true,
            language,
            source: 'free-pdf-popup',
            sourcePath
          })
        })

        const payload = await response.json().catch(() => ({}))
        if (!response.ok || payload?.success !== true) {
          throw new Error(payload?.error || 'Unable to save consent')
        }

        setHasMarketingConsent(true)
      } catch (error) {
        setConsentError(error?.message || 'Errore salvataggio consenso')
        return
      } finally {
        setIsSavingConsent(false)
      }
    }

    setComingSoonMessage(
      language === 'cs'
        ? 'Prémiové PDF budou dostupné brzy.'
        : language === 'en'
          ? 'Premium PDFs will be available soon.'
          : 'Disponibile prossimamente.'
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            {copy.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-slate-700 leading-relaxed">{copy.body}</p>
          <ul className="space-y-2">
            {copy.bullets.map((item) => (
              <li key={item} className="text-sm text-slate-800 flex items-start gap-2">
                <span className="mt-0.5 text-amber-600">-</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {user?.id ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 space-y-2">
              {isLoadingPrefs ? (
                <p className="text-xs text-slate-600">
                  {language === 'cs'
                    ? 'Ověřujeme nastavení e-mailů...'
                    : language === 'it'
                      ? 'Verifica preferenze email in corso...'
                      : 'Checking email preferences...'}
                </p>
              ) : hasMarketingConsent ? (
                <p className="text-xs text-emerald-700">
                  {language === 'cs'
                    ? 'Marketingový souhlas už máte aktivní. Můžete ho kdykoli změnit v nastavení účtu.'
                    : language === 'it'
                      ? 'Il consenso marketing è già attivo. Puoi modificarlo in qualsiasi momento nelle preferenze account.'
                      : 'Marketing consent is already active. You can change it anytime in your account preferences.'}
                </p>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="free-pdf-marketing-consent"
                      checked={consentChecked}
                      onCheckedChange={(checked) => setConsentChecked(checked === true)}
                      className="mt-0.5 border-amber-400 bg-white data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                    />
                    <label
                      htmlFor="free-pdf-marketing-consent"
                      className="text-xs leading-relaxed text-slate-700 cursor-pointer"
                    >
                      {legalCopy.checkboxLabel}
                    </label>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {legalCopy.helper}{' '}
                    <Link href="/gdpr" className="underline text-slate-800" target="_blank" rel="noopener noreferrer">
                      {legalCopy.legalLinkLabel}
                    </Link>
                  </p>
                </>
              )}
              {consentError ? (
                <p className="text-xs text-red-700">{consentError}</p>
              ) : null}
              {comingSoonMessage ? (
                <p className="text-xs font-semibold text-amber-800">{comingSoonMessage}</p>
              ) : null}
            </div>
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                {legalCopy.anonymousNote}{' '}
                <Link href="/gdpr" className="underline text-slate-800" target="_blank" rel="noopener noreferrer">
                  {legalCopy.legalLinkLabel}
                </Link>
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              onClick={handleContinue}
              disabled={isSavingConsent}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              {isSavingConsent
                ? (language === 'cs' ? 'Ukládám...' : language === 'it' ? 'Salvataggio...' : 'Saving...')
                : copy.cta}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-300 text-slate-700"
            >
              {copy.secondary}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
