'use client';

import Link from 'next/link';
import { Heart, MapPin, Bed, Ruler, Home, Building2, Castle, DoorOpen } from 'lucide-react';
import PropertyPhotoSwitcher from '@/components/PropertyPhotoSwitcher';
import { formatPriceCompact } from '@/lib/currency';
import { getLocalizedValue, getPropertyTypeLabel, getStatusLabel } from '@/lib/propertyDisplay';
import { getNewPropertyLabel } from '@/components/NewPropertyRibbon';
import { getNoAgencyLabel } from '@/components/NoAgencyBadge';

const LA_DANE_BOOKING_LABELS = {
  cs: 'Vytvo\u0159 si to podle sebe',
  en: 'Book and customize',
  it: 'Prenota e personalizza',
}

export default function PropertyCard({
  property,
  onFavorite,
  isFavorited,
  language,
  currency,
  onHoverStart,
  onHoverEnd,
  isHighlighted = false,
  isFlashed = false,
}) {
  const roomsLabel = language === 'cs' ? 'místnosti' : language === 'it' ? 'locali' : 'rooms'
  const bedroomsLabel = language === 'cs' ? 'ložnice' : language === 'it' ? 'camere' : 'bedrooms'
  const localizedTitle = getLocalizedValue(property.titleI18n || property.title, language, 'Untitled Property')
  const localizedTypeLabel = getPropertyTypeLabel(property.type, language)
  const statusLabel = getStatusLabel(property.status, language)
  const propertySlug = property.slug?.current || property.slug
  const isLaDanePreview = propertySlug === 'friuli-venezia-giulia-appartamento-zoncolan-la-dane'
  const laDaneBookingLabel = LA_DANE_BOOKING_LABELS[language] || LA_DANE_BOOKING_LABELS.en
  const notes = [
    statusLabel,
    property.isNew ? getNewPropertyLabel(language) : null,
    property.noAgency ? getNoAgencyLabel(language) : null,
  ].filter(Boolean)

  const typeIcons = {
    apartment: Building2,
    house: Home,
    villa: Castle,
    rustico: Home,
  }
  const TypeIcon = typeIcons[property.type] || Home

  const handleFavoriteClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onFavorite(property.id)
  }

  const propertyHref = propertySlug
    ? `/properties/${propertySlug}`
    : property.sanityId
    ? `/properties/${property.sanityId}`
    : '#'
  const photos = Array.isArray(property.images) && property.images.length > 0
    ? property.images
    : [property.image].filter(Boolean)

  return (
    <article
      className={`property-card group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-[0_10px_32px_rgba(14,21,46,0.06)] transition duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(14,21,46,0.16)] ${
        isFlashed
          ? 'ring-2 ring-[#c7895b]'
          : isHighlighted
          ? 'ring-2 ring-[#1b2642]/25'
          : ''
      }`}
      data-testid="property-card"
      data-property-id={property.id}
      data-property-type={property.type}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
      <PropertyPhotoSwitcher
        key={property.id}
        photos={photos}
        alt={localizedTitle}
        href={propertyHref}
        language={language}
      >
          {(notes.length > 0 || isLaDanePreview) && (
            <div className="pointer-events-none absolute left-3 top-3 z-10 flex max-w-[calc(100%-3.25rem)] flex-wrap gap-1.5">
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
              {isLaDanePreview && (
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[#0e152e]" data-testid="la-dane-booking-bubble">
                  {laDaneBookingLabel}
                </span>
              )}
            </div>
          )}
      </PropertyPhotoSwitcher>
      <Link
        href={propertyHref}
        className="flex flex-1 flex-col"
        data-testid="property-card-link"
      >
        <div className="flex flex-1 flex-col p-5">
          <h3
            className="line-clamp-2 text-wrap text-lg font-semibold leading-snug text-gray-900 transition-colors duration-200 group-hover:text-[#8e5636]"
            data-testid="property-title"
          >
            {localizedTitle}
          </h3>
          <p
            className="mt-2 text-lg font-semibold text-[#8e5636]"
            data-testid="property-price"
            data-price={property.price}
          >
            {formatPriceCompact(property.price, currency, language)}
          </p>
          <div className="mt-3 border-t border-gray-200 pt-3" data-testid="property-specifications">
            <p className="flex flex-wrap gap-x-3 gap-y-1.5 text-sm leading-snug text-gray-500">
              <span className="inline-flex items-center gap-1.5" data-testid="property-type-badge">
                <TypeIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                {localizedTypeLabel}
              </span>
              <span className="inline-flex items-center gap-1.5" data-testid="property-location">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                <span data-testid="property-region">{getLocalizedValue(property.regionI18n || property.region, language)}</span>
              </span>
              <span className="inline-flex items-center gap-1.5" data-testid="rooms-count">
                <DoorOpen className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                {property.rooms} {roomsLabel}
              </span>
              <span className="inline-flex items-center gap-1.5" data-testid="bedrooms-count">
                <Bed className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                {property.bedrooms} {bedroomsLabel}
              </span>
              <span className="inline-flex items-center gap-1.5" data-testid="square-footage-count">
                <Ruler className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                {property.area} m²
              </span>
            </p>
          </div>
        </div>
      </Link>

      <button
        type="button"
        className={`absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0_4px_14px_rgba(14,21,46,0.12)] ${
          isFavorited ? 'text-[#c7895b]' : 'text-[#0e152e]'
        }`}
        onClick={handleFavoriteClick}
        data-testid="favorite-button"
        data-property-id={property.id}
        data-favorited={isFavorited}
        aria-label={language === 'cs' ? 'Oblíbené' : language === 'it' ? 'Preferiti' : 'Favorite'}
      >
        <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
      </button>
    </article>
  )
}
