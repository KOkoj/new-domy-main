'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { X, BedDouble, Square as SquareIcon, ChevronRight } from 'lucide-react';
import { formatPriceCompact } from '@/lib/currency';

const CSS_FILES = [
  { id: 'leaflet-css', href: '/leaflet/leaflet.css' },
  { id: 'leaflet-markercluster-css', href: '/leaflet/MarkerCluster.css' },
  { id: 'leaflet-markercluster-default-css', href: '/leaflet/MarkerCluster.Default.css' },
];

const DEFAULT_CENTER = [42.8333, 12.8333];
const DEFAULT_ZOOM = 6;
const PIN_COLOR = '#3E6343';
const PIN_HIGHLIGHT_COLOR = '#ef4444';

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

function formatPinPrice(price) {
  const amount = Number(price) || 0;
  if (amount >= 1000000) {
    const millions = amount / 1000000;
    return `€${millions.toFixed(millions % 1 === 0 ? 0 : 1)}M`;
  }
  return `€${Math.round(amount / 1000)}k`;
}

function createPinIcon(L, property, highlighted) {
  const width = highlighted ? 56 : 46;
  const height = highlighted ? 72 : 60;
  const fill = highlighted ? PIN_HIGHLIGHT_COLOR : PIN_COLOR;

  return L.divIcon({
    className: 'property-pin',
    html: `
      <svg width="${width}" height="${height}" viewBox="0 0 46 60" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
        <path d="M23 60C23 60 46 37.5 46 23C46 10.2975 35.7025 0 23 0C10.2975 0 0 10.2975 0 23C0 37.5 23 60 23 60Z" fill="${fill}" stroke="#ffffff" stroke-width="3" />
        <circle cx="23" cy="23" r="12" fill="rgba(255,255,255,0.15)" />
        <text x="23" y="26" text-anchor="middle" font-size="11" font-weight="700" fill="#ffffff" style="paint-order: stroke; stroke: rgba(0,0,0,0.25); stroke-width: 1px;">
          ${formatPinPrice(property.price)}
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
        color: #ffffff; font-weight: 700; font-size: 13px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.35);
      ">${count}</div>
    `,
    iconSize: [size, size],
    iconAnchor: [Math.round(size / 2), Math.round(size / 2)],
  });
}

function MapPropertyCard({ property, currency = 'EUR', language = 'cs', onClose, onNavigate }) {
  const detailLabel =
    language === 'cs' ? 'Zobrazit detail' : language === 'it' ? 'Vedi dettagli' : 'View details';

  return (
    <div className="w-[280px] overflow-hidden rounded-2xl bg-white" data-testid="map-property-card">
      <div className="relative h-[150px] w-full bg-slate-100">
        {property.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={property.image}
            alt={property.title || ''}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md transition-colors hover:bg-white"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="absolute bottom-2 left-2 rounded-lg bg-white/10 px-3 py-1.5 backdrop-blur-md border border-white/20 shadow">
          <span className="text-lg font-bold text-white" data-testid="map-card-price">
            {formatPriceCompact(property.price, currency)}
          </span>
        </div>
      </div>
      <div className="p-3">
        <h4 className="mb-1 line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
          {property.title}
        </h4>
        <p className="mb-2 text-xs text-gray-500">{property.region}</p>
        <div className="mb-3 flex items-center gap-4 text-xs text-gray-600">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" />
              {property.bedrooms}
            </span>
          )}
          {property.area > 0 && (
            <span className="flex items-center gap-1">
              <SquareIcon className="h-3.5 w-3.5" />
              {property.area} m²
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onNavigate}
          className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-slate-700 to-slate-800 py-2 text-xs font-semibold text-white transition-all hover:from-slate-600 hover:to-slate-700"
          data-testid="map-card-detail-link"
        >
          {detailLabel}
          <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </button>
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
 * - showCard: when false, marker clicks only call onSelect (parent renders
 *   its own card, e.g. the mobile bottom sheet)
 */
const PropertyMap = ({
  properties = [],
  selectedId = null,
  hoveredId = null,
  onSelect = () => {},
  onHover = () => {},
  showCard = true,
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

  // Keep latest callbacks/props in refs so marker handlers never go stale and
  // markers don't need rebuilding when callbacks change identity.
  const callbacksRef = useRef({ onSelect, onHover, showCard });
  callbacksRef.current = { onSelect, onHover, showCard };

  const [ready, setReady] = useState(false);
  const [activeProperty, setActiveProperty] = useState(null);

  const closeCard = useCallback(() => {
    if (mapRef.current && popupRef.current) {
      mapRef.current.closePopup(popupRef.current);
    }
    setActiveProperty(null);
  }, []);

  // --- Map initialization (once) ---
  useEffect(() => {
    let destroyed = false;
    let resizeObserver = null;

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

      map.on('popupclose', (event) => {
        if (popupRef.current && event.popup === popupRef.current) {
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
        icon: createPinIcon(L, property, isHighlighted),
        zIndexOffset: isHighlighted ? 1000 : 0,
      });

      marker.on('click', () => {
        callbacksRef.current.onSelect(property.id);
        if (callbacksRef.current.showCard && popupContainerRef.current) {
          setActiveProperty(property);
          popupRef.current = L.popup({
            closeButton: false,
            className: 'property-map-popup',
            offset: [0, -58],
            maxWidth: 300,
            minWidth: 280,
            autoPan: true,
            autoPanPadding: [24, 24],
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
  }, [properties, ready, closeCard]);

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
      entry.marker.setIcon(createPinIcon(L, entry.property, isHighlighted));
      entry.marker.setZIndexOffset(isHighlighted ? 1000 : 0);
    });
  }, [selectedId, hoveredId, ready]);

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
      {showCard &&
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
    </div>
  );
};

export default PropertyMap;
