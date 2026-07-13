#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { extractListingData } = require('./extract-listing-data.cjs')

const ROOT = process.cwd()
const HAR_ROOT = 'C:/Users/39327/Desktop/Har sito'
const IMPORT_ROOT = path.join(ROOT, 'data', 'import', 'properties')

const ITEMS = [
  {
    n: 1,
    url: 'https://www.immobiliare.it/annunci/128783804/',
    region: 'Lazio',
    kind: 'apartment',
    slug: 'lazio-trilocale-latina-lido-via-elba',
    titleIt: 'Trilocale a Latina Lido, via Elba',
    titleEn: 'Two-Bedroom Apartment in Latina Lido, Via Elba',
    titleCs: 'Trilocale v Latina Lido, Via Elba',
    highlight: 'appartamento pronto vicino al mare con corte esclusiva'
  },
  {
    n: 2,
    url: 'https://www.immobiliare.it/annunci/127154217/',
    region: 'Lazio',
    kind: 'villa',
    slug: 'lazio-villa-plurifamiliare-terracina-oasi',
    titleIt: "Villa plurifamiliare all'Oasi di Terracina",
    titleEn: 'Multi-Family Villa in Terracina, Oasi',
    titleCs: 'Vicebytova vila v Terracine, Oasi',
    highlight: 'porzione di villino nel complesso Oasi a circa 250 metri dal mare'
  },
  {
    n: 3,
    url: 'https://www.immobiliare.it/annunci/128241706/',
    region: 'Lazio',
    kind: 'villa',
    slug: 'lazio-villa-bifamiliare-latina-macchia-grande',
    titleIt: 'Villa bifamiliare a Latina, Strada Macchia Grande',
    titleEn: 'Semi-Detached Villa in Latina, Strada Macchia Grande',
    titleCs: 'Polovina vily v Latine, Strada Macchia Grande',
    highlight: 'porzione di bifamiliare ristrutturata nel 2025 con giardino'
  },
  {
    n: 5,
    url: 'https://www.immobiliare.it/annunci/121470636/',
    region: 'Molise',
    kind: 'apartment',
    slug: 'molise-bilocale-campomarino-lido-stazione',
    titleIt: 'Bilocale a Campomarino Lido, via della Stazione',
    titleEn: 'Apartment in Campomarino Lido, Via della Stazione',
    titleCs: 'Byt v Campomarino Lido, Via della Stazione',
    highlight: 'appartamento all ultimo piano a Campomarino Lido'
  },
  {
    n: 6,
    url: 'https://www.immobiliare.it/annunci/120467710/',
    region: 'Campania',
    kind: 'house',
    slug: 'campania-casa-indipendente-apice-tignano',
    titleIt: 'Casa indipendente in Contrada Tignano, Apice',
    titleEn: 'Detached House in Contrada Tignano, Apice',
    titleCs: 'Samostatny dum v Contrada Tignano, Apice',
    highlight: 'casa indipendente da ristrutturare con terreno agricolo panoramico',
    manualData: {
      url: 'https://www.immobiliare.it/annunci/120467710/',
      title: 'Terratetto unifamiliare Contrada Tignano, Apice',
      typology: 'Casa indipendente',
      city: 'Apice',
      address: 'Contrada Tignano',
      priceLabel: 65000,
      surface: '140 m²',
      rooms: '3',
      bedrooms: '2',
      bathrooms: '1',
      latitude: 41.1453,
      longitude: 14.9397,
      imageUrls: ['https://pwm.im-cdn.it/image/1703941398/m-c.jpg'],
      description:
        'Casa indipendente in zona collinare e panoramica di Apice, a circa 7 km dal centro, con terreno agricolo circostante di circa 12.000 mq, giardino, depositi al seminterrato e abitazione al piano rialzato.'
    }
  },
  {
    n: 7,
    url: 'https://www.immobiliare.it/annunci/122288966/',
    region: 'Campania',
    kind: 'house',
    slug: 'campania-terratetto-apice-contrada-alvino',
    titleIt: 'Terratetto plurifamiliare in Contrada Alvino, Apice',
    titleEn: 'Multi-Family House in Contrada Alvino, Apice',
    titleCs: 'Vicebytovy dum v Contrada Alvino, Apice',
    highlight: 'proprieta collinare con due abitazioni, depositi e terreno agricolo'
  },
  {
    n: 8,
    url: 'https://www.immobiliare.it/annunci/128206104/',
    region: 'Puglia',
    kind: 'house',
    slug: 'puglia-terratetto-san-giovanni-rotondo-cavour',
    titleIt: 'Terratetto a San Giovanni Rotondo, via Cavour',
    titleEn: 'Townhouse in San Giovanni Rotondo, Via Cavour',
    titleCs: 'Mestsky dum v San Giovanni Rotondo, Via Cavour',
    highlight: 'soluzione indipendente in pieno centro su piu livelli'
  },
  {
    n: 9,
    url: 'https://www.immobiliare.it/annunci/125873951/',
    region: 'Puglia',
    kind: 'villa',
    slug: 'puglia-villa-bifamiliare-vico-del-gargano-mannarelle',
    titleIt: 'Villa bifamiliare a Vico del Gargano, Contrada Mannarelle',
    titleEn: 'Semi-Detached Villa in Vico del Gargano, Contrada Mannarelle',
    titleCs: 'Polovina vily ve Vico del Gargano, Contrada Mannarelle',
    highlight: 'villa panoramica sul Gargano con giardino, garage e vista mare'
  },
  {
    n: 10,
    url: 'https://www.immobiliare.it/annunci/126867719/',
    region: 'Puglia',
    kind: 'villa',
    slug: 'puglia-villa-san-giovanni-rotondo-sp43',
    titleIt: 'Villa bifamiliare a San Giovanni Rotondo, via SP43',
    titleEn: 'Semi-Detached Villa in San Giovanni Rotondo, SP43',
    titleCs: 'Polovina vily v San Giovanni Rotondo, SP43',
    highlight: 'villa indipendente con ampio terreno a circa 1 km dal centro'
  }
]

