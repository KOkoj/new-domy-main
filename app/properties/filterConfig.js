// Static configuration for the properties listing page: filter options,
// region slug handling, and page-level UI labels.

import { Home, Building, Castle, Building2 } from 'lucide-react'
import { PROPERTY_TYPE_LABELS } from '@/lib/propertyDisplay'

export const REGION_LABEL_BY_SLUG = {
  abruzzo: 'Abruzzo',
  basilicata: 'Basilicata',
  calabria: 'Calabria',
  campania: 'Campania',
  'emilia-romagna': 'Emilia-Romagna',
  'friuli-venezia-giulia': 'Friuli-Venezia Giulia',
  lazio: 'Lazio',
  liguria: 'Liguria',
  lombardy: 'Lombardy',
  marche: 'Marche',
  molise: 'Molise',
  piemonte: 'Piedmont',
  puglia: 'Puglia',
  sardegna: 'Sardinia',
  sicilia: 'Sicily',
  toscana: 'Tuscany',
  'trentino-alto-adige': 'Trentino-Alto Adige',
  umbria: 'Umbria',
  'valle-d-aosta': "Valle d'Aosta",
  veneto: 'Veneto'
};

const REGION_SLUG_ALIASES = {
  lombardia: 'lombardy',
  piedmont: 'piemonte',
  sicily: 'sicilia',
  sardinia: 'sardegna',
  tuscany: 'toscana',
  'aosta-valley': 'valle-d-aosta',
  'valle-daosta': 'valle-d-aosta'
};

export const toRegionSlug = (value) => {
  if (!value || typeof value !== 'string') return '';

  const normalized = value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return REGION_SLUG_ALIASES[normalized] || normalized;
};

export const propertyTypes = [
  { id: 'apartment', name: PROPERTY_TYPE_LABELS.apartment, icon: Building },
  { id: 'house', name: PROPERTY_TYPE_LABELS.house, icon: Home },
  { id: 'villa', name: PROPERTY_TYPE_LABELS.villa, icon: Castle },
  { id: 'rustico', name: PROPERTY_TYPE_LABELS.rustico, icon: Building2 }
];

export const ROOM_LAYOUT_OPTIONS = [
  { id: '1+kk', label: '1+kk', min: 1, max: 1 },
  { id: '2+kk', label: '2+kk', min: 2, max: 2 },
  { id: '3+kk', label: '3+kk', min: 3, max: 3 },
  { id: '4+kk', label: '4+kk', min: 4, max: 4 },
  { id: '5+kk+', label: '5+kk+', min: 5, max: null }
];

export const matchesRoomLayout = (roomCount, selectedLayoutId) => {
  if (!selectedLayoutId) return true

  const selectedLayout = ROOM_LAYOUT_OPTIONS.find((option) => option.id === selectedLayoutId)
  if (!selectedLayout) return true

  const parsedRoomCount = Number(roomCount || 0)
  if (!Number.isFinite(parsedRoomCount) || parsedRoomCount <= 0) return false

  if (selectedLayout.max === null) {
    return parsedRoomCount >= selectedLayout.min
  }

  return parsedRoomCount >= selectedLayout.min && parsedRoomCount <= selectedLayout.max
}

export const amenities = [
  { id: 'pool', name: { cs: 'Bazén', it: 'Piscina', en: 'Pool' } },
  { id: 'garden', name: { cs: 'Zahrada', it: 'Giardino', en: 'Garden' } },
  { id: 'parking', name: { cs: 'Parkování', it: 'Parcheggio', en: 'Parking' } },
  { id: 'sea_view', name: { cs: 'Výhled na moře', it: 'Vista mare', en: 'Sea view' } },
  { id: 'balcony', name: { cs: 'Balkon', it: 'Balcone', en: 'Balcony' } },
  { id: 'terrace', name: { cs: 'Terasa', it: 'Terrazza', en: 'Terrace' } },
  { id: 'fireplace', name: { cs: 'Krb', it: 'Camino', en: 'Fireplace' } },
  { id: 'aircon', name: { cs: 'Klimatizace', it: 'Aria condizionata', en: 'Air conditioning' } }
];

