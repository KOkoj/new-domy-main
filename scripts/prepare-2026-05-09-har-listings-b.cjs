#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { extractListingData } = require('./extract-listing-data.cjs')

const ROOT = process.cwd()
const HAR_ROOT = 'C:/Users/39327/Desktop/Har sito'
const IMPORT_ROOT = path.join(ROOT, 'data', 'import', 'properties')

const ITEMS = [
  { n: 1, url: 'https://www.immobiliare.it/annunci/128775662/', region: 'Lazio', kind: 'apartment', slug: 'lazio-bilocale-roma-monteverde-trasfigurazione', titleIt: 'Bilocale a Roma Monteverde Nuovo', titleEn: 'One-Bedroom Apartment in Rome Monteverde Nuovo', titleCs: 'Dvoupokojovy byt v Rime Monteverde Nuovo', highlight: 'piazza della Trasfigurazione nel quartiere Monteverde Nuovo' },
  { n: 2, url: 'https://www.immobiliare.it/annunci/123387041/', region: 'Lazio', kind: 'apartment', slug: 'lazio-bilocale-anzio-spadellata-susino', titleIt: 'Bilocale ad Anzio, zona Spadellata', titleEn: 'One-Bedroom Apartment in Anzio, Spadellata Area', titleCs: 'Dvoupokojovy byt v Anziu, oblast Spadellata', highlight: 'bilocale con due bagni nella zona Spadellata' },
  { n: 3, url: 'https://www.immobiliare.it/annunci/128937298/', region: 'Abruzzo', kind: 'house', slug: 'abruzzo-terratetto-sante-marie-ludovici', titleIt: 'Terratetto plurifamiliare a Sante Marie', titleEn: 'Multi-Family Townhouse in Sante Marie', titleCs: 'Vicegeneracni radovy dum v Sante Marie', highlight: 'grande terratetto nel centro di Sante Marie' },
  { n: 4, url: 'https://www.immobiliare.it/annunci/128777492/', region: 'Lazio', kind: 'apartment', slug: 'lazio-trilocale-roma-balduina-cecilio-stazio', titleIt: 'Trilocale a Roma Balduina', titleEn: 'Two-Bedroom Apartment in Rome Balduina', titleCs: 'Trilocale v Rime Balduina', highlight: 'zona Balduina con taglio compatto e due camere' },
  { n: 5, url: 'https://www.immobiliare.it/annunci/128244762/', region: 'Lazio', kind: 'apartment', slug: 'lazio-quadrilocale-roma-fleming-citta-di-castello', titleIt: 'Quadrilocale a Roma Fleming', titleEn: 'Four-Room Apartment in Rome Fleming', titleCs: 'Ctyrpokojovy byt v Rime Fleming', highlight: 'ampia metratura nel quartiere Fleming' },
  { n: 6, url: 'https://www.immobiliare.it/annunci/122322566/', region: 'Abruzzo', kind: 'apartment', slug: 'abruzzo-trilocale-villetta-barrea-marsicana', titleIt: 'Trilocale a Villetta Barrea', titleEn: 'Two-Bedroom Apartment in Villetta Barrea', titleCs: 'Trilocale ve Villetta Barrea', highlight: 'posizione in area montana vicino al Parco Nazionale d Abruzzo' },
  { n: 7, url: 'https://www.immobiliare.it/annunci/128187634/', region: 'Abruzzo', kind: 'apartment', slug: 'abruzzo-trilocale-vasto-pennaluce', titleIt: 'Trilocale a Vasto in via Pennaluce', titleEn: 'Two-Bedroom Apartment in Vasto, Via Pennaluce', titleCs: 'Trilocale ve Vastu, Via Pennaluce', highlight: 'zona Incoronata a Vasto con due camere' },
  { n: 8, url: 'https://www.immobiliare.it/annunci/127611620/', region: 'Abruzzo', kind: 'apartment', slug: 'abruzzo-quadrilocale-pescara-via-teramo', titleIt: 'Quadrilocale a Pescara in via Teramo', titleEn: 'Four-Room Apartment in Pescara, Via Teramo', titleCs: 'Ctyrpokojovy byt v Pescare, Via Teramo', highlight: 'zona centrale di Pescara vicino alla stazione' }
]

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
  const parts = [data.address, data.city].map((item) => String(item || '').trim()).filter(Boolean)
  return parts.join(', ')
}

function regionNames(region) {
  const map = {
    Lazio: { it: 'Lazio', en: 'Lazio', cs: 'Lazio' },
    Abruzzo: { it: 'Abruzzo', en: 'Abruzzo', cs: 'Abruzzo' }
  }
  return map[region] || { it: region, en: region, cs: region }
}

function typeIt(kind) {
  return kind === 'house' ? 'casa indipendente' : 'appartamento'
}

function kindEn(kind) {
  return kind === 'house' ? 'independent home' : 'apartment'
}

function buildFeatures(meta, data) {
  const sqm = num(data.surface)
  const values = [
    meta.highlight,
    `${sqm || data.surface} mq commerciali`,
    `${rooms(data.rooms) || data.rooms} locali`,
    `${num(data.bedrooms) || data.bedrooms} camere da letto`,
    `${num(data.bathrooms) || data.bathrooms} bagni`
  ].filter(Boolean)
  if (data.address) values.push(`indirizzo indicato: ${data.address}`)
  return values.slice(0, 6)
}

