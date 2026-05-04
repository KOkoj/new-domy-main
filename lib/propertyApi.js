import { client, FEATURED_PROPERTIES_QUERY, ALL_PROPERTIES_QUERY, PROPERTY_BY_SLUG_QUERY } from '@/lib/sanity'
import { getLocalProperties, getLocalPropertyBySlug } from '@/lib/localPropertiesStore'

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

export async function getAllProperties(searchParams) {
  const featured = searchParams.get('featured') === 'true'
  const propertyType = searchParams.get('type')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const city = searchParams.get('city')
  const search = searchParams.get('search')

  let properties = []
  const localProperties = await getLocalProperties().catch(() => [])

  if (!hasSanityConfig()) {
    properties = localProperties
  } else {
    const query = featured ? FEATURED_PROPERTIES_QUERY : ALL_PROPERTIES_QUERY
    const sanityProperties = await client.fetch(query).catch(() => [])
    properties = mergePropertyCollections(localProperties, Array.isArray(sanityProperties) ? sanityProperties : [])
  }

  let filteredProperties = Array.isArray(properties) ? properties : []

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

  return filteredProperties
}

export async function getPropertyBySlug(slug) {
  let property = null

  if (hasSanityConfig()) {
    property = await client.fetch(PROPERTY_BY_SLUG_QUERY, { slug }).catch(() => null)
  }

  if (!property) {
    property =
      await getLocalPropertyBySlug(slug).catch(() => null) ||
      await getLocalPropertyBySlug(decodeURIComponent(slug)).catch(() => null)
  }

  return property
}
