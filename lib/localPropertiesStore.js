import { promises as fs } from 'fs'
import path from 'path'

const LOCAL_PROPERTIES_PATH = path.join(process.cwd(), 'data', 'local-properties.json')

async function ensureDataFile() {
  const dir = path.dirname(LOCAL_PROPERTIES_PATH)
  await fs.mkdir(dir, { recursive: true })

  try {
    await fs.access(LOCAL_PROPERTIES_PATH)
  } catch {
    await fs.writeFile(LOCAL_PROPERTIES_PATH, '[]', 'utf8')
  }
}

async function readLocalProperties() {
  await ensureDataFile()
  const raw = await fs.readFile(LOCAL_PROPERTIES_PATH, 'utf8')

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writeLocalProperties(properties) {
  await ensureDataFile()
  await fs.writeFile(LOCAL_PROPERTIES_PATH, JSON.stringify(properties, null, 2), 'utf8')
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
    title: data.title || { en: 'Untitled property', cs: 'Nezadany nazev', it: 'Proprieta senza titolo' },
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
  const titleForSlug = data?.title?.en || data?.title?.it || data?.title?.cs

  const next = {
    ...current,
    ...data,
    price: data.price ? { ...current.price, ...data.price } : current.price,
    specifications: data.specifications
      ? { ...current.specifications, ...data.specifications }
      : current.specifications,
    location: data.location ? { ...current.location, ...data.location } : current.location,
    _updatedAt: new Date().toISOString()
  }

  if (titleForSlug) {
    next.slug = {
      _type: 'slug',
      current: slugify(titleForSlug)
    }
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
