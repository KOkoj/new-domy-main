import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

const PROJECT_DATA_PATH = path.join(process.cwd(), 'data', 'local-properties.json')
const TMP_DATA_PATH = path.join(os.tmpdir(), 'local-properties.json')

// Cache which path is writable so we only probe once per process lifetime.
// Reads and writes always use the same path to stay consistent.
let _writablePath = null

async function getWritablePath() {
  if (_writablePath) return _writablePath

  const dir = path.dirname(PROJECT_DATA_PATH)
  try {
    await fs.mkdir(dir, { recursive: true })
    const handle = await fs.open(PROJECT_DATA_PATH, 'a')
    await handle.close()
    _writablePath = PROJECT_DATA_PATH
  } catch {
    // Project dir is read-only (e.g. Vercel serverless). Use /tmp instead.
    // Note: /tmp is ephemeral on serverless — data won't persist across cold starts.
    _writablePath = TMP_DATA_PATH
  }

  return _writablePath
}

async function ensureDataFile(dataPath) {
  const dir = path.dirname(dataPath)
  await fs.mkdir(dir, { recursive: true })

  try {
    await fs.access(dataPath)
  } catch {
    // Seed from the deployed project data file if available, otherwise start empty
    if (dataPath !== PROJECT_DATA_PATH) {
      try {
        const seed = await fs.readFile(PROJECT_DATA_PATH, 'utf8')
        await fs.writeFile(dataPath, seed, 'utf8')
        return
      } catch {
        // project file not readable either, start fresh
      }
    }
    await fs.writeFile(dataPath, '[]', 'utf8')
  }
}

async function readLocalProperties() {
  const dataPath = await getWritablePath()
  try {
    await ensureDataFile(dataPath)
    const raw = await fs.readFile(dataPath, 'utf8')
    const parsed = JSON.parse(raw.replace(/^\uFEFF/, ''))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writeLocalProperties(properties) {
  const dataPath = await getWritablePath()
  await ensureDataFile(dataPath)
  await fs.writeFile(dataPath, JSON.stringify(properties, null, 2), 'utf8')
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function defaultLocation() {
  return {
    city: {
      name: { en: 'Italy', cs: 'Italie', it: 'Italia' },
      slug: { current: 'italy' },
      region: {
        name: { en: 'Italy', cs: 'Italie', it: 'Italia' },
        country: { en: 'Italy', cs: 'Italie', it: 'Italia' }
      }
    },
    address: { en: '', cs: '', it: '' }
  }
}

export async function getLocalProperties() {
  return readLocalProperties()
}

export async function getLocalPropertyBySlug(slugOrId) {
  const properties = await readLocalProperties()
  return properties.find((property) =>
    property?.slug?.current === slugOrId || property?._id === slugOrId
  ) || null
}

export async function createLocalProperty(data = {}) {
  const properties = await readLocalProperties()
  const now = new Date().toISOString()
  const titleForSlug = data?.title?.en || data?.title?.it || data?.title?.cs || 'property'
  const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

  const property = {
    _id: id,
    _type: 'listing',
    title: data.title || { en: 'Untitled property', cs: 'Nemovitost bez názvu', it: 'Proprietà senza titolo' },
    slug: {
      _type: 'slug',
      current: `${slugify(titleForSlug)}-${Date.now()}`
    },
    propertyType: data.propertyType || 'apartment',
    price: {
      amount: data?.price?.amount || 0,
      currency: data?.price?.currency || 'EUR'
    },
    specifications: {
      rooms: data?.specifications?.rooms || 0,
      bedrooms: data?.specifications?.bedrooms || 0,
      bathrooms: data?.specifications?.bathrooms || 0,
      squareFootage: data?.specifications?.squareFootage || 0
    },
    location: data.location || defaultLocation(),
    status: data.status || 'available',
    featured: Boolean(data.featured),
    description: data.description || { en: '', cs: '', it: '' },
    images: data.images || [],
    mainImage: data.mainImage ?? 0,
    amenities: data.amenities || [],
    seoTitle: data.seoTitle || { en: '', cs: '', it: '' },
    seoDescription: data.seoDescription || { en: '', cs: '', it: '' },
    keywords: data.keywords || [],
    sourceUrl: data.sourceUrl || '',
    publishAt: data.publishAt || null,
    scheduledPublish: Boolean(data.scheduledPublish),
    _createdAt: now,
    _updatedAt: now
  }

  properties.unshift(property)
  await writeLocalProperties(properties)
  return property
}

export async function updateLocalProperty(id, data = {}) {
  const properties = await readLocalProperties()
  const index = properties.findIndex((property) => property?._id === id)

  if (index < 0) return null

  const current = properties[index]

  const next = {
    ...current,
    ...data,
    // Preserve the original slug — changing it would break existing URLs
    slug: current.slug,
    price: data.price ? { ...current.price, ...data.price } : current.price,
    specifications: data.specifications
      ? { ...current.specifications, ...data.specifications }
      : current.specifications,
    location: data.location ? { ...current.location, ...data.location } : current.location,
    _updatedAt: new Date().toISOString()
  }

  properties[index] = next
  await writeLocalProperties(properties)
  return next
}

export async function deleteLocalProperty(id) {
  const properties = await readLocalProperties()
  const next = properties.filter((property) => property?._id !== id)
  const deleted = next.length !== properties.length

  if (!deleted) return false

  await writeLocalProperties(next)
  return true
}
