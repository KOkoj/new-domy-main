import { NextResponse } from 'next/server'
import { getPublicArticleBySlug } from '@/lib/publicArticles'
import { createRouteSupabaseClient, getAuthenticatedUser } from '@/lib/serverAuth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request, { params }) {
  try {
    const { supabase, applyCookies } = await createRouteSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Auth is not configured on server' }, { status: 503 })
    }

    const user = await getAuthenticatedUser(supabase)
    if (!user) {
      return applyCookies(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
    }

    const { slug } = await params
    const article = await getPublicArticleBySlug(slug)

    if (!article) {
      return applyCookies(NextResponse.json({ error: 'Article not found' }, { status: 404 }))
    }

    return applyCookies(NextResponse.json({ article }))
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load article' }, { status: 500 })
  }
}
