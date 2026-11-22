import { NextResponse } from 'next/server'
import { requireAdminApiAccess } from '@/lib/adminAuth'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { foldText } from '@/lib/clientMessages'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const LIMIT = 20

function displayName(user, profile) {
  const fromProfile = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim() || profile?.name || ''
  const meta = user?.user_metadata || {}
  return String(fromProfile || meta.full_name || meta.name || '').trim()
}

// Client lookup for /admin/zpravy by name or e-mail (auth.users + profiles,
// service role). Without q: the most recently registered clients.
export async function GET(request) {
  const access = await requireAdminApiAccess()
  if (!access.ok) return access.response

  const q = foldText(new URL(request.url).searchParams.get('q') || '').trim()

  try {
    const admin = getSupabaseAdminClient()
    const users = []
    for (let page = 1; page <= 10; page += 1) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
      if (error) throw error
      const batch = data?.users || []
      users.push(...batch)
      if (batch.length < 1000) break
    }

    const { data: profiles, error: profilesError } = await admin
      .from('profiles')
      .select('id, name, first_name, last_name, role')
    if (profilesError) console.error('[admin/messages/clients] profiles failed:', profilesError.message)
    const profileById = new Map((profiles || []).map((profile) => [profile.id, profile]))

    const clients = users
      .map((user) => {
        const profile = profileById.get(user.id)
        return {
          id: user.id,
          email: user.email || '',
          name: displayName(user, profile),
          role: profile?.role || 'user',
          createdAt: user.created_at
        }
      })
      .filter((client) => !q || foldText(`${client.name} ${client.email}`).includes(q))
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
      .slice(0, LIMIT)

    return NextResponse.json({ clients }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[admin/messages/clients] failed:', error?.message || error)
    return NextResponse.json({ error: 'Failed to search clients' }, { status: 500 })
  }
}
