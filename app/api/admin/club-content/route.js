import { NextResponse } from 'next/server'
import { requireAdminApiAccess } from '@/lib/adminAuth'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const CONTENT_TYPES = new Set(['video', 'guide', 'article'])

function sanitizeContentPayload(body) {
  const title = String(body?.title || '').trim()
  const contentType = String(body?.content_type || '').trim()

  if (!title || !CONTENT_TYPES.has(contentType)) {
    return { error: 'Title and a valid content_type (video, guide, article) are required' }
  }

  return {
    data: {
      title,
      description: String(body?.description || '').trim() || null,
      content_type: contentType,
      category: String(body?.category || '').trim() || null,
      thumbnail_url: String(body?.thumbnail_url || '').trim() || null,
      content_url: String(body?.content_url || '').trim() || null,
      file_url: String(body?.file_url || '').trim() || null,
      duration: String(body?.duration || '').trim() || null,
      pages: Number.parseInt(body?.pages, 10) || 0,
      read_time: String(body?.read_time || '').trim() || null,
      author: String(body?.author || '').trim() || null,
      is_featured: body?.is_featured === true,
      published_at: body?.published_at || new Date().toISOString()
    }
  }
}

export async function GET() {
  const access = await requireAdminApiAccess()
  if (!access.ok) return access.response

  try {
    const supabaseAdmin = getSupabaseAdminClient()
    const { data, error } = await supabaseAdmin
      .from('premium_content')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ content: data || [] })
  } catch (error) {
    console.error('[ADMIN_CLUB_CONTENT] Failed to load content:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to load content' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  const access = await requireAdminApiAccess()
  if (!access.ok) return access.response

  try {
    const body = await request.json()
    const { data: payload, error: validationError } = sanitizeContentPayload(body)

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdminClient()
    const { data, error } = await supabaseAdmin
      .from('premium_content')
      .insert([payload])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, item: data })
  } catch (error) {
    console.error('[ADMIN_CLUB_CONTENT] Failed to create content:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to create content' },
      { status: 500 }
    )
  }
}

export async function PATCH(request) {
  const access = await requireAdminApiAccess()
  if (!access.ok) return access.response

  try {
    const body = await request.json()
    const id = String(body?.id || '').trim()

    if (!id) {
      return NextResponse.json({ error: 'Missing content id' }, { status: 400 })
    }

    const { data: payload, error: validationError } = sanitizeContentPayload(body)

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdminClient()
    const { data, error } = await supabaseAdmin
      .from('premium_content')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) throw error
    if (!data) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, item: data })
  } catch (error) {
    console.error('[ADMIN_CLUB_CONTENT] Failed to update content:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to update content' },
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
      return NextResponse.json({ error: 'Missing content id' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdminClient()
    const { error } = await supabaseAdmin
      .from('premium_content')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[ADMIN_CLUB_CONTENT] Failed to delete content:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to delete content' },
      { status: 500 }
    )
  }
}
