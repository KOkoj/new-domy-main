export const GETYOURGUIDE_PARTNER_ID = 'H4OKCTR'

const BOOKING_AFFILIATE_PARAMS = Object.freeze({
  aid: '1522416',
  label: 'affnetcj-15735418_pub-7711899_site-101629596_pname-Creavita sro',
  lang: 'cs'
})

function buildBookingLink(path = '/', searchParams = {}) {
  const url = new URL(path, 'https://www.booking.com')
  Object.entries({ ...BOOKING_AFFILIATE_PARAMS, ...searchParams }).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })
  return url.toString()
}

const BOOKING_ITALY_SEARCH = buildBookingLink('/searchresults.html', {
  ss: 'Italia',
  dest_id: '104',
  dest_type: 'country',
  group_adults: '2',
  group_children: '0',
  no_rooms: '1'
})

const BOOKING_LOMBARDIA_SEARCH = buildBookingLink('/searchresults.html', {
  ss: 'Riva del Garda, Trentino-Alto Adige, Italia',
  dest_id: '-126468',
  dest_type: 'city',
  group_adults: '2',
  group_children: '0',
  no_rooms: '1'
})

export const AFFILIATE_LINKS = Object.freeze({
  booking: {
    default: 'https://www.dpbolvw.net/click-101629596-15735418',
    italySearch: BOOKING_ITALY_SEARCH,
    homepage: buildBookingLink(),
    direct: 'https://www.booking.com/'
  },
  getYourGuide: {
    default: 'https://gyg.me/O0X6ZC2R',
    italyGuide: 'https://gyg.me/fnMmh4S3',
    direct: 'https://www.getyourguide.com/',
    widgetFrame: 'https://widget.getyourguide.com/default/activities.frame',
    widgetScript: 'https://widget.getyourguide.com/dist/pa.umd.production.min.js'
  },
  carRental: {
    click: 'https://www.jdoqocy.com/click-101629596-17122732',
    regionClick: 'https://www.tkqlhce.com/click-101629596-17122732',
    pixel: 'https://www.ftjcfx.com/image-101629596-17122732'
  },
  flights: {
    click: 'https://www.dpbolvw.net/click-101629596-17053224',
    pixel: 'https://www.ftjcfx.com/image-101629596-17053224'
  },
  insurance: {
    guide: {
      click: 'https://www.dpbolvw.net/click-101629596-13328896',
      image: 'https://www.tqlkg.com/image-101629596-13328896'
    },
    property: {
      click: 'https://www.dpbolvw.net/click-101629596-13502304',
      image: 'https://www.tqlkg.com/image-101629596-13502304'
    }
  },
  banners: {
    travelSidebar: {
      click: 'https://www.anrdoezrs.net/click-101629596-17061697',
      image: 'https://www.ftjcfx.com/image-101629596-17061697'
    },
    accommodation: {
      click: 'https://www.kqzyfj.com/click-101629596-17227946',
      image: 'https://www.ftjcfx.com/image-101629596-17227946'
    },
    holidayBudget: {
      click: 'https://www.anrdoezrs.net/click-101629596-17227920',
      image: 'https://www.lduhtrp.net/image-101629596-17227920'
    },
    villages: {
      click: 'https://www.dpbolvw.net/click-101629596-17122710',
      image: 'https://www.lduhtrp.net/image-101629596-17122710'
    }
  }
})

export const REGION_BOOKING_LINKS = Object.freeze({
  lombardia: BOOKING_LOMBARDIA_SEARCH,
  lombardy: BOOKING_LOMBARDIA_SEARCH
})

