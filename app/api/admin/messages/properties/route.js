import { NextResponse } from 'next/server'
import { requireAdminApiAccess } from '@/lib/adminAuth'
import { getListableProperties } from '@/lib/propertyApi'
import { toZoneHouse } from '@/lib/zoneHouses'
import { foldText } from '@/lib/clientMessages'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const LIMIT = 12

// House picker for /admin/zpravy: search the public inventory by title,
// region, id or slug. Returns zone house cards.
export async function GET(request) {
  const access = await requireAdminApiAccess()
  if (!access.ok) return access.response

  const q = foldText(new URL(request.url).searchParams.get('q') || '').trim()
  if (q.length < 2) return NextResponse.json({ houses: [] })

  try {
    const properties = await getListableProperties(new URLSearchParams())
    const houses = []
    for (const property of properties) {
      const house = toZoneHouse(property)
      if (!house.id) continue
      if (foldText(`${house.title} ${house.region} ${house.id} ${house.slug || ''}`).includes(q)) {
        houses.push(house)
        if (houses.length >= LIMIT) break
      }
    }
    return NextResponse.json({ houses }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[admin/messages/properties] failed:', error?.message || error)
    return NextResponse.json({ error: 'Failed to search properties' }, { status: 500 })
  }
}
