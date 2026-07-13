import { getAllProperties } from '@/lib/propertyApi'
import { transformPropertyListings } from '@/lib/propertyListing'
import PropertiesClient from './PropertiesClient'

export const revalidate = 3600

async function getInitialProperties() {
  try {
    const properties = await getAllProperties(new URLSearchParams())
    return transformPropertyListings(properties)
  } catch (error) {
    console.error('Properties server fetch failed:', error)
    return []
  }
}

export default async function PropertiesPage() {
  const initialProperties = await getInitialProperties()

  return <PropertiesClient initialProperties={initialProperties} />
}
