import { NextResponse } from 'next/server'
import { getPublicArticleBySlug } from '@/lib/publicArticles'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request, { params }) {
  try {
    const { slug } = await params
    const article = await getPublicArticleBySlug(slug)

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    return NextResponse.json({ article })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load article' }, { status: 500 })
  }
}
