#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { extractListingData } = require('./extract-listing-data.cjs')

const ROOT = process.cwd()
const HAR_ROOT = 'C:/Users/39327/Desktop/Har sito'
const IMPORT_ROOT = path.join(ROOT, 'data', 'import', 'properties')

const ITEMS = [
  { n: 1, url: 'https://www.immobiliare.it/annunci/128798952/', region: 'Toscana', kind: 'apartment', slug: 'toscana-bilocale-santa-maria-a-monte-taccione', titleIt: 'Bilocale da investimento a Santa Maria a Monte', titleEn: 'Investment One-Bedroom Apartment in Santa Maria a Monte', titleCs: 'Investicni dvoupokojovy byt v Santa Maria a Monte', highlight: 'investimento a reddito in Via Taccione' },
  { n: 2, url: 'https://www.immobiliare.it/annunci/128108086/', region: 'Toscana', kind: 'apartment', slug: 'toscana-appartamento-pistoia-cireglio-collina', titleIt: 'Appartamento collinare a Cireglio, Pistoia', titleEn: 'Hill-Setting Apartment in Cireglio, Pistoia', titleCs: 'Byt v kopcovite casti Cireglio u Pistoie', highlight: 'contesto collinare e verde a Cireglio' },
  { n: 3, url: 'https://www.immobiliare.it/annunci/127970410/', region: 'Toscana', kind: 'apartment', slug: 'toscana-trilocale-santa-croce-sull-arno-mazzini', titleIt: "Trilocale a Santa Croce sull'Arno", titleEn: "Two-Bedroom Apartment in Santa Croce sull'Arno", titleCs: "Trilocale v Santa Croce sull'Arno", highlight: 'secondo e ultimo piano in piccolo contesto' },
  { n: 4, url: 'https://www.immobiliare.it/annunci/127300135/', region: 'Toscana', kind: 'house', slug: 'toscana-terratetto-san-marcello-piteglio-calamecca', titleIt: 'Terratetto nel borgo di Calamecca', titleEn: 'Village Townhouse in Calamecca', titleCs: 'Radovy dum v obci Calamecca', highlight: 'abitazione indipendente su tre livelli nel borgo' },
  { n: 5, url: 'https://www.immobiliare.it/annunci/119798110/', region: 'Toscana', kind: 'apartment', slug: 'toscana-trilocale-firenze-le-cure-cavalcanti', titleIt: 'Trilocale ristrutturato nel quartiere Le Cure', titleEn: 'Renovated Two-Bedroom Apartment in Florence Le Cure', titleCs: 'Zrekonstruovany trilocale ve Florencii Le Cure', highlight: 'ristrutturazione completa prevista nel 2025' },
  { n: 6, url: 'https://www.immobiliare.it/annunci/127851200/', region: 'Toscana', kind: 'house', slug: 'toscana-terratetto-firenze-via-mannelli-garage', titleIt: 'Terratetto con garage in via Mannelli a Firenze', titleEn: 'Townhouse with Garage on Via Mannelli in Florence', titleCs: 'Dum s garazi ve Via Mannelli ve Florencii', highlight: 'strada interna privata e garage' },
  { n: 7, url: 'https://www.immobiliare.it/annunci/122080284/', region: 'Toscana', kind: 'villa', slug: 'toscana-villetta-pietrasanta-osterietta', titleIt: 'Villetta bifamiliare ristrutturata a Pietrasanta', titleEn: 'Renovated Semi-Detached Villa in Pietrasanta', titleCs: 'Zrekonstruovana polovina vily v Pietrasante', highlight: 'libera su tre lati e vicina al centro storico' },
  { n: 8, url: 'https://www.immobiliare.it/annunci/125977685/', region: 'Toscana', kind: 'house', slug: 'toscana-villetta-massa-ronchi-poveromo', titleIt: 'Villetta a Marina di Ronchi, Massa', titleEn: 'Small Villa in Marina di Ronchi, Massa', titleCs: 'Vilka v Marina di Ronchi u Massy', highlight: 'zona residenziale a poca distanza dalle spiagge' },
  { n: 9, url: 'https://www.immobiliare.it/annunci/121934676/', region: 'Emilia-Romagna', kind: 'house', slug: 'emilia-romagna-casa-vigarano-mainarda-via-mantova', titleIt: 'Porzione di bifamiliare a Vigarano Mainarda', titleEn: 'Two-Level Semi-Detached Home in Vigarano Mainarda', titleCs: 'Cast dvojdomu ve Vigarano Mainarda', highlight: 'porzione di abitazione su due livelli' },
  { n: 10, url: 'https://www.immobiliare.it/annunci/127222155/', region: 'Veneto', kind: 'apartment', slug: 'veneto-trilocale-legnago-porto-carducci', titleIt: 'Trilocale a Porto di Legnago', titleEn: 'Two-Bedroom Apartment in Porto di Legnago', titleCs: 'Trilocale v Porto di Legnago', highlight: 'primo piano con spazi interni flessibili' },
  { n: 11, url: 'https://www.immobiliare.it/annunci/128365194/', region: 'Veneto', kind: 'villa', slug: 'veneto-villa-bifamiliare-crespino-via-trieste', titleIt: 'Villa bifamiliare con ampi spazi a Crespino', titleEn: 'Semi-Detached Villa with Generous Spaces in Crespino', titleCs: 'Prostorna polovina vily v Crespinu', highlight: 'villa bifamiliare del 1983 in zona residenziale' },
  { n: 12, url: 'https://www.immobiliare.it/annunci/127099395/', region: 'Veneto', kind: 'villa', slug: 'veneto-villa-legnaro-vescovo-giardino', titleIt: 'Villa singola in classe A2 con grande giardino a Legnaro', titleEn: 'A2-Rated Detached Villa with Large Garden in Legnaro', titleCs: 'Samostatna vila A2 s velkou zahradou v Legnaru', highlight: 'villa del 2010 con giardino, fotovoltaico e ampi accessori' },
  { n: 13, url: 'https://www.immobiliare.it/annunci/128875114/', region: 'Veneto', kind: 'villa', slug: 'veneto-villa-massanzago-viale-roma', titleIt: 'Villa singola con grande lotto a Massanzago', titleEn: 'Detached Villa on Large Plot in Massanzago', titleCs: 'Samostatna vila s velkym pozemkem v Massanzagu', highlight: 'villa in centro paese con lotto di circa 1100 mq' },
  { n: 14, url: 'https://www.immobiliare.it/annunci/123899347/', region: 'Veneto', kind: 'house', slug: 'veneto-terratetto-venezia-castello-biennale', titleIt: 'Terra-cielo indipendente a Venezia Castello', titleEn: 'Independent Townhouse in Venice Castello', titleCs: 'Samostatny dum ve veneztske ctvrti Castello', highlight: 'ingresso indipendente vicino a Via Garibaldi e Biennale' },
  { n: 15, url: 'https://www.immobiliare.it/annunci/81535855/', region: 'Veneto', kind: 'house', slug: 'veneto-terratetto-venezia-zattere-spirito-santo', titleIt: 'Terra-cielo alle Zattere, Venezia', titleEn: 'Townhouse near Zattere in Venice', titleCs: 'Dum u Zattere v Benatkach', highlight: 'corte veneziana tranquilla vicino alle Zattere' }
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
  if (region === 'Toscana') return { it: 'Toscana', en: 'Tuscany', cs: 'Toskansko' }
  if (region === 'Veneto') return { it: 'Veneto', en: 'Veneto', cs: 'Benatsko' }
  return { it: 'Emilia-Romagna', en: 'Emilia-Romagna', cs: 'Emilie-Romagna' }
}

