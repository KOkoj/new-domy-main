import { NextResponse } from 'next/server'
import { requireAdminApiAccess } from '@/lib/adminAuth'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const STORAGE_BUCKET = 'documents'
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB

export async function GET() {
  const access = await requireAdminApiAccess()
  if (!access.ok) return access.response

  try {
    const supabaseAdmin = getSupabaseAdminClient()
    const { data, error } = await supabaseAdmin
      .from('premium_documents')
      .select('*')
      .order('uploaded_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ documents: data || [] })
  } catch (error) {
    console.error('[ADMIN_DOCUMENTS] Failed to load documents:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to load documents' },
      { status: 500 }
    )
  }
}

// Multipart upload: file + metadata in one request. The file goes to the
// storage bucket via the service-role client so no storage RLS policy for
// browser writes is needed.
export async function POST(request) {
  const access = await requireAdminApiAccess()
  if (!access.ok) return access.response

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const name = String(formData.get('name') || '').trim()
    const description = String(formData.get('description') || '').trim()
    const category = String(formData.get('category') || '').trim()

    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    if (!name || !category) {
      return NextResponse.json({ error: 'Missing name or category' }, { status: 400 })
    }
    if (typeof file.size === 'number' && file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 50 MB)' }, { status: 413 })
    }

    const supabaseAdmin = getSupabaseAdminClient()

    const safeFileName = String(file.name || 'file').replace(/\s+/g, '-')
    const storagePath = `premium/${Date.now()}_${safeFileName}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined
      })

    if (uploadError) throw uploadError

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath)

    const fileUrl = publicUrlData?.publicUrl || storagePath
    const fileSize = `${(file.size / 1024 / 1024).toFixed(2)} MB`
    const fileType = safeFileName.includes('.')
      ? safeFileName.split('.').pop().toUpperCase()
      : 'FILE'

    const { data, error } = await supabaseAdmin
      .from('premium_documents')
      .insert({
        name,
        description: description || null,
        category,
        file_url: fileUrl,
        file_size: fileSize,
        file_type: fileType,
        is_public: false,
        uploaded_by: access.user?.id || null,
        uploaded_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, document: data })
  } catch (error) {
    console.error('[ADMIN_DOCUMENTS] Failed to upload document:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to upload document' },
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
      return NextResponse.json({ error: 'Missing document id' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdminClient()

    const { data: doc, error: loadError } = await supabaseAdmin
      .from('premium_documents')
      .select('id, file_url')
      .eq('id', id)
      .maybeSingle()

    if (loadError) throw loadError
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const { error: deleteError } = await supabaseAdmin
      .from('premium_documents')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    // Best-effort cleanup of the underlying storage object. A failure here
    // only leaves an orphan file behind, so it never fails the request.
    const marker = `/object/public/${STORAGE_BUCKET}/`
    const markerIndex = String(doc.file_url || '').indexOf(marker)
    if (markerIndex !== -1) {
      const storagePath = decodeURIComponent(doc.file_url.slice(markerIndex + marker.length))
      const { error: storageError } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .remove([storagePath])
      if (storageError) {
        console.warn('[ADMIN_DOCUMENTS] Could not remove storage object:', storageError.message)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[ADMIN_DOCUMENTS] Failed to delete document:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to delete document' },
      { status: 500 }
    )
  }
}
