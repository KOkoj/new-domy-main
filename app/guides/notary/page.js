'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, ArrowLeft, Euro, FileCheck, Scale, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import AuthModal from '../../../components/AuthModal'
import InformationalDisclaimer from '@/components/legal/InformationalDisclaimer'

const COPY = {
  cs: {
    blogLabel: 'Články',
    home: 'Domů',
    guide: 'Průvodce',
    page: 'Notář v Itálii',
    title: 'Notář v Itálii: role a náklady při koupi domu',
    intro:
      'Notář hraje při koupi domu v Itálii zásadní roli. Jeho funkce se ale v mnoha ohledech liší od toho, na co jsou čeští kupující zvyklí.',
    imageAlt: 'Pár před dokumenty s poradcem',
    imageCaption:
      'Notářská fáze je o dokumentech, podpisu a právní jistotě, ne o prvním dojmu z nemovitosti.',
    warning:
      'Pro mnoho českých kupujících představuje notář úplnou záruku.\nVe skutečnosti je jeho role zásadní, ale omezená na konkrétní právní odpovědnosti.\nVše, co se děje před notářským aktem a kolem něj, zůstává na odpovědnosti kupujícího.',
    roleTitle: 'Jaká je role notáře v Itálii',
    roleBody:
      'Notář v Itálii není pouze svědek podpisu. Je to nezávislý veřejný činitel, který odpovídá za právní správnost převodu nemovitosti.',
    roleChecks: [
      'ověřit vlastnická práva prodávajícího',
      'zkontrolovat zápisy v katastru',
      'zajistit, aby byl převod v souladu se zákonem'
    ],
    roleNote:
      'Notář nezastupuje kupujícího ani prodávajícího. Garantuje zákonnost převodu jako takového.',
    roleClarification:
      'To znamená, že notář nechrání osobní zájmy kupujícího, ale pouze právní správnost finálního aktu.',
    whenTitle: 'Kdy notář vstupuje do procesu',
    whenBody:
      'Notář se zapojuje v závěrečné fázi koupě, při podpisu kupní smlouvy. Je důležité vědět, že:',
    whenBullets: [
      'nevybírá nemovitost',
      'neposuzuje výhodnost koupě',
      'nekontroluje technický stav domu'
    ],
    whenClosing:
      'Všechna tato rozhodnutí probíhají dlouho před zapojením notáře a často jsou nejcitlivější částí celého nákupního procesu.',
    checksTitle: 'Co notář kontroluje - a co ne',
    checksYesTitle: 'Notář kontroluje:',
    checksYes: ['vlastnická práva', 'právní omezení, dluhy a zástavy', 'správnost dokumentace'],
    checksNoTitle: 'Notář nekontroluje:',
    checksNoBody: 'Technický stav nemovitosti. Spoléhat se pouze na notáře je častou chybou.',
    checksClosing:
      'Proto je spoléhat se výhradně na notáře jedním z nejčastějších omylů zahraničních kupujících. Technická kontrola, soulad dokumentů, skutečný stav nemovitosti i dohodnuté podmínky vyžadují širší koordinaci.',
    chooseTitle: 'Kdo notáře vybírá a kdo ho platí',
    chooseLead: 'V Itálii je běžné, že:',
    chooseBuyerTitle: 'Kupující může vybrat notáře',
    chooseBuyerBody:
      'V Itálii má kupující teoreticky právo vybrat notáře, ale ve většině případů se po dohodě volí notář v obci, kde se nemovitost nachází.',
    choosePayTitle: 'Náklady na notáře hradí kupující',
    choosePayBody:
      'Jde o standardní praxi, se kterou je dobré počítat už při plánování rozpočtu.',
    importantTitle: 'Důležité vědět',
    importantBody:
      'Vybrat správného notáře, sladit termíny, správně připravit dokumenty a ověřit, že je vše před aktem připravené, je odpovědnost, která často padá na kupujícího.\nA právě v této fázi se objevuje mnoho problémů.',
    costsTitle: 'Některé náklady na notáře',
    costsLead: 'Cena notáře se liší podle:',
    costsBullets: ['kupní ceny nemovitosti', 'typu převodu', 'výše daní'],
    costsIncludesTitle: 'Notářské náklady obvykle zahrnují:',
    costsIncludes: ['odměnu notáře', 'povinné daně', 'administrativní poplatky'],
    costsClosing:
      'Náklady na notáře jsou jen jednou částí celkového rozpočtu. Chybná příprava předchozích kroků může způsobit zpoždění, dodatečné náklady nebo odložení podpisu aktu.',
    primaryCta: 'Napsat nám k notáři',
    secondaryCta: 'Jak koupit dům krok za krokem',
    hiddenTitle: 'Jsme tu, aby byl proces bezpečnější',
    hiddenBody:
      'Notář je zásadní krok, ale není průvodcem celým procesem nákupu. Naše služba vznikla proto, aby klienty doprovázela před, během i po zapojení notáře, koordinovala všechny fáze a snižovala rizika.',
    closingQuestion: 'Chcete probrat svou situaci s notářem?',
    contactCta: 'Kontaktovat nás',
    backCta: 'Zpět na průvodce',
    nextCta: 'Náklady a poplatky'
  },
  it: {
    blogLabel: 'Articoli',
    home: 'Casa',
    guide: 'Guida',
    page: 'Notaio in Italia',
    title: 'Notaio in Italia: ruolo e costi nell’acquisto di una casa',
    intro:
      'Il notaio gioca un ruolo fondamentale nell’acquisto di una casa in Italia. La sua funzione, però, differisce in molti aspetti da ciò a cui alcuni acquirenti stranieri sono abituati.',
    imageAlt: 'Coppia davanti a documenti con un consulente',
    imageCaption:
      'La fase del notaio riguarda documenti, firma e certezza giuridica, non la prima impressione sulla casa.',
    warning:
      'Per molti acquirenti il notaio rappresenta una garanzia totale.\nIn realtà il suo ruolo è fondamentale, ma limitato a precise responsabilità legali.\nTutto ciò che avviene prima e attorno all’atto notarile resta a carico dell’acquirente.',
    roleTitle: 'Qual è il ruolo del notaio in Italia',
    roleBody:
      'Il notaio in Italia non è solo un testimone della firma. È un pubblico ufficiale indipendente che risponde della correttezza legale del trasferimento immobiliare.',
    roleChecks: [
      'verificare i diritti di proprietà del venditore',
      'controllare le iscrizioni al catasto',
      'assicurarsi che il trasferimento sia conforme alla legge'
    ],
    roleNote:
      'Il notaio non rappresenta né l’acquirente né il venditore. Garantisce la legalità del trasferimento in sé.',
    roleClarification:
      'Questo significa che il notaio non tutela gli interessi personali dell’acquirente, ma solo la regolarità giuridica dell’atto finale.',
    whenTitle: 'Quando il notaio entra nel processo',
    whenBody:
      'Il notaio interviene nella fase finale dell’acquisto, durante la firma dell’atto. È importante sapere che:',
    whenBullets: [
      'non seleziona la proprietà',
      'non valuta la convenienza dell’acquisto',
      'non controlla lo stato tecnico della casa'
    ],
    whenClosing:
      'Tutte queste decisioni avvengono molto prima dell’ingresso del notaio e sono spesso le più delicate dell’intero processo di acquisto.',
    checksTitle: 'Cosa controlla il notaio - e cosa no',
    checksYesTitle: 'Il notaio controlla:',
    checksYes: ['diritti di proprietà', 'restrizioni legali, debiti e gravami', 'correttezza della documentazione'],
    checksNoTitle: 'Il notaio non controlla:',
    checksNoBody:
      'Lo stato tecnico dell’immobile. Affidarsi solo al notaio è un errore comune.',
    checksClosing:
      'Per questo motivo, affidarsi esclusivamente al notaio è uno degli equivoci più comuni tra gli acquirenti stranieri. Il controllo tecnico, la coerenza tra documenti, lo stato reale dell’immobile e le condizioni concordate richiedono un coordinamento più ampio.',
    chooseTitle: 'Chi sceglie il notaio e chi lo paga',
    chooseLead: 'In Italia è normale che:',
    chooseBuyerTitle: 'L’acquirente può scegliere il notaio',
    chooseBuyerBody:
      'In teoria chi compra ha il diritto di scegliere il notaio, ma nella maggior parte dei casi si concorda un notaio nel comune in cui si trova l’immobile, per comodità operativa.',
    choosePayTitle: 'I costi del notaio sono a carico dell’acquirente',
    choosePayBody:
      'È una prassi standard, con cui è bene fare i conti già in fase di pianificazione del budget.',
    importantTitle: 'Importante da sapere',
    importantBody:
      'Scegliere il notaio giusto, coordinare i tempi, preparare correttamente i documenti e verificare che tutto sia pronto prima dell’atto è una responsabilità che spesso ricade sull’acquirente.\nEd è proprio in questa fase che emergono molti problemi.',
    costsTitle: 'Alcuni dei costi notarili',
    costsLead: 'Il prezzo del notaio varia in base a:',
    costsBullets: ["prezzo d'acquisto dell'immobile", 'tipo di trasferimento', 'ammontare delle tasse'],
    costsIncludesTitle: 'I costi notarili solitamente includono:',
    costsIncludes: ['onorario del notaio', 'tasse obbligatorie', 'spese amministrative'],
    costsClosing:
      'Il costo del notaio è solo una parte del budget complessivo. Una pianificazione errata dei passaggi precedenti può generare ritardi, costi aggiuntivi o rinvii dell’atto.',
    primaryCta: 'Scrivici per il notaio',
    secondaryCta: 'Come comprare casa passo dopo passo',
    hiddenTitle: 'Siamo qui per rendere il processo più sicuro',
    hiddenBody:
      'Il notaio è un passaggio essenziale, ma non è una guida lungo l’intero processo di acquisto. Il nostro servizio nasce per accompagnare il cliente prima, durante e dopo l’intervento del notaio, coordinando tutte le fasi e riducendo i rischi.',
    closingQuestion: 'Vuoi confrontarti sul tuo caso con riferimento al notaio?',
    contactCta: 'Contattaci',
    backCta: 'Vai al processo',
    nextCta: 'Costi e spese'
  },
  en: {
    blogLabel: 'Articles',
    home: 'Home',
    guide: 'Guide',
    page: 'Notary in Italy',
    title: 'Notary in Italy: Role and Costs When Buying a House',
    intro:
      'The notary plays a crucial role when buying a house in Italy. However, the function differs in many respects from what foreign buyers are often used to.',
    imageAlt: 'Couple in front of legal documents with an advisor',
    imageCaption:
      'The notary stage is about documents, signatures, and legal certainty, not first impressions of the house.',
    warning:
      'For many buyers, the notary looks like a total guarantee.\nIn reality, the role is essential but limited to specific legal responsibilities.\nEverything that happens before and around the notarial deed remains the buyer’s responsibility.',
    roleTitle: 'What is the role of the notary in Italy',
    roleBody:
      'The notary in Italy is not just a witness to the signature. The notary is an independent public official responsible for the legal correctness of the property transfer.',
    roleChecks: [
      "verify the seller's property rights",
      'check cadastral records',
      'ensure the transfer complies with the law'
    ],
    roleNote:
      'The notary does not represent the buyer or seller. The notary guarantees the legality of the transfer itself.',
    roleClarification:
      "This means the notary does not protect the buyer's personal interests, only the legal validity of the final deed.",
    whenTitle: 'When the notary enters the process',
    whenBody:
      'The notary gets involved in the final phase of the purchase, when signing the deed. It is important to know that:',
    whenBullets: [
      'the notary does not select the property',
      'the notary does not assess whether the purchase is a good deal',
      'the notary does not check the technical condition of the house'
    ],
    whenClosing:
      'All these decisions happen well before the notary enters the process and are often the most delicate part of the entire purchase.',
    checksTitle: 'What the notary checks - and what the notary does not',
    checksYesTitle: 'The notary checks:',
    checksYes: ['property rights', 'legal restrictions, debts, and liens', 'correctness of documentation'],
    checksNoTitle: 'The notary does not check:',
    checksNoBody:
      'The technical condition of the property. Relying only on the notary is a common mistake.',
    checksClosing:
      'For this reason, relying exclusively on the notary is one of the most common misconceptions among foreign buyers. Technical checks, consistency between documents, the real condition of the property, and agreed conditions require broader coordination.',
    chooseTitle: 'Who chooses the notary and who pays',
    chooseLead: 'In Italy it is common that:',
    chooseBuyerTitle: 'The buyer can choose the notary',
    chooseBuyerBody:
      'In theory, the buyer has the right to choose the notary, but in most cases the parties agree on a notary in the municipality where the property is located.',
    choosePayTitle: 'The buyer pays the notary costs',
    choosePayBody:
      'This is standard practice and should already be factored into the overall budget.',
    importantTitle: 'Important to know',
    importantBody:
      'Choosing the right notary, coordinating timelines, preparing documents correctly, and verifying that everything is ready before the deed are responsibilities that often fall on the buyer.\nThis is exactly the stage where many problems emerge.',
    costsTitle: 'Some notary costs',
    costsLead: "The notary's price varies according to:",
    costsBullets: ['purchase price of the property', 'type of transfer', 'amount of taxes'],
    costsIncludesTitle: 'Notary costs usually include:',
    costsIncludes: ["the notary's fee", 'mandatory taxes', 'administrative fees'],
    costsClosing:
      'The notary cost is only one part of the total budget. Poor planning in previous steps can lead to delays, extra costs, or a postponed deed.',
    primaryCta: 'Contact us about the notary',
    secondaryCta: 'How to Buy a House Step by Step',
    hiddenTitle: 'We are here to make the process safer',
    hiddenBody:
      'The notary is an essential step, but not a guide through the entire purchase process. Our service exists to support clients before, during, and after the notary’s intervention, coordinating all phases and reducing risk.',
    closingQuestion: 'Do you want to discuss your situation around the notary?',
    contactCta: 'Contact us',
    backCta: 'Go to the process',
    nextCta: 'Costs and Fees'
  }
}

