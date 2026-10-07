'use client'

import { useState, useEffect } from 'react'
import { MapPin, Home, TrendingUp, Star, CheckCircle, Shield, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import PropertySlider from '@/components/PropertySlider'
import { formatPriceCompact } from '@/lib/currency'
import { AFFILIATE_LINKS } from '@/lib/affiliateLinks'

const REGION_DETAIL_SLUGS = {
  lombardy: 'lombardia',
  'friuli-venezia-giulia': 'friuli-venezia-giulia',
  puglia: 'puglia',
  calabria: 'calabria',
  sicilia: 'sicilia',
  toscana: 'toscana',
  liguria: 'liguria',
  veneto: 'veneto',
  lazio: 'lazio',
  campania: 'campania',
  piemonte: 'piemonte',
  'emilia-romagna': 'emilia-romagna',
  umbria: 'umbria',
  sardegna: 'sardegna',
  abruzzo: 'abruzzo',
  'trentino-alto-adige': 'trentino-alto-adige',
  'valle-d-aosta': 'valle-d-aosta'
}

function getRegionDetailSlug(slug = '') {
  if (!slug) return ''
  return REGION_DETAIL_SLUGS[slug] || slug
}

function getRegionDisplayName(region, language = 'en') {
  const raw = region?.name?.[language] || region?.name?.en || ''
  return raw.split(' - ')[0]
}

function RegionCard({ region, language = 'en' }) {
  const detailSlug = getRegionDetailSlug(region.slug?.current || '')
  const name = getRegionDisplayName(region, language)
  const description = region.description?.[language] || region.description?.en || ''
  const cities = (region.topCities || []).slice(0, 4).join(' · ')
  const range = `${formatPriceCompact(region.priceRange?.min, 'EUR', language)} – ${formatPriceCompact(region.priceRange?.max, 'EUR', language)}`
  const propertiesLabel = language === 'cs' ? 'Nemovitosti' : language === 'it' ? 'Immobili' : 'Properties'

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_10px_32px_rgba(14,21,46,0.06)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(14,21,46,0.1)]">
      <Link href={`/regions/${detailSlug}`} className="group flex min-h-0 flex-1 flex-col">
        <span className="relative block aspect-[3/2] overflow-hidden">
          <Image
            src={region.image}
            alt={name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        </span>
        <span className="block px-5 pb-2 pt-5">
          <span className="text-sm font-semibold text-copper-700">{range}</span>
          <span className="mt-1 block text-pretty text-xl font-semibold leading-snug text-gray-900 group-hover:text-copper-700">{name}</span>
          <span className="mt-1 line-clamp-2 block text-pretty text-base leading-snug text-gray-700">{description}</span>
          {cities ? <span className="mt-3 block text-sm leading-snug text-gray-500">{cities}</span> : null}
        </span>
      </Link>
      <div className="px-5 pb-5 pt-2">
        <Link
          href={`/properties?region=${region.slug?.current || ''}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#1b2642]"
        >
          {propertiesLabel}
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  )
}

export default function RegionsListingClient({ initialRegions, initialProperties = [], sliderProperties }) {
  const [language, setLanguage] = useState('cs')
  const [regionsData, setRegionsData] = useState(initialRegions)

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
    }

    const handleLanguageChange = (event) => {
      setLanguage(event.detail)
      document.documentElement.lang = event.detail
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  useEffect(() => {
    let active = true

    const normalizeRegion = (region, index) => ({
      _id: region._id || `region-${index + 1}`,
      name: {
        en: region.name?.en || '',
        cs: region.name?.cs || '',
        it: region.name?.it || ''
      },
      slug: {
        _type: 'slug',
        current: region.slug?.current || `region-${index + 1}`
      },
      country: region.country || 'Italy',
      description: {
        en: region.description?.en || '',
        cs: region.description?.cs || '',
        it: region.description?.it || ''
      },
      image: region.image || '/Toscana.png',
      propertyCount: Number(region.propertyCount || 0),
      averagePrice: Number(region.averagePrice || 0),
      priceRange: {
        min: Number(region.priceRange?.min || 0),
        max: Number(region.priceRange?.max || 0)
      },
      topCities: Array.isArray(region.topCities) ? region.topCities : [],
      highlights: Array.isArray(region.highlights) ? region.highlights : [],
      popularity: Number(region.popularity || 0),
      priceNotes: region.priceNotes || null,
      warning: region.warning || null
    })

    const loadRegions = async () => {
      try {
        const response = await fetch('/api/content?type=regions', { cache: 'no-store' })
        const result = await response.json()

        if (!active) return

        if (response.ok && Array.isArray(result.regions) && result.regions.length > 0) {
          setRegionsData(result.regions.map(normalizeRegion))
        }
      } catch (error) {
        console.error('Failed to load regions content:', error)
      }
    }

    loadRegions()

    return () => {
      active = false
    }
  }, [])

  const copy = {
    eyebrow: language === 'cs' ? 'Regiony' : language === 'it' ? 'Regioni' : 'Regions',
    title: language === 'cs'
      ? 'Koupě domů v Itálii: který region zvolit?'
      : language === 'it'
        ? 'Comprare casa in Italia: quale regione scegliere?'
        : 'Buying a house in Italy: which region should you choose?',
    intro: language === 'cs'
      ? 'Itálie má dvacet velmi odlišných regionů. Výběr oblasti je často důležitější než samotný dům: liší se ceny, pravidla i to, jak se v místě žije.'
      : language === 'it'
        ? 'L’Italia ha venti regioni molto diverse. Scegliere l’area giusta conta spesso più della casa: cambiano prezzi, regole e vita quotidiana.'
        : 'Italy has twenty very different regions. Choosing the area often matters more than the house itself: prices, rules, and everyday life all change.',
    count: language === 'cs'
      ? `${regionsData.length} regionů v průvodci`
      : language === 'it'
        ? `${regionsData.length} regioni nella guida`
        : `${regionsData.length} regions in the guide`,
    chooseEyebrow: language === 'cs' ? 'Než vyberete' : language === 'it' ? 'Prima di scegliere' : 'Before you choose',
    chooseTitle: language === 'cs' ? 'Jak si vybrat region' : language === 'it' ? 'Come scegliere la regione' : 'How to choose a region',
    consult: language === 'cs' ? 'Konzultace zdarma' : language === 'it' ? 'Consulenza gratuita' : 'Free consultation',
    visitTitle: language === 'cs' ? 'Chcete region nejdříve poznat osobně?' : language === 'it' ? 'Volete conoscere prima la regione di persona?' : 'Want to see the region in person first?',
    visitBody: language === 'cs'
      ? 'Mnoho klientů před koupí region nejdříve navštíví. Na krátký pobyt se hodí ubytování i prohlídka místa.'
      : language === 'it'
        ? 'Molti clienti visitano la regione prima dell’acquisto. Per un soggiorno breve servono alloggio e un giro sul posto.'
        : 'Many clients visit the region before they buy. A short stay needs a place to sleep and a look around.',
    booking: language === 'cs' ? 'Najít ubytování' : language === 'it' ? 'Trova alloggio' : 'Find a place to stay',
    tours: language === 'cs' ? 'Výlety a průvodci' : language === 'it' ? 'Escursioni e guide' : 'Tours and guides',
  }

  const chooseItems = [
    { icon: MapPin, label: language === 'cs' ? 'Bydlení u moře, v horách, nebo ve městě' : language === 'it' ? 'Mare, montagna o città' : 'Sea, mountains, or a city' },
    { icon: Home, label: language === 'cs' ? 'Dům na dovolenou, investice, nebo nový život' : language === 'it' ? 'Casa vacanze, investimento o nuova vita' : 'A holiday home, an investment, or a new life' },
    { icon: TrendingUp, label: language === 'cs' ? 'Dostupnost z Česka a místní infrastruktura' : language === 'it' ? 'Accessibilità dalla Cechia e infrastruttura locale' : 'Access from home and local infrastructure' },
    { icon: Star, label: language === 'cs' ? 'Rozpočet včetně daní a poplatků' : language === 'it' ? 'Budget con tasse e costi inclusi' : 'A budget that includes taxes and fees' },
    { icon: CheckCircle, label: language === 'cs' ? 'Vlastní užívání, nebo pronájem' : language === 'it' ? 'Uso personale o affitto' : 'Personal use, or rental income' },
    { icon: Shield, label: language === 'cs' ? 'Jiná pravidla a jiný rytmus v každém regionu' : language === 'it' ? 'Regole e ritmi diversi in ogni regione' : 'Different rules and a different pace in every region' },
  ]

  return (
    <div className="site-page min-h-screen overflow-x-hidden bg-[#f7f4ed]">
      <Navigation />

      <div className="pb-16 pt-40">
        <div className="container mx-auto">
          <nav aria-label={language === 'cs' ? 'Drobečková navigace' : language === 'it' ? 'Percorso di navigazione' : 'Breadcrumb'} className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-[#1b2642]">
                  {language === 'cs' ? 'Domů' : language === 'it' ? 'Home' : 'Home'}
                </Link>
              </li>
              <li aria-hidden="true" className="text-gray-400">/</li>
              <li className="font-medium text-[#1b2642]" aria-current="page">{copy.eyebrow}</li>
            </ol>
          </nav>

          <header className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#c78b5a]">{copy.eyebrow}</p>
            <h1 className="text-pretty">{copy.title}</h1>
            <p className="mx-auto mt-3 max-w-[40rem] text-pretty text-base leading-snug text-gray-700">{copy.intro}</p>
            <p className="mt-3 text-sm font-medium text-gray-600">{copy.count}</p>
          </header>

          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {regionsData.map((region) => (
              <RegionCard key={region._id} region={region} language={language} />
            ))}
          </div>

          <section className="mt-20">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#c78b5a]">{copy.chooseEyebrow}</p>
            <h2 className="text-pretty text-[2.05rem] font-bold leading-[1.15] text-gray-900">{copy.chooseTitle}</h2>
            <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
              {chooseItems.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#1b2642]">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <p className="pt-1.5 text-pretty text-base font-semibold leading-snug text-gray-900">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact" className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gradient-to-r from-[#c7895b] to-[#996945] px-5 py-2.5 text-base font-semibold text-white">
                {copy.consult}
                <ChevronRight className="h-4 w-4" />
              </Link>
              <a
                href="https://wa.me/420731450001"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center rounded-full bg-white px-5 py-2.5 text-base font-semibold text-[#1b2642] shadow-[0_10px_32px_rgba(14,21,46,0.06)]"
              >
                WhatsApp
              </a>
            </div>
          </section>

          <section className="mt-16 rounded-2xl bg-white px-6 py-8 shadow-[0_10px_32px_rgba(14,21,46,0.06)] sm:px-10 sm:py-10">
            <h2 className="text-pretty text-[1.7rem] font-bold leading-snug text-gray-900">{copy.visitTitle}</h2>
            <p className="mt-3 max-w-[40rem] text-pretty text-base leading-snug text-gray-700">{copy.visitBody}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                data-affiliate-partner="booking"
                data-affiliate-placement="regions-travel-tools"
                data-affiliate-href={AFFILIATE_LINKS.booking.default}
                className="inline-flex w-fit items-center rounded-full bg-gradient-to-r from-[#c7895b] to-[#996945] px-5 py-2.5 text-base font-semibold text-white"
                onClick={() => window.open(AFFILIATE_LINKS.booking.default, '_blank', 'noopener,noreferrer')}
              >
                {copy.booking}
              </button>
              <button
                type="button"
                data-affiliate-partner="getyourguide"
                data-affiliate-placement="regions-travel-tools"
                data-affiliate-href={AFFILIATE_LINKS.getYourGuide.default}
                className="inline-flex w-fit items-center rounded-full bg-[#f7f4ed] px-5 py-2.5 text-base font-semibold text-[#1b2642]"
                onClick={() => window.open(AFFILIATE_LINKS.getYourGuide.default, '_blank', 'noopener,noreferrer')}
              >
                {copy.tours}
              </button>
            </div>
          </section>

          <div className="mt-20">
            <PropertySlider language={language} initialProperties={initialProperties} preparedProperties={sliderProperties} variant="home" />
          </div>
        </div>
      </div>

      <Footer language={language} />
    </div>
  )
}
