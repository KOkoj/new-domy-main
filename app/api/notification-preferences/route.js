import { NextResponse } from 'next/server'
import { createRouteSupabaseClient, getAuthenticatedUser } from '@/lib/serverAuth'
import { checkRateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

const defaultPreferences = {
  property_alerts: true,
  inquiry_responses: true,
  onboarding_emails: true,
  marketing_emails: false,
  frequency: 'daily',
  email_enabled: true
}

export async function GET() {
  try {
    const { supabase, applyCookies } = await createRouteSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Auth is not configured on server' }, { status: 503 })
    }

    const user = await getAuthenticatedUser(supabase)
    if (!user) {
      return applyCookies(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
    }

    const { data: preferences, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('Error fetching notification preferences:', error)
      return applyCookies(NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 }))
    }

    return applyCookies(NextResponse.json(preferences || defaultPreferences))
  } catch (error) {
    console.error('Error in notification-preferences GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { supabase, applyCookies } = await createRouteSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Auth is not configured on server' }, { status: 503 })
    }

    const user = await getAuthenticatedUser(supabase)
    if (!user) {
      return applyCookies(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
    }

    const rateLimit = checkRateLimit({
      request,
      bucket: 'notification-preferences',
      limit: 10,
      windowMs: 60 * 1000,
      identifier: user.id
    })

    if (!rateLimit.allowed) {
      return applyCookies(
        NextResponse.json(
          { error: 'Too many preference updates. Try again later.' },
          {
            status: 429,
            headers: {
              'Retry-After': String(rateLimit.retryAfterSeconds || 60)
            }
          }
        )
      )
    }

    const preferences = await request.json()

    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating notification preferences:', error)
      return applyCookies(NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 }))
    }

    return applyCookies(NextResponse.json(data))
  } catch (error) {
    console.error('Error in notification-preferences POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
