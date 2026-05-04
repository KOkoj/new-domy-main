import { NextResponse } from 'next/server'
import { writeClient } from '@/lib/sanity'
import { requireAdminApiAccess } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function isSanityConfigured() {
  return process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
         process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'placeholder' &&
         process.env.SANITY_API_TOKEN
}

export async function POST(request) {
  try {
    const access = await requireAdminApiAccess()
    if (!access.ok) return access.response

    if (!isSanityConfigured()) {
      return NextResponse.json({
        error: 'Sanity CMS not configured properly. Ensure SANITY_API_TOKEN is set.'
      }, { status: 503 })
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (typeof file.size === 'number' && file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 413 })
    }

    if (typeof file.type !== 'string' || !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image uploads are allowed' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

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
      details: error?.message || null
    }, { status: 500 })
  }
}
