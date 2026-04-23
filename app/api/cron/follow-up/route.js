import { NextResponse } from 'next/server'
import emailService from '@/lib/emailService'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const MS_PER_DAY = 24 * 60 * 60 * 1000

function parseFollowUpDays() {
  const raw = process.env.FOLLOW_UP_DAYS || '3'
  const values = raw
    .split(',')
    .map((v) => Number.parseInt(v.trim(), 10))
    .filter((v) => Number.isFinite(v) && v > 0)

  const unique = [...new Set(values)].sort((a, b) => a - b)
  return unique.length > 0 ? unique : [3]
}

function getDaysSinceRegistration(createdAt, now) {
  if (!createdAt) return null
  const createdMs = new Date(createdAt).getTime()
  if (!Number.isFinite(createdMs)) return null
  const diff = now.getTime() - createdMs
  if (diff < 0) return 0
  return Math.floor(diff / MS_PER_DAY)
}

function resolveDisplayName(user) {
  const fromMetaName =
    typeof user?.user_metadata?.name === 'string'
      ? user.user_metadata.name.trim()
      : ''
  if (fromMetaName) return fromMetaName

  const fromMetaFullName =
    typeof user?.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name.trim()
      : ''
  if (fromMetaFullName) return fromMetaFullName

  return 'there'
}

async function listAllAuthUsers(supabaseAdmin) {
  const users = []
  const perPage = 200
  let page = 1

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage
    })

    if (error) {
      throw new Error(`Auth users fetch failed on page ${page}: ${error.message}`)
    }

    const batch = data?.users || []
    users.push(...batch)

    if (batch.length < perPage) break
    page += 1
  }

  return users
}

async function getNotificationPrefs(supabaseAdmin, userId) {
  const { data, error } = await supabaseAdmin
    .from('notification_preferences')
    .select('email_enabled, onboarding_emails')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw new Error(`Notification preferences fetch failed: ${error.message}`)
  }

  return data
}

async function hasEmailBeenSent(supabaseAdmin, userId, emailType) {
  const { data, error } = await supabaseAdmin
    .from('email_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('email_type', emailType)
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(`Email log lookup failed: ${error.message}`)
  }

  return Boolean(data?.id)
}

async function logEmailResult({
  supabaseAdmin,
  userId,
  userEmail,
  emailType,
  subject,
  status,
  errorMessage,
  metadata
}) {
  const { error } = await supabaseAdmin.from('email_logs').insert({
    user_id: userId,
    email_type: emailType,
    recipient_email: userEmail,
    subject,
    status,
    error_message: errorMessage || null,
    metadata: metadata || null
  })

  if (error) {
    throw new Error(`Email log insert failed: ${error.message}`)
  }
}

async function runFollowUpJob() {
  const supabaseAdmin = getSupabaseAdminClient()
  const now = new Date()
  const milestones = parseFollowUpDays()
  const minMilestone = milestones[0]

  const users = await listAllAuthUsers(supabaseAdmin)

  let processed = 0
  let eligible = 0
  let sent = 0
  let skippedByPrefs = 0
  let skippedNoMilestone = 0
  let alreadySent = 0
  const errors = []

  for (const user of users) {
    processed += 1

    try {
      if (!user?.id || !user?.email) {
        skippedNoMilestone += 1
        continue
      }

      const daysSince = getDaysSinceRegistration(user.created_at, now)
      if (daysSince === null || daysSince < minMilestone) {
        skippedNoMilestone += 1
        continue
      }

      const prefs = await getNotificationPrefs(supabaseAdmin, user.id)
      const emailEnabled = prefs?.email_enabled !== false
      const onboardingEnabled = prefs?.onboarding_emails !== false

      if (!emailEnabled || !onboardingEnabled) {
        skippedByPrefs += 1
        continue
      }

      // Pick at most one unsent due milestone for this run.
      const dueMilestones = milestones.filter((d) => daysSince >= d).sort((a, b) => b - a)
      let milestoneToSend = null

      for (const milestone of dueMilestones) {
        const emailType = `follow_up_day_${milestone}`
        const exists = await hasEmailBeenSent(supabaseAdmin, user.id, emailType)
        if (!exists) {
          milestoneToSend = milestone
          break
        }
      }

      if (!milestoneToSend) {
        alreadySent += 1
        continue
      }

      eligible += 1

      const result = await emailService.sendFollowUpEmail({
        userEmail: user.email,
        userName: resolveDisplayName(user),
        daysSinceRegistration: milestoneToSend
      })

      const emailType = `follow_up_day_${milestoneToSend}`
      const subject = `Follow-up day ${milestoneToSend}`

      if (result?.success) {
        sent += 1
        await logEmailResult({
          supabaseAdmin,
          userId: user.id,
          userEmail: user.email,
          emailType,
          subject,
          status: 'sent',
          metadata: {
            trigger: 'cron-follow-up',
            milestoneDay: milestoneToSend,
            actualDaysSinceRegistration: daysSince,
            provider: result?.provider || null
          }
        })
      } else {
        await logEmailResult({
          supabaseAdmin,
          userId: user.id,
          userEmail: user.email,
          emailType,
          subject,
          status: 'failed',
          errorMessage: result?.error || result?.message || 'Unknown follow-up email error',
          metadata: {
            trigger: 'cron-follow-up',
            milestoneDay: milestoneToSend,
            actualDaysSinceRegistration: daysSince,
            provider: result?.provider || null
          }
        })
      }
    } catch (error) {
      errors.push({
        userId: user?.id || null,
        email: user?.email || null,
        error: error?.message || 'Unexpected follow-up error'
      })
    }
  }

  return {
    success: true,
    milestones,
    processed,
    eligible,
    sent,
    skippedByPrefs,
    skippedNoMilestone,
    alreadySent,
    errors: errors.length > 0 ? errors : undefined,
    timestamp: new Date().toISOString()
  }
}

function isAuthorized(request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return false
  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${cronSecret}`
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runFollowUpJob()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        error: error?.message || 'Follow-up cron failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  return GET(request)
}
