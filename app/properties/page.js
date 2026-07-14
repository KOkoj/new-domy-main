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

const propertiesIntro = (
  <p className="text-sm sm:text-base text-gray-600 text-center mb-4 max-w-2xl mx-auto leading-relaxed px-2">
    Na této stránce najdete aktuální nabídku domů na prodej v Itálii – byty, vily i rodinné domy napříč
    regiony. Každou nemovitost prověřujeme z právního i technického hlediska, abyste měli jistotu při
    rozhodování o prodeji nemovitostí v zahraničí. Pro české kupující nabízíme podporu od prvního dotazu
    až po podpis smlouvy.
  </p>
)

export default async function PropertiesPage() {
  const initialProperties = await getInitialProperties()

  return (
    <PropertiesClient initialProperties={initialProperties} intro={propertiesIntro} />
  )
}