function typeIt(kind) {
  return kind === 'villa' ? 'villa' : kind === 'house' ? 'casa indipendente' : 'appartamento'
}

function buildFeatures(meta, data) {
  const sqm = num(data.surface)
  const featureBase = [
    meta.highlight,
    `${sqm || data.surface} mq commerciali`,
    `${rooms(data.rooms) || data.rooms} locali`,
    `${num(data.bedrooms) || data.bedrooms} camere da letto`,
    `${num(data.bathrooms) || data.bathrooms} bagni`
  ].filter(Boolean)
  if (data.address) featureBase.push(`indirizzo indicato: ${data.address}`)
  return featureBase.slice(0, 6)
}

function trFeatureItToEn(feature) {
  let text = feature
    .replace('villa bifamiliare del 1983 in zona residenziale', 'semi-detached villa from 1983 in a residential area')
    .replace('villa del 2010 con giardino, fotovoltaico e ampi accessori', '2010 villa with garden, photovoltaic system and generous accessory spaces')
  return text
    .replace('mq commerciali', 'commercial sqm')
    .replace('locali', 'rooms')
    .replace('camere da letto', 'bedrooms')
    .replace('bagni', 'bathrooms')
    .replace('indirizzo indicato:', 'listed address:')
    .replace('investimento a reddito', 'income investment')
    .replace('contesto collinare e verde', 'green hillside setting')
    .replace('secondo e ultimo piano', 'second and top floor')
    .replace('abitazione indipendente', 'independent home')
    .replace('ristrutturazione completa', 'full renovation')
    .replace('strada interna privata e garage', 'private internal road and garage')
    .replace('libera su tre lati', 'free on three sides')
    .replace('zona residenziale', 'residential area')
    .replace('porzione di abitazione', 'portion of a home')
    .replace('primo piano', 'first floor')
    .replace('villa bifamiliare', 'semi-detached villa')
    .replace('villa del 2010', '2010 villa')
    .replace('grande giardino', 'large garden')
    .replace('ingresso indipendente', 'independent entrance')
}

