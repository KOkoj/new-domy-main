import { NextResponse } from 'next/server'
import { getPropertyBySlug } from '@/lib/propertyApi'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request, { params }) {
  try {
    const { slug } = await params
    const property = await getPropertyBySlug(slug)

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    return NextResponse.json(property, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Property detail API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
