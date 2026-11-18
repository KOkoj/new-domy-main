import { NextResponse } from 'next/server'
import { createRouteSupabaseClient, getAuthenticatedUser } from '@/lib/serverAuth'
import { client, ALL_PROPERTIES_QUERY } from '@/lib/sanity'
import { getLocalPropertyBySlug } from '@/lib/localPropertiesStore'
import { hasSanityConfig } from '@/lib/propertyApi'
import { mergePropertyRecords, isDisplayableProperty } from '@/lib/propertyTransform'
import { filterListableProperties } from '@/lib/getPropertyImage'
import { resolvePropertyId } from '@/lib/propertyAliases'
import { mapApiPropertyForDashboard, localizedField } from '@/lib/dashboardListings'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Client zone: the user's saved houses, resolved by id on the server.
// Replaces the old client-side join of /api/favorites with the whole
// /api/properties inventory (~1.3 MB, ~1.5 s server time) — only the
// favorited listings are looked up here.
const FAVORITES_QUERY = ALL_PROPERTIES_QUERY.replace(
  '!(_id in path("drafts.**"))]',
  '!(_id in path("drafts.**")) && (_id in $ids || slug.current in $keys)]'
)

export async function GET() {
  const { supabase, applyCookies } = await createRouteSupabaseClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const user = await getAuthenticatedUser(supabase)
  if (!user) {
    return applyCookies(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  }

  const { data: favorites, error } = await supabase
    .from('favorites')
    .select('listing_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return applyCookies(NextResponse.json({ error: error.message }, { status: 500 }))
  }

  const rows = (favorites || [])
    .map((favorite) => ({ key: resolvePropertyId(favorite.listing_id), savedAt: favorite.created_at }))
    .filter((row) => row.key)

  if (rows.length === 0) {
    return applyCookies(NextResponse.json([], { headers: { 'Cache-Control': 'no-store' } }))
  }

  const keys = [...new Set(rows.map((row) => row.key))]
  const localByKey = new Map()
  await Promise.all(
    keys.map(async (key) => {
      const local = await getLocalPropertyBySlug(key).catch(() => null)
      if (local) localByKey.set(key, local)
    })
  )

  let sanityDocs = []
  if (hasSanityConfig()) {
    const slugKeys = [...new Set([...keys, ...[...localByKey.values()].map((p) => p?.slug?.current).filter(Boolean)])]
    sanityDocs = await client.fetch(FAVORITES_QUERY, { ids: keys, keys: slugKeys }).catch((err) => {
      console.error('[favorites/houses] Sanity fetch failed:', err?.message || err)
      return []
    })
    if (!Array.isArray(sanityDocs)) sanityDocs = []
  }

  const findSanity = (key, local) =>
    sanityDocs.find(
      (doc) => doc._id === key || doc.slug?.current === key || (local?.slug?.current && doc.slug?.current === local.slug.current)
    ) || null

  const houses = []
  const seen = new Set()
  for (const row of rows) {
    const local = localByKey.get(row.key) || null
    const property = mergePropertyRecords(findSanity(row.key, local), local)
    if (!property || !isDisplayableProperty(property)) continue
    if (filterListableProperties([property]).length === 0) continue
    const mapped = mapApiPropertyForDashboard(property)
    if (seen.has(mapped._id)) continue
    seen.add(mapped._id)
    houses.push({
      id: mapped._id,
      slug: mapped.slug,
      title: localizedField(mapped.titleI18n, 'cs'),
      region: localizedField(mapped.regionI18n, 'cs'),
      price: mapped.price,
      currency: mapped.currency || 'EUR',
      image: mapped.image,
      status: mapped.status || 'available',
      listedAt: mapped.createdAt,
      savedAt: row.savedAt
    })
  }

  return applyCookies(NextResponse.json(houses, { headers: { 'Cache-Control': 'no-store' } }))
}