const REGION_NAMES = {
  Lazio: { it: 'Lazio', en: 'Lazio', cs: 'Lazio' },
  Molise: { it: 'Molise', en: 'Molise', cs: 'Molise' },
  Campania: { it: 'Campania', en: 'Campania', cs: 'Kampanie' },
  Puglia: { it: 'Puglia', en: 'Apulia', cs: 'Apulie' }
}

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function num(value) {
  if (value == null) return 0
  const cleaned = String(value).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')
  const parsed = Number.parseFloat(cleaned)
  return Number.isFinite(parsed) ? Math.round(parsed) : 0
}

function rooms(value) {
  if (String(value || '').includes('5+')) return 6
  return num(value)
}

function normalizeAddress(data) {
  return [data.address, data.streetNumber, data.city]
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .join(', ')
}

function regionNames(region) {
  return REGION_NAMES[region] || { it: region, en: region, cs: region }
}

function typeIt(kind) {
  if (kind === 'villa') return 'villa'
  if (kind === 'house') return 'casa indipendente'
  return 'appartamento'
}

function kindEn(kind) {
  if (kind === 'villa') return 'villa'
  if (kind === 'house') return 'house'
  return 'apartment'
}

function trFeatureItToEn(feature) {
  return String(feature)
    .replace('mq commerciali', 'commercial sqm')
    .replace('locali', 'rooms')
    .replace('camere da letto', 'bedrooms')
    .replace('bagni', 'bathrooms')
    .replace('indirizzo indicato:', 'listed address:')
    .replace('appartamento pronto vicino al mare', 'ready-to-use apartment near the sea')
    .replace('porzione di villino', 'villa portion')
    .replace('porzione di bifamiliare', 'semi-detached portion')
    .replace('appartamento all ultimo piano', 'top-floor apartment')
    .replace('casa indipendente', 'detached house')
    .replace('soluzione indipendente', 'independent home')
    .replace('villa panoramica', 'panoramic villa')
}

function trFeatureItToCs(feature) {
  return String(feature)
    .replace('mq commerciali', 'm2 komercni plochy')
    .replace('locali', 'mistnosti')
    .replace('camere da letto', 'loznice')
    .replace('bagni', 'koupelny')
    .replace('indirizzo indicato:', 'uvedena adresa:')
    .replace('appartamento pronto vicino al mare', 'byt pripraveny k bydleni blizko more')
    .replace('porzione di villino', 'cast vilky')
    .replace('porzione di bifamiliare', 'cast dvojdomu')
    .replace('appartamento all ultimo piano', 'byt v poslednim patre')
    .replace('casa indipendente', 'samostatny dum')
    .replace('soluzione indipendente', 'samostatne bydleni')
    .replace('villa panoramica', 'panoramaticka vila')
}

