import { notFound } from 'next/navigation'
import { REGION_BLOG_DATA } from '../regionBlogData'
import { buildArticleMetadata } from '@/lib/seo/contentSeo'

export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(REGION_BLOG_DATA).map((slug) => ({ slug }))
}

function getArticle(slug) {
  if (!Object.hasOwn(REGION_BLOG_DATA, slug)) notFound()
  return REGION_BLOG_DATA[slug]
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const article = getArticle(slug)
  return buildArticleMetadata({
    title: article.title.cs,
    description: article.excerpt.cs,
    path: `/blog/regions/${slug}`,
    image: article.image,
    datePublished: article.publishedAt
  })
}

export default async function RegionBlogLayout({ children, params }) {
  getArticle((await params).slug)
  return children
}
