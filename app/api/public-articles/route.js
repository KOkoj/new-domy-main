import { NextResponse } from 'next/server'
import { getPublicArticles } from '@/lib/publicArticles'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const articles = await getPublicArticles()
    return NextResponse.json({ articles })
  } catch (error) {
    return NextResponse.json({ articles: [], error: 'Failed to load public articles' }, { status: 500 })
  }
}
