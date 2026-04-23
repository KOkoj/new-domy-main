import { NextResponse } from 'next/server'
import { getAllProperties } from '@/lib/propertyApi'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request) {
  try {
    const url = new URL(request.url)
    const properties = await getAllProperties(url.searchParams)
    return NextResponse.json(properties)
  } catch (error) {
    console.error('Properties API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
