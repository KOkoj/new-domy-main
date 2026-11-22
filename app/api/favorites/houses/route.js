import { NextResponse } from 'next/server'
import { createRouteSupabaseClient, getAuthenticatedUser } from '@/lib/serverAuth'
import { resolveZoneHouses } from '@/lib/zoneHouses'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Client zone: the user's saved houses, resolved by id on the server
// (lib/zoneHouses) instead of the old client-side join with the whole
// /api/properties inventory.
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

  const rows = (favorites || []).filter((favorite) => favorite.listing_id)
  if (rows.length === 0) {
    return applyCookies(NextResponse.json([], { headers: { 'Cache-Control': 'no-store' } }))
  }

  const houseById = await resolveZoneHouses(rows.map((row) => row.listing_id))

  const houses = []
  const seen = new Set()
  for (const row of rows) {
    const house = houseById.get(row.listing_id)
    if (!house || seen.has(house.id)) continue
    seen.add(house.id)
    houses.push({ ...house, savedAt: row.created_at })
  }

  return applyCookies(NextResponse.json(houses, { headers: { 'Cache-Control': 'no-store' } }))
}
