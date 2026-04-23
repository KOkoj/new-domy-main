'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { supabase } from '../../lib/supabase'
import AuthModal from '../../components/AuthModal'
import { getPurchaseLegalCopy } from '@/lib/purchaseLegal'
import FormPrivacyNotice from '@/components/legal/FormPrivacyNotice'
import InformationalDisclaimer from '@/components/legal/InformationalDisclaimer'
import { PREMIUM_PDFS_ENABLED } from '@/lib/featureFlags'
import PremiumPdfComingSoonTrigger from '@/components/PremiumPdfComingSoonTrigger'

const PRICE_BY_PRODUCT = {
  'premium-domy': { original: 250, discounted: 85 },
  'premium-notary': { original: 250, discounted: 70 }
}

const PRODUCT_LABELS = {
  'premium-domy': {
    cs: 'Premium PDF',
    it: 'PDF Premium',
    en: 'Premium PDF'
  },
  'premium-notary': {
    cs: 'Premium PDF',
    it: 'PDF Premium',
    en: 'Premium PDF'
  }
}

const TEXT = {
  cs: {
    title: 'Operativní PDF pro ty, kdo chtějí mít jasno před rozhodnutím o koupi (metodicky a s kontrolou)',
    intro:
      'Tyto dokumenty nejsou obecné články, ale důležité materiály připravené systematicky a v některých částech vycházejí z reálných situací při nákupu v Itálii.',
    body:
      'PDF vysvětluje, co je klíčové před podpisem, kde nejčastěji vznikají ztráty a jak věcně řídit náklady, rizika i čas.',
    bullets: [
      'Prioritní kontroly před jakýmkoli závazným podpisem',
      'Možné chyby a konkrétní prevence',
      'Jasná struktura odpovědnosti, dokumentů a operační posloupnosti'
    ],
    trust:
      'Obsah je zpracován s důrazem na kvalitu a praktickou užitečnost.',
    value: 'Standardní hodnota',
    today: 'Dnes',
    cta: 'Odemknout PDF',
    paymentNoticeTitle: 'Upozornění',
    paymentNoticeBody:
      'Platba probíhá přes zabezpečenou platební bránu a je v souladu s platnou legislativou.',
    paymentNoticeCta: 'Zobrazit GDPR',
    legalSectionTitle: 'Povinne pravni potvrzeni pred zaplacenim',
    billingSectionTitle: 'Fakturacni a danove udaje',
    invoiceRequestedLabel: 'Pozaduji danovy doklad nebo fakturu, pokud je to pro mou situaci relevantni.',
    companyNameLabel: 'Nazev spolecnosti nebo jmeno pro fakturaci',
    taxReferenceLabel: 'DIC, VAT nebo danovy identifikator',
    billingNoteLabel: 'Poznamka k fakturaci nebo podpore',
    billingHelper:
      'Stripe Checkout bude vyzadovat fakturacni adresu, danove udaje a kontaktni informace. Pokud potrebujete danovy doklad, vyplnte i tato pole.',
    pdfDisclaimer:
      'Tento PDF slouzi pouze pro obecne informacni a operativni ucely. Nejde o individualni pravni, danove, notarske ani technicke poradenstvi. Pro konkretni situaci je nutne posouzeni kvalifikovanym odbornikem.',
    termsLink: 'Obchodni podminky',
    privacyLink: 'GDPR',
    legalError: 'Pro pokracovani je nutne potvrdit vsechny pravni souhlasy.',
    digitalRightsInfo:
      'Digitalni obsah bude dodan ihned po potvrzeni platby a tim zanika pravo na odstoupeni po zahajeni stahovani.',
    loading: 'Načítám...',
    back: 'Zpět'
  },
  it: {
    title: "PDF operativo per chi vuole avere le idee chiare prima di decidere l'acquisto (con metodo e controllo)",
    intro:
      'Questi documenti non sono articoli generici, ma approfondimenti importanti costruiti con criterio e, in alcuni casi, basati su situazioni reali di acquisto in Italia.',
    body:
      'Questo PDF spiega cosa conta prima di firmare, dove nascono le perdite più frequenti e come gestire in modo lucido costi, rischi e tempi.',
    bullets: [
      'Controlli prioritari prima di qualsiasi firma vincolante',
      'Possibili errori e prevenzione concreta',
      'Struttura chiara di responsabilità, documenti e sequenza operativa'
    ],
    trust:
      "Il contenuto è realizzato con attenzione alla qualità e all'utilità pratica.",
    value: 'Valore standard',
    today: 'Oggi',
    cta: 'Sblocca il PDF',
    paymentNoticeTitle: 'Nota',
    paymentNoticeBody:
      'Il metodo di pagamento è totalmente sicuro, conforme alla normativa vigente e gestito tramite provider certificato.',
    paymentNoticeCta: 'Leggi GDPR',
    legalSectionTitle: "Conferme legali obbligatorie prima del pagamento",
    billingSectionTitle: 'Dati fiscali e documento acquisto',
    invoiceRequestedLabel: 'Richiedo documento fiscale o fattura, se applicabile alla mia situazione.',
    companyNameLabel: 'Ragione sociale o nome intestatario',
    taxReferenceLabel: 'Partita IVA, VAT o riferimento fiscale',
    billingNoteLabel: 'Nota per fatturazione o supporto',
    billingHelper:
      'Nel checkout Stripe verranno raccolti indirizzo di fatturazione, dati fiscali e recapiti. Se ti serve documentazione fiscale, compila anche questi campi.',
    pdfDisclaimer:
      'Questo PDF ha finalità informative e operative generali. Non costituisce consulenza legale, fiscale, notarile o tecnica personalizzata. Per casi specifici è sempre necessaria una verifica con professionisti qualificati.',
    termsLink: 'Termini di vendita',
    privacyLink: 'GDPR',
    legalError: 'Per continuare devi accettare tutte le conferme legali.',
    digitalRightsInfo:
      'Il contenuto digitale viene fornito subito dopo la conferma del pagamento e, da quel momento, il diritto di recesso non è più esercitabile.',
    loading: 'Caricamento...',
    back: 'Indietro'
  },
  en: {
    title: 'Operational PDF for buyers who want full clarity before deciding to purchase (with method and control)',
    intro:
      'These documents are not generic articles. They are focused materials developed with structure and, in specific parts, based on real purchase situations in Italy.',
    body:
      'This PDF explains what matters before signing, where losses most often begin, and how to manage costs, risks and timing with clear control.',
    bullets: [
      'Priority checks before any binding step',
      'Possible errors and concrete prevention',
      'Clear structure of responsibilities, documents and operational sequence'
    ],
    trust:
      'The content is prepared with strong attention to quality and practical usefulness.',
    value: 'Standard value',
    today: 'Today',
    cta: 'Unlock PDF',
    paymentNoticeTitle: 'Notice',
    paymentNoticeBody:
      'The payment method is fully secure, compliant with applicable law, and handled by a certified provider.',
    paymentNoticeCta: 'Read GDPR',
    legalSectionTitle: 'Required legal confirmations before payment',
    billingSectionTitle: 'Billing and tax document details',
    invoiceRequestedLabel: 'I request a tax document or invoice if applicable to my situation.',
    companyNameLabel: 'Company or billing name',
    taxReferenceLabel: 'VAT, tax ID or fiscal reference',
    billingNoteLabel: 'Billing or support note',
    billingHelper:
      'Stripe Checkout will collect billing address, tax details and contact data. If you need tax documentation, fill these fields as well.',
    pdfDisclaimer:
      'This PDF is provided for general informational and operational purposes. It does not constitute individualized legal, tax, notarial, or technical advice. Specific cases always require review by qualified professionals.',
    termsLink: 'Terms of Sale',
    privacyLink: 'GDPR',
    legalError: 'To continue, you must accept all required legal confirmations.',
    digitalRightsInfo:
      'Digital content is delivered immediately after payment confirmation and withdrawal rights are lost once download starts.',
    loading: 'Loading...',
    back: 'Back'
  }
}