export default function NotaryGuidePage() {
  const [user, setUser] = useState(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [language, setLanguage] = useState('cs')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
    }
  }, [])

  useEffect(() => {
    if (!supabase) return
    const checkUser = async () => {
      const {
        data: { user: authUser }
      } = await supabase.auth.getUser()
      setUser(authUser)
    }
    checkUser()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const copy = COPY[language] || COPY.en

  const articleImage = {
    src: '/articles/notary-couple-documents.jpg',
    alt: copy.imageAlt,
    caption: copy.imageCaption
  }

  const handleLogout = async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
    }
  }

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)
    document.documentElement.lang = newLanguage
    localStorage.setItem('preferred-language', newLanguage)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f4ed] via-amber-50/20 to-slate-50">
      <nav
        className="fixed left-0 right-0 top-0 z-50 overflow-visible border-b border-white/20 backdrop-blur-md shadow-lg"
        style={{ backgroundColor: 'rgba(14, 21, 46, 0.9)' }}
      >
        <div className="container mx-auto px-6 pb-3 pt-4" style={{ maxWidth: '1200px' }}>
          <div className="flex items-center justify-between">
            <Link href="/" className="relative overflow-visible">
              <img
                src="/logo domy.svg"
                alt="Domy v Itálii"
                className="h-12 w-auto cursor-pointer"
                style={{ filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4))' }}
              />
            </Link>

            <div className="flex items-center space-x-4">
              <Link
                href="/blog"
                className="hidden items-center rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {copy.blogLabel}
              </Link>
              <div className="group flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-2 shadow-lg backdrop-blur-md">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`cursor-pointer leading-none hover:opacity-80 px-3 py-1 rounded-full text-sm font-medium ${language === 'en' ? 'bg-white/20 text-white' : 'text-white/60'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => handleLanguageChange('cs')}
                  className={`cursor-pointer leading-none hover:opacity-80 px-3 py-1 rounded-full text-sm font-medium ${language === 'cs' ? 'bg-white/20 text-white' : 'text-white/60'}`}
                >
                  CS
                </button>
                <button
                  onClick={() => handleLanguageChange('it')}
                  className={`cursor-pointer leading-none hover:opacity-80 px-3 py-1 rounded-full text-sm font-medium ${language === 'it' ? 'bg-white/20 text-white' : 'text-white/60'}`}
                >
                  IT
                </button>
              </div>
              {user && (
                <Button variant="outline" onClick={handleLogout} className="border-white/30 bg-white/10 text-white">
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="pb-16 pt-28 md:pb-24">
        <div className="container mx-auto mb-6 px-6" style={{ maxWidth: '1200px' }}>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-slate-700">{copy.home}</Link>
            <span>/</span>
            <Link href="/process" className="hover:text-slate-700">{copy.guide}</Link>
            <span>/</span>
            <span className="font-medium text-slate-700">{copy.page}</span>
          </div>
        </div>

        <div className="container mx-auto px-6" style={{ maxWidth: '1200px' }}>
          <div className="mx-auto max-w-4xl" style={{ maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto' }}>
            <div className="mb-8">
              <Button
                asChild
                variant="outline"
                className="mb-5 inline-flex items-center border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                <Link href="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {copy.blogLabel}
                </Link>
              </Button>
              <h1 className="mb-8 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text font-bold text-transparent">
                {copy.title}
              </h1>
              <p className="leading-relaxed text-gray-500" style={{color:'#4a4a4a', lineHeight:'1.75'}}>{copy.intro}</p>
            </div>

            <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <img
                src={articleImage.src}
                alt={articleImage.alt}
                className="h-64 w-full object-cover md:h-80"
                loading="lazy"
              />
              <p className="px-4 py-3 text-sm text-slate-600">{articleImage.caption}</p>
            </div>

            <Card className="mb-12 border-amber-200 bg-amber-50">
              <CardContent className="p-6">
                <p className="whitespace-pre-line text-lg font-semibold leading-relaxed text-amber-900">
                  {copy.warning}
                </p>
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center mb-8">
                    <Scale className="mr-3 h-6 w-6" />
                    {copy.roleTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 leading-relaxed text-gray-500" style={{color:'#4a4a4a', lineHeight:'1.75'}}>{copy.roleBody}</p>
                  <div className="space-y-3">
                    {copy.roleChecks.map((item) => (
                      <div key={item} className="flex items-start space-x-3">
                        <FileCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                        <p className="font-semibold text-slate-800">{item}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="font-semibold text-blue-900">{copy.roleNote}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-slate-50">
                <CardContent className="p-5">
                  <p className="whitespace-pre-line font-semibold leading-relaxed text-slate-800">
                    {copy.roleClarification}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="mb-8">{copy.whenTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 leading-relaxed text-gray-500" style={{color:'#4a4a4a', lineHeight:'1.75'}}>{copy.whenBody}</p>
                  <ul className="ml-6 space-y-2">
                    {copy.whenBullets.map((item) => (
                      <li key={item} className="text-gray-700">- {item}</li>
                    ))}
                  </ul>
                  <p className="mt-4 whitespace-pre-line leading-relaxed text-gray-500" style={{color:'#4a4a4a', lineHeight:'1.75'}}>{copy.whenClosing}</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center mb-8">
                    <Shield className="mr-3 h-6 w-6 text-green-600" />
                    {copy.checksTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <h4 className="mb-3 font-bold text-green-900">{copy.checksYesTitle}</h4>
                    <ul className="ml-6 space-y-2">
                      {copy.checksYes.map((item) => (
                        <li key={item} className="text-gray-700">- {item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <h4 className="mb-3 font-bold text-red-900">{copy.checksNoTitle}</h4>
                    <p className="leading-relaxed text-red-800">{copy.checksNoBody}</p>
                  </div>
                  <p className="mt-4 leading-relaxed text-gray-500" style={{color:'#4a4a4a', lineHeight:'1.75'}}>{copy.checksClosing}</p>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center mb-8">
                    <Euro className="mr-3 h-6 w-6" />
                    {copy.chooseTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 leading-relaxed text-gray-500" style={{color:'#4a4a4a', lineHeight:'1.75'}}>{copy.chooseLead}</p>
                  <div className="space-y-4">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="mb-2 font-semibold text-slate-800">{copy.chooseBuyerTitle}</p>
                      <p className="text-sm text-gray-500" style={{color:'#4a4a4a', lineHeight:'1.75'}}>{copy.chooseBuyerBody}</p>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="mb-2 font-semibold text-slate-800">{copy.choosePayTitle}</p>
                      <p className="text-sm text-gray-500" style={{color:'#4a4a4a', lineHeight:'1.75'}}>{copy.choosePayBody}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-6">
                  <h4 className="mb-3 flex items-center font-bold text-amber-900">
                    <AlertCircle className="mr-2 h-5 w-5" />
                    {copy.importantTitle}
                  </h4>
                  <p className="whitespace-pre-line leading-relaxed text-amber-900">{copy.importantBody}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-700 to-slate-800 text-white">
                <CardContent className="p-8">
                  <h3 className="mb-4 text-2xl font-bold">{copy.costsTitle}</h3>
                  <p className="mb-4 leading-relaxed text-slate-200">{copy.costsLead}</p>
                  <ul className="mb-6 space-y-2">
                    {copy.costsBullets.map((item) => (
                      <li key={item} className="text-slate-200">- {item}</li>
                    ))}
                  </ul>
                  <div className="rounded-lg border border-white/20 bg-white/10 p-4">
                    <p className="mb-2 font-semibold text-white">{copy.costsIncludesTitle}</p>
                    <ul className="space-y-1 text-slate-200">
                      {copy.costsIncludes.map((item) => (
                        <li key={item}>- {item}</li>
                      ))}
                    </ul>
                  </div>
                  <p className="mt-6 leading-relaxed text-slate-200">{copy.costsClosing}</p>
                  <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <Link href="/contact">
                        <Button className="w-full border border-amber-200/70 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 text-amber-950 shadow-sm hover:from-amber-200 hover:via-yellow-200 hover:to-amber-300">
                          {copy.primaryCta}
                        </Button>
                      </Link>
                    </div>
                    <Link href="/process">
                      <Button className="w-full border border-white/30 bg-white/10 text-white hover:bg-white/20">
                        {copy.secondaryCta}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="hidden">
                <CardContent className="p-6">
                  <h4 className="mb-3 font-bold text-green-900">{copy.hiddenTitle}</h4>
                  <p className="mt-3 leading-relaxed text-green-900">{copy.hiddenBody}</p>
                  <div className="mt-5">
                    <Link href="/contact">
                      <Button className="bg-gradient-to-r from-green-700 to-emerald-700 text-white hover:from-green-600 hover:to-emerald-600">
                        {copy.contactCta}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <p className="mb-4 text-lg font-semibold leading-relaxed text-blue-900">
                    {copy.closingQuestion}
                  </p>
                  <Link href="/contact">
                    <Button className="border border-amber-200/70 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 text-amber-950 shadow-sm hover:from-amber-200 hover:via-yellow-200 hover:to-amber-300">
                      {copy.contactCta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            <InformationalDisclaimer language={language} className="mt-14" />

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
              <Link href="/process">
                <Button variant="outline" size="lg" className="w-full">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  {copy.backCta}
                </Button>
              </Link>
              <Link href="/guides/costs">
                <Button size="lg" className="w-full bg-gradient-to-r from-slate-700 to-slate-800 text-white hover:from-slate-600 hover:to-slate-700">
                  {copy.nextCta}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(nextUser) => setUser(nextUser)}
      />
    </div>
  )
}
