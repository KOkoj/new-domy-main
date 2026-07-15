'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Download, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { t } from '@/lib/translations'

export default function EmailGateModal({ source, assetKey, className = '', language = 'cs' }) {
  const [authChecked, setAuthChecked] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const tr = (key) => t(`forms.emailGate.${key}`, language)

  useEffect(() => {
    let mounted = true
    fetch('/api/auth/session', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (mounted) setIsAuthenticated(Boolean(payload?.authenticated))
      })
      .catch(() => {
        if (mounted) setIsAuthenticated(false)
      })
      .finally(() => {
        if (mounted) setAuthChecked(true)
      })
    return () => {
      mounted = false
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source, consent })
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(tr('submitError'))
      }

      setSuccess(true)
      if (payload?.confirmed && payload?.redirectUrl) {
        window.location.assign(payload.redirectUrl)
      }
    } catch (submitError) {
      setError(submitError?.message || tr('submitError'))
    } finally {
      setSubmitting(false)
    }
  }

  if (!authChecked) {
    return (
      <div className={`rounded-xl border border-slate-200 bg-slate-50 p-5 ${className}`}>
        <p className="text-sm text-slate-600">{tr('checkingAuth')}</p>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <div className={`rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 ${className}`}>
        <p className="mb-4 text-sm text-emerald-900">
          {tr('authenticated')}
        </p>
        <Button asChild className="bg-slate-800 text-white hover:bg-slate-700">
          <a href={`/api/leads/download?asset=${encodeURIComponent(assetKey)}`}>
            <Download className="mr-2 h-4 w-4" />
            {tr('downloadPdf')}
          </a>
        </Button>
      </div>
    )
  }

  if (success) {
    return (
      <div
        className={`rounded-xl border border-emerald-200 bg-emerald-50/70 p-6 ${className}`}
        role="status"
      >
        <CheckCircle2 className="mb-3 h-8 w-8 text-emerald-600" />
        <h2 className="text-xl font-bold text-slate-900">{tr('checkEmailTitle')}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">{tr('checkEmailDescription')}</p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}
    >
      <div className="mb-4 flex items-center gap-2 text-slate-800">
        <Mail className="h-5 w-5" />
        <h2 className="text-lg font-bold">{tr('title')}</h2>
      </div>

      <label htmlFor={`lead-email-${source}`} className="mb-1.5 block text-sm font-medium text-slate-700">
        {tr('email')}
      </label>
      <input
        id={`lead-email-${source}`}
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder={tr('emailPlaceholder')}
        className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
      />

      <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-slate-700">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-slate-300"
        />
        <span>{tr('consent')}</span>
      </label>

      {error ? (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={submitting}
        className="mt-5 w-full bg-slate-800 text-white hover:bg-slate-700 sm:w-auto"
      >
        {submitting ? tr('submitting') : tr('submit')}
      </Button>
    </form>
  )
}
