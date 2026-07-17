'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, MapPin, Bed, Bath, Square } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import PropertyImage from '@/components/PropertyImage'
import { getPropertyImage } from '@/lib/getPropertyImage'
import { getLocalizedValue } from '@/lib/propertyDisplay'
import NewPropertyRibbon from '@/components/NewPropertyRibbon'
import NoAgencyBadge from '@/components/NoAgencyBadge'

const LABELS = {
  cs: {
    heading: 'Nemovitosti, které by vás mohly zajímat',
    viewAll: 'Zobrazit všechny nemovitosti',
    viewDetails: 'Zobrazit detail',
    beds: 'ložnice',
    baths: 'koupelny',
    sqm: 'm²',
    sold: 'Prodáno',
    reserved: 'Rezervováno',
  },
  it: {
    heading: 'Proprietà che potrebbero interessarti',
    viewAll: 'Vedi tutte le proprietà',
    viewDetails: 'Vedi dettagli',
    beds: 'camere',
    baths: 'bagni',
    sqm: 'm²',
    sold: 'Venduto',
    reserved: 'Riservato',
  },
  en: {
    heading: 'Properties you might like',
    viewAll: 'Browse all properties',
    viewDetails: 'View details',
    beds: 'beds',
    baths: 'baths',
    sqm: 'm²',
    sold: 'Sold',
    reserved: 'Reserved',
  },
}

function formatPrice(amount, currency = 'EUR') {
  if (!amount) return null
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1).replace('.0', '')}M ${currency}`
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}k ${currency}`
  return `${amount} ${currency}`
}


function getPropertyHref(property) {
  if (property.slug?.current) return `/properties/${property.slug.current}`
  if (property.slug && typeof property.slug === 'string') return `/properties/${property.slug}`
  if (property._id) return `/properties/${property._id}`
  return '/properties'
}

function transformProperty(prop, index) {
  const regionName =
    prop.location?.city?.region?.name?.en ||
    prop.location?.city?.region?.name?.it ||
    prop.location?.city?.region?.name?.cs ||
    prop.location?.city?.name?.it ||
    prop.location?.city?.name ||
    'Italy'

  const titleI18n = {
    en: prop.title?.en || prop.title?.it || prop.title?.cs || (typeof prop.title === 'string' ? prop.title : 'Property'),
    it: prop.title?.it || prop.title?.en || prop.title?.cs || (typeof prop.title === 'string' ? prop.title : 'Property'),
    cs: prop.title?.cs || prop.title?.en || prop.title?.it || (typeof prop.title === 'string' ? prop.title : 'Property'),
  }

  return {
    id: prop._id || `prop-${index}`,
    titleI18n,
    region: regionName,
    price: prop.price?.amount || 0,
    currency: prop.price?.currency || 'EUR',
    bedrooms: prop.specifications?.bedrooms || 0,
    bathrooms: prop.specifications?.bathrooms || 0,
    area: prop.specifications?.squareFootage || 0,
    image: getPropertyImage(prop),
    status: prop.status || 'available',
    slug: prop.slug?.current || prop.slug || prop._id || '',
    featured: prop.featured || false,
    createdAt: prop._createdAt || prop.createdAt || '',
    updatedAt: prop._updatedAt || prop.updatedAt || '',
    pinnedRank: Number(prop.pinnedRank) || 0,
    isNew: Boolean(prop.isNew || prop.newListing),
    noAgency: Boolean(prop.noAgency || prop.no_agency || prop.badges?.includes('no-agency')),
  }
}

function getPropertyTimestamp(property) {
  const timestamp = Date.parse(property?.createdAt || property?.updatedAt || '')
  return Number.isFinite(timestamp) ? timestamp : 0
}

function prepareProperties(rawProperties = []) {
  const transformed = rawProperties.map(transformProperty)
  const pinnedProperties = transformed
    .filter((property) => property.pinnedRank > 0)
    .sort((a, b) => a.pinnedRank - b.pinnedRank)
  const newProperties = transformed
    .filter((property) => property.pinnedRank === 0 && property.isNew)
    .sort((a, b) => getPropertyTimestamp(b) - getPropertyTimestamp(a))
  const otherProperties = transformed
    .filter((property) => property.pinnedRank === 0 && !property.isNew)
    .sort((a, b) => getPropertyTimestamp(b) - getPropertyTimestamp(a))

  return [...pinnedProperties, ...newProperties, ...otherProperties]
}