function trFeatureItToEn(feature) {
  return String(feature)
    .replace('mq commerciali', 'commercial sqm')
    .replace('locali', 'rooms')
    .replace('camere da letto', 'bedrooms')
    .replace('bagni', 'bathrooms')
    .replace('indirizzo indicato:', 'listed address:')
    .replace('bilocale', 'one-bedroom apartment')
    .replace('zona centrale', 'central area')
    .replace('ampia metratura', 'large floor area')
    .replace('grande terratetto', 'large townhouse')
    .replace('quartiere', 'district')
    .replace('vicino alla stazione', 'near the station')
}

function trFeatureItToCs(feature) {
  return String(feature)
    .replace('mq commerciali', 'm2 komercni plochy')
    .replace('locali', 'mistnosti')
    .replace('camere da letto', 'loznice')
    .replace('bagni', 'koupelny')
    .replace('indirizzo indicato:', 'uvedena adresa:')
    .replace('bilocale', 'dvoupokojovy byt')
    .replace('zona centrale', 'centralni oblast')
    .replace('ampia metratura', 'velka plocha')
    .replace('grande terratetto', 'velky radovy dum')
    .replace('quartiere', 'ctvrt')
    .replace('vicino alla stazione', 'blizko nadrazi')
}

function descriptions(meta, data) {
  const sqm = num(data.surface)
  const roomCount = rooms(data.rooms)
  const bedrooms = num(data.bedrooms)
  const bathrooms = num(data.bathrooms)
  const address = normalizeAddress(data)
  const rn = regionNames(meta.region)

  return {
    it: `A ${data.city}, proponiamo ${typeIt(meta.kind)} con ${sqm} mq, ${roomCount} locali, ${bedrooms} camere e ${bathrooms} bagni. La proprieta si trova in ${address || 'posizione indicata nell annuncio'} e rappresenta una soluzione concreta per chi cerca una casa in ${rn.it} con dati chiari e prezzo definito.\n\nIl punto forte dell annuncio e ${meta.highlight}. La distribuzione interna e la metratura rendono l immobile adatto sia a uso personale sia a valutazioni di investimento, secondo le esigenze dell acquirente.\n\nLa proposta richiede come sempre verifica documentale, controllo tecnico e sopralluogo prima di qualsiasi decisione di acquisto.`,
    en: `In ${data.city}, this ${kindEn(meta.kind)} offers ${sqm} sqm, ${roomCount} rooms, ${bedrooms} bedrooms and ${bathrooms} bathrooms. The property is located at ${address || 'the address stated in the listing'} and is a practical option for buyers looking in ${rn.en} with clear figures and a defined asking price.\n\nThe key point is ${trFeatureItToEn(meta.highlight)}. The internal layout and size make it suitable for personal use or for an investment assessment, depending on the buyer's goals.\n\nAs always, documents, technical condition and an on-site visit should be checked before any purchase decision.`,
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
    priceLabel: realEstate.price?.value || realEstate.price?.label || 0,
    surface: property.surface?.value || property.surface || '',
    rooms: property.rooms?.value || property.rooms || '',
    bedrooms: property.bedRoomsNumber?.value || property.bedRoomsNumber || '',
    bathrooms: property.bathrooms?.value || property.bathrooms || '',
    latitude: property.location?.latitude,
    longitude: property.location?.longitude,
    imageUrls
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
    price: num(data.priceLabel),
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
    seo_description_it: `${data.city}: ${typeIt(meta.kind)} di ${sqm} mq, ${bedroomCount} camere, ${bathroomCount} bagni. Prezzo ${num(data.priceLabel).toLocaleString('it-IT')} euro.`,
    seo_description_en: `${data.city}: ${kindEn(meta.kind)} of ${sqm} sqm, ${bedroomCount} bedrooms, ${bathroomCount} bathrooms. Asking price EUR ${num(data.priceLabel).toLocaleString('en-US')}.`,
    seo_description_cs: `${data.city}: nemovitost ${sqm} m2, ${bedroomCount} loznice, ${bathroomCount} koupelny. Cena ${num(data.priceLabel)} EUR.`,
    status: 'available',
    featured: false,
    keywords: [slugify(meta.region), slugify(data.city), meta.kind, slugify(data.address), 'immobiliare-it'].filter(Boolean),
    source_url: meta.url,
    lat: data.latitude,
    lng: data.longitude,
    image_urls: data.imageUrls || []
  }
}

function getData(harPath, imagesDir) {
  try {
    return extractListingData(harPath, imagesDir)
  } catch {
    return extractFromInvalidHar(harPath)
  }
}

function main() {
  const summary = []
  for (const meta of ITEMS) {
    const harPath = path.join(HAR_ROOT, `${meta.n}har.har`)
    const folder = path.join(IMPORT_ROOT, meta.slug)
    const imagesDir = path.join(folder, 'images')
    fs.mkdirSync(imagesDir, { recursive: true })

    const data = getData(harPath, imagesDir)
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
}

main()
