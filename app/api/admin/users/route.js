import { NextResponse } from 'next/server'
import { requireAdminApiAccess } from '@/lib/adminAuth'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { getProfileDisplayName } from '@/lib/profileName'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// `inquiries` was never migrated to snake_case and still uses `userId`/`createdAt`.
// Every other activity table (favorites, saved_searches, client_intake_forms,
// webinar_registrations, document_access_logs) uses snake_case `user_id`.
const STATS_TABLES = [
  { key: 'favorites', table: 'favorites', column: 'user_id' },
  { key: 'savedSearches', table: 'saved_searches', column: 'user_id' },
  { key: 'inquiries', table: 'inquiries', column: 'userId' },
  { key: 'forms', table: 'client_intake_forms', column: 'user_id' },
  { key: 'webinars', table: 'webinar_registrations', column: 'user_id' },
  { key: 'documents', table: 'document_access_logs', column: 'user_id' }
]

async function loadAllAuthUserEmails(supabaseAdmin) {
  const emailById = new Map()
  const perPage = 1000
  let page = 1

  // Bounded loop (safety net) instead of unbounded pagination.
  for (let i = 0; i < 20; i++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage })

    if (error) {
      console.error('[ADMIN_USERS] auth.admin.listUsers failed:', error.message)
      break
    }

    const authUsers = data?.users || []
    for (const authUser of authUsers) {
      if (authUser?.id) emailById.set(authUser.id, authUser.email || null)
    }

    if (authUsers.length < perPage) break
    page += 1
  }

  return emailById
}

function countByColumn(rows, column) {
  const counts = new Map()
  for (const row of rows || []) {
    const id = row?.[column]
    if (!id) continue
    counts.set(id, (counts.get(id) || 0) + 1)
  }
  return counts
}

export async function GET() {
  const access = await requireAdminApiAccess()
  if (!access.ok) return access.response

  try {
    const supabaseAdmin = getSupabaseAdminClient()

    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) throw profilesError

    const userIds = (profiles || []).map((profile) => profile.id).filter(Boolean)

    const [emailById, ...statsResults] = await Promise.all([
      loadAllAuthUserEmails(supabaseAdmin),
      ...STATS_TABLES.map(({ table, column }) =>
        userIds.length
          ? supabaseAdmin.from(table).select(column).in(column, userIds)
          : Promise.resolve({ data: [] })
      )
    ])

    const countsByKey = {}
    STATS_TABLES.forEach(({ key, table, column }, index) => {
      const { data, error } = statsResults[index] || {}
      if (error) {
        console.error(`[ADMIN_USERS] Failed to load ${table} stats:`, error.message)
      }
      countsByKey[key] = countByColumn(data, column)
    })

    const users = (profiles || []).map((profile) => {
      const email = emailById.get(profile.id) || null
      const resolvedName = getProfileDisplayName(profile, email)

      return {
        ...profile,
        name: resolvedName,
        // Defensive fallback while legacy rows haven't been backfilled yet
        // (see db/consolidate-profiles-columns.sql).
        created_at: profile.created_at || profile.createdAt || null,
        email,
        stats: {
          favorites: countsByKey.favorites.get(profile.id) || 0,
          savedSearches: countsByKey.savedSearches.get(profile.id) || 0,
          inquiries: countsByKey.inquiries.get(profile.id) || 0,
          forms: countsByKey.forms.get(profile.id) || 0,
          webinars: countsByKey.webinars.get(profile.id) || 0,
          documents: countsByKey.documents.get(profile.id) || 0
        }
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('[ADMIN_USERS] Failed to load users:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to load users' },
      { status: 500 }
    )
  }
}

export async function PATCH(request) {
  const access = await requireAdminApiAccess()
  if (!access.ok) return access.response

  try {
    const body = await request.json()
    const userId = String(body?.userId || '').trim()
    const role = String(body?.role || '').trim()

    if (!userId || !['user', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Missing or invalid userId/role' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdminClient()
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .maybeSingle()

    if (error) throw error

    return NextResponse.json({ success: true, user: data })
  } catch (error) {
    console.error('[ADMIN_USERS] Failed to update user role:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to update user role' },
      { status: 500 }
    )
  }
}
