import { NextResponse } from 'next/server'
import { getAllProperties } from '@/lib/propertyApi'

// The route reads URL search params at runtime, so it has to remain dynamic.
// We still set strong CDN cache headers so identical query strings are served
// from the edge for one hour. This is the equivalent of ISR for an API route
// that varies by query parameters.
export const dynamic = 'force-dynamic'
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
