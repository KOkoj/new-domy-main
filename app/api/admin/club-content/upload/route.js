import { NextResponse } from 'next/server'
import { requireAdminApiAccess } from '@/lib/adminAuth'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const STORAGE_BUCKET = 'documents'
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB

// Uploads a club-content asset (thumbnail image or guide PDF) to storage via
// the service-role client and returns its public URL.
export async function POST(request) {
  const access = await requireAdminApiAccess()
  if (!access.ok) return access.response

  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    if (typeof file.size === 'number' && file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 50 MB)' }, { status: 413 })
    }

    const fileName = String(file.name || 'file')
    const fileExt = fileName.includes('.') ? fileName.split('.').pop() : 'bin'
    const storagePath = `premium-content/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const supabaseAdmin = getSupabaseAdminClient()
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

    return NextResponse.json({
      success: true,
      url: publicUrlData?.publicUrl || storagePath
    })
  } catch (error) {
    console.error('[ADMIN_CLUB_CONTENT] Failed to upload file:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to upload file' },
      { status: 500 }
    )
  }
}
