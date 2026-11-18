'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getDashboardUser } from '@/lib/dashboardAuth'
import { mapApiPropertyForDashboard, localizedField } from '@/lib/dashboardListings'
import { resolvePropertyId } from '@/lib/propertyAliases'
import { getUserDisplayName } from '@/lib/siteAuthUser'

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

async function loadSavedHouses() {
  const [favoritesResponse, propertiesResponse] = await Promise.all([
    fetch('/api/favorites', { cache: 'no-store' }),
    fetch('/api/properties')
  ])
  if (!favoritesResponse.ok) return []
  const favorites = await favoritesResponse.json()
  if (!Array.isArray(favorites) || favorites.length === 0) return []

  const rawProperties = propertiesResponse.ok ? await propertiesResponse.json() : []
  const properties = (Array.isArray(rawProperties) ? rawProperties : []).map(mapApiPropertyForDashboard)

  return favorites
    .map((favorite) => {
      const listingId = resolvePropertyId(favorite.listingId)
      const property = properties.find((p) => p._id === listingId || p.slug === listingId)
      if (!property) return null
      return {
        id: property._id,
        slug: property.slug,
        title: localizedField(property.titleI18n, 'cs'),
        region: localizedField(property.regionI18n, 'cs'),
        price: property.price,
        currency: property.currency || 'EUR',
        image: property.image,
        status: property.status || 'available',
        listedAt: property.createdAt,
        savedAt: favorite.createdAt
      }
    })
    .filter(Boolean)
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

export function useZoneData() {
  const [state, setState] = useState(EMPTY)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const user = await getDashboardUser(supabase)
      if (!user) {
        if (!cancelled) setState({ ...EMPTY, loading: false })
        return
      }
      const settle = (promise, fallback) => promise.catch((error) => {
        console.error('Zone data load failed:', error)
        return fallback
      })
      const [profile, savedHouses, savedSearch, hasPurchases] = await Promise.all([
        settle(fetch('/api/profile', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).then((p) => p?.profile || null), null),
        settle(loadSavedHouses(), []),
        settle(loadSavedSearch(user.id), null),
        settle(loadHasPurchases(user.id), false)
      ])
      if (cancelled) return
      setState({
        loading: false,
        user,
        firstName: pickFirstName(profile, user),
        savedHouses,
        savedSearch,
        hasPurchases
      })
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
