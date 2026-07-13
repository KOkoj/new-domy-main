#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { extractListingData } = require('./extract-listing-data.cjs')

const ROOT = process.cwd()
const HAR_ROOT = 'C:/Users/39327/Desktop/Har sito'
const IMPORT_ROOT = path.join(ROOT, 'data', 'import', 'properties')

const ITEMS = [
  {
    har: '1 iseo.har',
    url: 'https://www.immobiliare.it/annunci/127929536/',
    region: 'Lombardia',
    kind: 'house',
    slug: 'lombardia-villetta-schiera-predore-via-plazza-iseo',
    titleIt: "Villetta a schiera ristrutturata a Predore, Lago d'Iseo",
    titleEn: "Renovated Townhouse in Predore, Lake Iseo",
    titleCs: "Zrekonstruovany radovy dum v Predore u jezera Iseo",
    highlight: 'villetta ristrutturata nel 2022 con due giardini, balconi e box auto'
  },
  {
    har: '2 nevea.har',
    url: 'https://www.immobiliare.it/annunci/127758516/',
    region: 'Friuli-Venezia Giulia',
    kind: 'apartment',
    slug: 'friuli-venezia-giulia-trilocale-sella-nevea-terrazza',
    titleIt: 'Trilocale con terrazza a Sella Nevea',
    titleEn: 'Two-Bedroom Apartment with Terrace in Sella Nevea',
    titleCs: 'Trilocale s terasou v Sella Nevea',
    highlight: 'appartamento per vacanze vicino agli impianti sciistici del Monte Canin'
  },
  {
    har: '3vieste.har',
    url: 'https://www.immobiliare.it/annunci/118887047/',
    region: 'Puglia',
    kind: 'apartment',
    slug: 'puglia-bilocale-vieste-zaffarano-terrazza-mare',
    titleIt: 'Bilocale a Vieste con terrazza vista mare',
    titleEn: 'One-Bedroom Apartment in Vieste with Sea-View Terrace',
    titleCs: 'Bilocale ve Vieste s terasou a vyhledem na more',
    highlight: 'ultimo piano con grande terrazza panoramica vicino al Pizzomunno'
  },
  {
    har: '4massa.har',
    url: 'https://www.immobiliare.it/annunci/127057511/',
    region: 'Toscana',
    kind: 'apartment',
    slug: 'toscana-attico-massa-marittima-centro-liberta',
    titleIt: 'Attico nel centro storico di Massa Marittima',
    titleEn: 'Penthouse in the Historic Centre of Massa Marittima',
    titleCs: 'Podkrovni byt v historickem centru Massa Marittima',
    highlight: 'attico pronto da abitare nel borgo medievale a circa 20 minuti dal mare'
  },
  {
    har: '5 camp.har',
    url: 'https://www.immobiliare.it/annunci/119908972/',
    region: 'Campania',
    kind: 'villa',
    slug: 'campania-casa-indipendente-salerno-collina',
    titleIt: 'Villa panoramica a Massa Lubrense con giardino',
    titleEn: 'Panoramic Villa in Massa Lubrense with Garden',
    titleCs: 'Panoramaticka vila v Massa Lubrense se zahradou',
    highlight: 'villa collinare con giardino, terrazzo panoramico e parcheggio'
  }
]

const REGION_NAMES = {
  Lombardia: { it: 'Lombardia', en: 'Lombardy', cs: 'Lombardie' },
  'Friuli-Venezia Giulia': { it: 'Friuli-Venezia Giulia', en: 'Friuli-Venezia Giulia', cs: 'Furlansko-Julske Benatsko' },
  Puglia: { it: 'Puglia', en: 'Apulia', cs: 'Apulie' },
  Toscana: { it: 'Toscana', en: 'Tuscany', cs: 'Toskansko' },
  Campania: { it: 'Campania', en: 'Campania', cs: 'Kampanie' }
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

function normalizeWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
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
    .replace('villetta ristrutturata nel 2022', 'townhouse renovated in 2022')
    .replace('appartamento per vacanze', 'holiday apartment')
    .replace('ultimo piano', 'top floor')
    .replace('attico pronto da abitare', 'move-in ready penthouse')
    .replace('soluzione indipendente', 'independent home')
}

