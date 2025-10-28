import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to toggle favorites
export const toggleFavorite = async (userId, listingId) => {
  // Check if already favorited
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('userId', userId)
    .eq('listingId', listingId)
    .single()

  if (existing) {
    // Remove from favorites
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('userId', userId)
      .eq('listingId', listingId)
    
    return { favorited: false, error }
  } else {
    // Add to favorites
    const { error } = await supabase
      .from('favorites')
      .insert([{ userId, listingId }])
    
    return { favorited: true, error }
  }
}

export default supabase