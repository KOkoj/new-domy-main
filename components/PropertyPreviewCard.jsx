'use client'

import Link from 'next/link'
import { MapPin, Bed, Home, Building2, Castle, DoorOpen, Ruler } from 'lucide-react'
import PropertyPhotoSwitcher from '@/components/PropertyPhotoSwitcher'
import { formatPriceCompact } from '@/lib/currency'
import { getLocalizedValue, getPropertyTypeLabel, getStatusLabel } from '@/lib/propertyDisplay'
import { getNewPropertyLabel } from '@/components/NewPropertyRibbon'
import { getNoAgencyLabel } from '@/components/NoAgencyBadge'

export function getPropertyHref(property) {
  if (property.slug?.current) return `/properties/${property.slug.current}`
  if (property.slug && typeof property.slug === 'string') return `/properties/${property.slug}`
  if (property._id) return `/properties/${property._id}`
  return '/properties'
}

export default function PropertyPreviewCard({ property, language, currency }) {
  const title = getLocalizedValue(property.titleI18n, language, 'Property')
  const href = getPropertyHref(property)
  const photos = Array.isArray(property.images) && property.images.length > 0
    ? property.images
    : [property.image].filter(Boolean)
  const statusLabel = getStatusLabel(property.status, language)
  const typeIcons = { apartment: Building2, house: Home, villa: Castle, rustico: Home }
  const TypeIcon = typeIcons[property.type] || Home
  const roomsLabel = language === 'cs' ? 'místnosti' : language === 'it' ? 'locali' : 'rooms'
  const bedroomsLabel = language === 'cs' ? 'ložnice' : language === 'it' ? 'camere' : 'bedrooms'
  const region = getLocalizedValue(property.regionI18n, language)

  return (
    <article
      className="property-card group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-[0_10px_32px_rgba(14,21,46,0.06)] transition duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(14,21,46,0.16)]"
      data-testid="property-card"
      data-property-id={property.id}
      onPointerDown={(event) => {
        if (event.target.closest('button')) event.stopPropagation()
      }}
    >
      <PropertyPhotoSwitcher photos={photos} alt={title} href={href} language={language}>
        {(statusLabel || property.isNew || property.noAgency) && (
          <div className="pointer-events-none absolute left-3 top-3 z-10 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-1.5">
            {statusLabel && (
              <span className="rounded-full bg-[#1b2642] px-2.5 py-1 text-xs font-medium text-white">
                {statusLabel}
              </span>
            )}
            {property.isNew && (
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[#0e152e]">
                {getNewPropertyLabel(language)}
              </span>
            )}
            {property.noAgency && (
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[#0e152e]">
                {getNoAgencyLabel(language)}
              </span>
            )}
          </div>
        )}
      </PropertyPhotoSwitcher>
      <Link href={href} className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col p-5">
          <h3 className="line-clamp-2 text-wrap text-lg font-semibold leading-snug text-gray-900 transition-colors duration-200 group-hover:text-[#8e5636]">
            {title}
          </h3>
          <p className="mt-2 text-lg font-semibold text-[#8e5636]">
            {formatPriceCompact(property.price, currency, language)}
          </p>
          <div className="mt-3 border-t border-gray-200 pt-3">
            <p className="flex flex-wrap gap-x-3 gap-y-1.5 text-sm leading-snug text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <TypeIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                {getPropertyTypeLabel(property.type, language)}
              </span>
              {region && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  {region}
                </span>
              )}
              {property.rooms > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <DoorOpen className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  {property.rooms} {roomsLabel}
                </span>
              )}
              {property.bedrooms > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Bed className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  {property.bedrooms} {bedroomsLabel}
                </span>
              )}
              {property.area > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Ruler className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  {property.area} m²
                </span>
              )}
            </p>
          </div>
        </div>
      </Link>
    </article>
  )
}
