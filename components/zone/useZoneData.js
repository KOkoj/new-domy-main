'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getUserDisplayName, loadSiteAuthUser } from '@/lib/siteAuthUser'

const EMPTY = {
  loading: true,
  user: null,
  firstName: '',
  savedHouses: [],
  savedSearch: null,
  hasPurchases: false
}

function pickFirstName(profile, user) {
  // Same name source as the site header (#57); never greet by e-mail.
  const raw = getUserDisplayName(user, profile)
  if (!raw || raw.includes('@')) return ''
  return String(raw).trim().split(/\s+/)[0] || ''
}

export function formatSearchSummary(filters) {
  if (!filters || typeof filters !== 'object') return ''
  const parts = []
  if (filters.location) parts.push(filters.location)
  if (filters.maxPrice) parts.push(`do ${Number(filters.maxPrice).toLocaleString('cs-CZ')} €`)
  if (filters.type) parts.push(filters.type)
  return parts.join(' · ')
}

// Saved houses come pre-joined from the server (only the favorited listings),
// instead of downloading the whole property inventory in the browser.
async function loadSavedHouses() {
  const response = await fetch('/api/favorites/houses', { cache: 'no-store', credentials: 'same-origin' })
  if (!response.ok) return []
  const houses = await response.json()
  return Array.isArray(houses) ? houses : []
}

async function loadProfile() {
  const response = await fetch('/api/profile', { cache: 'no-store', credentials: 'same-origin' })
  if (!response.ok) return null
  const payload = await response.json()
  return payload?.profile || null
}

async function loadSavedSearch(userId) {
  if (!supabase) return null
  const { data } = await supabase
    .from('saved_searches')
    .select('id, name, filters, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
  return data?.[0] || null
}

async function loadHasPurchases(userId) {
  if (!supabase) return false
  const { count } = await supabase
    .from('premium_purchases')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'paid')
  return (count || 0) > 0
}

// The browser Supabase client takes an auth lock per query; if another tab
// holds it, sidebar extras must not keep the whole zone on the skeleton.
function withTimeout(promise, ms, fallback) {
  return Promise.race([promise, new Promise((resolve) => setTimeout(() => resolve(fallback), ms))])
}

// Last result, so switching between /dashboard and /dashboard/ulozene renders
// instantly and refreshes in the background.
let lastZoneData = null

export function useZoneData() {
  const [state, setState] = useState(() => lastZoneData || EMPTY)

  useEffect(() => {
    let cancelled = false
    const settle = (promise, fallback) =>
      Promise.resolve(promise).catch((error) => {
        console.error('Zone data load failed:', error)
        return fallback
      })

    async function load() {
      // Everything starts at once (no waterfall). The session comes from the
      // same shared server request the header uses (lib/siteAuthUser), not
      // from the browser auth client, whose lock can stall the page.
      const userPromise = settle(loadSiteAuthUser(), null)
      const housesPromise = settle(loadSavedHouses(), [])
      const userScoped = userPromise.then((user) => {
        if (!user) return [null, null, false]
        const needsProfile = !getUserDisplayName(user) || getUserDisplayName(user).includes('@')
        return Promise.all([
          needsProfile ? settle(loadProfile(), null) : null,
          withTimeout(settle(loadSavedSearch(user.id), null), 3000, null),
          withTimeout(settle(loadHasPurchases(user.id), false), 3000, false)
        ])
      })

      const [user, savedHouses, [profile, savedSearch, hasPurchases]] = await Promise.all([
        userPromise,
        housesPromise,
        userScoped
      ])
      if (cancelled) return
      const next = user
        ? { loading: false, user, firstName: pickFirstName(profile, user), savedHouses, savedSearch, hasPurchases }
        : { ...EMPTY, loading: false }
      lastZoneData = user ? next : null
      setState(next)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return state
}

export function formatPrice(amount, currency = 'EUR') {
  if (!amount) return ''
  const symbol = currency === 'EUR' ? '€' : currency
  return `${Number(amount).toLocaleString('cs-CZ')} ${symbol}`
}

export function formatListedAt(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `v nabídce od ${date.getDate()}. ${date.getMonth() + 1}. ${date.getFullYear()}`
}
