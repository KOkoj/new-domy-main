import { NextResponse } from 'next/server'
import { requireAdminApiAccess } from '@/lib/adminAuth'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Sitewide dashboard stats via the service-role client. The browser client
// only sees RLS-scoped rows (e.g. the admin's own favorites), which made the
// old dashboard totals silently wrong.
export async function GET() {
  const access = await requireAdminApiAccess()
  if (!access.ok) return access.response

  try {
    const supabaseAdmin = getSupabaseAdminClient()

    const [
      usersResult,
      inquiriesResult,
      favoritesResult,
      savedSearchesResult,
      recentUsersResult,
      recentInquiriesResult
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('inquiries').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('favorites').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('saved_searches').select('id', { count: 'exact', head: true }),
      supabaseAdmin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5),
      // `inquiries` still uses the legacy camelCase createdAt column.
      supabaseAdmin
        .from('inquiries')
        .select('*')
        .order('createdAt', { ascending: false })
        .limit(5)
    ])

    const firstError =
      usersResult.error ||
      inquiriesResult.error ||
      favoritesResult.error ||
      savedSearchesResult.error ||
      recentUsersResult.error ||
      recentInquiriesResult.error
    if (firstError) throw firstError

    return NextResponse.json({
      totals: {
        users: usersResult.count || 0,
        inquiries: inquiriesResult.count || 0,
        favorites: favoritesResult.count || 0,
        savedSearches: savedSearchesResult.count || 0
      },
      recentUsers: recentUsersResult.data || [],
      recentInquiries: recentInquiriesResult.data || []
    })
  } catch (error) {
    console.error('[ADMIN_STATS] Failed to load stats:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to load stats' },
      { status: 500 }
    )
  }
}