export default function PremiumLandingPage() {
  const searchParams = useSearchParams()
  const requestedProduct = searchParams.get('product')
  const productKey =
    requestedProduct === 'premium-notary' ? 'premium-notary' : 'premium-domy'

  const [language, setLanguage] = useState('it')
  const [user, setUser] = useState(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false)
  const [legalChecks, setLegalChecks] = useState({
    terms: false,
    privacy: false,
    digitalWaiver: false
  })
  const [billingInfo, setBillingInfo] = useState({
    invoiceRequested: false,
    companyName: '',
    taxReference: '',
    billingNote: ''
  })
  const [legalError, setLegalError] = useState('')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage && (savedLanguage === 'cs' || savedLanguage === 'it' || savedLanguage === 'en')) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
    }
  }, [])

  useEffect(() => {
    if (!supabase) return

    const checkUser = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      setUser(user)
    }

    checkUser()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const t = TEXT[language]
  const legalCopy = useMemo(() => getPurchaseLegalCopy(language), [language])
  const productLabel = useMemo(() => {
    return PRODUCT_LABELS[productKey][language]
  }, [productKey, language])
  const currentPrice = PRICE_BY_PRODUCT[productKey] || PRICE_BY_PRODUCT['premium-domy']
  const canProceedWithLegal =
    legalChecks.terms && legalChecks.privacy && legalChecks.digitalWaiver

  if (!PREMIUM_PDFS_ENABLED) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f7f4ed] via-amber-50/20 to-slate-50">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto">
            <Card className="bg-white/95 border-gray-200 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl md:text-3xl font-bold text-slate-900">
                  {language === 'cs' ? 'Premium PDF budou dostupné brzy' : language === 'it' ? 'Disponibile prossimamente' : 'Available soon'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-700 leading-relaxed">
                  {language === 'cs'
                    ? 'Tuto cast zatim nezverejnujeme. Pri spusteni webu zustane sekce premium vypnuta a bude oznacena jako pripravovana.'
                    : language === 'it'
                      ? 'Questa sezione non viene pubblicata per ora. Al lancio del sito i PDF premium restano disattivati e segnalati come prossimamente disponibili.'
                      : 'This section is not being published yet. At launch, premium PDFs stay disabled and are marked as coming soon.'}
                </p>
                <p className="text-slate-600">
                  {language === 'cs'
                    ? 'Muzete dal pouzit bezplatne materialy a kontaktni formular.'
                    : language === 'it'
                      ? 'Puoi continuare a usare i materiali gratuiti e il form contatti.'
                      : 'You can continue using the free materials and the contact form.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link href="/guides">
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                      {language === 'cs' ? 'Prejit na pruvodce' : language === 'it' ? 'Vai alle guide' : 'Go to guides'}
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline">
                      {language === 'cs' ? 'Kontakt' : language === 'it' ? 'Contatti' : 'Contact'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)
    document.documentElement.lang = newLanguage
    localStorage.setItem('preferred-language', newLanguage)
  }

  const handleCheckout = async () => {
    setLegalError('')

    if (!user) {
      setIsAuthModalOpen(true)
      return
    }

    if (!canProceedWithLegal) {
      setLegalError(t.legalError)
      return
    }

    try {
      setIsLoadingCheckout(true)

      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productKey,
          cancelPath: `/premium?product=${encodeURIComponent(productKey)}`,
          language,
          legalConsent: {
            termsAccepted: legalChecks.terms,
            privacyAccepted: legalChecks.privacy,
            digitalWaiverAccepted: legalChecks.digitalWaiver,
            sourcePath: `/premium?product=${encodeURIComponent(productKey)}`
          },
          billingInfo
        })
      })

      const payload = await response.json().catch(() => ({}))
      if (response.status === 401) {
        setIsAuthModalOpen(true)
        return
      }

      if (!response.ok || !payload?.url) {
        throw new Error(payload?.error || 'Unable to start checkout')
      }

      window.location.assign(payload.url)
    } catch (error) {
      alert(error?.message || 'Checkout error')
    } finally {
      setIsLoadingCheckout(false)
    }
  }

  const updateLegalCheck = (key, checked) => {
    setLegalError('')
    setLegalChecks((prev) => ({ ...prev, [key]: checked === true }))
  }

  const updateBillingInfo = (key, value) => {
    setBillingInfo((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f4ed] via-amber-50/20 to-slate-50">
      <nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md shadow-lg border-b border-white/20"
        style={{ backgroundColor: 'rgba(14, 21, 46, 0.9)' }}
      >
        <div className="container mx-auto px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="relative">
              <img
                src="/logo domy.svg"
                alt="Domy v Italii"
                className="h-12 w-auto"
                style={{ filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4))' }}
              />
            </Link>

            <div className="flex items-center space-x-4">
              <Link
                href={productKey === 'premium-notary' ? '/guides/notary' : '/guides/costs'}
                className="hidden md:inline-flex items-center text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3 py-2 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.back}
              </Link>
              <div className="group flex items-center bg-white/10 backdrop-blur-md rounded-full px-3 py-2 shadow-lg border border-white/20">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${language === 'en' ? 'bg-white/20 text-white' : 'text-white/60'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => handleLanguageChange('cs')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${language === 'cs' ? 'bg-white/20 text-white' : 'text-white/60'}`}
                >
                  CS
                </button>
                <button
                  onClick={() => handleLanguageChange('it')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${language === 'it' ? 'bg-white/20 text-white' : 'text-white/60'}`}
                >
                  IT
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-14">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/95 border-gray-200 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl md:text-2xl font-bold text-slate-800">
                  {productLabel}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <h1 className="text-3xl md:text-4xl font-bold leading-tight text-slate-900">
                  {t.title}
                </h1>

                <p className="text-lg text-gray-700 leading-relaxed">{t.intro}</p>
                <p className="text-gray-700 leading-relaxed">{t.body}</p>
                <InformationalDisclaimer language={language} variant="pdf" />

                <div className="space-y-3">
                  {t.bullets.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">{item}</p>
                    </div>
                  ))}
                </div>

                <p className="text-gray-700 leading-relaxed">{t.trust}</p>

                <div className="p-5 rounded-xl border border-amber-200 bg-amber-50">
                  <p className="text-amber-900 text-sm mb-2">
                    {t.value}: <span className="line-through font-semibold">{currentPrice.original} Kč</span>
                  </p>
                  <p className="text-amber-950 text-2xl md:text-3xl font-bold mb-3">
                    {t.today}: {currentPrice.discounted} Kč
                  </p>

                  <div className="mb-4 p-4 rounded-lg border border-slate-200 bg-white/80 space-y-3">
                    <p className="text-sm font-semibold text-slate-900">{t.legalSectionTitle}</p>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="purchase-terms"
                        checked={legalChecks.terms}
                        onCheckedChange={(checked) => updateLegalCheck('terms', checked)}
                        className="mt-0.5 border-slate-400 data-[state=checked]:bg-slate-800 data-[state=checked]:border-slate-800"
                      />
                      <label htmlFor="purchase-terms" className="text-xs text-slate-700 leading-relaxed cursor-pointer">
                        {legalCopy.termsLabel}{' '}
                        <Link href="/terms" className="underline text-slate-900" target="_blank" rel="noopener noreferrer">
                          {t.termsLink}
                        </Link>
                      </label>
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="purchase-privacy"
                        checked={legalChecks.privacy}
                        onCheckedChange={(checked) => updateLegalCheck('privacy', checked)}
                        className="mt-0.5 border-slate-400 data-[state=checked]:bg-slate-800 data-[state=checked]:border-slate-800"
                      />
                      <label htmlFor="purchase-privacy" className="text-xs text-slate-700 leading-relaxed cursor-pointer">
                        {legalCopy.privacyLabel}{' '}
                        <Link href="/gdpr" className="underline text-slate-900" target="_blank" rel="noopener noreferrer">
                          {t.privacyLink}
                        </Link>
                      </label>
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="purchase-digital-waiver"
                        checked={legalChecks.digitalWaiver}
                        onCheckedChange={(checked) => updateLegalCheck('digitalWaiver', checked)}
                        className="mt-0.5 border-slate-400 data-[state=checked]:bg-slate-800 data-[state=checked]:border-slate-800"
                      />
                      <label htmlFor="purchase-digital-waiver" className="text-xs text-slate-700 leading-relaxed cursor-pointer">
                        {legalCopy.digitalWaiverLabel}
                      </label>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {t.digitalRightsInfo}
                    </p>

                    {legalError ? (
                      <p className="text-xs text-red-700">{legalError}</p>
                    ) : null}
                  </div>

                  <div className="mb-4 p-4 rounded-lg border border-blue-200 bg-blue-50/70 space-y-3">
                    <p className="text-sm font-semibold text-slate-900">{t.billingSectionTitle}</p>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="purchase-invoice-requested"
                        checked={billingInfo.invoiceRequested}
                        onCheckedChange={(checked) => updateBillingInfo('invoiceRequested', checked === true)}
                        className="mt-0.5 border-slate-400 data-[state=checked]:bg-slate-800 data-[state=checked]:border-slate-800"
                      />
                      <label htmlFor="purchase-invoice-requested" className="text-xs text-slate-700 leading-relaxed cursor-pointer">
                        {t.invoiceRequestedLabel}
                      </label>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label htmlFor="billing-company-name" className="text-xs font-medium text-slate-700">
                          {t.companyNameLabel}
                        </label>
                        <Input
                          id="billing-company-name"
                          value={billingInfo.companyName}
                          onChange={(event) => updateBillingInfo('companyName', event.target.value)}
                          placeholder={t.companyNameLabel}
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="billing-tax-reference" className="text-xs font-medium text-slate-700">
                          {t.taxReferenceLabel}
                        </label>
                        <Input
                          id="billing-tax-reference"
                          value={billingInfo.taxReference}
                          onChange={(event) => updateBillingInfo('taxReference', event.target.value)}
                          placeholder={t.taxReferenceLabel}
                          className="bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="billing-note" className="text-xs font-medium text-slate-700">
                        {t.billingNoteLabel}
                      </label>
                      <Input
                        id="billing-note"
                        value={billingInfo.billingNote}
                        onChange={(event) => updateBillingInfo('billingNote', event.target.value)}
                        placeholder={t.billingNoteLabel}
                        className="bg-white"
                      />
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {t.billingHelper}
                    </p>
                    <FormPrivacyNotice language={language} purpose="purchase" />
                  </div>

                  <PremiumPdfComingSoonTrigger
                    language={language}
                    disabled={isLoadingCheckout}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full md:w-auto bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 text-amber-950 hover:from-amber-200 hover:via-yellow-200 hover:to-amber-300 border border-amber-200/70"
                  >
                    {isLoadingCheckout ? t.loading : `${t.cta} (${currentPrice.discounted} Kč)`}
                  </PremiumPdfComingSoonTrigger>

                  <div className="mt-4 p-4 rounded-lg border border-blue-200 bg-blue-50">
                    <p className="text-blue-900 font-semibold mb-1">{t.paymentNoticeTitle}</p>
                    <p className="text-blue-900 text-sm leading-relaxed mb-3">{t.paymentNoticeBody}</p>
                    <Link href="/gdpr">
                      <Button variant="outline" className="border-blue-300 text-blue-900 hover:bg-blue-100">
                        {t.paymentNoticeCta}
                      </Button>
                    </Link>
                  </div>

                  <p className="mt-4 text-xs text-slate-600 leading-relaxed">
                    {t.pdfDisclaimer}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(currentUser) => {
          setUser(currentUser)
          setIsAuthModalOpen(false)
        }}
      />
    </div>
  )
}