function buildFeatures(meta, data) {
  const values = [
    meta.highlight,
    `${num(data.surface) || data.surface} mq commerciali`,
    `${rooms(data.rooms) || data.rooms} locali`,
    `${num(data.bedrooms) || data.bedrooms} camere da letto`,
    `${num(data.bathrooms) || data.bathrooms} bagni`
  ].filter(Boolean)
  if (data.address) values.push(`indirizzo indicato: ${normalizeAddress(data)}`)
  return values.slice(0, 6)
}

function descriptions(meta, data) {
  const sqm = num(data.surface)
  const roomCount = rooms(data.rooms)
  const bedrooms = num(data.bedrooms)
  const bathrooms = num(data.bathrooms)
  const address = normalizeAddress(data)
  const rn = regionNames(meta.region)
  const type = typeIt(meta.kind)
  const sourceText = String(data.description || '').trim()

  return {
    it: `A ${data.city}, proponiamo ${type} con ${sqm} mq, ${roomCount} locali, ${bedrooms} camere e ${bathrooms} bagni. La proprieta si trova in ${address || 'posizione indicata nell annuncio'} e rappresenta una soluzione concreta per chi cerca una casa in ${rn.it} con dati chiari e prezzo definito.\n\nIl punto forte dell annuncio e ${meta.highlight}. ${sourceText ? `Dalla descrizione emerge inoltre: ${sourceText}` : 'La distribuzione interna e la metratura rendono l immobile interessante per uso personale o valutazione di investimento.'}\n\nLa proposta richiede come sempre verifica documentale, controllo tecnico e sopralluogo prima di qualsiasi decisione di acquisto.`,
    en: `In ${data.city}, this ${kindEn(meta.kind)} offers ${sqm} sqm, ${roomCount} rooms, ${bedrooms} bedrooms and ${bathrooms} bathrooms. The property is located at ${address || 'the address stated in the listing'} and is a practical option for buyers looking in ${rn.en} with clear figures and a defined asking price.\n\nThe key point is ${trFeatureItToEn(meta.highlight)}. The layout and size make the property suitable for personal use or for an investment assessment, depending on the buyer's goals.\n\nAs always, documents, technical condition and an on-site visit should be checked before any purchase decision.`,
    cs: `V lokalite ${data.city} nabizi tato nemovitost ${sqm} m2, ${roomCount} mistnosti, ${bedrooms} loznice a ${bathrooms} koupelny. Nachazi se na adrese ${address || 'uvedene v inzeratu'} a predstavuje praktickou moznost pro kupujici, kteri hledaji nemovitost v regionu ${rn.cs} s jasnymi udaji a stanovenou cenou.\n\nHlavnim bodem nabidky je ${trFeatureItToCs(meta.highlight)}. Dispozice a velikost mohou davat smysl jak pro vlastni uzivani, tak pro investicni posouzeni podle cilu kupujiciho.\n\nPred rozhodnutim o koupi je nutne proverit dokumentaci, technicky stav a nemovitost osobne navstivit.`
  }
}

function extractFirstHtml(file) {
  const raw = fs.readFileSync(file, 'utf8')
  const marker = '"text": "<!DOCTYPE html'
  const m = raw.indexOf(marker)
  if (m < 0) throw new Error(`No HTML marker in ${file}`)
  const start = raw.indexOf('"', raw.indexOf(':', m) + 1)
  let out = ''
  for (let i = start + 1; i < raw.length; i += 1) {
    const ch = raw[i]
    if (ch === '\\') {
      const next = raw[++i]
      if (next === '"') out += '"'
      else if (next === '\\') out += '\\'
      else if (next === '/') out += '/'
      else if (next === 'b') out += '\b'
      else if (next === 'f') out += '\f'
      else if (next === 'n') out += '\n'
      else if (next === 'r') out += '\r'
      else if (next === 't') out += '\t'
      else if (next === 'u') {
        out += String.fromCharCode(parseInt(raw.slice(i + 1, i + 5), 16))
        i += 4
      } else out += next
    } else if (ch === '"') break
    else out += ch
  }
  return out
}

