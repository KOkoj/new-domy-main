import { NextResponse } from 'next/server'
import { client, writeClient } from '@/lib/sanity'
import {
  getLocalProperties,
  createLocalProperty,
  updateLocalProperty,
  deleteLocalProperty
} from '@/lib/localPropertiesStore'
import {
  getLocalRegions,
  createLocalRegion,
  updateLocalRegion,
  deleteLocalRegion
} from '@/lib/localRegionsStore'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Helper to check if Sanity is configured
function isSanityConfigured() {
  return process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && 
         process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'placeholder'
}

// GET - Fetch all properties or regions
export async function GET(request) {
  const url = new URL(request.url)
  const type = url.searchParams.get('type') || 'properties'

  try {
    if (!isSanityConfigured()) {
      if (type === 'properties') {
        const properties = await getLocalProperties()
        return NextResponse.json({ properties })
      }

      if (type === 'regions') {
        const regions = await getLocalRegions()
        return NextResponse.json({ regions })
      }

      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }

    if (type === 'properties') {
      const query = `*[_type == "listing" && !(_id in path("drafts.**"))] | order(_createdAt desc) {
        _id,
        title,
        slug,
        propertyType,
        price,
        specifications,
        location,
        status,
        featured,
        description,
        images,
        mainImage,
        amenities,
        seoTitle,
        seoDescription,
        keywords,
        publishAt,
        scheduledPublish,
        sourceUrl,
        _createdAt
      }`
      
      const properties = await client.fetch(query)
      if (Array.isArray(properties) && properties.length > 0) {
        return NextResponse.json({ properties })
      }

      // Fallback to local properties when Sanity has no items
      const localProperties = await getLocalProperties()
      return NextResponse.json({ properties: localProperties })
    }

    if (type === 'regions') {
      const query = `*[_type == "region" && !(_id in path("drafts.**"))] | order(coalesce(name.en, name.it, name.cs) asc) {
        _id,
        name,
        slug,
        country,
        description,
        image,
        propertyCount,
        averagePrice,
        priceRange,
        topCities,
        highlights,
        popularity
      }`

      const regions = await client.fetch(query)
      if (Array.isArray(regions) && regions.length > 0) {
        return NextResponse.json({ regions })
      }

      const localRegions = await getLocalRegions()
      return NextResponse.json({ regions: localRegions })
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
  } catch (error) {
    console.error('Error fetching content:', error)

    // Graceful fallback to local stores when Sanity request fails
    if (type === 'properties') {
      try {
        const properties = await getLocalProperties()
        return NextResponse.json({
          properties,
          warning: 'Sanity fetch failed, using local properties fallback'
        })
      } catch {
        return NextResponse.json({
          error: 'Failed to fetch content',
          properties: [],
          regions: []
        }, { status: 500 })
      }
    }

    if (type === 'regions') {
      try {
        const regions = await getLocalRegions()
        return NextResponse.json({
          regions,
          warning: 'Sanity fetch failed, using local regions fallback'
        })
      } catch {
        return NextResponse.json({
          error: 'Failed to fetch content',
          properties: [],
          regions: []
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      error: 'Failed to fetch content',
      properties: [],
      regions: []
    }, { status: 500 })
  }
}

// POST - Create new property
export async function POST(request) {
  try {
    const body = await request.json()
    const { type, data } = body

    if (!isSanityConfigured()) {
      if (type === 'property') {
        const property = await createLocalProperty(data)
        return NextResponse.json({ success: true, property })
      }

      if (type === 'region') {
        const region = await createLocalRegion(data)
        return NextResponse.json({ success: true, region })
      }

      return NextResponse.json({ error: 'Invalid type or missing data' }, { status: 400 })
    }

    if (type === 'property') {
      // Generate slug from title
      const slugBase = (data.title?.en || data.title?.it || 'untitled')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const slug = `${slugBase}-${Date.now()}`

      const document = {
        _type: 'listing',
        title: data.title,
        slug: {
          _type: 'slug',
          current: slug
        },
        propertyType: data.propertyType,
        price: {
          amount: data.price?.amount || 0,
          currency: data.price?.currency || 'EUR'
        },
        specifications: {
          rooms: data.specifications?.rooms || 0,
          bedrooms: data.specifications?.bedrooms || 0,
          bathrooms: data.specifications?.bathrooms || 0,
          squareFootage: data.specifications?.squareFootage || 0
        },
        location: data.location || null,
        status: data.status || 'available',
        featured: data.featured || false,
        description: data.description || { en: '', it: '' },
        // Images with main image reference
        images: data.images || [],
        mainImage: data.mainImage || null,
        amenities: data.amenities || [],
        sourceUrl: data.sourceUrl || '',
        // SEO fields
        seoTitle: data.seoTitle || { en: '', it: '' },
        seoDescription: data.seoDescription || { en: '', it: '' },
        keywords: data.keywords || [],
        // Scheduled publishing
        publishAt: data.publishAt || null,
        scheduledPublish: data.scheduledPublish || false
      }

      // Fallback to local write when SANITY_API_TOKEN is not available
      if (!process.env.SANITY_API_TOKEN) {
        const property = await createLocalProperty(data)
        return NextResponse.json({
          success: true,
          property,
          warning: 'Sanity API token missing, property saved to local store'
        })
      }

      try {
        const result = await writeClient.create(document)
        return NextResponse.json({ success: true, property: result })
      } catch (sanityError) {
        console.error('Sanity create failed, falling back to local store:', sanityError)
        const property = await createLocalProperty(data)
        return NextResponse.json({
          success: true,
          property,
          warning: 'Sanity create failed, property saved to local store'
        })
      }
    }

    if (type === 'region') {
      const slugBase = (data?.slug?.current || data?.name?.en || data?.name?.it || 'region')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const document = {
        _type: 'region',
        name: data.name || { en: '', cs: '', it: '' },
        slug: {
          _type: 'slug',
          current: slugBase
        },
        country: data.country || 'Italy',
        description: data.description || { en: '', cs: '', it: '' },
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

      // Use writeClient for mutations (requires API token)
      if (!process.env.SANITY_API_TOKEN) {
        return NextResponse.json({ 
          error: 'Sanity API token not configured. Write operations require SANITY_API_TOKEN.' 
        }, { status: 503 })
      }

      const result = await writeClient.create(document)
      return NextResponse.json({ success: true, region: result })
    }

    return NextResponse.json({ error: 'Invalid type or missing data' }, { status: 400 })
  } catch (error) {
    console.error('Error creating content:', error)
    // Only expose verbose details in non-production environments
    const base = {
      error: 'Failed to create content',
      hint: 'Ensure SANITY_API_TOKEN is set on Vercel (Production), token has Editor role, and dataset/project IDs match'
    }
    if (process.env.NODE_ENV !== 'production') {
      base.details = error?.message || null
      base.sanityError = error?.response?.body || error?.response || null
    }
    return NextResponse.json(base, { status: 500 })
  }
}

// PUT - Update property
export async function PUT(request) {
  try {
    const body = await request.json()
    const { type, id, data } = body

    if (!isSanityConfigured()) {
      if (type === 'property' && id) {
        const property = await updateLocalProperty(id, data)

        if (!property) {
          return NextResponse.json({ error: 'Property not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true, property })
      }

      if (type === 'region' && id) {
        const region = await updateLocalRegion(id, data)

        if (!region) {
          return NextResponse.json({ error: 'Region not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true, region })
      }

      return NextResponse.json({ error: 'Invalid type or missing ID' }, { status: 400 })
    }

    if (type === 'property' && id) {
      const updateData = {}

      if (data.title) updateData.title = data.title
      if (data.propertyType) updateData.propertyType = data.propertyType
      if (data.price) updateData.price = data.price
      if (data.specifications) updateData.specifications = data.specifications
      if (data.location) updateData.location = data.location
      if (data.status) updateData.status = data.status
      if (data.featured !== undefined) updateData.featured = data.featured
      if (data.description) updateData.description = data.description
      if (data.images) updateData.images = data.images
      if (data.mainImage !== undefined) updateData.mainImage = data.mainImage
      if (data.amenities) updateData.amenities = data.amenities
      if (data.sourceUrl !== undefined) updateData.sourceUrl = data.sourceUrl
      if (data.seoTitle) updateData.seoTitle = data.seoTitle
      if (data.seoDescription) updateData.seoDescription = data.seoDescription
      if (data.keywords) updateData.keywords = data.keywords
      if (data.publishAt !== undefined) updateData.publishAt = data.publishAt
      if (data.scheduledPublish !== undefined) updateData.scheduledPublish = data.scheduledPublish

      // Generate new slug if title changed
      if (data.title && (data.title.en || data.title.it)) {
        const slugBase = (data.title.en || data.title.it || 'untitled')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')

        updateData.slug = {
          _type: 'slug',
          current: slugBase
        }
      }

      // Fallback to local write when SANITY_API_TOKEN is not available
      if (!process.env.SANITY_API_TOKEN) {
        const property = await updateLocalProperty(id, data)
        if (!property) {
          return NextResponse.json({ error: 'Property not found' }, { status: 404 })
        }
        return NextResponse.json({
          success: true,
          property,
          warning: 'Sanity API token missing, property updated in local store'
        })
      }

      try {
        const result = await writeClient
          .patch(id)
          .set(updateData)
          .commit()

        return NextResponse.json({ success: true, property: result })
      } catch (sanityError) {
        console.error('Sanity update failed, falling back to local store:', sanityError)
        const property = await updateLocalProperty(id, data)
        if (!property) {
          return NextResponse.json({ error: 'Property not found' }, { status: 404 })
        }
        return NextResponse.json({
          success: true,
          property,
          warning: 'Sanity update failed, property updated in local store'
        })
      }
    }

    if (type === 'region' && id) {
      const updateData = {}
      if (data.name) updateData.name = data.name
      if (data.slug) updateData.slug = data.slug
      if (data.country) updateData.country = data.country
      if (data.description) updateData.description = data.description
      if (data.image !== undefined) updateData.image = data.image
      if (data.propertyCount !== undefined) updateData.propertyCount = Number(data.propertyCount || 0)
      if (data.averagePrice !== undefined) updateData.averagePrice = Number(data.averagePrice || 0)
      if (data.priceRange) {
        updateData.priceRange = {
          min: Number(data?.priceRange?.min || 0),
          max: Number(data?.priceRange?.max || 0)
        }
      }
      if (data.topCities) updateData.topCities = data.topCities
      if (data.highlights) updateData.highlights = data.highlights
      if (data.popularity !== undefined) updateData.popularity = Number(data.popularity || 0)

      if (!process.env.SANITY_API_TOKEN) {
        return NextResponse.json({
          error: 'Sanity API token not configured. Write operations require SANITY_API_TOKEN.'
        }, { status: 503 })
      }

      const result = await writeClient
        .patch(id)
        .set(updateData)
        .commit()

      return NextResponse.json({ success: true, region: result })
    }

    return NextResponse.json({ error: 'Invalid type or missing ID' }, { status: 400 })
  } catch (error) {
    console.error('Error updating content:', error)
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 })
  }
}

// DELETE - Delete property
export async function DELETE(request) {
  try {
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const id = url.searchParams.get('id')

    if (!isSanityConfigured()) {
      if (type === 'property' && id) {
        const deleted = await deleteLocalProperty(id)
        if (!deleted) {
          return NextResponse.json({ error: 'Property not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true })
      }

      if (type === 'region' && id) {
        const deleted = await deleteLocalRegion(id)
        if (!deleted) {
          return NextResponse.json({ error: 'Region not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true })
      }

      return NextResponse.json({ error: 'Invalid type or missing ID' }, { status: 400 })
    }

    if ((type === 'property' || type === 'region') && id) {
      // Fallback for property delete when SANITY_API_TOKEN is missing
      if (type === 'property' && !process.env.SANITY_API_TOKEN) {
        const deleted = await deleteLocalProperty(id)
        if (!deleted) {
          return NextResponse.json({ error: 'Property not found' }, { status: 404 })
        }
        return NextResponse.json({
          success: true,
          warning: 'Sanity API token missing, property deleted from local store'
        })
      }

      // Use writeClient for mutations (requires API token)
      if (!process.env.SANITY_API_TOKEN) {
        return NextResponse.json({
          error: 'Sanity API token not configured. Write operations require SANITY_API_TOKEN.'
        }, { status: 503 })
      }

      try {
        await writeClient.delete(id)
        return NextResponse.json({ success: true })
      } catch (sanityError) {
        if (type === 'property') {
          console.error('Sanity delete failed, falling back to local store:', sanityError)
          const deleted = await deleteLocalProperty(id)
          if (!deleted) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 })
          }
          return NextResponse.json({
            success: true,
            warning: 'Sanity delete failed, property deleted from local store'
          })
        }
        throw sanityError
      }
    }

    return NextResponse.json({ error: 'Invalid type or missing ID' }, { status: 400 })
  } catch (error) {
    console.error('Error deleting content:', error)
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 })
  }
}