function trFeatureItToCs(feature) {
  let text = feature
    .replace('villa bifamiliare del 1983 in zona residenziale', 'polovina vily z roku 1983 v rezidencni oblasti')
    .replace('villa del 2010 con giardino, fotovoltaico e ampi accessori', 'vila z roku 2010 se zahradou, fotovoltaikou a velkym prislusenstvim')
  return text
    .replace('mq commerciali', 'm2 komercni plochy')
    .replace('locali', 'mistnosti')
    .replace('camere da letto', 'loznice')
    .replace('bagni', 'koupelny')
    .replace('indirizzo indicato:', 'uvedena adresa:')
    .replace('investimento a reddito', 'investice s vynosem')
    .replace('contesto collinare e verde', 'zelene kopcovite prostredi')
    .replace('secondo e ultimo piano', 'druhe a posledni patro')
    .replace('abitazione indipendente', 'samostatny dum')
    .replace('ristrutturazione completa', 'kompletni rekonstrukce')
    .replace('strada interna privata e garage', 'soukroma vnitrni cesta a garaz')
    .replace('libera su tre lati', 'volna ze tri stran')
    .replace('zona residenziale', 'rezidencni oblast')
    .replace('porzione di abitazione', 'cast domu')
    .replace('primo piano', 'prvni patro')
    .replace('villa bifamiliare', 'polovina vily')
    .replace('villa del 2010', 'vila z roku 2010')
    .replace('grande giardino', 'velka zahrada')
    .replace('ingresso indipendente', 'samostatny vstup')
}

function descriptions(meta, data) {
  const sqm = num(data.surface)
  const roomCount = rooms(data.rooms)
  const bedrooms = num(data.bedrooms)
  const bathrooms = num(data.bathrooms)
  const address = normalizeAddress(data)
  const type = typeIt(meta.kind)

  const specsIt = `${sqm} mq, ${roomCount} locali, ${bedrooms} camere e ${bathrooms} bagni`
  const specsEn = `${sqm} sqm, ${roomCount} rooms, ${bedrooms} bedrooms and ${bathrooms} bathrooms`
  const specsCs = `${sqm} m2, ${roomCount} mistnosti, ${bedrooms} loznice a ${bathrooms} koupelny`

  return {
    it: `A ${data.city}, proponiamo ${type} con ${specsIt}. La proprieta si trova in ${address || 'posizione indicata nell annuncio'} e rappresenta una soluzione concreta per chi cerca una casa in ${meta.region} con dati chiari e prezzo definito.\n\nIl punto forte dell annuncio e ${meta.highlight}. La distribuzione interna e la metratura rendono l immobile adatto sia a uso personale sia a valutazioni di investimento, secondo le esigenze dell acquirente.\n\nLa proposta richiede come sempre verifica documentale, controllo tecnico e sopralluogo prima di qualsiasi decisione di acquisto.`,
    en: `In ${data.city}, this ${meta.kind === 'apartment' ? 'apartment' : meta.kind === 'villa' ? 'villa' : 'independent home'} offers ${specsEn}. The property is located at ${address || 'the address stated in the listing'} and is a practical option for buyers looking in ${regionNames(meta.region).en} with clear figures and a defined asking price.\n\nThe key point is ${trFeatureItToEn(meta.highlight)}. The internal layout and size make it suitable for personal use or for an investment assessment, depending on the buyer's goals.\n\nAs always, documents, technical condition and an on-site visit should be checked before any purchase decision.`,
    cs: `V lokalite ${data.city} nabizi tato nemovitost ${specsCs}. Nachazi se na adrese ${address || 'uvedene v inzeratu'} a predstavuje praktickou moznost pro kupujici, kteri hledaji nemovitost v regionu ${regionNames(meta.region).cs} s jasnymi udaji a stanovenou cenou.\n\nHlavnim bodem nabidky je ${trFeatureItToCs(meta.highlight)}. Dispozice a velikost mohou davat smysl jak pro vlastni uzivani, tak pro investicni posouzeni podle cilu kupujiciho.\n\nPred rozhodnutim o koupi je nutne proverit dokumentaci, technicky stav a nemovitost osobne navstivit.`
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
    .slice(0, 12)

  return {
    url: pageProps.detailData.seo?.canonical,
    title: realEstate.title,
    typology: realEstate.typology?.name || 'Villa',
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
    seo_description_en: `${data.city}: ${meta.kind} of ${sqm} sqm, ${bedroomCount} bedrooms, ${bathroomCount} bathrooms. Asking price EUR ${num(data.priceLabel).toLocaleString('en-US')}.`,
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

function main() {
  const summary = []
  for (const meta of ITEMS) {
    const harPath = path.join(HAR_ROOT, `${meta.n}har.har`)
    const folder = path.join(IMPORT_ROOT, meta.slug)
    const imagesDir = path.join(folder, 'images')
    fs.mkdirSync(imagesDir, { recursive: true })

    let data
    if (meta.n === 11 || meta.n === 12) {
      data = extractFromInvalidHar(harPath)
    } else {
      data = extractListingData(harPath, imagesDir)
    }

    const listing = buildListing(meta, data)
    fs.writeFileSync(path.join(folder, 'listing.json'), `${JSON.stringify(listing, null, 2)}\n`, 'utf8')
    summary.push({
      n: meta.n,
      slug: meta.slug,
      city: data.city,
      price: listing.price,
      sqm: listing.square_meters,
      images: fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir).length : listing.image_urls.length
    })
  }
  console.table(summary)
}

main()
