import { client, FEATURED_PROPERTIES_QUERY, ALL_PROPERTIES_QUERY, PROPERTY_BY_SLUG_QUERY } from '@/lib/sanity'
import { getLocalProperties, getLocalPropertyBySlug } from '@/lib/localPropertiesStore'
import { mergePropertyRecords, isDisplayableProperty } from '@/lib/propertyTransform'

export function hasSanityConfig() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

  return Boolean(projectId && dataset && projectId !== 'placeholder')
}

function getPropertyMergeKey(property) {
  return property?.slug?.current || property?._id || null
}

function mergePropertyCollections(primary = [], secondary = []) {
  const merged = []
  const seen = new Set()

  for (const property of [...primary, ...secondary]) {
    const key = getPropertyMergeKey(property)
    if (key && seen.has(key)) continue
    if (key) seen.add(key)
    merged.push(property)
  }

  return merged
}

function getPropertyTimestamp(property) {
  const value = property?._createdAt || property?._updatedAt || property?.createdAt || property?.updatedAt
  const timestamp = Date.parse(value || '')
  return Number.isFinite(timestamp) ? timestamp : 0
}

function sortPropertiesByNewest(properties = []) {
  return [...properties].sort((a, b) => {
    const pinDifference = (Number(a?.pinnedRank) || 0) - (Number(b?.pinnedRank) || 0)
    if (a?.pinnedRank || b?.pinnedRank) {
      if (!a?.pinnedRank) return 1
      if (!b?.pinnedRank) return -1
      if (pinDifference !== 0) return pinDifference
    }
    return getPropertyTimestamp(b) - getPropertyTimestamp(a)
  })
}

async function resolveLocalPropertyBySlug(slug) {
  return (
    await getLocalPropertyBySlug(slug).catch((err) => {
      console.error('[propertyApi] getLocalPropertyBySlug failed:', err?.message || err)
      return null
    }) ||
    await getLocalPropertyBySlug(decodeURIComponent(slug)).catch((err) => {
      console.error('[propertyApi] getLocalPropertyBySlug (decoded) failed:', err?.message || err)
      return null
    })
  )
}

export async function getAllProperties(searchParams) {
  const featured = searchParams.get('featured') === 'true'
  const propertyType = searchParams.get('type')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const city = searchParams.get('city')
  const search = searchParams.get('search')

  let properties = []
  const localProperties = await getLocalProperties().catch((err) => {
    console.error('[propertyApi] getLocalProperties failed:', err?.message || err)
    return []
  })

  if (!hasSanityConfig()) {
    properties = localProperties
  } else {
    const query = featured ? FEATURED_PROPERTIES_QUERY : ALL_PROPERTIES_QUERY
    const sanityProperties = await client.fetch(query).catch((err) => {
      console.error('[propertyApi] Sanity fetch failed:', err?.message || err)
      return []
    })
    properties = mergePropertyCollections(localProperties, Array.isArray(sanityProperties) ? sanityProperties : [])
  }

  let filteredProperties = Array.isArray(properties) ? properties : []

  filteredProperties = filteredProperties.filter(isDisplayableProperty)

  if (propertyType) {
    filteredProperties = filteredProperties.filter((property) => property.propertyType === propertyType)
  }

  if (minPrice) {
    filteredProperties = filteredProperties.filter((property) => property.price.amount >= parseInt(minPrice, 10))
  }

  if (maxPrice) {
    filteredProperties = filteredProperties.filter((property) => property.price.amount <= parseInt(maxPrice, 10))
  }

  if (city) {
    filteredProperties = filteredProperties.filter(
      (property) =>
        property.location?.city?.slug?.current === city ||
        property.location?.city?.name?.en?.toLowerCase().includes(city.toLowerCase())
    )
  }

  if (search) {
    const searchLower = search.toLowerCase()
    filteredProperties = filteredProperties.filter(
      (property) =>
        property.title?.en?.toLowerCase().includes(searchLower) ||
        property.title?.it?.toLowerCase().includes(searchLower) ||
        property.description?.en?.toLowerCase().includes(searchLower) ||
        property.description?.it?.toLowerCase().includes(searchLower) ||
        property.location?.city?.name?.en?.toLowerCase().includes(searchLower)
    )
  }

  return sortPropertiesByNewest(filteredProperties)
}

export async function getPropertyBySlug(slug) {
  const localProperty = await resolveLocalPropertyBySlug(slug)
  let sanityProperty = null

  if (hasSanityConfig()) {
    sanityProperty = await client.fetch(PROPERTY_BY_SLUG_QUERY, { slug }).catch((err) => {
      console.error('[propertyApi] Sanity getPropertyBySlug failed:', err?.message || err)
      return null
    })
  }

  const property = mergePropertyRecords(sanityProperty, localProperty)

  if (!property || !isDisplayableProperty(property)) {
    return null
  }

  return property
}
