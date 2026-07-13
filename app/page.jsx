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
    a: 'Ano. Itálie umoznuje obcanum EU vcetne Cechu kupovat nemovitostí za stejnych podminek jako mistnim. Nepotrebujete italske obcanstvi ani trvaly pobyt.'
  },
  {
    q: 'Jake jsou typicke naklady na koupí nemovitostí v Itálii?',
    a: 'Krome kupni ceny pocitejte s notarskymi poplatky, dani z prevodu (registracni dan), katastralnimi poplatky a pripadnym pravnim a technickym setrenim. Soucet vedlejsich nakladu se obvykle pohybuje mezi 8 az 15 procenty kupni ceny u rezidence non-prima casa.'
  },
  {
    q: 'Jak dlouho trva proces koupe?',
    a: 'Od prvni nabídky po zapis do katastru obvykle 2 az 4 mesice, podle slozitosti pravnich a technickych kontrol a rychlosti notare.'
  },
  {
    q: 'Potrebuji italske bankovni spojeni nebo italske danove cislo?',
    a: 'Ano, k podpisu kupni smlouvy budete potrebovat italske danove cislo (codice fiscale). Bankovni ucet v Itálii neni podminkou, ale velmi usnadnuje placeni rocnich dani a vyuctovani.'
  },
  {
    q: 'Ktere regiony jsou pro české kupující nejatraktivnejsi?',
    a: 'Mezi nejcastejsi volby patri Toskánsko, Lombardie (jezera), Liguria, Marche, Abruzzo a Puglie. Volba zavisi na rozpočtu, planovanem využití a dostupnosti.'
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
