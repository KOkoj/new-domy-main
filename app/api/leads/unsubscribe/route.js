import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function confirmationPage() {
  return `<!doctype html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Odhlášení potvrzeno</title>
  </head>
  <body style="font-family:Arial,sans-serif;max-width:640px;margin:64px auto;padding:0 24px;color:#0f172a">
    <h1>Odhlášení bylo potvrzeno</h1>
    <p>Na tuto e-mailovou adresu už nebudeme posílat tipy ani zprávy k bezplatným PDF.</p>
    <p><a href="/">Zpět na Domy v Itálii</a></p>
  </body>
</html>`
}

export async function GET(request) {
  try {
    const token = new URL(request.url).searchParams.get('token') || ''
    if (!UUID_PATTERN.test(token)) {
      return new NextResponse('Neplatný odhlašovací odkaz.', { status: 400 })
    }

    const admin = getSupabaseAdminClient()
    const { data: lead, error } = await admin
      .from('leads')
      .select('id,status')
      .eq('confirm_token', token)
      .maybeSingle()

    if (error) throw error
    if (!lead) return new NextResponse('Neplatný odhlašovací odkaz.', { status: 404 })

    if (lead.status !== 'unsubscribed') {
      const { error: updateError } = await admin
        .from('leads')
        .update({
          status: 'unsubscribed',
          unsubscribed_at: new Date().toISOString()
        })
        .eq('id', lead.id)
      if (updateError) throw updateError
    }

    return new NextResponse(confirmationPage(), {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
      }
    })
  } catch (error) {
    console.error('[LEADS] Unsubscribe failed:', error.message)
    return new NextResponse('Odhlášení se nepodařilo dokončit.', { status: 500 })
  }
}
