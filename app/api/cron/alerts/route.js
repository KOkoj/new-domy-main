import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { client } from '@/lib/sanity'
import emailService from '@/lib/emailService'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Cron endpoint to check saved searches and send property alerts
 * Should be called periodically (e.g., daily via Vercel Cron or external scheduler)
 */
export async function GET(request) {
  // Optional: Add authentication/secret key for cron security
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('🔄 Starting property alerts cron job...')
    
    // 1. Fetch all active saved searches from Supabase
    const { data: savedSearches, error: searchError } = await supabase
      .from('saved_searches')
      .select('*')
      .eq('alertsEnabled', true) // Only process searches with alerts enabled
    
    if (searchError) {
      console.error('Error fetching saved searches:', searchError)
      return NextResponse.json({ 
        error: 'Failed to fetch saved searches',
        details: searchError.message 
      }, { status: 500 })
    }

    if (!savedSearches || savedSearches.length === 0) {
      console.log('✅ No active saved searches found')
      return NextResponse.json({ 
        success: true,
        message: 'No active saved searches to process',
        emailsSent: 0,
        searchesProcessed: 0
      })
    }

    console.log(`📊 Found ${savedSearches.length} saved searches to process`)

    // 2. Fetch all properties from Sanity
    const propertiesQuery = `*[_type == "listing" && status == "available"] {
      _id,
      title,
      slug,
      propertyType,
      price,
      specifications,
      location {
        city-> {
          name,
          slug
        }
      },
      _createdAt
    }`
    
    const allProperties = await client.fetch(propertiesQuery)
    console.log(`🏠 Fetched ${allProperties.length} available properties`)

    let emailsSent = 0
    let searchesProcessed = 0
    const errors = []

    // 3. Process each saved search
    for (const search of savedSearches) {
      try {
        searchesProcessed++
        
        // Get user details from Supabase
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email, name')
          .eq('id', search.userId)
          .single()
        
        if (userError || !userData) {
          console.error(`⚠️ User not found for search ${search.id}`)
          errors.push({ searchId: search.id, error: 'User not found' })
          continue
        }

        // Check notification preferences
        const { data: preferences } = await supabase
          .from('notification_preferences')
          .select('new_properties, email_enabled')
          .eq('user_id', search.userId)
          .single()

        // Skip if user has disabled notifications
        if (preferences && (!preferences.new_properties || !preferences.email_enabled)) {
          console.log(`⏭️ Skipping search ${search.id} - notifications disabled`)
          continue
        }

        // 4. Filter properties based on search criteria
        const filters = search.filters || {}
        const matchingProperties = allProperties.filter(property => {
          // Filter by property type
          if (filters.type && property.propertyType !== filters.type) {
            return false
          }

          // Filter by city
          if (filters.city && property.location?.city?.slug?.current !== filters.city) {
            return false
          }

          // Filter by price range
          if (filters.priceMin && property.price?.amount < filters.priceMin) {
            return false
          }
          if (filters.priceMax && property.price?.amount > filters.priceMax) {
            return false
          }

          // Filter by bedrooms
          if (filters.bedrooms && property.specifications?.bedrooms < filters.bedrooms) {
            return false
          }

          // Filter by bathrooms
          if (filters.bathrooms && property.specifications?.bathrooms < filters.bathrooms) {
            return false
          }

          // Only include properties created since last alert check
          // For MVP, we'll send all matches (you can add lastAlertSent logic later)
          return true
        })

        console.log(`🎯 Found ${matchingProperties.length} matches for search "${search.name}"`)

        // 5. Send email if there are matching properties
        if (matchingProperties.length > 0) {
          const emailResult = await emailService.sendPropertyAlert({
            userEmail: userData.email,
            userName: userData.name || 'there',
            properties: matchingProperties,
            searchCriteria: {
              type: filters.type || 'any',
              city: filters.city || 'any location',
              priceMin: filters.priceMin,
              priceMax: filters.priceMax,
              bedrooms: filters.bedrooms,
              bathrooms: filters.bathrooms
            }
          })

          if (emailResult.success) {
            emailsSent++
            console.log(`✅ Alert sent to ${userData.email}`)
            
            // Update last alert sent timestamp
            await supabase
              .from('saved_searches')
              .update({ 
                lastAlertSent: new Date().toISOString(),
                lastMatchCount: matchingProperties.length 
              })
              .eq('id', search.id)
          } else {
            console.error(`❌ Failed to send alert to ${userData.email}:`, emailResult.error)
            errors.push({ 
              searchId: search.id, 
              email: userData.email,
              error: emailResult.error || emailResult.message 
            })
          }
        } else {
          console.log(`⏭️ No new matches for search "${search.name}"`)
        }

      } catch (searchError) {
        console.error(`Error processing search ${search.id}:`, searchError)
        errors.push({ 
          searchId: search.id, 
          error: searchError.message 
        })
      }
    }

    console.log(`✅ Cron job completed: ${emailsSent} emails sent, ${searchesProcessed} searches processed`)

    return NextResponse.json({
      success: true,
      emailsSent,
      searchesProcessed,
      totalSearches: savedSearches.length,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Cron job failed:', error)
    return NextResponse.json({ 
      error: 'Cron job failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

/**
 * POST endpoint for manual triggering from admin panel
 */
export async function POST(request) {
  // Same logic as GET, but can be called manually
  return GET(request)
}
