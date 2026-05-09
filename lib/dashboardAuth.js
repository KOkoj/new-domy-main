'use client'

export async function getDashboardUser(supabase) {
  if (supabase?.auth) {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (user) return user
    } catch (error) {
      console.warn('Client auth lookup failed, using server session fallback:', error)
    }
  }

  try {
    const response = await fetch('/api/auth/session', { cache: 'no-store' })
    if (!response.ok) return null

    const payload = await response.json()
    if (!payload?.authenticated || !payload?.user) return null

    return {
      id: payload.user.id,
      email: payload.user.email,
      user_metadata: payload.user.user_metadata || {}
    }
  } catch (error) {
    console.error('Server session fallback failed:', error)
    return null
  }
}

