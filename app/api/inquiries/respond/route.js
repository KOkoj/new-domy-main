import { NextResponse } from 'next/server'
import emailService from '@/lib/emailService'
import { requireAdminApiAccess } from '@/lib/adminAuth'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())
}

export async function POST(request) {
  const access = await requireAdminApiAccess()
  if (!access.ok) return access.response

  try {
    const body = await request.json()
    const inquiryId = String(body?.inquiryId || '').trim()
    const responseText = String(body?.responseText || '').trim()

    if (!inquiryId || !responseText) {
      return NextResponse.json(
        { error: 'Missing inquiryId or responseText' },
        { status: 400 }
      )
    }

    if (!emailService.isConfigured) {
      return NextResponse.json(
        { error: 'Resend is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL to send real response emails.' },
        { status: 503 }
      )
    }

    let supabase = access.supabase
    try {
      supabase = getSupabaseAdminClient()
    } catch {
      // Fall back to the authenticated admin session client when the service role key is not configured.
    }
    const { data: inquiry, error: loadError } = await supabase
      .from('inquiries')
      .select('*')
      .eq('id', inquiryId)
      .maybeSingle()

    if (loadError) {
      return NextResponse.json({ error: loadError.message }, { status: 500 })
    }

    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    if (!isValidEmail(inquiry.email)) {
      return NextResponse.json(
        { error: 'Inquiry has an invalid recipient email' },
        { status: 400 }
      )
    }

    const result = await emailService.sendInquiryResponse({
      userEmail: inquiry.email,
      userName: inquiry.name,
      // Only pass a human-readable title. listingId is a slug (e.g.
      // "local-import-friuli-...-1779192847787") and must never leak into the
      // client-facing subject; with no title the email uses a generic subject.
      propertyTitle: body?.propertyTitle || inquiry.propertyTitle || null,
      inquiryMessage: inquiry.message,
      responseMessage: responseText
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || result.message || 'Failed to send response email' },
        { status: 502 }
      )
    }

    const { error: updateError } = await supabase
      .from('inquiries')
      .update({ responded: true })
      .eq('id', inquiryId)

    if (updateError) {
      const isMissingRespondedColumn =
        updateError.code === 'PGRST204' ||
        String(updateError.message || '').includes("'responded' column") ||
        String(updateError.message || '').includes('responded')

      if (isMissingRespondedColumn) {
        console.warn(
          '[INQUIRY RESPONSE] Email sent, but inquiry status was not persisted because the responded column is missing.'
        )

        return NextResponse.json({
          success: true,
          provider: result.provider,
          statusCode: result.statusCode,
          warning:
            'Response email sent, but the inquiry status could not be saved because the responded column is missing in Supabase.'
        })
      }

      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      provider: result.provider,
      statusCode: result.statusCode
    })
  } catch (error) {
    console.error('Error sending inquiry response:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
