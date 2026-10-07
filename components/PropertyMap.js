'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { X, MapPin, Bed, Ruler, Home, Building2, Castle, DoorOpen } from 'lucide-react';
import { getLocalizedValue, getPropertyTypeLabel, getStatusLabel } from '@/lib/propertyDisplay';
import { getNewPropertyLabel } from '@/components/NewPropertyRibbon';
import { getNoAgencyLabel } from '@/components/NoAgencyBadge';
import { formatPriceCompact, CURRENCY_RATES } from '@/lib/currency';
import PropertyPhotoSwitcher from '@/components/PropertyPhotoSwitcher';

const CSS_FILES = [
  { id: 'leaflet-css', href: '/leaflet/leaflet.css' },
  { id: 'leaflet-markercluster-css', href: '/leaflet/MarkerCluster.css' },
  { id: 'leaflet-markercluster-default-css', href: '/leaflet/MarkerCluster.Default.css' },
];

const DEFAULT_CENTER = [42.8333, 12.8333];
const DEFAULT_ZOOM = 6;
const PIN_COLOR = '#1b2642';
const PIN_HIGHLIGHT_COLOR = '#c48759';
const PIN_HIGHLIGHT_TEXT = '#1b2642';

function injectCss() {
  CSS_FILES.forEach(({ id, href }) => {
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
  });
}

function hasValidLocation(property) {
  const loc = property?.location;
  return (
    Array.isArray(loc) &&
    loc.length === 2 &&
    Number.isFinite(loc[0]) &&
    Number.isFinite(loc[1]) &&
    loc[0] >= -90 && loc[0] <= 90 &&
    loc[1] >= -180 && loc[1] <= 180
  );
}

function formatPinPrice(price, currency = 'EUR', language = 'cs') {
  let amount = Number(price) || 0;
  if (currency === 'CZK') amount *= CURRENCY_RATES.CZK;
  if (amount >= 1000000) {
    const millions = Math.round((amount / 1000000) * 10) / 10;
    const text = String(millions).replace('.', ',');
    if (language === 'en') return `${text}m`;
    if (language === 'it') return `${text} mln`;
    return `${text} mil.`;
  }
  const thousands = Math.round(amount / 1000);
  if (language === 'en') return `${thousands}k`;
  if (language === 'it') return `${thousands} mila`;
  return `${thousands} tis.`;
}

function createPinIcon(L, property, highlighted, currency = 'EUR', language = 'cs') {
  const width = highlighted ? 56 : 46;
  const height = highlighted ? 72 : 60;
  const fill = highlighted ? PIN_HIGHLIGHT_COLOR : PIN_COLOR;
  const textFill = highlighted ? PIN_HIGHLIGHT_TEXT : '#ffffff';

  return L.divIcon({
    className: 'property-pin',
    html: `
      <svg width="${width}" height="${height}" viewBox="0 0 46 60" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(14,21,46,0.28));">
        <path d="M23 60C23 60 46 37.5 46 23C46 10.2975 35.7025 0 23 0C10.2975 0 0 10.2975 0 23C0 37.5 23 60 23 60Z" fill="${fill}" stroke="#ffffff" stroke-width="3" />
        <text x="23" y="27" text-anchor="middle" font-size="11" font-weight="700" fill="${textFill}">
          ${formatPinPrice(property.price, currency, language)}
        </text>
      </svg>
    `,
    iconSize: [width, height],
    iconAnchor: [Math.round(width / 2), height],
  });
}

function createClusterIcon(L, cluster) {
  const count = cluster.getChildCount();
  const size = count >= 100 ? 52 : count >= 10 ? 46 : 40;

  return L.divIcon({
    className: 'property-cluster',
    html: `
      <div style="
        width: ${size}px; height: ${size}px;
        background: ${PIN_COLOR};
        border: 3px solid #ffffff;
        border-radius: 9999px;
        display: flex; align-items: center; justify-content: center;
        color: #ffffff; font-weight: 700; font-size: 14px;
        box-shadow: 0 2px 8px rgba(14,21,46,0.28);
      ">${count}</div>
    `,
    iconSize: [size, size],
    iconAnchor: [Math.round(size / 2), Math.round(size / 2)],
  });
}

