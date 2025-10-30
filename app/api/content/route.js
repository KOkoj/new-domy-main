import { NextResponse } from 'next/server'
import { client, writeClient } from '@/lib/sanity'

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
  if (!isSanityConfigured()) {
    return NextResponse.json({ 
      error: 'Sanity CMS not configured',
      properties: [],
      regions: []
    }, { status: 503 })
  }

  try {
    const url = new URL(request.url)
    const type = url.searchParams.get('type') || 'properties'

    if (type === 'properties') {
      const query = `*[_type == "listing" && !(_id in path("drafts.**"))] | order(_createdAt desc) {
        _id,
        title,
        slug,
        propertyType,
        price,
        specifications,
        "location": {
          "city": city->{
            name,
            slug
          }
        },
        status,
        featured,
        _createdAt
      }`
      
      const properties = await client.fetch(query)
      return NextResponse.json({ properties: properties || [] })
    }

    if (type === 'regions') {
      const query = `*[_type == "region" && !(_id in path("drafts.**"))] | order(name.en asc) {
        _id,
        name,
        slug,
        country,
        description,
        "propertyCount": count(*[_type == "listing" && references(^.cities[]._ref)])
      }`
      
      const regions = await client.fetch(query)
      return NextResponse.json({ regions: regions || [] })
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch content',
      properties: [],
      regions: []
    }, { status: 500 })
  }
}

// POST - Create new property
export async function POST(request) {
  if (!isSanityConfigured()) {
    return NextResponse.json({ error: 'Sanity CMS not configured' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { type, data } = body

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
          bedrooms: data.specifications?.bedrooms || 0,
          bathrooms: data.specifications?.bathrooms || 0,
          squareFootage: data.specifications?.squareFootage || 0
        },
        status: data.status || 'available',
        featured: data.featured || false,
        description: data.description || { en: '', it: '' }
      }

      // Use writeClient for mutations (requires API token)
      if (!process.env.SANITY_API_TOKEN) {
        return NextResponse.json({ 
          error: 'Sanity API token not configured. Write operations require SANITY_API_TOKEN.' 
        }, { status: 503 })
      }

      const result = await writeClient.create(document)
      return NextResponse.json({ success: true, property: result })
    }

    return NextResponse.json({ error: 'Invalid type or missing data' }, { status: 400 })
  } catch (error) {
    console.error('Error creating content:', error)
    // Return more detailed error message for debugging
    return NextResponse.json({ 
      error: 'Failed to create content',
      details: error?.message || null,
      sanityError: error?.response?.body || error?.response || null,
      hint: 'Ensure SANITY_API_TOKEN is set on Vercel (Production), token has Editor role, and dataset/project IDs match'
    }, { status: 500 })
  }
}

// PUT - Update property
export async function PUT(request) {
  if (!isSanityConfigured()) {
    return NextResponse.json({ error: 'Sanity CMS not configured' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { type, id, data } = body

    if (type === 'property' && id) {
      const updateData = {}

      if (data.title) updateData.title = data.title
      if (data.propertyType) updateData.propertyType = data.propertyType
      if (data.price) updateData.price = data.price
      if (data.specifications) updateData.specifications = data.specifications
      if (data.status) updateData.status = data.status
      if (data.featured !== undefined) updateData.featured = data.featured
      if (data.description) updateData.description = data.description

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

      // Use writeClient for mutations (requires API token)
      if (!process.env.SANITY_API_TOKEN) {
        return NextResponse.json({ 
          error: 'Sanity API token not configured. Write operations require SANITY_API_TOKEN.' 
        }, { status: 503 })
      }

      const result = await writeClient
        .patch(id)
        .set(updateData)
        .commit()

      return NextResponse.json({ success: true, property: result })
    }

    return NextResponse.json({ error: 'Invalid type or missing ID' }, { status: 400 })
  } catch (error) {
    console.error('Error updating content:', error)
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 })
  }
}

// DELETE - Delete property
export async function DELETE(request) {
  if (!isSanityConfigured()) {
    return NextResponse.json({ error: 'Sanity CMS not configured' }, { status: 503 })
  }

  try {
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const id = url.searchParams.get('id')

    if (type === 'property' && id) {
      // Use writeClient for mutations (requires API token)
      if (!process.env.SANITY_API_TOKEN) {
        return NextResponse.json({ 
          error: 'Sanity API token not configured. Write operations require SANITY_API_TOKEN.' 
        }, { status: 503 })
      }

      await writeClient.delete(id)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid type or missing ID' }, { status: 400 })
  } catch (error) {
    console.error('Error deleting content:', error)
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 })
  }
}

