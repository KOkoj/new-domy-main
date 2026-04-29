import { NextResponse } from 'next/server'
import { getAllProperties } from '@/lib/propertyApi'

// Cache the properties response at the edge for one hour. Browser-side fetches
// hit a CDN-cached payload and Server Components can reuse the same data
// during their render without each one hitting Sanity directly.
export const revalidate = 3600
export const runtime = 'nodejs'

export async function GET(request) {
  try {
    const url = new URL(request.url)
    const properties = await getAllProperties(url.searchParams)
    return NextResponse.json(properties, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Properties API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
