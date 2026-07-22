import { NextResponse } from 'next/server'
import { requireAdminApiAccess } from '@/lib/adminAuth'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { getAllProperties } from '@/lib/propertyApi'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getAdminClient(access) {
  try {
    return getSupabaseAdminClient()
  } catch {
    return access.supabase
  }
}

export async function GET() {
  const access = await requireAdminApiAccess()
  if (!access.ok) return access.response

  try {
    const supabase = getAdminClient(access)
    const [{ data, error }, properties] = await Promise.all([
      supabase
        .from('inquiries')
        .select('*')
        .order('createdAt', { ascending: false }),
      getAllProperties(new URLSearchParams())
    ])

    if (error) throw error

    const propertyById = new Map()
    for (const property of properties || []) {
      const slug = property?.slug?.current
      if (!slug) continue
      if (property?._id) propertyById.set(property._id, slug)
      propertyById.set(slug, slug)
    }

    const inquiries = (data || []).map((inquiry) => {
      const listingId = inquiry.listingId || inquiry.listing_id || null
      const listingSlug = listingId ? propertyById.get(listingId) || listingId : null

      return {
        ...inquiry,
        listingId,
        listingSlug,
        status: inquiry.responded ? 'responded' : 'pending'
      }
    })

    return NextResponse.json({ inquiries })
  } catch (error) {
    console.error('[ADMIN_INQUIRIES] Failed to load inquiries:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to load inquiries' },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  const access = await requireAdminApiAccess()
  if (!access.ok) return access.response

  try {
    const url = new URL(request.url)
    const id = String(url.searchParams.get('id') || '').trim()

    if (!id) {
      return NextResponse.json({ error: 'Missing inquiry id' }, { status: 400 })
    }

    const supabase = getAdminClient(access)
    const { data, error } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle()

    if (error) throw error
    if (!data) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[ADMIN_INQUIRIES] Failed to delete inquiry:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to delete inquiry' },
      { status: 500 }
    )
  }
}
