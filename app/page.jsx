import { getAllProperties } from '@/lib/propertyApi'
import { absoluteUrl, SITE_NAME, SITE_URL } from '@/lib/siteConfig'
import JsonLd from '@/components/seo/JsonLd'
import HomePageClient from './HomePageClient'

export const revalidate = 3600

async function fetchPropertiesSafely() {
  try {
    return await getAllProperties(new URLSearchParams())
  } catch (error) {
    console.error('Homepage server fetch failed:', error)
    return []
  }
}

const HOMEPAGE_FAQS_CS = [
  {
    q: 'Mohu jako Čech koupit nemovitost v Itálii?',
    a: 'Ano. Itálie umožňuje občanům EU včetně Čechů kupovat nemovitosti za stejných podmínek jako místním. Nepotřebujete italské občanství ani trvalý pobyt.'
  },
  {
    q: 'Jaké jsou typické náklady na koupi nemovitostí v Itálii?',
    a: 'Kromě kupní ceny počítejte s notářskými poplatky, daní z převodu (registrační daň), katastrálními poplatky a případným právním a technickým šetřením. Součet vedlejších nákladů se obvykle pohybuje mezi 8 až 15 procenty kupní ceny u rezidence non-prima casa.'
  },
  {
    q: 'Jak dlouho trvá proces koupě?',
    a: 'Od první nabídky po zápis do katastru obvykle 2 až 4 měsíce, podle složitosti právních a technických kontrol a rychlosti notáře.'
  },
  {
    q: 'Potřebuji italské bankovní spojení nebo italské daňové číslo?',
    a: 'Ano, k podpisu kupní smlouvy budete potřebovat italské daňové číslo (codice fiscale). Bankovní účet v Itálii není podmínkou, ale velmi usnadňuje placení ročních daní a vyúčtování.'
  },
  {
    q: 'Které regiony jsou pro české kupující nejatraktivnější?',
    a: 'Mezi nejčastější volby patří Toskánsko, Lombardie (jezera), Ligurie, Marche, Abruzzo a Puglia. Volba závisí na rozpočtu, plánovaném využití a dostupnosti.'
  }
]

function buildFaqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOMEPAGE_FAQS_CS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a
      }
    }))
  }
}

function buildWebsiteWithSearchJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'cs-CZ',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: absoluteUrl('/properties?search={search_term_string}')
      },
      'query-input': 'required name=search_term_string'
    }
  }
}

export default async function HomePage() {
  const properties = await fetchPropertiesSafely()

  return (
    <>
      <JsonLd data={buildFaqJsonLd()} />
      <JsonLd data={buildWebsiteWithSearchJsonLd()} />
      <HomePageClient initialProperties={properties} />
    </>
  )
}
