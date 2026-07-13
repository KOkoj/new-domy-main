'use client';

import Link from 'next/link';
import { MapPin, Heart, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import PropertyImage from '@/components/PropertyImage';
import { formatPriceCompact } from '@/lib/currency';
import { getLocalizedValue, getPropertyTypeLabel, getStatusLabel } from '@/lib/propertyDisplay';
import NewPropertyRibbon from '@/components/NewPropertyRibbon';
import NoAgencyBadge from '@/components/NoAgencyBadge';
import { PAGE_LABELS } from './filterConfig';

// PropertyCard component matching homepage design
export default function PropertyCard({ property, onFavorite, isFavorited, language, currency }) {
  const roomsLabel = language === 'cs' ? 'místnosti' : language === 'it' ? 'locali' : 'rooms'
  const bedroomsLabel = language === 'cs' ? 'ložnice' : language === 'it' ? 'camere' : 'bedrooms'
  const viewDetailsLabel = PAGE_LABELS[language]?.viewDetails || PAGE_LABELS.en.viewDetails
  const localizedTitle = getLocalizedValue(property.titleI18n || property.title, language, 'Untitled Property')
  const localizedTypeLabel = getPropertyTypeLabel(property.type, language)
  const statusLabel = getStatusLabel(property.status, language)

  const handleFavoriteClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onFavorite(property.id)
  }

  // Construct the href with slug safeguard
  const propertyHref = property.slug?.current
    ? `/properties/${property.slug.current}`
    : property.slug
    ? `/properties/${property.slug}`
    : property.sanityId
    ? `/properties/${property.sanityId}`
    : '#'

  return (
    <Card
      className="group relative cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden border border-gray-100 shadow-lg bg-white rounded-2xl flex flex-col h-full hover:border-slate-200/50"
      data-testid="property-card"
      data-property-id={property.id}
      data-property-type={property.type}
    >
      <Link
        href={propertyHref}
        className="flex flex-1 flex-col"
        data-testid="property-card-link"
      >
      <div className="relative overflow-hidden h-48 sm:h-64" data-testid="property-image-container">
        <PropertyImage
          src={property.image}
          alt={localizedTitle}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover group-hover:scale-110 transition-transform duration-300 ease-out"
          data-testid="property-image"
        />

        {property.isNew && <NewPropertyRibbon language={language} />}
        {property.noAgency && (
          <div className="absolute right-4 top-16 z-30 pointer-events-none">
            <NoAgencyBadge language={language} />
          </div>
        )}

        {statusLabel && (
          <div className="absolute left-4 top-4 z-30 pointer-events-none">
            <span
              className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-lg ${
                property.status === 'sold' ? 'bg-red-600/95' : 'bg-amber-600/95'
              }`}
            >
              {statusLabel}
            </span>
          </div>
        )}

        {/* Gradient overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-800/30 via-transparent to-transparent group-hover:from-slate-800/40 transition-all duration-300" />

        {/* Top badges and favorite button */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
          <Badge
            className={`bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white transition-all duration-300 px-3 py-1.5 text-xs font-medium shadow-lg rounded-lg capitalize backdrop-blur-sm border border-white/20 group-hover:shadow-xl pointer-events-none ${statusLabel ? 'ml-0 mt-10' : ''}`}
            data-testid="property-type-badge"
          >
            {localizedTypeLabel}
          </Badge>

        </div>

        {/* Price overlay */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 shadow-lg hover:bg-white/20 transition-all duration-300 group-hover:shadow-xl group-hover:bg-white/15">
            <span
              className="text-2xl font-bold text-white"
              data-testid="property-price"
              data-price={property.price}
            >
              {formatPriceCompact(property.price, currency)}
            </span>
          </div>
        </div>
      </div>

      <CardContent className="p-6 sm:p-8 flex flex-col flex-1">
        {/* Content area that grows */}
        <div className="flex-1 space-y-2 sm:space-y-3">
          {/* Title and location */}
          <div className="space-y-1.5 sm:space-y-2">
            <h3
              className="font-bold text-base sm:text-lg leading-tight line-clamp-2 group-hover:text-slate-800 transition-colors duration-300 group-hover:tracking-wide"
              data-testid="property-title"
            >
              {localizedTitle}
            </h3>

            <div className="flex items-center text-gray-500 text-xs sm:text-sm group-hover:text-gray-600 transition-colors duration-300" data-testid="property-location">
              <div className="p-1 bg-slate-100 rounded-lg mr-2 group-hover:bg-slate-200 transition-colors duration-300">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600 group-hover:text-slate-700 transition-colors duration-300" />
              </div>
              <span className="font-medium" data-testid="property-region">{property.region}</span>
            </div>
          </div>

          {/* Specifications */}
          <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100 text-xs sm:text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300" data-testid="property-specifications">
            <span className="font-semibold" data-testid="rooms-count">{property.rooms} {roomsLabel}</span>
            <span className="font-semibold" data-testid="bedrooms-count">{property.bedrooms} {bedroomsLabel}</span>
            <span className="font-semibold" data-testid="square-footage-count">{property.area} m2</span>
          </div>
        </div>

        {/* Enhanced CTA button - always at bottom */}
        <div className="pt-3 sm:pt-4 mt-auto" data-testid="property-footer">
          <div
            className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-2 sm:py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group border-0 text-xs sm:text-sm flex items-center justify-center cursor-pointer"
          >
            <span data-testid="view-details-text">{viewDetailsLabel}</span>
            <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
      </CardContent>
      </Link>

      <Button
        variant="ghost"
        size="icon"
        className={`absolute right-4 top-4 z-30 p-2.5 rounded-full transition-all duration-300 active:scale-95 shadow-lg backdrop-blur-sm border border-white/20 ${
          isFavorited
            ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:shadow-red-500/25'
            : 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white hover:shadow-slate-500/25'
        }`}
        onClick={handleFavoriteClick}
        data-testid="favorite-button"
        data-property-id={property.id}
        data-favorited={isFavorited}
      >
        <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
      </Button>
    </Card>
  )
}
