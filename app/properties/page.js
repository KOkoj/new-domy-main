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

const propertiesIntro = {
  "cs": "Na této stránce najdete aktuální nabídku domů na prodej v Itálii – byty, vily i rodinné domy napříč regiony. Každou nemovitost prověřujeme z právního i technického hlediska, abyste měli jistotu při rozhodování o prodeji nemovitostí v zahraničí. Pro české kupující nabízíme podporu od prvního dotazu až po podpis smlouvy.",
  "it": "In questa pagina trovi le offerte aggiornate di immobili in vendita in Italia: appartamenti, ville e case indipendenti in tutte le regioni. Verifichiamo ogni immobile dal punto di vista legale e tecnico, per aiutarti a scegliere con sicurezza. Per gli acquirenti cechi offriamo assistenza dalla prima richiesta fino alla firma del contratto.",
  "en": "Browse the latest properties for sale in Italy, including apartments, villas and detached houses across the regions. We check each property from a legal and technical perspective to help you make an informed decision. For Czech buyers, we provide support from the first enquiry through to signing the contract."
}

export default async function PropertiesPage() {
  const initialProperties = await getInitialProperties()

  return (
    <PropertiesClient initialProperties={initialProperties} intro={propertiesIntro} />
  )
}
