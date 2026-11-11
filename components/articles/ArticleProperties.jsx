import Link from 'next/link'
import PropertyPreviewCard from '@/components/PropertyPreviewCard'
import { getArticleProperties } from '@/lib/articleProperties'

export default async function ArticleProperties() {
  const properties = await getArticleProperties()
  if (properties.length === 0) return null

  return (
    <section
      className="mx-auto w-full max-w-[1800px] px-5 pb-20 sm:px-8 sm:pb-28 xl:px-[10rem]"
      aria-labelledby="article-properties-title"
      data-testid="article-properties"
    >
      <div className="border-t border-[#c7895b]/25 pt-10 sm:pt-12">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="article-properties-title" className="text-[1.65rem] font-bold leading-tight text-[#1b2642] sm:text-[2rem]">
            Vybrané nemovitosti
          </h2>
          <Link href="/nemovitosti" className="inline-flex min-h-11 items-center font-semibold text-[#8e5636] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c7895b]">
            Zobrazit všechny nemovitosti →
          </Link>
        </header>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="article-properties-grid">
          {properties.map(property => (
            <PropertyPreviewCard key={property.id} property={property} language="cs" currency="EUR" />
          ))}
        </div>
      </div>
    </section>
  )
}
