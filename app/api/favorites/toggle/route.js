import { NextResponse } from 'next/server'
import { createRouteSupabaseClient, getAuthenticatedUser } from '@/lib/serverAuth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request) {
  const { supabase, applyCookies } = await createRouteSupabaseClient()

  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const user = await getAuthenticatedUser(supabase)
  if (!user) {
    return applyCookies(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  }

  const { listingId } = await request.json()
  if (!listingId) {
    return applyCookies(NextResponse.json({ error: 'listingId is required' }, { status: 400 }))
  }

  const { data: existing, error: checkError } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('listing_id', listingId)
    .maybeSingle()

  if (checkError) {
    console.error('Error checking favorite:', checkError)
    return applyCookies(NextResponse.json({ error: checkError.message }, { status: 500 }))
  }

  if (existing) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('listing_id', listingId)

    if (error) {
      console.error('Error deleting favorite:', error)
      return applyCookies(NextResponse.json({ error: error.message }, { status: 500 }))
    }

    return applyCookies(NextResponse.json({ favorited: false }))
  }

  const { error } = await supabase
    .from('favorites')
    .insert([{ user_id: user.id, listing_id: listingId }])

  if (error) {
    console.error('Error adding favorite:', error)
    return applyCookies(NextResponse.json({ error: error.message }, { status: 500 }))
  }

  return applyCookies(NextResponse.json({ favorited: true }))
}
