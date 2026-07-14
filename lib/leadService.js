import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { getLeadAssetStoragePath } from '@/lib/leadAssets'

export const LEAD_SIGNED_URL_TTL_SECONDS = 60 * 60

export async function createLeadAssetSignedUrl(asset) {
  const admin = getSupabaseAdminClient()
  const bucket = process.env.FREE_PDF_BUCKET || 'documents'
  const storagePath = getLeadAssetStoragePath(asset)

  const { data, error } = await admin.storage
    .from(bucket)
    .createSignedUrl(storagePath, LEAD_SIGNED_URL_TTL_SECONDS, {
      download: asset.downloadName
    })

  if (error || !data?.signedUrl) {
    throw new Error(`Unable to create free PDF URL: ${error?.message || 'unknown error'}`)
  }

  return data.signedUrl
}

export async function logLeadEmail({
  lead,
  emailType,
  subject,
  result,
  metadata = {}
}) {
  try {
    const admin = getSupabaseAdminClient()
    const { error } = await admin.from('email_logs').insert({
      user_id: lead.user_id || null,
      email_type: emailType,
      recipient_email: lead.email,
      subject,
      status: result?.success ? 'sent' : 'failed',
      error_message: result?.success ? null : result?.error || 'Unknown email error',
      metadata: {
        lead_id: lead.id,
        source: lead.source,
        provider: result?.provider || null,
        ...metadata
      }
    })

    if (error) {
      console.error('[LEADS] Could not write email log:', error.message)
    }
  } catch (error) {
    console.error('[LEADS] Could not write email log:', error.message)
  }
}
