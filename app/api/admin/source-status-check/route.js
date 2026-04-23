import { NextResponse } from 'next/server'
import { requireAdminApiAccess } from '@/lib/adminAuth'
import {
  canMonitorSource,
  checkSourceListing,
  loadSourceTrackedProperties,
  updatePropertySourceStatus
} from '@/lib/sourceStatusMonitor'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function normalizeUrl(value) {
  return String(value || '').trim()
}

export async function POST(request) {
  const access = await requireAdminApiAccess()
  if (!access.ok) return access.response

  try {
    const body = await request.json().catch(() => ({}))
    const propertyId = String(body?.propertyId || '').trim()
    const sourceUrl = normalizeUrl(body?.sourceUrl)
    const persist = body?.persist !== false

    let property = null

    if (propertyId) {
      const properties = await loadSourceTrackedProperties()
      property = properties.find((item) => item?._id === propertyId) || null
    } else if (sourceUrl) {
      property = {
        _id: null,
        status: 'available',
        sourceStatus: null,
        sourceUrl
      }
    }

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    if (!canMonitorSource(property)) {
      return NextResponse.json(
        { error: 'Source URL is missing or not monitorable' },
        { status: 400 }
      )
    }

    const result = await checkSourceListing(property.sourceUrl)

    let updatedProperty = null
    if (persist && property._id) {
      updatedProperty = await updatePropertySourceStatus(property, result)
    }

    return NextResponse.json({
      success: true,
      checkedAt: new Date().toISOString(),
      persist,
      propertyId: property._id,
      sourceUrl: property.sourceUrl,
      monitoring: result,
      updatedProperty
    })
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || 'Manual source status check failed' },
      { status: 500 }
    )
  }
}
