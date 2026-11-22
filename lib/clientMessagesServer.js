import { resolveZoneHouses } from '@/lib/zoneHouses'

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
