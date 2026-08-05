import JsonLd from '@/components/seo/JsonLd'
import { getGuideSeo } from '@/lib/seo/contentPages'
import { buildArticleJsonLd, buildArticleMetadata, buildBreadcrumbJsonLd } from '@/lib/seo/contentSeo'

const seo = getGuideSeo('codice-fiscale-acquisto-casa-italia')

const faq = [
  ['Je codice fiscale povinné pro koupi nemovitosti v Itálii?', 'Pro dokončení koupě, notářský zápis a související daňové úkony ho zahraniční kupující v praxi potřebuje. Je vhodné vyřídit jej ještě před podpisem závazných dokumentů.'],
  ['Jak získat codice fiscale z České republiky?', 'Pro účely koupě nemovitosti jsou aktuálními praktickými možnostmi osobní návštěva kteréhokoli územního pracoviště Agenzia delle Entrate v Itálii nebo pověření třetí osoby, která žádost podá v Itálii s podepsaným zmocněním a kopiemi dokladů žadatele.'],
  ['Stačí codice fiscale vypočítané online?', 'Ne. Online kalkulátor může pouze odhadnout znaky kódu. Pro koupi je potřeba kód skutečně přidělený italskou finanční správou a potvrzení o jeho přidělení.'],
  ['Má codice fiscale omezenou platnost?', 'Ne. Přidělený codice fiscale běžně nemá datum expirace a změna bydliště sama o sobě jej nemění.']
]

export const metadata = buildArticleMetadata(seo)

export default function CodiceFiscaleGuideLayout({ children }) {
  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Guides', path: '/guides' }, { name: seo.title, path: seo.path }])} />
      <JsonLd data={buildArticleJsonLd(seo)} />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })) }} />
      {children}
    </>
  )
}