function SlideCard({ property, language, labels }) {
  const title = getLocalizedValue(property.titleI18n, language, 'Property')
  const href = getPropertyHref(property)
  const priceStr = formatPrice(property.price, property.currency)

  const statusLabel =
    property.status === 'sold'
      ? labels.sold
      : property.status === 'reserved'
      ? labels.reserved
      : null

  return (
    <Card className="group relative cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100 shadow-md bg-white rounded-2xl flex flex-col h-full">
      <Link href={href} className="flex h-full flex-col">
      {/*
        Explicit width + height let the browser reserve the exact 320×208 space
        before the image downloads, eliminating layout shift. w-full + h-auto
        makes it responsive; the container clips at the right height via
        aspect-[320/208] so the card thumbnail is always the same proportion.
      */}
      <div className="relative overflow-hidden flex-shrink-0">
        <PropertyImage
          src={property.image}
          alt={title}
          width={320}
          height={208}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="w-full h-auto object-cover aspect-[320/208] group-hover:scale-105 transition-transform duration-300 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-800/40 via-transparent to-transparent" />

        {property.isNew && <NewPropertyRibbon language={language} />}
        {property.noAgency && (
          <div className="absolute right-3 top-3 z-20 pointer-events-none">
            <NoAgencyBadge language={language} className="px-2.5 py-1 text-[10px] tracking-[0.1em]" />
          </div>
        )}

        {statusLabel && (
          <div className="absolute left-3 top-3 z-20 pointer-events-none">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow ${
                property.status === 'sold' ? 'bg-red-600/90' : 'bg-amber-600/90'
              }`}
            >
              {statusLabel}
            </span>
          </div>
        )}

        {property.featured && !statusLabel && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <Badge className="bg-gradient-to-r from-slate-700 to-slate-800 text-white text-xs px-3 py-1 shadow rounded-lg border border-white/20">
              ⭐ Featured
            </Badge>
          </div>
        )}

        {priceStr && (
          <div className="absolute bottom-3 right-3 z-20 pointer-events-none">
            <span className="bg-white/95 text-slate-900 font-bold text-sm px-3 py-1.5 rounded-xl shadow-lg">
              {priceStr}
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors duration-200">
          {title}
        </h3>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{property.region}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-auto pt-1 border-t border-gray-50">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bed className="h-3 w-3" />
              {property.bedrooms}
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bath className="h-3 w-3" />
              {property.bathrooms}
            </span>
          )}
          {property.area > 0 && (
            <span className="flex items-center gap-1">
              <Square className="h-3 w-3" />
              {property.area} {labels.sqm}
            </span>
          )}
        </div>
      </CardContent>
      </Link>
    </Card>
  )
}

export default function PropertySlider({ language = 'en', initialProperties = [] }) {
  const labels = LABELS[language] || LABELS.en
  const properties = prepareProperties(initialProperties)

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    dragFree: true,
    slidesToScroll: 1,
  })

  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanPrev(emblaApi.canScrollPrev())
    setCanNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  if (properties.length === 0) return null

  return (
    <section className="bg-gray-50 border-t border-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              {labels.heading}
            </h2>
            <div className="w-12 h-1 bg-amber-400 rounded-full mt-2" />
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/properties"
              className="hidden sm:inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors duration-150 mr-2"
            >
              {labels.viewAll}
            </Link>
            <button
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canPrev}
              aria-label="Previous"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 text-slate-700" />
            </button>
            <button
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canNext}
              aria-label="Next"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4 text-slate-700" />
            </button>
          </div>
        </div>

        <div
          ref={emblaRef}
          style={{ overflow: 'clip', overflowClipMargin: '40px' }}
          className="-m-[40px] p-[40px]"
        >
          <div className="flex gap-5">
            {properties.map((property) => (
              <div
                key={property.id}
                className="flex-[0_0_280px] sm:flex-[0_0_300px] lg:flex-[0_0_320px] min-w-0"
              >
                <SlideCard property={property} language={language} labels={labels} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-center sm:hidden">
          <Link
            href="/properties"
            className="text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
          >
            {labels.viewAll} →
          </Link>
        </div>
      </div>
    </section>
  )
}
