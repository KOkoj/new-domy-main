'use client'

// Who is signed in, for zone pages. Always asks the server session
// (/api/auth/session) with a timeout. The browser Supabase client is not used
// here: its auth lock can hang forever, which kept pages (e.g. Nastavení účtu)
// on the loading skeleton. The `supabase` argument is kept for compatibility.
const SESSION_TIMEOUT_MS = 8000

export async function getDashboardUser(_supabase) {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
  const timer = controller ? setTimeout(() => controller.abort(), SESSION_TIMEOUT_MS) : null

  try {
    const response = await fetch('/api/auth/session', {
      cache: 'no-store',
      credentials: 'same-origin',
      signal: controller?.signal
    })
    if (!response.ok) return null

    const payload = await response.json()
    if (!payload?.authenticated || !payload?.user) return null

    return {
      id: payload.user.id,
      email: payload.user.email,
      user_metadata: payload.user.user_metadata || {},
      app_metadata: payload.user.app_metadata || {}
    }
  } catch (error) {
    console.error('Server session lookup failed:', error)
    return null
  } finally {
    if (timer) clearTimeout(timer)
  }
}
