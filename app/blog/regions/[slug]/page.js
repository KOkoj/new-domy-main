import { Suspense } from 'react'
import RegionBlogClient from './RegionBlogClient'
import ArticleProperties from '@/components/articles/ArticleProperties'
import { REGION_BLOG_DATA } from '../regionBlogData'

export default async function RegionBlogPage({ params }) {
  const { slug } = await params
  return (
    <RegionBlogClient relatedProperties={Object.hasOwn(REGION_BLOG_DATA, slug) ? <Suspense fallback={null}><ArticleProperties /></Suspense> : null} />
  )
}