function extractFromInvalidHar(harPath) {
  const html = extractFirstHtml(harPath)
  const nextRaw = html.match(/<script[^>]+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i)?.[1]
  if (!nextRaw) throw new Error(`No __NEXT_DATA__ in ${harPath}`)
  const pageProps = JSON.parse(nextRaw).props.pageProps
  const realEstate = pageProps.detailData.realEstate
  const property = realEstate.properties[0]
  const photos = property.multimedia?.photos || []
  const imageUrls = photos
    .map((photo) => photo?.urls?.xxl || photo?.urls?.large || photo?.urls?.medium || photo?.urls?.['m-c'])
    .filter(Boolean)
    .slice(0, 14)

  return {
    url: pageProps.detailData.seo?.canonical,
    title: realEstate.title,
    typology: realEstate.typology?.name || '',
    city: property.location?.city || '',
    address: property.location?.address || '',
    streetNumber: property.location?.streetNumber || '',
    priceLabel: realEstate.price?.value || realEstate.price?.label || 0,
    surface: property.surface?.value || property.surface || '',
    rooms: property.rooms?.value || property.rooms || '',
    bedrooms: property.bedRoomsNumber?.value || property.bedRoomsNumber || '',
    bathrooms: property.bathrooms?.value || property.bathrooms || '',
    description: property.description || '',
    latitude: property.location?.latitude,
    longitude: property.location?.longitude,
    imageUrls
  }
}

function getData(meta, harPath, imagesDir) {
  if (meta.manualData) return meta.manualData
  try {
    return extractListingData(harPath, imagesDir)
  } catch {
    return extractFromInvalidHar(harPath)
  }
}

function buildListing(meta, data) {
  const featuresIt = buildFeatures(meta, data)
  const desc = descriptions(meta, data)
  const address = normalizeAddress(data)
  const rn = regionNames(meta.region)
  const sqm = num(data.surface)
  const bedroomCount = num(data.bedrooms)
  const bathroomCount = num(data.bathrooms)
  const price = num(data.priceLabel)

  return {
    slug: meta.slug,
    title_it: meta.titleIt,
    title_en: meta.titleEn,
    title_cs: meta.titleCs,
    propertyType: meta.kind,
    propertyType_it: typeIt(meta.kind),
    region_it: rn.it,
    city_it: data.city,
    city_en: data.city,
    city_cs: data.city,
    address_it: address,
    address_en: address,
    address_cs: address,
    price,
    rooms: rooms(data.rooms),
    bedrooms: bedroomCount,
    bathrooms: bathroomCount,
    square_meters: sqm,
    features: featuresIt.map((it) => ({ it, en: trFeatureItToEn(it), cs: trFeatureItToCs(it) })),
    description_it: desc.it,
    description_en: desc.en,
    description_cs: desc.cs,
    seo_title_it: `${meta.titleIt} in vendita`,
    seo_title_en: `${meta.titleEn} for sale`,
    seo_title_cs: `${meta.titleCs} na prodej`,
    seo_description_it: `${data.city}: ${typeIt(meta.kind)} di ${sqm} mq, ${bedroomCount} camere, ${bathroomCount} bagni. Prezzo ${price.toLocaleString('it-IT')} euro.`,
    seo_description_en: `${data.city}: ${kindEn(meta.kind)} of ${sqm} sqm, ${bedroomCount} bedrooms, ${bathroomCount} bathrooms. Asking price EUR ${price.toLocaleString('en-US')}.`,
    seo_description_cs: `${data.city}: nemovitost ${sqm} m2, ${bedroomCount} loznice, ${bathroomCount} koupelny. Cena ${price.toLocaleString('cs-CZ')} EUR.`,
    status: 'available',
    featured: false,
    keywords: [slugify(meta.region), slugify(data.city), meta.kind, slugify(data.address), 'immobiliare-it'].filter(Boolean),
    source_url: meta.url,
    lat: data.latitude,
    lng: data.longitude,
    image_urls: data.imageUrls || data.gallery || []
  }
}

function main() {
  const summary = []

  for (const meta of ITEMS) {
    const harPath = path.join(HAR_ROOT, `${meta.n}.har`)
    const folder = path.join(IMPORT_ROOT, meta.slug)
    const imagesDir = path.join(folder, 'images')
    fs.mkdirSync(imagesDir, { recursive: true })

    const data = getData(meta, harPath, imagesDir)
    const listing = buildListing(meta, data)
    fs.writeFileSync(path.join(folder, 'listing.json'), `${JSON.stringify(listing, null, 2)}\n`, 'utf8')

    summary.push({
      n: meta.n,
      slug: meta.slug,
      city: data.city,
      price: listing.price,
      sqm: listing.square_meters,
      localImages: fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir).length : 0,
      remoteImages: listing.image_urls.length
    })
  }

  console.table(summary)
  console.log('Skipped n.4: 4.har is empty and no reliable listing data was available.')
}

main()
