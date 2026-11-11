import 'server-only'
import { getAllProperties } from '@/lib/propertyApi'
import { preparePropertySliderPreview } from '@/lib/propertySliderData'

export const ARTICLE_PROPERTY_LIMIT = 3

export function prepareArticleProperties(properties = []) {
  // Preserve the homepage's pinned/newest ordering; do not promote sold listings.
  const available = properties.filter(property => !property.status || property.status === 'available')
  return preparePropertySliderPreview(available).slice(0, ARTICLE_PROPERTY_LIMIT)
}

export async function getArticleProperties() {
  try {
    return prepareArticleProperties(await getAllProperties(new URLSearchParams()))
  } catch (error) {
    console.error('[articleProperties] Inventory unavailable:', error?.message || error)
    return []
  }
}
