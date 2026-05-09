#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { extractListingData } = require('./extract-listing-data.cjs')

const ROOT = process.cwd()
const HAR_ROOT = 'C:/Users/39327/Desktop/Har sito'
const IMPORT_ROOT = path.join(ROOT, 'data', 'import', 'properties')

const ITEMS = [
  { n: 1, url: 'https://www.immobiliare.it/annunci/128743436/', region: 'Marche', kind: 'house', slug: 'marche-terratetto-offagna-centro', titleIt: 'Terratetto in ottimo stato nel centro di Offagna', titleEn: 'Townhouse in Excellent Condition in Central Offagna', titleCs: 'Radovy dum ve vybornem stavu v centru Offagny', highlight: 'ampia casa indipendente nel centro di Offagna' },
  { n: 2, url: 'https://www.immobiliare.it/annunci/127581588/', region: 'Marche', kind: 'apartment', slug: 'marche-quadrilocale-fano-sant-orso-de-curtis', titleIt: "Quadrilocale a Fano, zona Sant'Orso", titleEn: "Four-Room Apartment in Fano, Sant'Orso", titleCs: "Ctyrpokojovy byt ve Fanu, Sant'Orso", highlight: 'quartiere residenziale Sant Orso con doppi servizi' },
  { n: 3, url: 'https://www.immobiliare.it/annunci/126851667/', region: 'Emilia-Romagna', kind: 'apartment', slug: 'emilia-romagna-appartamento-rimini-bellariva-armellini', titleIt: 'Appartamento spazioso a Rimini Bellariva', titleEn: 'Spacious Apartment in Rimini Bellariva', titleCs: 'Prostorny byt v Rimini Bellariva', highlight: 'zona Bellariva vicina ai servizi e al mare' },
  { n: 4, url: 'https://www.immobiliare.it/annunci/128638974/', region: 'Emilia-Romagna', kind: 'apartment', slug: 'emilia-romagna-trilocale-riccione-parco-monterosa', titleIt: 'Trilocale a Riccione, zona Parco', titleEn: 'Two-Bedroom Apartment in Riccione, Parco Area', titleCs: 'Trilocale v Riccione, oblast Parco', highlight: 'zona Parco a Riccione con spazi ben distribuiti' },
  { n: 5, url: 'https://www.immobiliare.it/annunci/118735713/', region: 'Marche', kind: 'house', slug: 'marche-terratetto-fabriano-collamato', titleIt: 'Terratetto a Collamato, Fabriano', titleEn: 'Townhouse in Collamato, Fabriano', titleCs: 'Radovy dum v Collamatu u Fabriana', highlight: 'soluzione indipendente nella frazione Collamato' },
  { n: 6, url: 'https://www.immobiliare.it/annunci/106748975/', region: 'Marche', kind: 'house', slug: 'marche-terratetto-treia-contrada-berta', titleIt: 'Terratetto in Contrada Berta a Treia', titleEn: 'Townhouse in Contrada Berta, Treia', titleCs: 'Radovy dum v Contrada Berta u Treie', highlight: 'casa indipendente compatta in contesto marchigiano' },
  { n: 7, url: 'https://www.immobiliare.it/annunci/125411963/', region: 'Marche', kind: 'villa', slug: 'marche-villa-cantiano-martiri-resistenza', titleIt: 'Villa unifamiliare a Cantiano', titleEn: 'Detached Villa in Cantiano', titleCs: 'Samostatna vila v Cantianu', highlight: 'grande metratura e posizione centrale a Cantiano' },
  { n: 8, url: 'https://www.immobiliare.it/annunci/128635466/', region: 'Umbria', kind: 'house', slug: 'umbria-terratetto-gualdo-tadino-fratelli-tromba', titleIt: 'Terratetto a Gualdo Tadino centro', titleEn: 'Townhouse in Central Gualdo Tadino', titleCs: 'Radovy dum v centru Gualdo Tadino', highlight: 'abitazione plurifamiliare in centro storico' },
  { n: 9, url: 'https://www.immobiliare.it/annunci/125346019/', region: 'Umbria', kind: 'villa', slug: 'umbria-villa-perugia-montevile', titleIt: 'Villa con grande superficie a Perugia Montevile', titleEn: 'Large Villa in Perugia Montevile', titleCs: 'Velka vila v Perugii Montevile', highlight: 'villa con ampi spazi e terreno a Montevile' },
  { n: 10, url: 'https://www.immobiliare.it/annunci/127718822/', region: 'Umbria', kind: 'villa', slug: 'umbria-villa-cannara-sant-angelo', titleIt: "Villa a Cannara in via Sant'Angelo", titleEn: "Villa in Cannara on Via Sant'Angelo", titleCs: "Vila v Cannare ve Via Sant'Angelo", highlight: 'villa indipendente con tre camere e doppi servizi' },
  { n: 11, url: 'https://www.immobiliare.it/annunci/124223825/', region: 'Umbria', kind: 'villa', slug: 'umbria-villa-bifamiliare-corciano-chiugiana', titleIt: 'Villa bifamiliare a Corciano, Chiugiana', titleEn: 'Semi-Detached Villa in Corciano, Chiugiana', titleCs: 'Polovina vily v Corcianu, Chiugiana', highlight: 'villa bifamiliare con metratura importante a Corciano' },
  { n: 12, url: 'https://www.immobiliare.it/annunci/128638238/', region: 'Lazio', kind: 'apartment', slug: 'lazio-bilocale-viterbo-mattonara', titleIt: 'Bilocale a Viterbo in via della Mattonara', titleEn: 'One-Bedroom Apartment in Viterbo, Via della Mattonara', titleCs: 'Dvoupokojovy byt ve Viterbu, Via della Mattonara', highlight: 'bilocale compatto a San Martino al Cimino' },
  { n: 13, url: 'https://www.immobiliare.it/annunci/111281773/', region: 'Lazio', kind: 'house', slug: 'lazio-terratetto-faleria-giacomo-matteotti', titleIt: 'Terratetto con giardino a Faleria', titleEn: 'Townhouse with Garden in Faleria', titleCs: 'Radovy dum se zahradou ve Falerii', highlight: 'giardino esclusivo e posizione alta a Faleria', fallback: { title: 'Terratetto unifamiliare via Giacomo Matteotti 31, Faleria', typology: 'Casa indipendente', city: 'Faleria', address: 'Via Giacomo Matteotti 31', priceLabel: 89000, surface: 113, rooms: '4', bedrooms: '2', bathrooms: '1', latitude: 42.6811, longitude: 12.4457, imageUrls: ['https://pwm.im-cdn.it/image/1911769260/m-c.jpg'] } },
  { n: 14, url: 'https://www.immobiliare.it/annunci/123692641/', region: 'Umbria', kind: 'apartment', slug: 'umbria-quadrilocale-terni-maratta-narni', titleIt: 'Quadrilocale a Terni, zona Maratta', titleEn: 'Four-Room Apartment in Terni, Maratta Area', titleCs: 'Ctyrpokojovy byt v Terni, oblast Maratta', highlight: 'quadrilocale con tre camere a Maratta' },
  { n: 15, url: 'https://www.immobiliare.it/annunci/128630928/', region: 'Lazio', kind: 'villa', slug: 'lazio-villa-rignano-flaminio-montelarco', titleIt: 'Villa a Rignano Flaminio, Montelarco', titleEn: 'Villa in Rignano Flaminio, Montelarco', titleCs: 'Vila v Rignano Flaminio, Montelarco', highlight: 'villa con tre camere nella zona Montelarco' },
  { n: 16, url: 'https://www.immobiliare.it/annunci/127834878/', region: 'Lazio', kind: 'villa', slug: 'lazio-villa-bifamiliare-orte-camerano', titleIt: 'Villa bifamiliare a Orte in via Camerano', titleEn: 'Semi-Detached Villa in Orte, Via Camerano', titleCs: 'Polovina vily v Orte, Via Camerano', highlight: 'villa bifamiliare con grande superficie a Orte' },
  { n: 17, url: 'https://www.immobiliare.it/annunci/127213249/', region: 'Lazio', kind: 'villa', slug: 'lazio-villa-marta-via-laertina', titleIt: 'Villa unifamiliare a Marta in via Laertina', titleEn: 'Detached Villa in Marta, Via Laertina', titleCs: 'Samostatna vila v Marte, Via Laertina', highlight: 'villa vicina al Lago di Bolsena' },
  { n: 18, url: 'https://www.immobiliare.it/annunci/128841204/', region: 'Lazio', kind: 'apartment', slug: 'lazio-bilocale-anzio-santa-teresa-andromaca', titleIt: 'Bilocale ad Anzio, Santa Teresa', titleEn: 'One-Bedroom Apartment in Anzio, Santa Teresa', titleCs: 'Dvoupokojovy byt v Anziu, Santa Teresa', highlight: 'bilocale nella zona Santa Teresa ad Anzio' },
  { n: 19, url: 'https://www.immobiliare.it/annunci/127746584/', region: 'Lazio', kind: 'villa', slug: 'lazio-villa-bifamiliare-ardea-paese-salvie', titleIt: 'Villa bifamiliare ad Ardea Paese', titleEn: 'Semi-Detached Villa in Ardea Paese', titleCs: 'Polovina vily v Ardea Paese', highlight: 'villa bifamiliare con quattro camere ad Ardea' },
  { n: 20, url: 'https://www.immobiliare.it/annunci/119476777/', region: 'Lazio', kind: 'villa', slug: 'lazio-villa-lanuvio-laviniense', titleIt: 'Villa unifamiliare a Lanuvio', titleEn: 'Detached Villa in Lanuvio', titleCs: 'Samostatna vila v Lanuviu', highlight: 'villa di ampia metratura nel centro di Lanuvio' }
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
    Marche: { it: 'Marche', en: 'Marche', cs: 'Marky' },
    'Emilia-Romagna': { it: 'Emilia-Romagna', en: 'Emilia-Romagna', cs: 'Emilie-Romagna' },
    Umbria: { it: 'Umbria', en: 'Umbria', cs: 'Umbrie' },
    Lazio: { it: 'Lazio', en: 'Lazio', cs: 'Lazio' }
  }
  return map[region] || { it: region, en: region, cs: region }
}