function MapPropertyCard({ property, currency = 'EUR', language = 'cs', onClose, onNavigate, className = 'w-[280px]' }) {
  const roomsLabel = language === 'cs' ? 'místnosti' : language === 'it' ? 'locali' : 'rooms'
  const bedroomsLabel = language === 'cs' ? 'ložnice' : language === 'it' ? 'camere' : 'bedrooms'
  const localizedTitle = getLocalizedValue(property.titleI18n || property.title, language, '')
  const localizedTypeLabel = getPropertyTypeLabel(property.type, language)
  const statusLabel = getStatusLabel(property.status, language)
  const propertySlug = property.slug?.current || property.slug
  const isLaDanePreview = propertySlug === 'friuli-venezia-giulia-appartamento-zoncolan-la-dane'
  const laDaneBookingLabel = language === 'cs'
    ? 'Vytvoř si to podle sebe'
    : language === 'it'
    ? 'Prenota e personalizza'
    : 'Book and customize'
  const typeIcons = {
    apartment: Building2,
    house: Home,
    villa: Castle,
    rustico: Home,
  }
  const TypeIcon = typeIcons[property.type] || Home
  const photos = Array.isArray(property.images) && property.images.length > 0
    ? property.images
    : [property.image].filter(Boolean)

  return (
    <div className={`${className} group relative overflow-hidden rounded-2xl bg-white`} data-testid="map-property-card">
      <PropertyPhotoSwitcher
        key={property.id}
        photos={photos}
        alt={localizedTitle}
        onActivate={onNavigate}
        language={language}
        reveal="always"
        imageTestId="map-card-image"
      >
          {(statusLabel || property.isNew || property.noAgency || isLaDanePreview) && (
            <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex max-w-[calc(100%-2.75rem)] flex-wrap gap-1.5">
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
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[#0e152e]">
                  {laDaneBookingLabel}
                </span>
              )}
            </div>
          )}
      </PropertyPhotoSwitcher>
      <button
        type="button"
        onClick={onNavigate}
        className="block w-full text-left"
        data-testid="map-card-detail-link"
      >
        <div className="p-4">
          <h4 className="line-clamp-2 text-wrap text-lg font-semibold leading-snug text-gray-900 transition-colors duration-200 group-hover:text-[#8e5636]">
            {localizedTitle}
          </h4>
          <p className="mt-1.5 text-lg font-semibold text-[#8e5636]" data-testid="map-card-price">
            {formatPriceCompact(property.price, currency, language)}
          </p>
          <div className="mt-2.5 border-t border-gray-200 pt-2.5">
            <p className="flex flex-wrap gap-x-3 gap-y-1.5 text-sm leading-snug text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <TypeIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                {localizedTypeLabel}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                {getLocalizedValue(property.regionI18n || property.region, language)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <DoorOpen className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                {property.rooms} {roomsLabel}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Bed className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                {property.bedrooms} {bedroomsLabel}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Ruler className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                {property.area} m²
              </span>
            </p>
          </div>
        </div>
      </button>
      <button
        type="button"
        onClick={onClose}
        aria-label={language === 'cs' ? 'Zavřít' : language === 'it' ? 'Chiudi' : 'Close'}
        className="absolute right-2.5 top-2.5 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0e152e] shadow-[0_4px_14px_rgba(14,21,46,0.12)] transition-colors hover:bg-[#f7f4ed]"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Bottom sheet wrapper used on mobile: swipe down (or tap X) to dismiss.
 */
function MapBottomSheet({ children, onClose }) {
  const [dragY, setDragY] = useState(0);
  const touchStartYRef = useRef(null);

  const handleTouchStart = (event) => {
    touchStartYRef.current = event.touches[0].clientY;
  };

  const handleTouchMove = (event) => {
    if (touchStartYRef.current === null) return;
    const delta = event.touches[0].clientY - touchStartYRef.current;
    if (delta > 0) setDragY(delta);
  };

  const handleTouchEnd = () => {
    if (dragY > 80) {
      onClose();
    }
    setDragY(0);
    touchStartYRef.current = null;
  };

  return (
    <div
      className="absolute inset-x-3 bottom-20 z-[1000]"
      style={{
        transform: `translateY(${dragY}px)`,
        transition: dragY === 0 ? 'transform 0.2s ease-out' : 'none',
        touchAction: 'none',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      data-testid="map-bottom-sheet"
    >
      <div className="overflow-hidden rounded-2xl shadow-2xl">
        <div className="flex justify-center bg-white pt-2">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>
        {children}
      </div>
    </div>
  );
}

/**
 * PropertyMap v2 — stable Leaflet instance with clustering.
 *
 * Props contract:
 * - properties: transformed listings (location as [lat, lng])
 * - selectedId / hoveredId: ids controlled by the parent
 * - onSelect(id): marker clicked
 * - onHover(id|null): marker hover state
 * - onBoundsChange({ south, north, west, east }): current viewport, after pan or zoom
 * - cardVariant: 'popup' anchors a Leaflet popup at the pin (desktop),
 *   'sheet' shows a swipe-dismissable bottom card (mobile)
 */
const PropertyMap = ({
  properties = [],
  selectedId = null,
  hoveredId = null,
  onSelect = () => {},
  onHover = () => {},
  onBoundsChange = null,
  cardVariant = 'popup',
  currency = 'EUR',
  language = 'cs',
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
}) => {
  const router = useRouter();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const clusterGroupRef = useRef(null);
  const markersByIdRef = useRef(new Map());
  const popupRef = useRef(null);
  const popupContainerRef = useRef(null);
  const boundsSignatureRef = useRef('');
  const highlightRef = useRef({ selectedId: null, hoveredId: null });
  const activeMarkerIdRef = useRef(null);

  // Keep latest callbacks/props in refs so marker handlers never go stale and
  // markers don't need rebuilding when callbacks change identity.
  const callbacksRef = useRef({ onSelect, onHover, onBoundsChange, cardVariant });
  callbacksRef.current = { onSelect, onHover, onBoundsChange, cardVariant };

  const [ready, setReady] = useState(false);
  const [activeProperty, setActiveProperty] = useState(null);

  const closeCard = useCallback(() => {
    activeMarkerIdRef.current = null;
    if (mapRef.current && popupRef.current) {
      mapRef.current.closePopup(popupRef.current);
    }
    setActiveProperty(null);
  }, []);

  // The card renders into the popup after it opens, so Leaflet has to
  // measure again and pan the taller card fully into the map.
  useEffect(() => {
    if (!activeProperty || cardVariant !== 'popup') return undefined;
    const frame = requestAnimationFrame(() => {
      popupRef.current?.update();
    });
    return () => cancelAnimationFrame(frame);
  }, [activeProperty, cardVariant]);

  // --- Map initialization (once) ---
  useEffect(() => {
    let destroyed = false;
    let resizeObserver = null;
    let stopMarkerFocusScroll = null;
    let detachReveal = null;

    const init = async () => {
      const L = (await import('leaflet')).default || (await import('leaflet'));
      await import('leaflet.markercluster');

      if (destroyed || !containerRef.current || mapRef.current) return;

      injectCss();

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      leafletRef.current = L;

      const map = L.map(containerRef.current, { zoomControl: true }).setView(center, zoom);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const clusterGroup = L.markerClusterGroup({
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        spiderfyOnMaxZoom: true,
        maxClusterRadius: 60,
        iconCreateFunction: (cluster) => createClusterIcon(L, cluster),
      });
      map.addLayer(clusterGroup);
      clusterGroupRef.current = clusterGroup;

      popupContainerRef.current = document.createElement('div');

      // Focusing a marker makes the browser scroll the page to a bogus
      // position because the pin sits in a transformed Leaflet pane.
      stopMarkerFocusScroll = (event) => {
        if (event.target?.closest?.('.leaflet-marker-icon')) {
          event.preventDefault();
        }
      };
      containerRef.current.addEventListener('mousedown', stopMarkerFocusScroll, true);

      // First grab, click, or scroll-zoom brings the whole map into the window.
      // Deferred so it runs after Leaflet restores the scroll it saves on focus.
      let revealLocked = false;
      let revealTimer = 0;
      const scrollMapIntoView = () => {
        const mapEl = containerRef.current?.closest('.rounded-2xl') || containerRef.current;
        if (!mapEl || mapEl.closest('[data-testid="mobile-map-overlay"]')) return false;
        const nav = document.querySelector('[data-testid="navigation-component"]');
        const navBottom = nav ? Math.max(0, nav.getBoundingClientRect().bottom) : 0;
        const gap = 16;
        const topLimit = navBottom + gap;
        const bottomLimit = window.innerHeight - gap;
        const rect = mapEl.getBoundingClientRect();
        if (rect.height < 80) return false;
        if (rect.top >= topLimit - 2 && rect.bottom <= bottomLimit + 2) return false;

        let delta = rect.top - topLimit;
        if (rect.bottom - delta > bottomLimit && rect.height <= bottomLimit - topLimit) {
          delta += rect.bottom - delta - bottomLimit;
        }
        const nextTop = Math.max(0, window.scrollY + delta);
        if (Math.abs(nextTop - window.scrollY) < 2) return false;
        window.scrollTo({ top: nextTop, behavior: 'smooth' });
        return true;
      };
      const revealMap = () => {
        if (revealLocked) return;
        revealLocked = true;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const moved = scrollMapIntoView();
            if (!moved) {
              revealLocked = false;
              return;
            }
            window.clearTimeout(revealTimer);
            revealTimer = window.setTimeout(() => {
              revealLocked = false;
            }, 900);
          });
        });
      };
      const revealNode = containerRef.current;
      revealNode.addEventListener('pointerdown', revealMap);
      revealNode.addEventListener('wheel', revealMap, { passive: true });
      detachReveal = () => {
        revealNode.removeEventListener('pointerdown', revealMap);
        revealNode.removeEventListener('wheel', revealMap);
        window.clearTimeout(revealTimer);
      };

      const placeOpenCard = () => {
        const popup = popupRef.current;
        const id = activeMarkerIdRef.current;
        const group = clusterGroupRef.current;
        const entry = id ? markersByIdRef.current.get(id) : null;
        if (!popup || !popup.isOpen() || !entry || !group) return;
        const visible = group.getVisibleParent(entry.marker) || entry.marker;
        if (visible?.getLatLng) {
          popup.setLatLng(visible.getLatLng());
        }
        popup.update();
      };
      const reportBounds = () => {
        const bounds = map.getBounds();
        if (!bounds?.isValid?.()) return;
        const next = {
          south: bounds.getSouth(),
          north: bounds.getNorth(),
          west: bounds.getWest(),
          east: bounds.getEast(),
        };
        if (!Object.values(next).every(Number.isFinite)) return;
        callbacksRef.current.onBoundsChange?.(next);
      };
      map.on('zoomend', placeOpenCard);
      map.on('moveend', reportBounds);
      map.on('dragend', reportBounds);

      map.on('popupclose', (event) => {
        if (popupRef.current && event.popup === popupRef.current) {
          activeMarkerIdRef.current = null;
          setActiveProperty(null);
        }
      });

      // Re-measure whenever the container is resized or becomes visible
      // (fixes the hidden-container init bug and split-view resizes).
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize();
          }
        });
        resizeObserver.observe(containerRef.current);
      }

      setReady(true);
    };

    init().catch((error) => {
      console.error('Error loading map:', error);
    });

    return () => {
      destroyed = true;
      if (resizeObserver) resizeObserver.disconnect();
      if (detachReveal) detachReveal();
      if (containerRef.current && stopMarkerFocusScroll) {
        containerRef.current.removeEventListener('mousedown', stopMarkerFocusScroll, true);
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      leafletRef.current = null;
      clusterGroupRef.current = null;
      markersByIdRef.current = new Map();
      popupRef.current = null;
      boundsSignatureRef.current = '';
      setReady(false);
    };
    // Initial center/zoom only — the map instance manages its own view after mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Marker sync when the property set changes ---
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const clusterGroup = clusterGroupRef.current;
    if (!ready || !L || !map || !clusterGroup) return;

    const mappable = properties.filter(hasValidLocation);

    clusterGroup.clearLayers();
    markersByIdRef.current = new Map();

    mappable.forEach((property) => {
      const isHighlighted =
        property.id === highlightRef.current.selectedId ||
        property.id === highlightRef.current.hoveredId;

      const marker = L.marker(property.location, {
        icon: createPinIcon(L, property, isHighlighted, currency, language),
        keyboard: false,
        zIndexOffset: isHighlighted ? 1000 : 0,
      });

      marker.on('click', () => {
        callbacksRef.current.onSelect(property.id);
        activeMarkerIdRef.current = property.id;
        setActiveProperty(property);
        if (callbacksRef.current.cardVariant === 'popup' && popupContainerRef.current) {
          const mapHeight = map.getSize().y;
          popupRef.current = L.popup({
            closeButton: false,
            className: 'property-map-popup',
            offset: [0, -58],
            maxWidth: 300,
            minWidth: 280,
            maxHeight: Math.max(220, mapHeight - 36),
            autoPan: true,
            keepInView: true,
            autoPanPadding: [16, 16],
          })
            .setLatLng(property.location)
            .setContent(popupContainerRef.current)
            .openOn(map);
        }
      });
      marker.on('mouseover', () => callbacksRef.current.onHover(property.id));
      marker.on('mouseout', () => callbacksRef.current.onHover(null));

      markersByIdRef.current.set(property.id, { marker, property });
      clusterGroup.addLayer(marker);
    });

    // Fit bounds only when the filtered set actually changes,
    // not when selection/hover state changes.
    const signature = mappable
      .map((property) => property.id)
      .sort()
      .join('|');

    if (signature !== boundsSignatureRef.current) {
      boundsSignatureRef.current = signature;
      if (mappable.length > 0) {
        const bounds = L.latLngBounds(mappable.map((property) => property.location));
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13 });
      }
      closeCard();
    }
  }, [properties, ready, closeCard, currency, language]);

  // --- Highlight sync (selected / hovered pin) ---
  useEffect(() => {
    const L = leafletRef.current;
    if (!ready || !L) return;

    const prev = highlightRef.current;
    const next = { selectedId, hoveredId };
    highlightRef.current = next;

    const affectedIds = new Set(
      [prev.selectedId, prev.hoveredId, next.selectedId, next.hoveredId].filter(Boolean)
    );

    affectedIds.forEach((id) => {
      const entry = markersByIdRef.current.get(id);
      if (!entry) return;
      const isHighlighted = id === next.selectedId || id === next.hoveredId;
      entry.marker.setIcon(createPinIcon(L, entry.property, isHighlighted, currency, language));
      entry.marker.setZIndexOffset(isHighlighted ? 1000 : 0);
    });
  }, [selectedId, hoveredId, ready, currency, language]);

  const handleNavigate = useCallback(() => {
    if (!activeProperty) return;
    const slugOrId = activeProperty.slug || activeProperty.sanityId;
    if (slugOrId) {
      router.push(`/properties/${slugOrId}`);
    }
  }, [activeProperty, router]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="z-0 h-full min-h-[300px] w-full" data-testid="property-map" />
      {cardVariant === 'popup' &&
        activeProperty &&
        popupContainerRef.current &&
        createPortal(
          <MapPropertyCard
            property={activeProperty}
            currency={currency}
            language={language}
            onClose={closeCard}
            onNavigate={handleNavigate}
          />,
          popupContainerRef.current
        )}
      {cardVariant === 'sheet' && activeProperty && (
        <MapBottomSheet onClose={closeCard}>
          <MapPropertyCard
            property={activeProperty}
            currency={currency}
            language={language}
            onClose={closeCard}
            onNavigate={handleNavigate}
            className="w-full"
          />
        </MapBottomSheet>
      )}
    </div>
  );
};

export default PropertyMap;
