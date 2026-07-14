import { NextResponse } from 'next/server'
import { createRouteSupabaseClient, getAuthenticatedUser } from '@/lib/serverAuth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())
}

async function logEmailAttempt(supabaseAdmin, { userId, emailType, recipientEmail, subject, result, metadata }) {
  if (!supabaseAdmin || !recipientEmail) return

  try {
    const { error } = await supabaseAdmin.from('email_logs').insert({
      user_id: userId || null,
      email_type: emailType,
      recipient_email: recipientEmail,
      subject,
      status: result?.success ? 'sent' : 'failed',
      error_message: result?.success ? null : result?.error || result?.message || 'Unknown email error',
      metadata: metadata || null
    })

    if (error) {
      console.error(`[INQUIRIES] Could not write ${emailType} email log:`, error.message)
    }
  } catch (logError) {
    console.error(`[INQUIRIES] Could not write ${emailType} email log:`, logError.message)
  }
}

// Inquiries can be submitted by anonymous visitors; the user lookup only
// gates who the confirmation email is addressed to, never the insert, and
// never whether it is sent (transactional emails fire regardless of auth
// state or marketing preferences).
export async function POST(request) {
  const { supabase, applyCookies } = await createRouteSupabaseClient()

  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const body = await request.json()
  const {
    listingId,
    name,
    email,
    message,
    propertyTitle,
    phone,
    type = 'property',
    inquiryType,
    preferredDate,
    preferredTime,
    timezone
  } = body

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
        inquiryType: inquiryType || null,
        propertyTitle: propertyTitle || null,
      },
    ])
    .select()
    .single()

  if (error) {
    return applyCookies(NextResponse.json({ error: error.message }, { status: 500 }))
  }

  // Never let a SendGrid hiccup lose a lead: the insert above already
  // succeeded, so emails below are best-effort and always logged.
  let supabaseAdmin = null
  try {
    const { getSupabaseAdminClient } = await import('@/lib/supabaseAdmin')
    supabaseAdmin = getSupabaseAdminClient()
  } catch (adminError) {
    console.error('[INQUIRIES] Admin client unavailable for email logging:', adminError.message)
  }

  try {
    const { default: emailService } = await import('@/lib/emailService')

    const adminNotificationResult = await emailService.sendAdminInquiryNotification({
      type,
      name,
      email,
      phone,
      message,
      // Only real property inquiries carry a meaningful title; other types
      // send a placeholder title just for the admin list view.
      propertyTitle: type === 'property' ? propertyTitle : null
    })

    await logEmailAttempt(supabaseAdmin, {
      userId: user?.id || null,
      emailType: 'inquiry_admin_notification',
      recipientEmail: process.env.ADMIN_NOTIFY_EMAIL || null,
      subject: `New inquiry notification (${type})`,
      result: adminNotificationResult,
      metadata: { inquiryId: data?.id, type, listingId: listingId || null }
    })

    if (!adminNotificationResult?.success) {
      console.error('[INQUIRIES] Admin notification email failed:', adminNotificationResult?.error)
    }
  } catch (adminEmailError) {
    console.error('[INQUIRIES] Failed to send admin notification email:', adminEmailError)
    await logEmailAttempt(supabaseAdmin, {
      userId: user?.id || null,
      emailType: 'inquiry_admin_notification',
      recipientEmail: process.env.ADMIN_NOTIFY_EMAIL || null,
      subject: `New inquiry notification (${type})`,
      result: { success: false, error: adminEmailError.message },
      metadata: { inquiryId: data?.id, type, listingId: listingId || null }
    })
  }

  if (isValidEmail(email)) {
    try {
      const { default: emailService } = await import('@/lib/emailService')

      const confirmationResult = await emailService.sendInquiryConfirmation({
        userEmail: email,
        userName: name,
        type,
        propertyTitle: propertyTitle || (listingId ? `Property ${listingId}` : null),
        inquiryMessage: message,
        preferredDate,
        preferredTime,
        timezone
      })

      await logEmailAttempt(supabaseAdmin, {
        userId: user?.id || null,
        emailType: 'inquiry_confirmation',
        recipientEmail: email,
        subject: `Inquiry confirmation (${type})`,
        result: confirmationResult,
        metadata: { inquiryId: data?.id, type, listingId: listingId || null }
      })

      if (!confirmationResult?.success) {
        console.error('Failed to send inquiry confirmation email:', confirmationResult?.error)
      }
    } catch (emailError) {
      // Don't fail the inquiry if the confirmation email fails.
      console.error('Failed to send inquiry confirmation email:', emailError)
      await logEmailAttempt(supabaseAdmin, {
        userId: user?.id || null,
        emailType: 'inquiry_confirmation',
        recipientEmail: email,
        subject: `Inquiry confirmation (${type})`,
        result: { success: false, error: emailError.message },
        metadata: { inquiryId: data?.id, type, listingId: listingId || null }
      })
    }
  }

  return applyCookies(NextResponse.json({ success: true, data }))
}
