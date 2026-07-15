import { NextResponse } from 'next/server'
import { requireAdminApiAccess } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Reports which server-side email services are configured, so admin tooling
// (EmailTester) can show real status instead of reading client env vars that
// never existed.
export async function GET() {
  const access = await requireAdminApiAccess()
  if (!access.ok) return access.response

  return NextResponse.json({
    resendConfigured: Boolean(process.env.RESEND_API_KEY),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    cronSecretConfigured: Boolean(process.env.CRON_SECRET)
  })
}
