'use client'

import { useState, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import PageIntro from '@/components/PageIntro'

const TESTIMONIALS = [
  {
    name: 'Adéla Babišová',
    tag: 'Umbria',
    quote: {
      cs: 'Koupě domů v zahraničí má svoje specifika a rozhodně bych to nepodcenila. Sama jsem se přesvědčila, že tam je tolik detailů, které je lepší vždy ověřit a prověřit. Sama bych se do tohoto procesu nepouštěla — moje nejlepší rozhodnutí bylo spojit síly s Domy v Itálii a nechat si krýt záda od parťáka, který tomu rozumí, má zkušenosti a odhalil chyby v kupní smlouvě, které chystala italská realitka. Vykomunikovala veškeré termíny s notářem a veškerou dokumentaci zkontrolovali do posledního písmenka. Servis vážně na jedničku s hvězdičkou.',
      it: 'L’acquisto di una casa all’estero ha le sue particolarità e non lo sottovaluterei assolutamente. Mi sono resa conto personalmente di quanti dettagli sia sempre meglio verificare e controllare. Non affronterei questo processo da sola: la mia decisione migliore è stata unire le forze con Domy v Itálii e affidarmi a un partner competente ed esperto, che ha scoperto degli errori nel contratto di compravendita preparato dall’agenzia immobiliare italiana. Ha coordinato tutte le scadenze con il notaio e ogni documento è stato controllato fino all’ultima lettera. Un servizio davvero da dieci e lode.',
      en: 'Buying a home abroad has its own particularities, and I definitely would not underestimate them. I discovered for myself how many details are better checked and verified. I would not undertake this process alone—my best decision was joining forces with Domy v Itálii and relying on an experienced partner who understood the process and uncovered errors in the purchase contract prepared by the Italian estate agency. They coordinated every deadline with the notary and checked all documentation down to the last letter. Truly first-class service.',
    },
  },
  {
    name: 'Lenka Kluková',
    tag: 'Slovensko',
    quote: {
      cs: 'Původně jsme si chtěli zabezpečit dom po vlastní ose, ale velmi rychle jsme zjistili, že italské agentury nezdvihají zahraniční čísla a většina agentů parla solo italiano. Domy v Itálii byla ta správná volba — vstřícný a rychlý přístup, ochota poradit, promptná komunikace s realitními agenturami a prověření zásadních informací o nemovitostech, které většinou nejsou uvedeny v inzerátech. Za nás absolutní spokojenost.',
      it: 'Inizialmente volevamo trovare una casa per conto nostro, ma ci siamo resi conto molto presto che le agenzie italiane non rispondono ai numeri stranieri e che la maggior parte degli agenti parla solo italiano. Domy v Itálii è stata la scelta giusta: un approccio disponibile e rapido, la volontà di consigliare, una comunicazione tempestiva con le agenzie immobiliari e la verifica di informazioni essenziali sugli immobili che spesso non compaiono negli annunci. Da parte nostra, soddisfazione assoluta.',
      en: 'At first we wanted to find a house on our own, but we quickly discovered that Italian agencies do not answer foreign numbers and that most agents speak only Italian. Domy v Itálii was the right choice: a helpful and fast approach, a willingness to advise us, prompt communication with estate agencies, and verification of essential property information that is usually missing from listings. We are completely satisfied.',
    },
  },
  {
    name: 'Marcela Dejlová',
    tag: 'Itálie',
    quote: {
      cs: 'Děkuji za perfektní servis, pomoc při koupi domu včetně všech nezbytných úředních procedur, osobní asistenci a neuvěřitelně vstřícné, milé a přátelské jednání. Zdravím z Itálie.',
      it: 'Grazie per il servizio perfetto, per l’aiuto nell’acquisto della casa, comprese tutte le necessarie procedure amministrative, per l’assistenza personale e per l’atteggiamento incredibilmente disponibile, gentile e amichevole. Un saluto dall’Italia.',
      en: 'Thank you for the perfect service, the help with buying my house—including all the necessary administrative procedures—the personal assistance, and the incredibly helpful, kind, and friendly approach. Greetings from Italy.',
    },
  },
  {
    name: 'Jaroslav Sloupský',
    tag: 'Itálie',
    quote: {
      cs: 'Absolvoval jsem koupi s těmito úžasnými lidmi a mohu jenom doporučit. Koupě domu není jenom podpis ani náhodou, starosti v podstatě napořád a pokud nevládnete jazykem dostanete se do těžkých situací co chvíli. My jsme se nakonec stali přáteli dofám napořád. Děkuji moc touto cestou Lucii a Lucovi 😘😘😘',
      it: 'Ho affrontato l’acquisto insieme a queste persone meravigliose e non posso che raccomandarle. Comprare una casa non significa affatto soltanto firmare: le preoccupazioni sono praticamente continue e, se non si padroneggia la lingua, ci si ritrova spesso in situazioni difficili. Alla fine siamo diventati amici, spero per sempre. Con queste parole ringrazio di cuore Lucie e Luca 😘😘😘',
      en: 'I went through the purchase with these wonderful people and can only recommend them. Buying a house is by no means just about signing papers—the concerns are practically ongoing, and if you do not speak the language, you can find yourself in difficult situations at every turn. In the end we became friends, hopefully forever. I would like to thank Lucie and Luca very much this way 😘😘😘',
    },
  },
]

const pageLabels = {
  badge: {
    cs: 'Reference',
    it: 'Referenze',
    en: 'References',
  },
  title: {
    cs: 'Reference',
    it: 'Referenze',
    en: 'References',
  },
  subtitle: {
    cs: 'Co říkají klienti, kteří koupili nemovitost v Itálii s naší pomocí.',
    it: 'Cosa dicono i clienti che hanno acquistato un immobile in Italia con il nostro aiuto.',
    en: 'What clients say after buying property in Italy with our help.',
  },
  ctaHeading: {
    cs: 'Chcete být dalším spokojeným klientem?',
    it: 'Vuoi essere il prossimo cliente soddisfatto?',
    en: 'Want to be the next happy client?',
  },
  ctaSubtext: {
    cs: 'Rezervujte si bezplatnou konzultaci a zjistěte, jak vám můžeme pomoci.',
    it: 'Prenota una consulenza gratuita e scopri come possiamo aiutarti.',
    en: 'Book a free consultation and find out how we can help you.',
  },
  ctaButton: {
    cs: 'Rezervovat konzultaci zdarma',
    it: 'Prenota consulenza gratuita',
    en: 'Book a Free Consultation',
  },
}

export default function ReferencePage() {
  const [language, setLanguage] = useState('cs')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
    }

    const handleLanguageChange = (event) => {
      setLanguage(event.detail)
      document.documentElement.lang = event.detail
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  const t = (key) => pageLabels[key]?.[language] ?? pageLabels[key]?.cs ?? ''

  return (
    <div className="site-page min-h-screen bg-[#f7f4ed]">
      <Navigation />

      <PageIntro eyebrow={t('badge')} title={t('title')}>
        <p>{t('subtitle')}</p>
      </PageIntro>

      {/* Testimonial list */}
      <div className="container mx-auto px-6 py-16 md:py-24">
        <div className="space-y-6">
          {TESTIMONIALS.map((item, i) => (
            <article
              key={i}
              className="rounded-[1.75rem] bg-white p-8 shadow-[0_18px_50px_rgba(14,21,46,0.07)] md:p-10"
            >
              <blockquote className="text-lg md:text-xl text-slate-600 leading-[1.85] italic mb-6">
                &ldquo;{item.quote[language] ?? item.quote.cs}&rdquo;
              </blockquote>
              <footer className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-copper-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-copper-700">{item.name.charAt(0)}</span>
                </div>
                <span className="font-bold text-slate-800">{item.name}</span>
              </footer>
            </article>
          ))}
        </div>

        {/* CTA block */}
        <div className="mt-20">
          <div className="rounded-[1.75rem] bg-gradient-to-br from-[#243056] to-[#0e152e] p-10 text-center md:p-16">
              <h2 className="mb-4 text-pretty text-[2.05rem] font-bold leading-[1.15] text-white">
                {t('ctaHeading')}
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-lg leading-snug text-white/80">
                {t('ctaSubtext')}
              </p>
              <Link
                href="/book-call"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#c7895b] to-[#996945] px-5 py-2.5 text-base font-semibold text-white transition duration-200 hover:from-[#e8bc8a] hover:to-[#c48759]"
              >
                {t('ctaButton')}
                <ArrowRight className="h-4 w-4" />
              </Link>
          </div>
        </div>
      </div>

      <Footer language={language} />
    </div>
  )
}
