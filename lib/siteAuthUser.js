'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// Shared "who is signed in" state for public pages (header, homepage hero).
//
// The dashboard decides access from the server (`/api/auth/session`, which
// reads the session cookies with the SSR client and refreshes them). Public
// pages used to ask the browser Supabase client instead, with an async
// onAuthStateChange callback that awaited `supabase.from()` while auth-js held
// its auth lock. That is a known auth-js deadlock: every later auth call on the
// shared browser client (getUser in the homepage hero, the header check) could
// hang forever, so the page kept its initial logged-out state while the
// dashboard (server source) still showed the user as signed in. Pages restored
// from the back/forward cache also kept the pre-login header.
//
// This module therefore uses the same server source as the dashboard, with one
// shared request per page view, and skips the request entirely for visitors
// without a Supabase auth cookie (no extra work for anonymous traffic, pages
// stay static/cacheable as before).

export const AUTH_CHANGED_EVENT = 'site-auth-changed'

const AUTH_COOKIE_PATTERN = /(?:^|;\s*)sb-[^=;]+-auth-token(?:\.\d+)?=/

let inflight = null
let cached = { user: undefined, at: 0 }
const CACHE_MS = 5000

function hasAuthCookie() {
  if (typeof document === 'undefined') return false
  return AUTH_COOKIE_PATTERN.test(document.cookie || '')
}

function normalizeServerUser(payloadUser) {
  if (!payloadUser?.id) return null
  return {
    id: payloadUser.id,
    email: payloadUser.email || '',
    user_metadata: payloadUser.user_metadata || {}
  }
}

async function fetchServerUser() {
  const response = await fetch('/api/auth/session', {
    cache: 'no-store',
    credentials: 'same-origin'
  })
  if (!response.ok) throw new Error(`session ${response.status}`)
  const payload = await response.json()
  return payload?.authenticated ? normalizeServerUser(payload.user) : null
}

async function fetchBrowserUser() {
  if (!supabase) return null
  // getSession reads the cookie locally (no lock-heavy network roundtrip);
  // only used when the server check itself fails (e.g. offline).
  const { data } = await supabase.auth.getSession()
  return data?.session?.user || null
}

export function resetSiteAuthUserCache() {
  inflight = null
  cached = { user: undefined, at: 0 }
}

export function loadSiteAuthUser({ force = false } = {}) {
  if (!hasAuthCookie()) {
    cached = { user: null, at: Date.now() }
    return Promise.resolve(null)
  }

  if (!force && cached.user !== undefined && Date.now() - cached.at < CACHE_MS) {
    return Promise.resolve(cached.user)
  }
  if (!force && inflight) return inflight

  inflight = fetchServerUser()
    .catch(() => fetchBrowserUser().catch(() => null))
    .then((user) => {
      cached = { user, at: Date.now() }
      return user
    })
    .finally(() => {
      inflight = null
    })

  return inflight
}

// Call after a sign-in/sign-out that happened without a page reload.
export function notifySiteAuthChanged(user) {
  if (typeof window === 'undefined') return
  if (user === undefined) {
    resetSiteAuthUserCache()
  } else {
    cached = { user: user || null, at: Date.now() }
  }
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT, { detail: { user } }))
}

export function useSiteAuthUser() {
  const [user, setUser] = useState(null)
  const [isResolved, setIsResolved] = useState(false)

  useEffect(() => {
    let active = true

    const refresh = (force = false) => {
      loadSiteAuthUser({ force }).then((nextUser) => {
        if (!active) return
        setUser(nextUser)
        setIsResolved(true)
      })
    }

    refresh()

    // Back/forward cache restores the old DOM + React state without running
    // effects again; re-check so the header reflects a login done meanwhile.
    const handlePageShow = (event) => {
      if (event.persisted) refresh(true)
    }
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    const handleAuthChanged = (event) => {
      const nextUser = event?.detail?.user
      if (nextUser === undefined) {
        refresh(true)
        return
      }
      setUser(nextUser || null)
      setIsResolved(true)
    }

    window.addEventListener('pageshow', handlePageShow)
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChanged)

    // Same-tab sign-in/out done by the browser client (e.g. other tabs via
    // storage). Synchronous callback only: never await Supabase calls here.
    let subscription = null
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_OUT') {
          cached = { user: null, at: Date.now() }
          if (active) {
            setUser(null)
            setIsResolved(true)
          }
        } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          setTimeout(() => refresh(true), 0)
        }
      })
      subscription = data?.subscription || null
    }

    return () => {
      active = false
      window.removeEventListener('pageshow', handlePageShow)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChanged)
      subscription?.unsubscribe()
    }
  }, [])

  return { user, setUser, isResolved }
}

export function getUserDisplayName(user, profile = null) {
  const metadata = user?.user_metadata || {}
  return (
    String(metadata.full_name || '').trim() ||
    String(metadata.name || '').trim() ||
    String(profile?.name || '').trim() ||
    user?.email ||
    ''
  )
}
