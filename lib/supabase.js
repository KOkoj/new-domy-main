import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let supabaseClient = null

if (supabaseUrl && supabaseAnonKey) {
  supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
} else if (typeof window !== 'undefined') {
  console.warn(
    '[Supabase] Missing environment variables: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
    'Auth and database features will be unavailable.'
  )
}

export const supabase = supabaseClient

// Helper function to toggle favorites
export const toggleFavorite = async (userId, listingId) => {
  // Check if already favorited
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('listing_id', listingId)
    .single()

  if (existing) {
    // Remove from favorites
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('listing_id', listingId)
    
    return { favorited: false, error }
  } else {
    // Add to favorites
    const { error } = await supabase
      .from('favorites')
      .insert([{ user_id: userId, listing_id: listingId }])
    
    return { favorited: true, error }
  }
}

export default supabase