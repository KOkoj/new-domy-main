import aliases from '@/data/property-aliases.json'

// Only manually verified duplicates belong here. Historical records and IDs
// stay in the data store; aliases are suppressed only in public collections.
export function isPropertyAlias(property) {
  return aliases.some(alias => property?.slug?.current === alias.secondarySlug || property?._id === alias.secondaryId)
}

export function resolvePropertySlug(key) {
  const alias = aliases.find(alias => key === alias.secondarySlug || key === alias.secondaryId)
  return alias?.primarySlug || key
}

export function resolvePropertyId(key) {
  const alias = aliases.find(alias => key === alias.secondaryId || key === alias.secondarySlug)
  return alias?.primaryId || key
}