export const REGION_GETYOURGUIDE_LINKS = Object.freeze({
  lombardia: 'https://gyg.me/tVi5p3To',
  toscana: 'https://www.getyourguide.com/toscana-l558/',
  'trentino-alto-adige': 'https://www.getyourguide.com/trentino-alto-adigesudtirol-l2493/',
  liguria: 'https://www.getyourguide.com/liguria-l221/',
  piemonte: 'https://www.getyourguide.com/piemonte-l598/',
  'friuli-venezia-giulia': 'https://www.getyourguide.com/friuli-venezia-giulia-l1130/',
  veneto: 'https://www.getyourguide.com/veneto-l222/',
  'valle-d-aosta': 'https://www.getyourguide.com/valle-d-aosta-l2478/',
  'emilia-romagna': 'https://www.getyourguide.com/emilia-romagna-l252/',
  marche: 'https://www.getyourguide.com/marche-l257/',
  umbria: 'https://www.getyourguide.com/comune-di-perugia-l1507/',
  lazio: 'https://www.getyourguide.com/lazio-l862/',
  molise: 'https://www.getyourguide.com/molise-l197924/',
  abruzzo: 'https://www.getyourguide.com/abruzzo-l1174/',
  campania: 'https://www.getyourguide.com/pompei-campania-l156880/',
  puglia: 'https://www.getyourguide.com/puglia-l727/',
  calabria: 'https://www.getyourguide.com/calabria-l733/',
  sicilia: 'https://www.getyourguide.com/sicilia-l65/',
  sardegna: 'https://www.getyourguide.com/sardegna-l249/'
})

export const REGION_GETYOURGUIDE_WIDGETS = Object.freeze({
  lombardia: ['310', 'lake como', 'milan', 'https://www.getyourguide.com/lombardia-l310/'],
  toscana: ['558', 'chianti', 'florence', REGION_GETYOURGUIDE_LINKS.toscana],
  'trentino-alto-adige': ['2493', 'dolomites', 'bolzano', REGION_GETYOURGUIDE_LINKS['trentino-alto-adige']],
  liguria: ['221', 'cinque terre', 'genoa', REGION_GETYOURGUIDE_LINKS.liguria],
  piemonte: ['598', 'langhe', 'turin', REGION_GETYOURGUIDE_LINKS.piemonte],
  'friuli-venezia-giulia': ['1130', 'trieste', 'udine', REGION_GETYOURGUIDE_LINKS['friuli-venezia-giulia']],
  veneto: ['222', 'venice', 'verona', REGION_GETYOURGUIDE_LINKS.veneto],
  'valle-d-aosta': ['2478', 'mont blanc', 'aosta', REGION_GETYOURGUIDE_LINKS['valle-d-aosta']],
  'emilia-romagna': ['252', 'bologna', 'rimini', REGION_GETYOURGUIDE_LINKS['emilia-romagna']],
  marche: ['257', 'urbino', 'ancona', REGION_GETYOURGUIDE_LINKS.marche],
  umbria: ['1507', 'assisi', 'perugia', REGION_GETYOURGUIDE_LINKS.umbria],
  lazio: ['862', 'rome', 'tivoli', REGION_GETYOURGUIDE_LINKS.lazio],
  molise: ['197924', 'campobasso', 'termoli', REGION_GETYOURGUIDE_LINKS.molise],
  abruzzo: ['1174', 'gran sasso', 'pescara', REGION_GETYOURGUIDE_LINKS.abruzzo],
  campania: ['156880', 'pompeii', 'naples', REGION_GETYOURGUIDE_LINKS.campania],
  puglia: ['727', 'alberobello', 'bari', REGION_GETYOURGUIDE_LINKS.puglia],
  calabria: ['733', 'tropea', 'reggio calabria', REGION_GETYOURGUIDE_LINKS.calabria],
  sicilia: ['65', 'etna', 'palermo', REGION_GETYOURGUIDE_LINKS.sicilia],
  sardegna: ['249', 'cagliari', 'alghero', REGION_GETYOURGUIDE_LINKS.sardegna]
})

export function getRegionGetYourGuideWidget(region) {
  const config = REGION_GETYOURGUIDE_WIDGETS[region]
  if (!config) return null
  const [locationId, primaryQuery, secondaryQuery, destinationLink] = config
  return { locationId, primaryQuery, secondaryQuery, destinationLink }
}

export function getTrackedGetYourGuideLink(link, campaign = 'domyvitalii-region') {
  if (!link || link.includes('gyg.me/')) return link || AFFILIATE_LINKS.getYourGuide.default
  try {
    const url = new URL(link)
    url.searchParams.set('partner_id', GETYOURGUIDE_PARTNER_ID)
    url.searchParams.set('cmp', campaign)
    return url.toString()
  } catch {
    return AFFILIATE_LINKS.getYourGuide.default
  }
}
