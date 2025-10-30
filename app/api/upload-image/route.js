import { NextResponse } from 'next/server'
import { writeClient } from '@/lib/sanity'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Helper to check if Sanity is configured
function isSanityConfigured() {
  return process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && 
         process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'placeholder' &&
         process.env.SANITY_API_TOKEN
}

export async function POST(request) {
  if (!isSanityConfigured()) {
    return NextResponse.json({ 
      error: 'Sanity CMS not configured properly. Ensure SANITY_API_TOKEN is set.' 
    }, { status: 503 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Sanity
    const asset = await writeClient.assets.upload('image', buffer, {
      filename: file.name,
      contentType: file.type
    })

    return NextResponse.json({ 
      success: true, 
      asset: {
        _id: asset._id,
        url: asset.url,
        metadata: asset.metadata
      }
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json({ 
      error: 'Failed to upload image',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    }, { status: 500 })
  }
}

