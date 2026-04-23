#!/usr/bin/env node

const fs = require('fs/promises')
const path = require('path')

function parseArgs(argv) {
  const options = {
    har: '',
    output: path.join(process.cwd(), 'tmp', 'property-presentations'),
    slug: '',
    photoCount: 8
  }

  for (const arg of argv) {
    if (arg.startsWith('--har=')) options.har = arg.slice('--har='.length).trim()
    else if (arg.startsWith('--output=')) options.output = path.resolve(process.cwd(), arg.slice('--output='.length).trim())
    else if (arg.startsWith('--slug=')) options.slug = arg.slice('--slug='.length).trim()
    else if (arg.startsWith('--photo-count=')) options.photoCount = Math.max(4, Number(arg.slice('--photo-count='.length).trim()) || 8)
    else if (arg === '--help' || arg === '-h') options.help = true
  }

  return options
}

function printHelp() {
  console.log(`
Build a temporary property presentation from an Immobiliare HAR file.

Usage:
  node scripts/build-har-presentation.cjs --har=/path/to/file.har [options]

Options:
  --output=DIR        Output root directory (default: tmp/property-presentations)
  --slug=SLUG         Output folder slug override
  --photo-count=N     Number of gallery photos to export (default: 8)
  --help, -h          Show this help
`)
}

async function loadHar(harPath) {
  const text = await fs.readFile(harPath, 'utf8')

  try {
    return JSON.parse(text)
  } catch (error) {
    const entriesMarker = text.indexOf('"entries": [')
    const lastEntrySeparator = text.lastIndexOf('\n      },\n      {\n        "_connectionId":')

    if (entriesMarker < 0 || lastEntrySeparator < 0) {
      throw error
    }

    const repaired = `${text.slice(0, lastEntrySeparator)}\n      }\n    ]\n  }\n}`
    return JSON.parse(repaired)
  }
}

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function ensureArray(value) {
  return Array.isArray(value) ? value : []
}

