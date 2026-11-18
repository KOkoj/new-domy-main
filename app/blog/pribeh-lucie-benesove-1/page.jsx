import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import PageIntro from '@/components/PageIntro'
import JsonLd from '@/components/seo/JsonLd'
import { buildArticleJsonLd, buildArticleMetadata, buildBreadcrumbJsonLd } from '@/lib/seo/contentSeo'
import story from '@/data/lucie-benesova-story.json'
import ArticleProperties from '@/components/articles/ArticleProperties'
import ConciergeContact from '@/components/ConciergeContact'
import { CONTACT_PHONE_E164, buildWhatsappUrl } from '@/lib/contactDetails'

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
          <figure className="article-body mb-12">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] sm:aspect-[16/10]">
              <Image
                src={story.image}
                alt="Lucie Benešová s Lucií a Lucou v kanceláři Domy v Itálii"
                fill
                priority
                sizes="(max-width: 640px) calc(100vw - 40px), (max-width: 784px) calc(100vw - 64px), 720px"
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
            <section aria-label="Chcete taky pomoct s koupí?" data-testid="benesova-story-cta" className="!mt-14 rounded-[1.75rem] bg-[#1b2642] px-6 py-8 text-white sm:px-10 sm:py-10">
              <h2 className="text-pretty text-[1.65rem] font-bold leading-tight sm:text-[2rem]">Chcete taky pomoct s koupí?</h2>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a href={buildWhatsappUrl('Dobrý den, mám dotaz ke koupi nemovitosti v Itálii.')} rel="noopener noreferrer" data-testid="benesova-cta-whatsapp" className="inline-flex items-center justify-center rounded-full bg-[#25D366] px-6 py-3 font-semibold text-[#0b2a17] transition hover:brightness-95">WhatsApp</a>
                <a href={`tel:${CONTACT_PHONE_E164}`} data-testid="benesova-cta-phone" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 font-semibold text-[#1b2642] transition hover:bg-slate-100">Zavolat</a>
                <Link href="/book-call" data-testid="benesova-cta-consultation" className="inline-flex items-center justify-center rounded-full border border-white/60 px-6 py-3 font-semibold text-white transition hover:bg-white/10">Konzultace zdarma</Link>
              </div>
            </section>
            <nav aria-label="Další čtení" className="!mt-12 flex flex-wrap gap-5 border-t border-copper-200 pt-8">
              <Link href="/blog" className="font-semibold text-copper-700 underline underline-offset-4">← Zpět na články</Link>
              <Link href="/reference" className="font-semibold text-copper-700 underline underline-offset-4">Reference klientů →</Link>
            </nav>
          </div>
        </article>
        <Suspense fallback={null}>
          <ArticleProperties />
        </Suspense>
      </main>
      <Footer language="cs" />
      <ConciergeContact language="cs" />
    </div>
  )
}
