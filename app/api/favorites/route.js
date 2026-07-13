import { NextResponse } from 'next/server'
import { createRouteSupabaseClient, getAuthenticatedUser } from '@/lib/serverAuth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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

  const mapped = (favorites || []).map((favorite) => ({
    listingId: favorite.listing_id,
    createdAt: favorite.created_at,
  }))

  return applyCookies(NextResponse.json(mapped))
}