function typeIt(kind) {
  return kind === 'villa' ? 'villa' : kind === 'house' ? 'casa indipendente' : 'appartamento'
}

function kindEn(kind) {
  return kind === 'villa' ? 'villa' : kind === 'house' ? 'independent home' : 'apartment'
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
    .replace('casa indipendente', 'independent home')
    .replace('abitazione plurifamiliare', 'multi-family home')
    .replace('villa bifamiliare', 'semi-detached villa')
    .replace('villa indipendente', 'detached villa')
    .replace('ampia casa indipendente', 'large independent home')
    .replace('grande metratura', 'large size')
    .replace('grande superficie', 'large floor area')
    .replace('zona residenziale', 'residential area')
    .replace('centro storico', 'historic centre')
    .replace('giardino esclusivo', 'private garden')
    .replace('posizione alta', 'elevated position')
    .replace('vicina al Lago di Bolsena', 'near Lake Bolsena')
}

function trFeatureItToCs(feature) {
  return String(feature)
    .replace('mq commerciali', 'm2 komercni plochy')
    .replace('locali', 'mistnosti')
    .replace('camere da letto', 'loznice')
    .replace('bagni', 'koupelny')
    .replace('indirizzo indicato:', 'uvedena adresa:')
    .replace('casa indipendente', 'samostatny dum')
    .replace('abitazione plurifamiliare', 'vicegeneracni dum')
    .replace('villa bifamiliare', 'polovina vily')
    .replace('villa indipendente', 'samostatna vila')
    .replace('ampia casa indipendente', 'velky samostatny dum')
    .replace('grande metratura', 'velka plocha')
    .replace('grande superficie', 'velka plocha')
    .replace('zona residenziale', 'rezidencni oblast')
    .replace('centro storico', 'historicke centrum')
    .replace('giardino esclusivo', 'soukroma zahrada')
    .replace('posizione alta', 'vyvysena poloha')
    .replace('vicina al Lago di Bolsena', 'blizko jezera Bolsena')
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

function getData(meta, harPath, imagesDir) {
  if (meta.fallback) return meta.fallback

  try {
    return extractListingData(harPath, imagesDir)
  } catch {
    return extractFromInvalidHar(harPath)
  }
}

function main() {
  const summary = []
  for (const meta of ITEMS) {
    const harPath = path.join(HAR_ROOT, `har${meta.n}a.har`)
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
}

main()
