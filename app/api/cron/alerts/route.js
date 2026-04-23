import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity'
import emailService from '@/lib/emailService'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const HOURS_PER_WEEK = 24 * 7

function isAuthorized(request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return false
  return request.headers.get('authorization') === `Bearer ${cronSecret}`
}

function getSearchUserId(search) {
  return search?.user_id || search?.userId || null
}

function getSearchFilters(search) {
  return search?.filters || search?.search_criteria || {}
}

function isSearchAlertsEnabled(search) {
  if (typeof search?.alerts_enabled === 'boolean') return search.alerts_enabled
  if (typeof search?.alertsEnabled === 'boolean') return search.alertsEnabled
  if (typeof search?.notifications === 'boolean') return search.notifications
  return true
}

function getLastAlertSent(search) {
  return search?.last_alert_sent || search?.lastAlertSent || null
}

function shouldSendByFrequency(lastSentIso, frequency = 'daily') {
  if (!lastSentIso) return true

  const lastSent = new Date(lastSentIso)
  if (!Number.isFinite(lastSent.getTime())) return true

  const hoursSinceLastSent = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60)

  switch (frequency) {
    case 'instant':
      return hoursSinceLastSent >= 1
    case 'weekly':
      return hoursSinceLastSent >= HOURS_PER_WEEK
    case 'daily':
    default:
      return hoursSinceLastSent >= 24
  }
}

function getPropertyType(property) {
  return property?.propertyType || property?.type || null
}

function getPropertyPrice(property) {
  if (typeof property?.price?.amount === 'number') return property.price.amount
  if (typeof property?.price === 'number') return property.price
  return null
}

function getPropertyCitySlug(property) {
  return property?.location?.city?.slug?.current || property?.location?.city?.slug || null
}

function getPropertyBedrooms(property) {
  return property?.specifications?.bedrooms ?? property?.bedrooms ?? null
}

function getPropertyBathrooms(property) {
  return property?.specifications?.bathrooms ?? property?.bathrooms ?? null
}

