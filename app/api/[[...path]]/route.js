import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { client } from '../../../lib/sanity.js'
import { FEATURED_PROPERTIES_QUERY, ALL_PROPERTIES_QUERY, PROPERTY_BY_SLUG_QUERY } from '../../../lib/sanity.js'

// Force dynamic rendering - don't pre-render this route during build
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getSupabaseClient() {
  const cookieStore = cookies()
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Handle all API routes
export async function GET(request, { params }) {
  const { path } = params
  const url = new URL(request.url)
  const searchParams = url.searchParams

  try {
    const supabase = getSupabaseClient()

    // Check if Supabase is configured
    if (!supabase && path && (path[0] === 'favorites' || path[0] === 'saved-searches' || path[0] === 'inquiries')) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }
    // Properties endpoints
    if (!path || path.length === 0 || (path.length === 1 && path[0] === 'properties')) {
      // Get all properties with optional filtering
      const featured = searchParams.get('featured') === 'true'
      const propertyType = searchParams.get('type')
      const minPrice = searchParams.get('minPrice')
      const maxPrice = searchParams.get('maxPrice')
      const city = searchParams.get('city')
      const search = searchParams.get('search')

      let query = ALL_PROPERTIES_QUERY
      
      if (featured) {
        query = FEATURED_PROPERTIES_QUERY
      }

      console.log('Fetching properties from Sanity with query:', query)
      const properties = await client.fetch(query)
      console.log(`Fetched ${properties.length} properties from Sanity`)
      
      // Apply additional filters if needed
      let filteredProperties = properties
      
      if (propertyType) {
        filteredProperties = filteredProperties.filter(p => p.propertyType === propertyType)
      }
      
      if (minPrice) {
        filteredProperties = filteredProperties.filter(p => p.price.amount >= parseInt(minPrice))
      }
      
      if (maxPrice) {
        filteredProperties = filteredProperties.filter(p => p.price.amount <= parseInt(maxPrice))
      }
      
      if (city) {
        filteredProperties = filteredProperties.filter(p => 
          p.location?.city?.slug?.current === city ||
          p.location?.city?.name?.en?.toLowerCase().includes(city.toLowerCase())
        )
      }
      
      if (search) {
        const searchLower = search.toLowerCase()
        filteredProperties = filteredProperties.filter(p => 
          p.title?.en?.toLowerCase().includes(searchLower) ||
          p.title?.it?.toLowerCase().includes(searchLower) ||
          p.description?.en?.toLowerCase().includes(searchLower) ||
          p.description?.it?.toLowerCase().includes(searchLower) ||
          p.location?.city?.name?.en?.toLowerCase().includes(searchLower)
        )
      }

      return NextResponse.json(filteredProperties)
    }

    if (path[0] === 'properties' && path[1]) {
      // Get single property by slug
      const slug = path[1]
      const property = await client.fetch(PROPERTY_BY_SLUG_QUERY, { slug })
      
      if (!property) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 })
      }
      
      return NextResponse.json(property)
    }

    // Favorites endpoints
    if (path[0] === 'favorites') {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { data: favorites, error } = await supabase
        .from('favorites')
        .select('listingId, createdAt')
        .eq('userId', user.id)
        .order('createdAt', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(favorites || [])
    }

    // Saved searches endpoints
    if (path[0] === 'saved-searches') {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { data: searches, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('userId', user.id)
        .order('createdAt', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(searches || [])
    }

    // Inquiries endpoints
    if (path[0] === 'inquiries') {
      const { data: inquiries, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('createdAt', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(inquiries || [])
    }

    return NextResponse.json({ message: 'Italian Properties API' })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  const { path } = params
  const body = await request.json()

  try {
    const supabase = getSupabaseClient()

    // Toggle favorite
    if (path[0] === 'favorites' && path[1] === 'toggle') {
      if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { listingId } = body
      
      // Check if already favorited
      const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('userId', user.id)
        .eq('listingId', listingId)
        .single()

      if (existing) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('userId', user.id)
          .eq('listingId', listingId)
        
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        
        return NextResponse.json({ favorited: false })
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert([{ userId: user.id, listingId }])
        
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        
        return NextResponse.json({ favorited: true })
      }
    }

    // Save search
    if (path[0] === 'saved-searches') {
      if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { name, filters } = body
      
      const { data, error } = await supabase
        .from('saved_searches')
        .insert([{ userId: user.id, name, filters }])
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(data)
    }

    // Submit inquiry
    if (path[0] === 'inquiries') {
      if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
      
      const { listingId, name, email, message, propertyTitle } = body
      
      // Get user if authenticated
      const { data: { user } } = await supabase.auth.getUser()
      
      const inquiryData = {
        listingId,
        name,
        email,
        message,
        userId: user?.id || null
      }

      const { data, error } = await supabase
        .from('inquiries')
        .insert([inquiryData])
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Send inquiry confirmation email if user has email notifications enabled
      if (user) {
        try {
          const { data: preferences } = await supabase
            .from('notification_preferences')
            .select('inquiry_responses, email_enabled')
            .eq('user_id', user.id)
            .single()

          if (!preferences || (preferences.inquiry_responses && preferences.email_enabled)) {
            // Import the email service dynamically to avoid circular imports
            const { default: emailService } = await import('@/lib/emailService')
            
            await emailService.sendInquiryConfirmation({
              userEmail: email,
              userName: name,
              propertyTitle: propertyTitle || `Property ${listingId}`,
              inquiryMessage: message
            })
          }
        } catch (emailError) {
          console.error('Failed to send inquiry confirmation email:', emailError)
          // Don't fail the inquiry if email fails
        }
      }

      return NextResponse.json({ success: true, data })
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const { path } = params
  const url = new URL(request.url)
  const id = url.searchParams.get('id')

  try {
    const supabase = getSupabaseClient()

    if (path[0] === 'saved-searches' && id) {
      if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', id)
        .eq('userId', user.id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
