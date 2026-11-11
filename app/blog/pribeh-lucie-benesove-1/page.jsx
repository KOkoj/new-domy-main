import Image from 'next/image'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import PageIntro from '@/components/PageIntro'
import JsonLd from '@/components/seo/JsonLd'
import { buildArticleJsonLd, buildArticleMetadata, buildBreadcrumbJsonLd } from '@/lib/seo/contentSeo'
import story from '@/data/lucie-benesova-story.json'

const seo = {
  title: story.title,
  description: story.description,
  path: story.path,
  image: story.shareImage,
  articleSection: 'Příběhy klientů',
}

export const metadata = {
  ...buildArticleMetadata(seo),
  robots: { index: true, follow: true },
  authors: [{ name: 'Lucie a Luca' }],
  openGraph: { ...buildArticleMetadata(seo).openGraph, locale: 'cs_CZ' },
}

export default function LucieBenesovaStoryPage() {
  return (
    <div className="site-page min-h-screen bg-[#f7f4ed]" lang="cs">
      <Navigation />
      <JsonLd data={{ ...buildArticleJsonLd(seo), isAccessibleForFree: true, author: { '@type': 'Organization', name: 'Lucie a Luca – Domy v Itálii' } }} />
      <JsonLd data={buildBreadcrumbJsonLd([
        { name: 'Domů', path: '/' },
        { name: 'Články', path: '/blog' },
        { name: story.title, path: story.path },
      ])} />
      <main>
        <PageIntro className="article-intro" eyebrow="Příběhy klientů · 1. díl" title={story.title}>
          <p>{story.subtitle}</p>
        </PageIntro>
        <article className="mx-auto max-w-[1800px] px-5 pb-20 pt-8 sm:px-8 sm:pb-28 xl:px-[10rem]" aria-label={story.title}>
          <figure className="mx-auto mb-12 max-w-[896px]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] sm:aspect-[16/10]">
              <Image
                src={story.image}
                alt="Lucie Benešová s Lucií a Lucou v kanceláři Domy v Itálii"
                fill
                priority
                sizes="(max-width: 640px) calc(100vw - 40px), (max-width: 1024px) calc(100vw - 64px), 896px"
                className="object-cover object-[center_58%]"
              />
            </div>
          </figure>
          <div className="article-body space-y-5" data-testid="benesova-story-body">
            {story.blocks.map((block) => block.style === 'Heading1' ? (
              <h2 key={block.id} className="!mt-12 mb-5 text-pretty text-[1.65rem] font-bold leading-tight text-[#1b2642] sm:text-[2rem]">{block.text}</h2>
            ) : (
              <p key={block.id} className="text-pretty text-lg leading-[1.85] text-slate-700">{block.text}</p>
            ))}
            <nav aria-label="Další čtení" className="!mt-12 flex flex-wrap gap-5 border-t border-copper-200 pt-8">
              <Link href="/blog" className="font-semibold text-copper-700 underline underline-offset-4">← Zpět na články</Link>
              <Link href="/reference" className="font-semibold text-copper-700 underline underline-offset-4">Reference klientů →</Link>
            </nav>
          </div>
        </article>
      </main>
      <Footer language="cs" />
    </div>
  )
}