function trFeatureItToCs(feature) {
  return String(feature)
    .replace('mq commerciali', 'm2 komercni plochy')
    .replace('locali', 'mistnosti')
    .replace('camere da letto', 'loznice')
    .replace('bagni', 'koupelny')
    .replace('indirizzo indicato:', 'uvedena adresa:')
    .replace('villetta ristrutturata nel 2022', 'radovy dum zrekonstruovany v roce 2022')
    .replace('appartamento per vacanze', 'rekreacni byt')
    .replace('ultimo piano', 'posledni patro')
    .replace('attico pronto da abitare', 'podkrovni byt pripraveny k bydleni')
    .replace('soluzione indipendente', 'samostatne bydleni')
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
  const sourceText = normalizeWhitespace(data.description)

  return {
    it: `A ${data.city || rn.it}, proponiamo ${type} con ${sqm} mq, ${roomCount} locali, ${bedrooms} camere e ${bathrooms} bagni. La proprieta si trova in ${address || 'posizione indicata nell annuncio'} e rappresenta una proposta concreta per chi cerca casa in ${rn.it} con prezzo definito e dati verificabili.\n\nIl punto forte dell annuncio e ${meta.highlight}. ${sourceText ? `Dalla descrizione emerge inoltre: ${sourceText}` : 'La distribuzione interna e gli spazi accessori rendono l immobile interessante per uso personale o valutazione di investimento.'}\n\nLa proposta richiede come sempre verifica documentale, controllo tecnico e sopralluogo prima di qualsiasi decisione di acquisto.`,
    en: `In ${data.city || rn.en}, this ${kindEn(meta.kind)} offers ${sqm} sqm, ${roomCount} rooms, ${bedrooms} bedrooms and ${bathrooms} bathrooms. The property is located at ${address || 'the address stated in the listing'} and is a practical option for buyers looking in ${rn.en} with clear figures and a defined asking price.\n\nThe key point is ${trFeatureItToEn(meta.highlight)}. The layout and size make the property suitable for personal use or for an investment assessment, depending on the buyer's goals.\n\nAs always, documents, technical condition and an on-site visit should be checked before any purchase decision.`,
    cs: `V lokalite ${data.city || rn.cs} nabizi tato nemovitost ${sqm} m2, ${roomCount} mistnosti, ${bedrooms} loznice a ${bathrooms} koupelny. Nachazi se na adrese ${address || 'uvedene v inzeratu'} a predstavuje praktickou moznost pro kupujici, kteri hledaji nemovitost v regionu ${rn.cs} s jasnymi udaji a stanovenou cenou.\n\nHlavnim bodem nabidky je ${trFeatureItToCs(meta.highlight)}. Dispozice a velikost mohou davat smysl jak pro vlastni uzivani, tak pro investicni posouzeni podle cilu kupujiciho.\n\nPred rozhodnutim o koupi je nutne proverit dokumentaci, technicky stav a nemovitost osobne navstivit.`
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

function findImageContentByUrlRaw(raw, url) {
  const urlIndex = raw.indexOf(`"url": "${url}"`)
  if (urlIndex < 0) return null
  const responseIndex = raw.indexOf('"response"', urlIndex)
  const contentIndex = raw.indexOf('"content"', responseIndex)
  const textIndex = raw.indexOf('"text": "', contentIndex)
  if (textIndex < 0) return null
  const start = textIndex + '"text": "'.length
  const end = raw.indexOf('",', start)
  if (end < 0) return null
  const encoded = raw.slice(start, end)
  if (!encoded || encoded.length < 64) return null
  return Buffer.from(encoded, 'base64')
}

function saveFallbackImagesFromRawHar(harPath, outDir, urls) {
  const raw = fs.readFileSync(harPath, 'utf8')
  fs.mkdirSync(outDir, { recursive: true })
  const saved = []
  urls.slice(0, 12).forEach((url, index) => {
    const candidates = [
      url,
      url.replace('/xxl.jpg', '/cover-m-c.jpg'),
      url.replace('/xxl.jpg', '/m-c.jpg'),
      url.replace('/xxl.jpg', '/xxs-c.jpg')
    ]
    const buffer = candidates.map((candidate) => findImageContentByUrlRaw(raw, candidate)).find(Boolean)
    if (!buffer) return
    const name = index === 0 ? 'main.jpg' : `gallery-${index}.jpg`
    fs.writeFileSync(path.join(outDir, name), buffer)
    saved.push(path.join(outDir, name))
  })
  return saved
}

function extractFromInvalidHar(harPath, outDir) {
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

  saveFallbackImagesFromRawHar(harPath, outDir, imageUrls)

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
  try {
    return extractListingData(harPath, imagesDir)
  } catch {
    return extractFromInvalidHar(harPath, imagesDir)
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
    city_it: data.city || rn.it,
    city_en: data.city || rn.en,
    city_cs: data.city || rn.cs,
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
    seo_description_it: `${data.city || rn.it}: ${typeIt(meta.kind)} di ${sqm} mq, ${bedroomCount} camere, ${bathroomCount} bagni. Prezzo ${price.toLocaleString('it-IT')} euro.`,
    seo_description_en: `${data.city || rn.en}: ${kindEn(meta.kind)} of ${sqm} sqm, ${bedroomCount} bedrooms, ${bathroomCount} bathrooms. Asking price EUR ${price.toLocaleString('en-US')}.`,
    seo_description_cs: `${data.city || rn.cs}: nemovitost ${sqm} m2, ${bedroomCount} loznice, ${bathroomCount} koupelny. Cena ${price.toLocaleString('cs-CZ')} EUR.`,
    status: 'available',
    featured: false,
    isNew: true,
    keywords: [slugify(meta.region), slugify(data.city), meta.kind, slugify(data.address), 'immobiliare-it', 'novita'].filter(Boolean),
    source_url: meta.url,
    lat: data.latitude,
    lng: data.longitude,
    image_urls: data.imageUrls || data.gallery || []
  }
}

function main() {
  const summary = []

  for (const meta of ITEMS) {
    const harPath = path.join(HAR_ROOT, meta.har)
    const folder = path.join(IMPORT_ROOT, meta.slug)
    const imagesDir = path.join(folder, 'images')
    fs.mkdirSync(imagesDir, { recursive: true })

    const data = getData(meta, harPath, imagesDir)
    const listing = buildListing(meta, data)
    fs.writeFileSync(path.join(folder, 'listing.json'), `${JSON.stringify(listing, null, 2)}\n`, 'utf8')

    summary.push({
      slug: meta.slug,
      city: data.city,
      price: listing.price,
      sqm: listing.square_meters,
      images: fs.readdirSync(imagesDir).filter((file) => /\.(jpe?g|png|webp)$/i.test(file)).length
    })
  }

  console.table(summary)
}

main()
