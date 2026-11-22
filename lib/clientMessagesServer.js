import { resolveZoneHouses } from '@/lib/zoneHouses'
import emailService from '@/lib/emailService'
import { canSendMessageNotification } from '@/lib/clientMessages'

export const MESSAGE_COLUMNS = 'id, client_id, author_kind, author_id, body, property_id, created_at, read_at'

// Message rows -> API shape with the attached house card (or null when the
// listing is gone / hidden).
export async function withHouses(rows = []) {
  const propertyIds = [...new Set(rows.map((row) => row.property_id).filter(Boolean))]
  const houses = propertyIds.length > 0 ? await resolveZoneHouses(propertyIds).catch(() => new Map()) : new Map()
  return rows.map((row) => ({
    id: row.id,
    authorKind: row.author_kind,
    body: row.body,
    propertyId: row.property_id || null,
    house: row.property_id ? houses.get(row.property_id) || null : null,
    createdAt: row.created_at,
    readAt: row.read_at || null
  }))
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value) {
  return UUID.test(String(value || ''))
}

// Notification e-mail; never throws. Outside Vercel production only the
// internal test inboxes receive it (lib/clientMessages canSendMessageNotification).
export async function notifyClient(admin, clientId, authorKind) {
  try {
    if (!emailService.isConfigured) {
      console.log('[client-messages] notification skipped: Resend not configured')
      return 'skipped'
    }
    const { data, error } = await admin.auth.admin.getUserById(clientId)
    const email = data?.user?.email
    if (error || !email) return 'skipped'
    if (!canSendMessageNotification(email, process.env)) {
      console.log('[client-messages] notification skipped: recipient not allowed outside production')
      return 'skipped'
    }
    const result = await emailService.sendClientMessageNotification({ userEmail: email, authorKind })
    return result?.success ? 'sent' : 'failed'
  } catch (error) {
    console.error('[client-messages] notification failed:', error?.message || error)
    return 'failed'
  }
}
