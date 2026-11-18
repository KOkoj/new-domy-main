'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getSafeRedirectPath } from '@/lib/safeRedirect'

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}

// Is the Google provider switched on in Supabase? Checked on click, so the
// visitor gets a message instead of a Supabase error page while it is off.
async function isGoogleEnabled() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return false
  try {
    const response = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } })
    if (!response.ok) return true
    const settings = await response.json()
    return settings?.external?.google !== false
  } catch {
    return true
  }
}

/**
 * "Pokračovat přes Google": Supabase OAuth, back to /auth/callback which
 * exchanges the code and redirects to the safe `next` path only.
 */
export default function GoogleSignInButton({ label, nextPath = '/properties', className = '', onError }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (isLoading) return
    setIsLoading(true)
    onError?.('')
    try {
      if (!supabase || !(await isGoogleEnabled())) {
        onError?.('googleUnavailable')
        setIsLoading(false)
        return
      }
      const next = getSafeRedirectPath(nextPath, '/properties')
      const redirectTo = `${window.location.origin}/auth/callback?${new URLSearchParams({ next }).toString()}`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo }
      })
      if (error) {
        onError?.('googleUnavailable')
        setIsLoading(false)
      }
      // Success: the browser is leaving for Google.
    } catch {
      onError?.('googleUnavailable')
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={`flex w-full items-center justify-center gap-3 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 ${className}`}
      data-testid="auth-google-button"
    >
      <GoogleLogo />
      <span>{label}</span>
    </button>
  )
}
