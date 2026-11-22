import { client, ALL_PROPERTIES_QUERY } from '@/lib/sanity'
import { getLocalPropertyBySlug } from '@/lib/localPropertiesStore'
import { hasSanityConfig } from '@/lib/propertyApi'
import { mergePropertyRecords, isDisplayableProperty } from '@/lib/propertyTransform'
import { filterListableProperties } from '@/lib/getPropertyImage'
import { resolvePropertyId } from '@/lib/propertyAliases'
import { mapApiPropertyForDashboard, localizedField } from '@/lib/dashboardListings'

// Client zone house cards resolved by id on the server: only the requested
// listings are looked up (local inventory + one Sanity query), never the whole
// /api/properties inventory (~1.3 MB, ~1.5 s server time).
const HOUSES_BY_ID_QUERY = ALL_PROPERTIES_QUERY.replace(
  '!(_id in path("drafts.**"))]',
  '!(_id in path("drafts.**")) && (_id in $ids || slug.current in $keys)]'
)

export function toZoneHouse(property) {
  const mapped = mapApiPropertyForDashboard(property)
  return {
    id: mapped._id,
    slug: mapped.slug,
    title: localizedField(mapped.titleI18n, 'cs'),
    region: localizedField(mapped.regionI18n, 'cs'),
    price: mapped.price,
    currency: mapped.currency || 'EUR',
    image: mapped.image,
    status: mapped.status || 'available',
    listedAt: mapped.createdAt
  }
}

// Returns Map(original listing id -> zone house). Unknown, hidden or
// photo-less listings are left out.
export async function resolveZoneHouses(listingIds = []) {
  const keyById = new Map()
  for (const listingId of listingIds) {
    const key = resolvePropertyId(listingId)
    if (key) keyById.set(listingId, key)
  }
  const result = new Map()
  if (keyById.size === 0) return result

  const keys = [...new Set(keyById.values())]
  const localByKey = new Map()
  await Promise.all(
    keys.map(async (key) => {
      const local = await getLocalPropertyBySlug(key).catch(() => null)
      if (local) localByKey.set(key, local)
    })
  )

  let sanityDocs = []
  if (hasSanityConfig()) {
    const slugKeys = [...new Set([...keys, ...[...localByKey.values()].map((p) => p?.slug?.current).filter(Boolean)])]
    sanityDocs = await client.fetch(HOUSES_BY_ID_QUERY, { ids: keys, keys: slugKeys }).catch((err) => {
      console.error('[zoneHouses] Sanity fetch failed:', err?.message || err)
      return []
    })
    if (!Array.isArray(sanityDocs)) sanityDocs = []
  }

  const findSanity = (key, local) =>
    sanityDocs.find(
      (doc) => doc._id === key || doc.slug?.current === key || (local?.slug?.current && doc.slug?.current === local.slug.current)
    ) || null

  const houseByKey = new Map()
  for (const key of keys) {
    const local = localByKey.get(key) || null
    const property = mergePropertyRecords(findSanity(key, local), local)
    if (!property || !isDisplayableProperty(property)) continue
    if (filterListableProperties([property]).length === 0) continue
    houseByKey.set(key, toZoneHouse(property))
  }

  for (const [listingId, key] of keyById) {
    const house = houseByKey.get(key)
    if (house) result.set(listingId, house)
  }
  return result
}
