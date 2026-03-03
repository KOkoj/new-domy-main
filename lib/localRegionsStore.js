import { promises as fs } from 'fs'
import path from 'path'
import vm from 'vm'

const LOCAL_REGIONS_PATH = path.join(process.cwd(), 'data', 'local-regions.json')
const REGIONS_PAGE_PATH = path.join(process.cwd(), 'app', 'regions', 'page.js')

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function normalizeRegion(data = {}, fallbackId = null) {
  const name = data.name || {}
  const description = data.description || {}
  const titleForSlug = name.en || name.it || name.cs || data.country || 'region'

  return {
    _id: data._id || fallbackId || `local-region-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    _type: 'region',
    name: {
      en: name.en || '',
      cs: name.cs || '',
      it: name.it || ''
    },
    slug: {
      _type: 'slug',
      current: data?.slug?.current || slugify(titleForSlug)
    },
    country: data.country || 'Italy',
    description: {
      en: description.en || '',
      cs: description.cs || '',
      it: description.it || ''
    },
    image: data.image || '',
    propertyCount: Number(data.propertyCount || 0),
    averagePrice: Number(data.averagePrice || 0),
    priceRange: {
      min: Number(data?.priceRange?.min || 0),
      max: Number(data?.priceRange?.max || 0)
    },
    topCities: Array.isArray(data.topCities) ? data.topCities : [],
    highlights: Array.isArray(data.highlights) ? data.highlights : [],
    popularity: Number(data.popularity || 0)
  }
}

async function extractSampleRegionsFromPage() {
  try {
    const source = await fs.readFile(REGIONS_PAGE_PATH, 'utf8')
    const match = source.match(/const SAMPLE_REGIONS = (\[[\s\S]*?\n\])\n\nfunction RegionCard/)
    if (!match?.[1]) return []

    const regions = vm.runInNewContext(match[1], {}, { timeout: 1000 })
    if (!Array.isArray(regions)) return []

    return regions.map((region, index) => normalizeRegion(region, `sample-region-${index + 1}`))
  } catch {
    return []
  }
}

async function ensureDataFile() {
  const dir = path.dirname(LOCAL_REGIONS_PATH)
  await fs.mkdir(dir, { recursive: true })

  try {
    await fs.access(LOCAL_REGIONS_PATH)
  } catch {
    const seed = await extractSampleRegionsFromPage()
    await fs.writeFile(LOCAL_REGIONS_PATH, JSON.stringify(seed, null, 2), 'utf8')
  }
}

async function readLocalRegions() {
  await ensureDataFile()
  const raw = await fs.readFile(LOCAL_REGIONS_PATH, 'utf8')

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writeLocalRegions(regions) {
  await ensureDataFile()
  await fs.writeFile(LOCAL_REGIONS_PATH, JSON.stringify(regions, null, 2), 'utf8')
}

export async function getLocalRegions() {
  return readLocalRegions()
}

export async function createLocalRegion(data = {}) {
  const regions = await readLocalRegions()
  const id = `local-region-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const region = normalizeRegion({ ...data, _id: id }, id)
  regions.unshift(region)
  await writeLocalRegions(regions)
  return region
}

export async function updateLocalRegion(id, data = {}) {
  const regions = await readLocalRegions()
  const index = regions.findIndex((region) => region?._id === id)
  if (index < 0) return null

  const current = regions[index]
  const next = normalizeRegion(
    {
      ...current,
      ...data,
      name: { ...current.name, ...(data.name || {}) },
      description: { ...current.description, ...(data.description || {}) },
      priceRange: { ...current.priceRange, ...(data.priceRange || {}) },
      slug: data.slug?.current ? data.slug : current.slug,
      topCities: data.topCities ?? current.topCities,
      highlights: data.highlights ?? current.highlights
    },
    id
  )

  regions[index] = next
  await writeLocalRegions(regions)
  return next
}

export async function deleteLocalRegion(id) {
  const regions = await readLocalRegions()
  const next = regions.filter((region) => region?._id !== id)
  const deleted = next.length !== regions.length
  if (!deleted) return false
  await writeLocalRegions(next)
  return true
}
