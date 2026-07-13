import { NextResponse } from 'next/server'
import { createRouteSupabaseClient, getAuthenticatedUser } from '@/lib/serverAuth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Inquiries can be submitted by anonymous visitors; the user lookup only
// gates the confirmation email, never the insert.
export async function POST(request) {
  const { supabase, applyCookies } = await createRouteSupabaseClient()

  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const body = await request.json()
  const { listingId, name, email, message, propertyTitle, phone, type = 'property' } = body

  const user = await getAuthenticatedUser(supabase)

  const { data, error } = await supabase
    .from('inquiries')
    .insert([
      {
        listingId: listingId || null,
        name,
        email,
        message,
        userId: user?.id || null,
        phone: phone || null,
        type,
      },
    ])
    .select()
    .single()

  if (error) {
    return applyCookies(NextResponse.json({ error: error.message }, { status: 500 }))
  }

  if (user) {
    try {
      const { data: preferences } = await supabase
        .from('notification_preferences')
        .select('inquiry_responses, email_enabled')
        .eq('user_id', user.id)
        .single()

      if (!preferences || (preferences.inquiry_responses && preferences.email_enabled)) {
        const { default: emailService } = await import('@/lib/emailService')

        await emailService.sendInquiryConfirmation({
          userEmail: email,
          userName: name,
          propertyTitle: propertyTitle || `Property ${listingId}`,
          inquiryMessage: message,
        })
      }
    } catch (emailError) {
      // Don't fail the inquiry if the confirmation email fails.
      console.error('Failed to send inquiry confirmation email:', emailError)
    }
  }

  return applyCookies(NextResponse.json({ success: true, data }))
}