function stripContactLines(text) {
  return String(text || '')
    .replace(/\bPer info:.*$/gim, '')
    .replace(/\bTel\..*$/gim, '')
    .replace(/\bTelefono:.*$/gim, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function paragraphize(text) {
  return stripContactLines(text)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function formatCurrency(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return ''
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(amount)
}

function getPageEntry(har) {
  return ensureArray(har?.log?.entries).find((entry) => {
    const url = entry?.request?.url || ''
    return /immobiliare\.it\/annunci\/\d+\/?$/.test(url)
  })
}

function extractNextData(html) {
  const marker = '<script id="__NEXT_DATA__" type="application/json">'
  const start = html.indexOf(marker)
  if (start < 0) {
    throw new Error('Unable to find __NEXT_DATA__ in HAR page response.')
  }
  const end = html.indexOf('</script>', start)
  if (end < 0) {
    throw new Error('Unable to find closing </script> after __NEXT_DATA__.')
  }
  return JSON.parse(html.slice(start + marker.length, end))
}

function parseListing(har) {
  const pageEntry = getPageEntry(har)
  if (!pageEntry?.response?.content?.text) {
    throw new Error('HAR does not contain the page HTML response.')
  }

  const nextData = extractNextData(pageEntry.response.content.text)
  const detailData = nextData?.props?.pageProps?.detailData
  const property = ensureArray(detailData?.realEstate?.properties)[0]
  const realEstate = detailData?.realEstate

  if (!property || !realEstate) {
    throw new Error('Could not parse property details from HAR.')
  }

  const location = property.location || {}
  const mainFeatures = ensureArray(property.mainFeatures)
  const visibleFeatures = ensureArray(property.primaryFeatures)
    .filter((item) => item?.isVisible)
    .map((item) => item.name)

  return {
    sourceUrl: detailData?.seo?.canonical || pageEntry.request.url,
    listingId: String(realEstate.id || property.id || ''),
    title: realEstate.title || '',
    subtitle: [location.address, location.macrozone, location.city].filter(Boolean).join(', '),
    location: {
      address: location.address || '',
      area: location.macrozone || '',
      city: location.city || '',
      province: location.province || '',
      region: location.region || ''
    },
    price: property.price?.value || realEstate.price?.value || 0,
    priceLabel: property.price?.formattedValue || realEstate.price?.formattedValue || '',
    pricePerSquareMeter: property.price?.pricePerSquareMeter || realEstate.price?.pricePerSquareMeter || '',
    surface: property.surface || mainFeatures.find((item) => item.type === 'surface')?.label || '',
    rooms: property.rooms || mainFeatures.find((item) => item.type === 'rooms')?.compactLabel || '',
    bathrooms: property.bathrooms || mainFeatures.find((item) => item.type === 'bathrooms')?.compactLabel || '',
    bedrooms: property.bedRoomsNumber || '',
    typology: property.typologyV2?.name || property.typology?.name || realEstate.typology?.name || '',
    condition: property.condition || '',
    floor: property.floor?.value || '',
    floors: property.floors || '',
    heating: property.energy?.heatingType || '',
    energyClass: property.energy?.class?.name || '',
    energyIndex: property.energy?.epi ? `${property.energy.epi} ${property.energy.epiUm || ''}`.trim() : '',
    garage: property.garage || '',
    kitchenStatus: property.kitchenStatus || '',
    availability: property.availability || '',
    furnished: visibleFeatures.includes('Arredato'),
    outdoorFeatures: visibleFeatures.filter((item) =>
      /(balcone|terrazza|giardino|vista|esposizione esterna)/i.test(item)
    ),
    featureBullets: Array.from(new Set([...visibleFeatures, property.kitchenStatus, property.garage, property.availability].filter(Boolean))).slice(0, 10),
    descriptionParagraphs: paragraphize(property.description || property.defaultDescription || ''),
    photoEntries: ensureArray(property.multimedia?.photos)
  }
}

function collectImageEntries(har) {
  return ensureArray(har?.log?.entries).filter((entry) => {
    const mime = entry?.response?.content?.mimeType || ''
    const url = entry?.request?.url || ''
    return /^image\//.test(mime) && /im-cdn\.it/.test(url) && entry?.response?.content?.text
  })
}

function scorePhoto(photo) {
  const caption = String(photo?.caption || '').toLowerCase()
  let score = 0
  if (/vista|esterno|facciata/.test(caption)) score += 9
  if (/giardino/.test(caption)) score += 8
  if (/terraz/.test(caption)) score += 6
  if (/balcone/.test(caption)) score += 4
  if (/salone|living|soggiorno/.test(caption)) score += 4
  if (/camera/.test(caption)) score += 3
  if (/cucina/.test(caption)) score += 2
  if (/bagno/.test(caption)) score += 1
  return score
}

function classifyPhoto(photo) {
  const caption = String(photo?.caption || '').toLowerCase()
  if (/camera/.test(caption)) return 'bedroom'
  if (/bagno/.test(caption)) return 'bathroom'
  if (/cucina/.test(caption)) return 'kitchen'
  if (/salone|soggiorno|living/.test(caption)) return 'living'
  if (/vista|esterno|facciata|giardino|balcone|terraz|box auto/.test(caption)) return 'exterior'
  return 'other'
}

function urlPreference(url) {
  if (/xxl\./i.test(url)) return 5
  if (/cover-m-c\./i.test(url)) return 4
  if (/\/m-c\./i.test(url)) return 3
  if (/\/m\./i.test(url)) return 2
  if (/xxs-c\./i.test(url)) return 1
  return 0
}

function pickPhotoVariant(photo, imageEntries) {
  const variants = []
  for (const value of Object.values(photo?.urls || {})) {
    if (typeof value === 'string' && value.startsWith('http')) {
      variants.push(value)
    }
  }

  const byUrl = new Map(imageEntries.map((entry) => [entry.request.url, entry]))
  const exact = variants
    .map((url) => byUrl.get(url))
    .filter(Boolean)
    .sort((a, b) => urlPreference(b.request.url) - urlPreference(a.request.url))[0]
  if (exact) return exact

  const photoId = String(photo?.id || '')
  return imageEntries
    .filter((entry) => entry.request.url.includes(photoId))
    .sort((a, b) => urlPreference(b.request.url) - urlPreference(a.request.url))[0]
}

async function writeImage(entry, filePath) {
  const content = entry.response.content
  const buffer = content.encoding === 'base64'
    ? Buffer.from(content.text, 'base64')
    : Buffer.from(content.text || '', 'utf8')
  await fs.writeFile(filePath, buffer)
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const ICONS = {
  surface: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M14 26V10m0 0h16m-16 0 10 10M50 38v16m0 0H34m16 0-10-10" />
      <path d="M50 14v12M50 14H38m12 0-8 8M14 50V38m0 12h12m-12 0 8-8" />
      <text x="32" y="36" text-anchor="middle">m²</text>
    </svg>
  `,
  rooms: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="10" y="18" width="44" height="32" rx="6" />
      <path d="M10 26h44M20 14v8M44 14v8" />
      <text x="32" y="39" text-anchor="middle">ROOMS</text>
    </svg>
  `,
  bedrooms: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M12 36h40a6 6 0 0 1 6 6v8H6v-8a6 6 0 0 1 6-6Z" />
      <path d="M12 36V24a6 6 0 0 1 6-6h10a6 6 0 0 1 6 6v12M34 36V24a6 6 0 0 1 6-6h6a6 6 0 0 1 6 6v12" />
      <path d="M10 50v4M54 50v4" />
    </svg>
  `,
  bathrooms: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M18 38h26a8 8 0 0 1 8 8v2H10v-2a8 8 0 0 1 8-8Z" />
      <path d="M22 38V24a10 10 0 0 1 20 0v2" />
      <path d="M34 26v12M18 50v4M46 50v4" />
    </svg>
  `,
  location: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 56s16-14 16-28a16 16 0 1 0-32 0c0 14 16 28 16 28Z" />
      <circle cx="32" cy="28" r="6" />
      <path d="M16 54h32M22 46l-4 8M42 46l4 8" />
    </svg>
  `,
  price: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M14 24 26 12h24v24L38 48H14Z" />
      <circle cx="44" cy="20" r="3" />
      <path d="M24 38c2 2 8 2 10-1 3-4-2-6-5-7-3-1-7-3-4-7 2-3 8-3 10-1M30 20v22" />
    </svg>
  `
}

function buildHtml(model) {
  const hero = model.heroImage
  const galleryItems = model.galleryImages
    .map(
      (item) => `
        <figure class="gallery-item">
          <img src="${escapeHtml(item.relativePath)}" alt="${escapeHtml(item.caption || model.title)}" />
        </figure>
      `
    )
    .join('')

  const statItems = [
    { key: 'surface', label: model.surface || 'n/d' },
    { key: 'rooms', label: model.rooms ? `${model.rooms} locali` : 'n/d' },
    { key: 'bedrooms', label: model.bedrooms ? `${model.bedrooms} camere` : 'n/d' },
    { key: 'bathrooms', label: model.bathrooms ? `${model.bathrooms} bagni` : 'n/d' },
    { key: 'location', label: model.locationLabel || 'n/d' },
    { key: 'price', label: model.priceLabel || formatCurrency(model.price) || 'n/d' }
  ]
    .map(
      (item) => `
        <div class="stat-row">
          <div class="stat-icon">${ICONS[item.key]}</div>
          <div class="stat-value">${escapeHtml(item.label)}</div>
        </div>
      `
    )
    .join('')

  const detailItems = [
    model.typology,
    model.condition,
    model.pricePerSquareMeter,
    model.heating
  ]
    .filter(Boolean)
    .map((item) => `<div class="detail-chip">${escapeHtml(item)}</div>`)
    .join('')

  const paragraphs = model.descriptionParagraphs
    .map((item) => `<p>${escapeHtml(item)}</p>`)
    .join('')

  return `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(model.title)}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 0;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: "Segoe UI", Arial, sans-serif;
      color: #18212b;
      background: #f4f0ea;
    }

    .page {
      width: 297mm;
      height: 210mm;
      page-break-after: always;
      position: relative;
      overflow: hidden;
      background: linear-gradient(135deg, #f7f2ec 0%, #ffffff 100%);
    }

    .page:last-child {
      page-break-after: auto;
    }

    .cover-page {
      display: grid;
      grid-template-columns: 41% 59%;
      height: 100%;
    }

    .cover-copy {
      position: relative;
      z-index: 2;
      padding: 18mm 10mm 14mm 16mm;
      background: linear-gradient(180deg, #fbf9f6 0%, #f2ece5 100%);
      display: flex;
      flex-direction: column;
    }

    h1 {
      margin: 0 0 8mm;
      font-size: 24pt;
      line-height: 1.04;
      font-weight: 700;
      color: #1a232d;
      max-width: 95%;
    }

    .stats {
      display: grid;
      gap: 4.2mm;
      margin-top: 2mm;
      width: 100%;
      max-width: 112mm;
    }

    .stat-row {
      display: grid;
      grid-template-columns: 16mm 1fr;
      align-items: center;
      gap: 4.5mm;
      min-height: 16mm;
    }

    .stat-icon {
      width: 14mm;
      height: 14mm;
      color: #131920;
    }

    .stat-icon svg {
      width: 100%;
      height: 100%;
      fill: none;
      stroke: currentColor;
      stroke-width: 2.2;
      stroke-linecap: round;
      stroke-linejoin: round;
      overflow: visible;
    }

    .stat-icon text {
      font-family: "Segoe UI", Arial, sans-serif;
      font-size: 12px;
      font-weight: 700;
      fill: currentColor;
      stroke: none;
      letter-spacing: 0.02em;
    }

    .stat-value {
      font-size: 15pt;
      line-height: 1.12;
      font-weight: 500;
      color: #202933;
    }

    .detail-row {
      display: flex;
      flex-wrap: wrap;
      gap: 3mm;
      margin-top: auto;
      padding-top: 8mm;
    }

    .detail-chip {
      padding: 2.4mm 4mm;
      border-radius: 999px;
      background: #ebe3da;
      color: #465260;
      font-size: 9pt;
      line-height: 1.2;
    }

    .cover-image {
      position: relative;
      overflow: hidden;
      background: #d9d4ce;
    }

    .cover-image img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: saturate(0.97) contrast(1.03);
    }

    .cover-image::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, rgba(247, 242, 236, 1) 0%, rgba(247, 242, 236, 0.92) 4%, rgba(247, 242, 236, 0.56) 12%, rgba(247, 242, 236, 0.08) 24%, rgba(247, 242, 236, 0) 36%);
      z-index: 1;
    }

    .cover-image::after {
      position: absolute;
      inset: 0;
      content: "";
      background: linear-gradient(180deg, rgba(18, 24, 30, 0.04) 0%, rgba(18, 24, 30, 0.18) 100%);
      z-index: 1;
    }

    .page-two {
      display: grid;
      grid-template-columns: 109mm 1fr;
      gap: 0;
      background: #f6f2ed;
    }

    .gallery-panel {
      padding: 12mm 8mm 12mm 16mm;
      background: #f1ebe4;
    }

    .gallery-grid {
      height: 100%;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-auto-rows: 50mm;
      gap: 4mm;
      align-content: start;
    }

    .gallery-item {
      margin: 0;
      overflow: hidden;
      width: 40mm;
      height: 50mm;
      background: #dcd9d2;
      box-shadow: 0 12px 20px rgba(26, 35, 45, 0.08);
    }

    .gallery-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .text-panel {
      padding: 16mm 16mm 14mm 10mm;
      background: #fcfbf9;
      border-left: 2px solid #e6ddd2;
      display: flex;
      flex-direction: column;
    }

    .text-panel h2 {
      margin: 0 0 5mm;
      font-size: 18pt;
      line-height: 1.15;
      color: #111922;
    }

    .text-panel p {
      margin: 0 0 4mm;
      font-size: 10.5pt;
      line-height: 1.48;
      color: #253240;
      text-align: left;
    }

    .footer-note {
      margin-top: auto;
      padding-top: 5mm;
      font-size: 8.5pt;
      color: #788392;
      border-top: 1px solid #ece7df;
    }
  </style>
</head>
<body>
  <section class="page cover-page">
    <div class="cover-copy">
      <h1>${escapeHtml(model.title)}</h1>
      <div class="stats">${statItems}</div>
      <div class="detail-row">${detailItems}</div>
    </div>
    <div class="cover-image">
      <img src="${escapeHtml(hero.relativePath)}" alt="${escapeHtml(hero.caption || model.title)}" />
    </div>
  </section>

  <section class="page page-two">
    <div class="gallery-panel">
      <div class="gallery-grid">${galleryItems}</div>
    </div>
    <div class="text-panel">
      <h2>${escapeHtml(model.title)}</h2>
      ${paragraphs}
      <div class="footer-note">Fonte: ${escapeHtml(model.sourceUrl)}</div>
    </div>
  </section>
</body>
</html>
`
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  if (options.help || !options.har) {
    printHelp()
    process.exit(options.help ? 0 : 1)
  }

  const harPath = path.resolve(options.har)
  const har = await loadHar(harPath)
  const listing = parseListing(har)
  const imageEntries = collectImageEntries(har)

  const slug = options.slug || slugify(`${listing.location.region}-${listing.location.city}-${listing.listingId || listing.title}`)
  const baseDir = path.join(options.output, slug)
  const assetsDir = path.join(baseDir, 'assets')

  await fs.mkdir(assetsDir, { recursive: true })
  for (const entry of await fs.readdir(assetsDir, { withFileTypes: true })) {
    if (entry.isFile()) {
      await fs.unlink(path.join(assetsDir, entry.name))
    }
  }

  const selectedPhotos = listing.photoEntries
    .map((photo) => ({
      photo,
      score: scorePhoto(photo),
      entry: pickPhotoVariant(photo, imageEntries)
    }))
    .filter((item) => item.entry)
    .sort((a, b) => b.score - a.score)

  if (selectedPhotos.length === 0) {
    throw new Error('No usable photo data found in HAR.')
  }

  const uniqueById = []
  const seenPhotoIds = new Set()
  for (const item of selectedPhotos) {
    const id = String(item.photo.id)
    if (seenPhotoIds.has(id)) continue
    seenPhotoIds.add(id)
    uniqueById.push(item)
  }

  const heroCandidate = uniqueById.find((item) => classifyPhoto(item.photo) === 'exterior') || uniqueById[0]
  const usedPhotoIds = new Set([String(heroCandidate.photo.id)])
  const preferredGalleryOrder = ['bedroom', 'bathroom', 'kitchen', 'living', 'bedroom', 'living', 'exterior', 'other']
  const galleryCandidates = []

  for (const category of preferredGalleryOrder) {
    const match = uniqueById.find((item) => {
      const id = String(item.photo.id)
      return !usedPhotoIds.has(id) && classifyPhoto(item.photo) === category
    })
    if (!match) continue
    galleryCandidates.push(match)
    usedPhotoIds.add(String(match.photo.id))
    if (galleryCandidates.length >= options.photoCount) break
  }

  if (galleryCandidates.length < options.photoCount) {
    for (const item of uniqueById) {
      const id = String(item.photo.id)
      if (usedPhotoIds.has(id)) continue
      galleryCandidates.push(item)
      usedPhotoIds.add(id)
      if (galleryCandidates.length >= options.photoCount) break
    }
  }

  const exportedImages = []
  for (const [index, item] of [heroCandidate, ...galleryCandidates].entries()) {
    const ext = item.entry.response.content.mimeType.includes('png') ? '.png' : '.jpg'
    const fileName = `${String(index + 1).padStart(2, '0')}-${slugify(item.photo.caption || `photo-${index + 1}`) || `photo-${index + 1}`}${ext}`
    const filePath = path.join(assetsDir, fileName)
    await writeImage(item.entry, filePath)
    exportedImages.push({
      id: item.photo.id,
      caption: item.photo.caption || '',
      fileName,
      relativePath: `assets/${fileName}`
    })
  }

  const heroImage = exportedImages[0]
  const galleryImages = exportedImages.slice(1, 7)

  const model = {
    ...listing,
    subtitle: listing.subtitle || [listing.typology, listing.location.city].filter(Boolean).join(' | '),
    locationLabel: [listing.location.city, listing.location.province, listing.location.region].filter(Boolean).join(', '),
    heroImage,
    galleryImages: galleryImages.length > 0 ? galleryImages : exportedImages.slice(1, 7),
    sourceHar: harPath
  }

  const metadata = {
    generatedAt: new Date().toISOString(),
    sourceHar: harPath,
    listing: {
      id: listing.listingId,
      sourceUrl: listing.sourceUrl,
      title: listing.title,
      price: listing.price,
      priceLabel: listing.priceLabel,
      surface: listing.surface,
      rooms: listing.rooms,
      bathrooms: listing.bathrooms,
      bedrooms: listing.bedrooms,
      typology: listing.typology,
      condition: listing.condition,
      pricePerSquareMeter: listing.pricePerSquareMeter,
      heating: listing.heating,
      location: listing.location
    },
    descriptionParagraphs: listing.descriptionParagraphs,
    heroImage,
    galleryImages,
    exportedImages
  }

  await fs.writeFile(path.join(baseDir, 'metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`, 'utf8')
  await fs.writeFile(path.join(baseDir, 'presentation.html'), buildHtml(model), 'utf8')
  await fs.writeFile(path.join(baseDir, 'presentation.doc.html'), buildHtml(model), 'utf8')

  console.log(JSON.stringify({
    outputDir: baseDir,
    html: path.join(baseDir, 'presentation.html'),
    wordHtml: path.join(baseDir, 'presentation.doc.html'),
    heroImage: heroImage.fileName,
    galleryCount: model.galleryImages.length,
    exportedImageCount: exportedImages.length
  }, null, 2))
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
