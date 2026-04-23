import { NextResponse } from 'next/server'
import {
  canMonitorSource,
  checkSourceListing,
  loadSourceTrackedProperties,
  updatePropertySourceStatus
} from '@/lib/sourceStatusMonitor'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function isAuthorized(request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return false
  return request.headers.get('authorization') === `Bearer ${cronSecret}`
}

async function runSourceStatusCron() {
  const allProperties = await loadSourceTrackedProperties()
  const monitorableProperties = allProperties.filter(canMonitorSource)

  const summary = {
    checkedAt: new Date().toISOString(),
    scanned: monitorableProperties.length,
    updated: 0,
    unchanged: 0,
    skipped: Math.max(allProperties.length - monitorableProperties.length, 0),
    errors: []
  }

  for (const property of monitorableProperties) {
    try {
      const result = await checkSourceListing(property.sourceUrl)
      const statusChanged =
        property.status !== (result.propertyStatus || property.status) ||
        property.sourceStatus !== result.sourceStatus

      await updatePropertySourceStatus(property, result)

      if (statusChanged) {
        summary.updated += 1
      } else {
        summary.unchanged += 1
      }
    } catch (error) {
      summary.errors.push({
        propertyId: property._id,
        sourceUrl: property.sourceUrl,
        message: error?.message || 'Unknown source check error'
      })
    }
  }

  return {
    success: summary.errors.length === 0,
    ...summary
  }
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runSourceStatusCron()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || 'Source status cron failed' },
      { status: 500 }
    )
  }
}