function getFilterNumber(filters, keys) {
  for (const key of keys) {
    const value = filters?.[key]
    if (value === null || value === undefined || value === '') continue
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

function matchesFilters(property, filters) {
  const type = filters?.type || filters?.property_type || null
  const city = filters?.city || filters?.city_slug || null
  const priceMin = getFilterNumber(filters, ['priceMin', 'price_min'])
  const priceMax = getFilterNumber(filters, ['priceMax', 'price_max'])
  const bedrooms = getFilterNumber(filters, ['bedrooms'])
  const bathrooms = getFilterNumber(filters, ['bathrooms'])

  if (type && getPropertyType(property) !== type) return false
  if (city && getPropertyCitySlug(property) !== city) return false

  const price = getPropertyPrice(property)
  if (priceMin !== null && (price === null || price < priceMin)) return false
  if (priceMax !== null && (price === null || price > priceMax)) return false

  const propertyBedrooms = getPropertyBedrooms(property)
  if (bedrooms !== null && (propertyBedrooms === null || propertyBedrooms < bedrooms)) return false

  const propertyBathrooms = getPropertyBathrooms(property)
  if (bathrooms !== null && (propertyBathrooms === null || propertyBathrooms < bathrooms)) return false

  return true
}

function inferUserName(user) {
  const metaName = typeof user?.user_metadata?.name === 'string' ? user.user_metadata.name.trim() : ''
  if (metaName) return metaName
  const fullName = typeof user?.user_metadata?.full_name === 'string' ? user.user_metadata.full_name.trim() : ''
  if (fullName) return fullName
  return 'there'
}

async function loadPreferencesMap(supabaseAdmin, userIds) {
  const ids = [...new Set(userIds)].filter(Boolean)
  if (ids.length === 0) return new Map()

  const { data, error } = await supabaseAdmin
    .from('notification_preferences')
    .select('user_id, property_alerts, frequency, email_enabled')
    .in('user_id', ids)

  if (error) {
    throw new Error(`Failed to load notification preferences: ${error.message}`)
  }

  const map = new Map()
  for (const row of data || []) {
    map.set(row.user_id, row)
  }
  return map
}

async function updateLastAlertSent(supabaseAdmin, searchId) {
  const nowIso = new Date().toISOString()

  let result = await supabaseAdmin
    .from('saved_searches')
    .update({ last_alert_sent: nowIso })
    .eq('id', searchId)

  if (!result.error) return

  // Backward-compatible fallback for legacy camelCase schema
  result = await supabaseAdmin
    .from('saved_searches')
    .update({ lastAlertSent: nowIso })
    .eq('id', searchId)

  if (result.error) {
    throw new Error(`Failed to update last alert timestamp: ${result.error.message}`)
  }
}

async function insertEmailLog(supabaseAdmin, { userId, userEmail, status, errorMessage, metadata }) {
  const { error } = await supabaseAdmin.from('email_logs').insert({
    user_id: userId,
    email_type: 'property_alert',
    recipient_email: userEmail,
    subject: 'Property alert',
    status,
    error_message: errorMessage || null,
    metadata: metadata || null
  })

  if (error) {
    throw new Error(`Failed to insert email log: ${error.message}`)
  }
}

async function getAuthUserById(supabaseAdmin, userId, cache) {
  if (cache.has(userId)) return cache.get(userId)
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId)
  if (error) {
    cache.set(userId, null)
    return null
  }
  const user = data?.user || null
  cache.set(userId, user)
  return user
}

async function runAlertsCron() {
  const supabaseAdmin = getSupabaseAdminClient()

  const { data: searches, error: searchesError } = await supabaseAdmin
    .from('saved_searches')
    .select('*')

  if (searchesError) {
    throw new Error(`Failed to fetch saved searches: ${searchesError.message}`)
  }

  if (!searches || searches.length === 0) {
    return {
      success: true,
      message: 'No saved searches found',
      searchesProcessed: 0,
      emailsSent: 0
    }
  }

  const propertiesQuery = `*[_type == "listing" && status == "available"] {
    _id,
    title,
    slug,
    propertyType,
    price,
    specifications,
    location {
      city-> {
        name,
        slug
      }
    },
    _createdAt
  }`
  const allProperties = await client.fetch(propertiesQuery)
  const properties = Array.isArray(allProperties) ? allProperties : []

  const userIds = searches.map((search) => getSearchUserId(search)).filter(Boolean)
  const preferencesByUser = await loadPreferencesMap(supabaseAdmin, userIds)
  const userCache = new Map()

  let searchesProcessed = 0
  let emailsSent = 0
  let skippedBySearchConfig = 0
  let skippedByPreferences = 0
  let skippedByFrequency = 0
  let noMatches = 0
  const errors = []

  for (const search of searches) {
    searchesProcessed += 1

    try {
      if (!isSearchAlertsEnabled(search)) {
        skippedBySearchConfig += 1
        continue
      }

      const userId = getSearchUserId(search)
      if (!userId) {
        skippedBySearchConfig += 1
        continue
      }

      const prefs = preferencesByUser.get(userId)
      const alertsEnabled = prefs?.property_alerts !== false
      const emailEnabled = prefs?.email_enabled !== false
      if (!alertsEnabled || !emailEnabled) {
        skippedByPreferences += 1
        continue
      }

      const frequency = prefs?.frequency || 'daily'
      if (!shouldSendByFrequency(getLastAlertSent(search), frequency)) {
        skippedByFrequency += 1
        continue
      }

      const filters = getSearchFilters(search)
      const matching = properties.filter((property) => matchesFilters(property, filters))

      if (matching.length === 0) {
        noMatches += 1
        continue
      }

      const user = await getAuthUserById(supabaseAdmin, userId, userCache)
      const userEmail = user?.email || null
      if (!userEmail) {
        errors.push({ searchId: search.id, userId, error: 'Missing user email' })
        continue
      }

      const sendResult = await emailService.sendPropertyAlert({
        userEmail,
        userName: inferUserName(user),
        properties: matching,
        searchCriteria: filters
      })

      if (sendResult?.success) {
        emailsSent += 1
        await updateLastAlertSent(supabaseAdmin, search.id)
        await insertEmailLog(supabaseAdmin, {
          userId,
          userEmail,
          status: 'sent',
          metadata: {
            trigger: 'cron-alerts',
            searchId: search.id,
            matchedProperties: matching.length,
            frequency
          }
        })
      } else {
        await insertEmailLog(supabaseAdmin, {
          userId,
          userEmail,
          status: 'failed',
          errorMessage: sendResult?.error || sendResult?.message || 'Unknown send error',
          metadata: {
            trigger: 'cron-alerts',
            searchId: search.id,
            matchedProperties: matching.length,
            frequency
          }
        })
      }
    } catch (error) {
      errors.push({
        searchId: search?.id || null,
        userId: getSearchUserId(search),
        error: error?.message || 'Unexpected alert processing error'
      })
    }
  }

  return {
    success: true,
    searchesProcessed,
    emailsSent,
    skippedBySearchConfig,
    skippedByPreferences,
    skippedByFrequency,
    noMatches,
    errors: errors.length > 0 ? errors : undefined,
    timestamp: new Date().toISOString()
  }
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runAlertsCron()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || 'Property alerts cron failed' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  return GET(request)
}
