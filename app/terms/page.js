'use client'

import { useEffect, useState } from 'react'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const TERMS_CONTENT = {
  it: {
    title: 'Termini di vendita - Contenuti digitali',
    subtitle: 'PDF premium acquistati online',
    updatedAt: 'Ultimo aggiornamento: 2 marzo 2026',
    intro:
      'Questi termini regolano la vendita dei PDF premium sul sito Domy v Italii.',
    sellerTitle: 'Venditore',
    sellerBody:
      'Creavita s.r.o., Laskova 1802/3, 148 00 Praha 4 - Chodov, VAT/ID: CZ07136943. Email: info@domyvitalii.cz',
    contractTitle: 'Oggetto del contratto',
    contractBody:
      'Acquisti un contenuto digitale (PDF) ad uso personale informativo. Il contenuto non costituisce consulenza legale, fiscale o notarile personalizzata.',
    priceTitle: 'Prezzo e pagamento',
    priceBody:
      'Il prezzo totale e mostrato prima del pagamento. Il pagamento e gestito da Stripe su canali sicuri.',
    deliveryTitle: 'Consegna digitale',
    deliveryBody:
      'Dopo conferma del pagamento, il download viene reso disponibile immediatamente tramite link sicuro.',
    withdrawalTitle: 'Diritto di recesso (contenuti digitali)',
    withdrawalBody:
      'Con la tua richiesta di fornitura immediata e con l avvio del download, accetti la perdita del diritto di recesso ai sensi della normativa UE applicabile ai contenuti digitali non forniti su supporto materiale.',
    supportTitle: 'Assistenza e reclami',
    supportBody:
      'Per problemi tecnici di accesso al PDF, scrivi a info@domyvitalii.cz indicando email di acquisto e prodotto.',
    lawTitle: 'Legge applicabile',
    lawBody:
      'I presenti termini sono interpretati secondo la normativa UE e la normativa applicabile del venditore, fatti salvi i diritti inderogabili del consumatore nel suo Paese di residenza.'
  },
  en: {
    title: 'Terms of Sale - Digital content',
    subtitle: 'Premium PDFs purchased online',
    updatedAt: 'Last updated: March 2, 2026',
    intro:
      'These terms govern the sale of premium PDF products on the Domy v Italii website.',
    sellerTitle: 'Seller',
    sellerBody:
      'Creavita s.r.o., Laskova 1802/3, 148 00 Praha 4 - Chodov, VAT/ID: CZ07136943. Email: info@domyvitalii.cz',
    contractTitle: 'Contract subject',
    contractBody:
      'You purchase digital content (PDF) for personal informational use. Content is not individualized legal, tax, or notarial advice.',
    priceTitle: 'Price and payment',
    priceBody:
      'The total price is shown before payment. Payments are handled by Stripe over secure channels.',
    deliveryTitle: 'Digital delivery',
    deliveryBody:
      'After payment confirmation, download is made available immediately through a secure link.',
    withdrawalTitle: 'Withdrawal rights (digital content)',
    withdrawalBody:
      'By requesting immediate supply and starting the download, you acknowledge loss of withdrawal rights under EU rules for digital content not supplied on a tangible medium.',
    supportTitle: 'Support and complaints',
    supportBody:
      'For technical issues accessing your PDF, email info@domyvitalii.cz with your purchase email and product name.',
    lawTitle: 'Applicable law',
    lawBody:
      'These terms are interpreted under EU law and the seller applicable law, without prejudice to mandatory consumer rights in your country of residence.'
  },
  cs: {
    title: 'Obchodni podminky - Digitalni obsah',
    subtitle: 'Premium PDF zakoupene online',
    updatedAt: 'Posledni aktualizace: 2. brezna 2026',
    intro:
      'Tyto podminky upravuji prodej premium PDF produktu na webu Domy v Italii.',
    sellerTitle: 'Prodavajici',
    sellerBody:
      'Creavita s.r.o., Laskova 1802/3, 148 00 Praha 4 - Chodov, VAT/ID: CZ07136943. Email: info@domyvitalii.cz',
    contractTitle: 'Predmet smlouvy',
    contractBody:
      'Kupujete digitalni obsah (PDF) pro osobni informacni pouziti. Obsah neni individualni pravni, danove ani notarske poradenstvi.',
    priceTitle: 'Cena a platba',
    priceBody:
      'Celkova cena je zobrazena pred platbou. Platba probiha pres Stripe zabezpecenym zpusobem.',
    deliveryTitle: 'Digitalni dodani',
    deliveryBody:
      'Po potvrzeni platby je stazeni dostupne okamzite pres zabezpeceny odkaz.',
    withdrawalTitle: 'Pravo na odstoupeni (digitalni obsah)',
    withdrawalBody:
      'Pozadavkem na okamzite dodani a zahajenim stahovani berete na vedomi ztratu prava na odstoupeni dle pravidel EU pro digitalni obsah nedodavany na hmotnem nosici.',
    supportTitle: 'Podpora a reklamace',
    supportBody:
      'Pro technicke potize se stazenim PDF piste na info@domyvitalii.cz a uvedte email pouzity pri nakupu a nazev produktu.',
    lawTitle: 'Rozhodne pravo',
    lawBody:
      'Tyto podminky se vykladaji podle prava EU a prava prodavajiciho, bez dotceni povinnych spotrebitelskych prav ve state vaseho bydliste.'
  }
}

export default function TermsPage() {
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') || 'en'
    setLanguage(savedLanguage)
    document.documentElement.lang = savedLanguage

    const handleLanguageChange = (event) => {
      setLanguage(event.detail)
      document.documentElement.lang = event.detail
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  const content = TERMS_CONTENT[language] || TERMS_CONTENT.en

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navigation />

      <main className="pt-28 md:pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
                  {content.title}
                </CardTitle>
                <p className="text-lg text-slate-600">{content.subtitle}</p>
                <p className="text-sm text-slate-500">{content.updatedAt}</p>
              </CardHeader>
              <CardContent className="space-y-5 text-slate-700">
                <p className="leading-relaxed">{content.intro}</p>

                <section className="space-y-1">
                  <h2 className="font-semibold text-slate-900">{content.sellerTitle}</h2>
                  <p>{content.sellerBody}</p>
                </section>

                <section className="space-y-1">
                  <h2 className="font-semibold text-slate-900">{content.contractTitle}</h2>
                  <p>{content.contractBody}</p>
                </section>

                <section className="space-y-1">
                  <h2 className="font-semibold text-slate-900">{content.priceTitle}</h2>
                  <p>{content.priceBody}</p>
                </section>

                <section className="space-y-1">
                  <h2 className="font-semibold text-slate-900">{content.deliveryTitle}</h2>
                  <p>{content.deliveryBody}</p>
                </section>

                <section className="space-y-1">
                  <h2 className="font-semibold text-slate-900">{content.withdrawalTitle}</h2>
                  <p>{content.withdrawalBody}</p>
                </section>

                <section className="space-y-1">
                  <h2 className="font-semibold text-slate-900">{content.supportTitle}</h2>
                  <p>{content.supportBody}</p>
                </section>

                <section className="space-y-1">
                  <h2 className="font-semibold text-slate-900">{content.lawTitle}</h2>
                  <p>{content.lawBody}</p>
                </section>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}
