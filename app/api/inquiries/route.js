import { NextResponse } from 'next/server'
import { createRouteSupabaseClient, getAuthenticatedUser } from '@/lib/serverAuth'
import { trackServerEvent } from '@/lib/trackServerEvent'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())
}

const ALLOWED_INQUIRY_TYPES = new Set([
  'General Inquiry',
  'Property Viewing',
  'Purchase Consultation',
  'Legal Assistance',
  'Property Management',
  'Other'
])

function wasEmailDelivered(result) {
  return result?.success === true && result.provider !== 'simulation'
}

async function logEmailAttempt(supabaseAdmin, { userId, emailType, recipientEmail, subject, result, metadata }) {
  if (!supabaseAdmin || !recipientEmail) return

  try {
    const delivered = wasEmailDelivered(result)
    const { error } = await supabaseAdmin.from('email_logs').insert({
      user_id: userId || null,
      email_type: emailType,
      recipient_email: recipientEmail,
      subject,
      status: delivered ? 'sent' : 'failed',
      error_message: delivered
        ? null
        : result?.error || result?.message || 'Email provider did not accept delivery',
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

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

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

  if (!String(name || '').trim() || !isValidEmail(email) || !String(message || '').trim()) {
    return NextResponse.json(
      { error: 'Name, a valid email address, and message are required' },
      { status: 400 }
    )
  }

  if (type === 'general' && !ALLOWED_INQUIRY_TYPES.has(inquiryType)) {
    return NextResponse.json({ error: 'Invalid inquiry type' }, { status: 400 })
  }

  const user = await getAuthenticatedUser(supabase)

  const insertPayload = {
    listingId: listingId || null,
    name,
    email,
    message,
    userId: user?.id || null,
    phone: phone || null,
    type,
    inquiryType: inquiryType || null,
    propertyTitle: propertyTitle || null,
  }

  let { data, error } = await supabase.from('inquiries').insert([insertPayload]).select().single()

  if (error) {
    const isMissingMetadataColumn =
      error.code === '42703' ||
      error.code === 'PGRST204' ||
      /column .*(inquiryType|propertyTitle).* does not exist/i.test(error.message || '')

    if (isMissingMetadataColumn) {
      // db/add-inquiry-metadata-columns.sql hasn't been run yet. Never lose the
      // lead over a missing column: retry without the new fields.
      console.warn(
        '[INQUIRIES] inquiryType/propertyTitle columns missing (run db/add-inquiry-metadata-columns.sql). Retrying insert without them:',
        error.message
      )

      const fallbackPayload = { ...insertPayload }
      delete fallbackPayload.inquiryType
      delete fallbackPayload.propertyTitle

      const retry = await supabase.from('inquiries').insert([fallbackPayload]).select().single()
      data = retry.data
      error = retry.error
    }
  }

  if (error) {
    return applyCookies(NextResponse.json({ error: error.message }, { status: 500 }))
  }

  await trackServerEvent(request, 'inquiry_submit', { type: type || 'property' })

  // Save the lead before attempting delivery. Delivery failures are logged
  // below and reported in `failedDeliveries`, but do not fail the request.
  let supabaseAdmin = null
  let adminNotificationResult = null
  let confirmationResult = null

  try {
    const { getSupabaseAdminClient } = await import('@/lib/supabaseAdmin')
    supabaseAdmin = getSupabaseAdminClient()
  } catch (adminError) {
    console.error('[INQUIRIES] Admin client unavailable for email logging:', adminError.message)
  }

  try {
    const { default: emailService } = await import('@/lib/emailService')

    adminNotificationResult = await emailService.sendAdminInquiryNotification({
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

      confirmationResult = await emailService.sendInquiryConfirmation({
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
  } else {
    confirmationResult = { success: false, error: 'Invalid recipient email' }
  }

  const failedDeliveries = [
    !wasEmailDelivered(adminNotificationResult) ? 'admin_notification' : null,
    !wasEmailDelivered(confirmationResult) ? 'sender_confirmation' : null
  ].filter(Boolean)

  // The inquiry is stored, so the visitor must see a success state. A failed
  // notification is an operational problem for us (visible in the function
  // logs and in email_logs), never an error for the sender.
  if (failedDeliveries.length > 0) {
    console.error(
      `[INQUIRIES] Inquiry ${data?.id || '(unknown id)'} saved, but email delivery failed: ${failedDeliveries.join(', ')}`
    )
  }

  return applyCookies(
    NextResponse.json({
      success: true,
      inquirySaved: true,
      inquiryId: data?.id,
      data,
      emailDelivery: {
        adminNotification: adminNotificationResult?.provider || null,
        senderConfirmation: confirmationResult?.provider || null
      },
      failedDeliveries
    })
  )
}
