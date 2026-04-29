import { getAllProperties } from '@/lib/propertyApi'
import { getPropertyImageList } from '@/lib/getPropertyImage'
import { REGION_DATA_OVERRIDES } from '@/app/regions/regionContent'
import { absoluteUrl, SITE_NAME, SITE_URL } from '@/lib/siteConfig'
import JsonLd from '@/components/seo/JsonLd'
import HomePageClient from './HomePageClient'

export const revalidate = 3600

function getLocalized(value, language = 'cs', fallback = '') {
  if (!value) return fallback
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    return value[language] || value.cs || value.en || value.it || Object.values(value)[0] || fallback
  }
  return fallback
}

async function fetchPropertiesSafely() {
  try {
    return await getAllProperties(new URLSearchParams())
  } catch (error) {
    console.error('Homepage server fetch failed:', error)
    return []
  }
}

const PROPERTY_TYPES_CS = [
  { slug: 'apartment', label: 'Byty v Italii', description: 'Mestske byty v italskych mestech a lokalitach s turistickou poptavkou.' },
  { slug: 'house', label: 'Domy v Italii', description: 'Rodinne domy s pozemkem v ruznych italskych regionech.' },
  { slug: 'villa', label: 'Vily v Italii', description: 'Luxusni vily s pozemkem, bazenem a vyhledem.' },
  { slug: 'rustic', label: 'Rustikalni statky a casaly', description: 'Tradicni italske rustikalni domy a statky vhodne k rekonstrukci.' },
  { slug: 'land', label: 'Pozemky v Italii', description: 'Stavebni a zemedelske pozemky v italskych regionech.' }
]

const HOMEPAGE_FAQS_CS = [
  {
    q: 'Mohu jako Cech koupit nemovitost v Italii?',
    a: 'Ano. Italie umoznuje obcanum EU vcetne Cechu kupovat nemovitosti za stejnych podminek jako mistnim. Nepotrebujete italske obcanstvi ani trvaly pobyt.'
  },
  {
    q: 'Jake jsou typicke naklady na koupi nemovitosti v Italii?',
    a: 'Krome kupni ceny pocitejte s notarskymi poplatky, dani z prevodu (registracni dan), katastralnimi poplatky a pripadnym pravnim a technickym setrenim. Soucet vedlejsich nakladu se obvykle pohybuje mezi 8 az 15 procenty kupni ceny u rezidence non-prima casa.'
  },
  {
    q: 'Jak dlouho trva proces koupe?',
    a: 'Od prvni nabidky po zapis do katastru obvykle 2 az 4 mesice, podle slozitosti pravnich a technickych kontrol a rychlosti notare.'
  },
  {
    q: 'Potrebuji italske bankovni spojeni nebo italske danove cislo?',
    a: 'Ano, k podpisu kupni smlouvy budete potrebovat italske danove cislo (codice fiscale). Bankovni ucet v Italii neni podminkou, ale velmi usnadnuje placeni rocnich dani a vyuctovani.'
  },
  {
    q: 'Ktere regiony jsou pro ceske kupujici nejatraktivnejsi?',
    a: 'Mezi nejcastejsi volby patri Toskansko, Lombardie (jezera), Liguria, Marche, Abruzzo a Puglie. Volba zavisi na rozpoctu, planovanem vyuziti a dostupnosti.'
  }
]

function HomeSeoContent({ properties }) {
  const regions = Object.entries(REGION_DATA_OVERRIDES)

  return (
    <div
      style={{
        position: 'absolute',
        left: '-10000px',
        top: 'auto',
        width: '1px',
        height: '1px',
        overflow: 'hidden'
      }}
    >
      <header>
        <h1>Domy v Italii - kompletni pruvodce koupi nemovitosti v Italii pro Cechy</h1>
        <p>
          Pomahame ceskym kupujicim s nakupem nemovitosti v Italii: byty, vily,
          rodinne domy a rustikalni statky napric vsemi italskymi regiony.
          Nabizime pravni a technicke setreni, podporu s codice fiscale,
          notarem a celym procesem od prvni prohlidky po zapis do katastru.
        </p>
      </header>

      <section>
        <h2>Italske regiony - kde koupit nemovitost</h2>
        <p>
          Italie ma 20 regionu a kazdy ma svuj specificky trh, cenovou hladinu
          a dynamiku. Niz najdete pruvodce koupi pro nejvyznamnejsi regiony.
        </p>
        <ul>
          {regions.map(([slug, region]) => {
            const name = region?.name?.cs || region?.name?.en || slug
            const tagline = getLocalized(region?.tagline, 'cs', '')
            return (
              <li key={slug}>
                <a href={`/regions/${slug}`}>
                  <strong>{name}</strong>
                </a>
                {tagline ? ` - ${tagline}` : null}
              </li>
            )
          })}
        </ul>
      </section>

      <section>
        <h2>Typy nemovitosti v Italii</h2>
        <ul>
          {PROPERTY_TYPES_CS.map((type) => (
            <li key={type.slug}>
              <strong>{type.label}</strong> - {type.description}
            </li>
          ))}
        </ul>
      </section>

      {properties && properties.length > 0 ? (
        <section>
          <h2>Aktualni nabidka nemovitosti v Italii</h2>
          <ul>
            {properties.slice(0, 12).map((property) => {
              const slug = property?.slug?.current
              if (!slug) return null
              const title = getLocalized(property?.title, 'cs', 'Nemovitost v Italii')
              const city = getLocalized(property?.location?.city?.name, 'cs', '')
              const region = getLocalized(property?.location?.city?.region?.name, 'cs', '')
              const description = getLocalized(property?.description, 'cs', '').slice(0, 200)
              const image = getPropertyImageList(property)[0]
              return (
                <li key={slug}>
                  <a href={`/properties/${slug}`}>
                    <strong>{title}</strong>
                    {city ? `, ${city}` : ''}
                    {region ? `, ${region}` : ''}
                  </a>
                  {image ? <img src={image} alt={title} /> : null}
                  {description ? <p>{description}</p> : null}
                </li>
              )
            })}
          </ul>
          <p>
            <a href="/properties">Zobrazit vsechny nemovitosti v Italii</a>
          </p>
        </section>
      ) : null}

      <section>
        <h2>Casto kladene otazky o koupi nemovitosti v Italii</h2>
        <dl>
          {HOMEPAGE_FAQS_CS.map((faq, idx) => (
            <div key={idx}>
              <dt>
                <strong>{faq.q}</strong>
              </dt>
              <dd>{faq.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2>Pruvodci a clanky</h2>
        <ul>
          <li>
            <a href="/clanky/pruvodce-italii">Pruvodce Italii</a>
          </li>
          <li>
            <a href="/blog">Clanky a pruvodci</a>
          </li>
          <li>
            <a href="/process">Jak probiha proces koupe</a>
          </li>
          <li>
            <a href="/about">O nas</a>
          </li>
          <li>
            <a href="/contact">Kontakt</a>
          </li>
        </ul>
      </section>
    </div>
  )
}

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
      <HomeSeoContent properties={properties} />
      <HomePageClient initialProperties={properties} />
    </>
  )
}