export const PAGE_LABELS = {
  cs: {
    viewDetails: 'Zobrazit detail',
    loadingMap: 'Načítám mapu...',
    showFilters: 'Zobrazit filtry',
    hideFilters: 'Skrýt filtry',
    title: 'Nemovitosti v Itálii',
    propertiesCount: 'nemovitostí',
    propertyType: 'Typ nemovitosti',
    region: 'Region',
    allRegions: 'Všechny regiony',
    layout: 'Dispozice',
    priceRange: 'Cenové rozpětí (EUR)',
    from: 'Od',
    to: 'Do',
    amenities: 'Vybavení',
    clearFilters: 'Vymazat filtry',
    searchPlaceholder: 'Vyhledat nemovitosti...',
    sortNewest: 'Nejnovější',
    sortCheapest: 'Nejlevnější',
    sortExpensive: 'Nejdražší',
    showMap: 'Zobrazit mapu',
    hideMap: 'Skrýt mapu',
    loading: 'Načítání...',
    loadMore: 'Načíst další nemovitosti',
    allShown: 'Zobrazili jste všechny nemovitosti',
    noResultsBadge: 'Nenašli jsme přesnou shodu',
    noResultsTitle: 'Vaši vysněnou nemovitost najdeme i mimo náš výběr',
    noResultsDescription1: 'To, co vidíte zde, je pouze naše doporučená selekce – nikoli kompletní nabídka. Máme kontakty po celé Itálii a najdeme vám přesně to, co hledáte.',
    noResultsDescription2: 'Napište nám, co si představujete, a my vám připravíme nabídku na míru – zdarma a nezávazně.',
    contactUsCta: 'Kontaktujte nás',
    whatsappCta: 'Napsat na WhatsApp',
    clearFiltersCta: 'Vymazat filtry'
  },
  it: {
    viewDetails: 'Vedi dettagli',
    loadingMap: 'Caricamento mappa...',
    showFilters: 'Mostra filtri',
    hideFilters: 'Nascondi filtri',
    title: 'Proprietà in Italia',
    propertiesCount: 'proprietà',
    propertyType: 'Tipo di proprietà',
    region: 'Regione',
    allRegions: 'Tutte le regioni',
    layout: 'Disposizione',
    priceRange: 'Fascia di prezzo (EUR)',
    from: 'Da',
    to: 'A',
    amenities: 'Servizi',
    clearFilters: 'Cancella filtri',
    searchPlaceholder: 'Cerca proprietà...',
    sortNewest: 'Più recenti',
    sortCheapest: 'Prezzo più basso',
    sortExpensive: 'Prezzo più alto',
    showMap: 'Mostra mappa',
    hideMap: 'Nascondi mappa',
    loading: 'Caricamento...',
    loadMore: 'Carica altre proprietà',
    allShown: 'Hai visualizzato tutte le proprietà',
    noResultsBadge: 'Nessuna corrispondenza esatta',
    noResultsTitle: 'Possiamo trovare la tua casa anche fuori da questa selezione',
    noResultsDescription1: 'Quelle che vedi qui sono soltanto le nostre proprietà consigliate – non l’intero portafoglio. Abbiamo contatti in tutta Italia e possiamo trovare esattamente ciò che cerchi.',
    noResultsDescription2: 'Scrivici cosa hai in mente e prepareremo una proposta su misura – gratis e senza impegno.',
    contactUsCta: 'Contattaci',
    whatsappCta: 'Scrivici su WhatsApp',
    clearFiltersCta: 'Cancella filtri'
  },
  en: {
    viewDetails: 'View details',
    loadingMap: 'Loading map...',
    showFilters: 'Show filters',
    hideFilters: 'Hide filters',
    title: 'Properties in Italy',
    propertiesCount: 'properties',
    propertyType: 'Property type',
    region: 'Region',
    allRegions: 'All regions',
    layout: 'Layout',
    priceRange: 'Price range (EUR)',
    from: 'From',
    to: 'To',
    amenities: 'Amenities',
    clearFilters: 'Clear filters',
    searchPlaceholder: 'Search properties...',
    sortNewest: 'Newest',
    sortCheapest: 'Lowest price',
    sortExpensive: 'Highest price',
    showMap: 'Show map',
    hideMap: 'Hide map',
    loading: 'Loading...',
    loadMore: 'Load more properties',
    allShown: 'You have viewed all properties',
    noResultsBadge: 'No exact match found',
    noResultsTitle: 'We can find your dream home beyond this selection',
    noResultsDescription1: 'What you see here is only our recommended selection – not our complete portfolio. We have contacts across Italy and can source exactly what you are looking for.',
    noResultsDescription2: 'Tell us what you have in mind and we’ll put together a tailored offer – free of charge and with no obligation.',
    contactUsCta: 'Contact us',
    whatsappCta: 'Message on WhatsApp',
    clearFiltersCta: 'Clear filters'
  }
}
