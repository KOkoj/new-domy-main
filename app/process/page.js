'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  FileSearch, 
  CheckCircle, 
  Calendar,
  Users,
  Shield,
  FileText,
  MapPin,
  Heart,
  Key,
  Clock,
  CheckSquare,
  ChevronRight,
  Euro,
  Landmark,
  Mail
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const PROCESS_STEPS = [
  {
    number: 1,
    title: {
      en: 'Initial Consultation',
      cs: 'Úvodní konzultace',
      it: 'Consulenza Iniziale'
    },
    subtitle: {
      en: 'Understanding Your Vision',
      cs: 'Pochopení vaší vize',
      it: 'Comprendere la tua visione'
    },
    description: {
      en: 'We start with a comprehensive consultation to understand your needs, preferences, budget, and timeline. This can be done via video call, phone, or in person.',
      cs: 'Začínáme komplexní konzultací, abychom pochopili vaše potřeby, preference, rozpočet a časový plán. Toto lze provést prostřednictvím videohovoru, telefonu nebo osobně.',
      it: 'Iniziamo con una consulenza completa per comprendere le tue esigenze, preferenze, budget e tempistiche. Questo può essere fatto tramite videochiamata, telefono o di persona.'
    },
    duration: {
      en: '1-2 hours',
      cs: '1-2 hodiny',
      it: '1-2 ore'
    },
    icon: <Users className="h-8 w-8" />,
    includes: [
      {
        en: 'Budget & financing discussion',
        cs: 'Diskuse o rozpočtu a financování',
        it: 'Discussione su budget e finanziamento'
      },
      {
        en: 'Region & property type preferences',
        cs: 'Preference regionu a typu nemovitosti',
        it: 'Preferenze di regione e tipo di proprietà'
      },
      {
        en: 'Timeline & requirements planning',
        cs: 'Plánování časového plánu a požadavků',
        it: 'Pianificazione tempistiche e requisiti'
      },
      {
        en: 'Q&A about Italian property market',
        cs: 'Otázky a odpovědi o italském trhu nemovitostí',
        it: 'Domande e risposte sul mercato immobiliare italiano'
      }
    ]
  },
  {
    number: 2,
    title: {
      en: 'Property Search & Curation',
      cs: 'Vyhledávání a výběr nemovitostí',
      it: 'Ricerca e Selezione Immobili'
    },
    subtitle: {
      en: 'Finding Your Perfect Match',
      cs: 'Nalezení vaší dokonalé volby',
      it: 'Trovare la tua scelta perfetta'
    },
    description: {
      en: 'Our team searches through thousands of properties across Italy to find options that match your criteria. We provide detailed information, photos, and videos for each property.',
      cs: 'Náš tým prohledává tisíce nemovitostí po celé Itálii, aby našel možnosti odpovídající vašim kritériím. Poskytujeme podrobné informace, fotografie a videa pro každou nemovitost.',
      it: 'Il nostro team cerca tra migliaia di proprietà in tutta Italia per trovare opzioni che corrispondono ai tuoi criteri. Forniamo informazioni dettagliate, foto e video per ogni proprietà.'
    },
    duration: {
      en: '1-4 weeks',
      cs: '1-4 týdny',
      it: '1-4 settimane'
    },
    icon: <Search className="h-8 w-8" />,
    includes: [
      {
        en: 'Access to exclusive off-market properties',
        cs: 'Přístup k exkluzivním nemovitostem mimo trh',
        it: 'Accesso a proprietà esclusive fuori mercato'
      },
      {
        en: 'Detailed property dossiers',
        cs: 'Podrobné dokumenty nemovitostí',
        it: 'Dossier immobiliari dettagliati'
      },
      {
        en: 'Virtual tours & video walkthroughs',
        cs: 'Virtuální prohlídky a video návody',
        it: 'Tour virtuali e video walkthrough'
      },
      {
        en: 'Market analysis & price evaluation',
        cs: 'Analýza trhu a hodnocení cen',
        it: 'Analisi di mercato e valutazione prezzi'
      }
    ]
  },
  {
    number: 3,
    title: {
      en: 'Property Viewings',
      cs: 'Prohlídky nemovitostí',
      it: 'Visite Immobiliari'
    },
    subtitle: {
      en: 'Experience Your Future Home',
      cs: 'Poznejte svůj budoucí domov',
      it: 'Vivi la tua futura casa'
    },
    description: {
      en: 'We organize and accompany you to property viewings in Italy. If you cannot travel, we can arrange detailed video tours with our local representatives.',
      cs: 'Organizujeme a doprovázíme vás na prohlídky nemovitostí v Itálii. Pokud nemůžete cestovat, můžeme uspořádat podrobné video prohlídky s našimi místními zástupci.',
      it: 'Organizziamo e ti accompagniamo alle visite immobiliari in Italia. Se non puoi viaggiare, possiamo organizzare tour video dettagliati con i nostri rappresentanti locali.'
    },
    duration: {
      en: '3-7 days',
      cs: '3-7 dní',
      it: '3-7 giorni'
    },
    icon: <MapPin className="h-8 w-8" />,
    includes: [
      {
        en: 'Personalized viewing itinerary',
        cs: 'Personalizovaný itinerář prohlídek',
        it: 'Itinerario personalizzato delle visite'
      },
      {
        en: 'Professional translation services',
        cs: 'Profesionální překladatelské služby',
        it: 'Servizi di traduzione professionale'
      },
      {
        en: 'Local area tours & amenity checks',
        cs: 'Prohlídky místní oblasti a kontroly vybavení',
        it: 'Tour della zona locale e controlli servizi'
      },
      {
        en: 'Technical inspection recommendations',
        cs: 'Doporučení technických inspekcí',
        it: 'Raccomandazioni ispezioni tecniche'
      }
    ]
  },
  {
    number: 4,
    title: {
      en: 'Due Diligence & Inspections',
      cs: 'Due Diligence a inspekce',
      it: 'Due Diligence e Ispezioni'
    },
    subtitle: {
      en: 'Ensuring Everything Checks Out',
      cs: 'Zajištění, že vše souhlasí',
      it: 'Assicurarsi che tutto sia a posto'
    },
    description: {
      en: 'Our legal and technical partners conduct thorough checks on the property, including title verification, structural surveys, and compliance reviews.',
      cs: 'Naši právní a technickí partneři provádějí důkladné kontroly nemovitosti, včetně ověření titulu, stavebních průzkumů a kontrol souladu.',
      it: 'I nostri partner legali e tecnici conducono controlli approfonditi sulla proprietà, inclusa la verifica del titolo, rilievi strutturali e revisioni di conformità.'
    },
    duration: {
      en: '2-3 weeks',
      cs: '2-3 týdny',
      it: '2-3 settimane'
    },
    icon: <FileSearch className="h-8 w-8" />,
    includes: [
      {
        en: 'Title deed verification (Visura Catastale)',
        cs: 'Ověření vlastnického titulu (Visura Catastale)',
        it: 'Verifica atto di proprietà (Visura Catastale)'
      },
      {
        en: 'Building permits & planning compliance',
        cs: 'Stavební povolení a soulad s plánováním',
        it: 'Permessi edilizi e conformità urbanistica'
      },
      {
        en: 'Structural & energy efficiency survey',
        cs: 'Stavební a energetický průzkum',
        it: 'Rilievo strutturale ed efficienza energetica'
      },
      {
        en: 'Utility connections & land registry checks',
        cs: 'Kontroly připojení k sítím a katastru nemovitostí',
        it: 'Collegamenti utenze e controlli catastali'
      }
    ]
  },
  {
    number: 5,
    title: {
      en: 'Offer & Negotiation',
      cs: 'Nabídka a vyjednávání',
      it: 'Offerta e Negoziazione'
    },
    subtitle: {
      en: 'Securing the Best Deal',
      cs: 'Zajištění nejlepší nabídky',
      it: 'Ottenere il miglior affare'
    },
    description: {
      en: 'We help you prepare and submit a competitive offer, then negotiate on your behalf to secure the best possible terms and price.',
      cs: 'Pomůžeme vám připravit a podat konkurenceschopnou nabídku, poté vyjednáváme vaším jménem, abychom zajistili nejlepší možné podmínky a cenu.',
      it: 'Ti aiutiamo a preparare e presentare un\'offerta competitiva, poi negoziamo per tuo conto per assicurare i migliori termini e prezzo possibili.'
    },
    duration: {
      en: '1-2 weeks',
      cs: '1-2 týdny',
      it: '1-2 settimane'
    },
    icon: <Euro className="h-8 w-8" />,
    includes: [
      {
        en: 'Market-based pricing strategy',
        cs: 'Cenová strategie založená na trhu',
        it: 'Strategia di pricing basata sul mercato'
      },
      {
        en: 'Professional negotiation support',
        cs: 'Profesionální podpora vyjednávání',
        it: 'Supporto negoziazione professionale'
      },
      {
        en: 'Contract terms review & optimization',
        cs: 'Přezkoumání a optimalizace smluvních podmínek',
        it: 'Revisione e ottimizzazione termini contrattuali'
      },
      {
        en: 'Deposit & escrow arrangement',
        cs: 'Uspořádání zálohy a úschovy',
        it: 'Accordo deposito e garanzia'
      }
    ]
  },
  {
    number: 6,
    title: {
      en: 'Legal Documentation',
      cs: 'Právní dokumentace',
      it: 'Documentazione Legale'
    },
    subtitle: {
      en: 'Preparing All Paperwork',
      cs: 'Příprava všech dokumentů',
      it: 'Preparazione di tutta la documentazione'
    },
    description: {
      en: 'Our Italian lawyers (Notaio) prepare all necessary legal documents, including the preliminary contract (Compromesso) and final deed (Rogito).',
      cs: 'Naši italští právníci (Notaio) připravují všechny potřebné právní dokumenty, včetně předběžné smlouvy (Compromesso) a konečného aktu (Rogito).',
      it: 'I nostri avvocati italiani (Notaio) preparano tutti i documenti legali necessari, incluso il contratto preliminare (Compromesso) e l\'atto finale (Rogito).'
    },
    duration: {
      en: '2-4 weeks',
      cs: '2-4 týdny',
      it: '2-4 settimane'
    },
    icon: <FileText className="h-8 w-8" />,
    includes: [
      {
        en: 'Preliminary contract (Compromesso) drafting',
        cs: 'Vypracování předběžné smlouvy (Compromesso)',
        it: 'Redazione contratto preliminare (Compromesso)'
      },
      {
        en: 'Tax registration & fiscal code (Codice Fiscale)',
        cs: 'Daňová registrace a daňový kód (Codice Fiscale)',
        it: 'Registrazione fiscale e codice fiscale'
      },
      {
        en: 'Translation of all legal documents',
        cs: 'Překlad všech právních dokumentů',
        it: 'Traduzione di tutti i documenti legali'
      },
      {
        en: 'Power of attorney arrangements (if needed)',
        cs: 'Uspořádání plné moci (v případě potřeby)',
        it: 'Accordi procura (se necessario)'
      }
    ]
  },
  {
    number: 7,
    title: {
      en: 'Final Closing',
      cs: 'Konečné uzavření',
      it: 'Chiusura Finale'
    },
    subtitle: {
      en: 'Signing & Ownership Transfer',
      cs: 'Podpis a převod vlastnictví',
      it: 'Firma e trasferimento proprietà'
    },
    description: {
      en: 'The final deed is signed in the presence of a Notary (Notaio), and full payment is made. You officially become the owner of your Italian property!',
      cs: 'Konečný akt je podepsán v přítomnosti notáře (Notaio) a provede se úplná platba. Oficiálně se stanete vlastníkem své italské nemovitosti!',
      it: 'L\'atto finale viene firmato alla presenza di un Notaio e viene effettuato il pagamento completo. Diventi ufficialmente proprietario del tuo immobile italiano!'
    },
    duration: {
      en: '1 day',
      cs: '1 den',
      it: '1 giorno'
    },
    icon: <Landmark className="h-8 w-8" />,
    includes: [
      {
        en: 'Notary appointment coordination',
        cs: 'Koordinace schůzky s notářem',
        it: 'Coordinamento appuntamento notaio'
      },
      {
        en: 'Final payment & tax settlement',
        cs: 'Konečná platba a daňové vypořádání',
        it: 'Pagamento finale e liquidazione tasse'
      },
      {
        en: 'Deed registration (Rogito)',
        cs: 'Registrace aktu (Rogito)',
        it: 'Registrazione atto (Rogito)'
      },
      {
        en: 'Keys handover & property access',
        cs: 'Předání klíčů a přístup k nemovitosti',
        it: 'Consegna chiavi e accesso proprietà'
      }
    ]
  },
  {
    number: 8,
    title: {
      en: 'After-Sale Support',
      cs: 'Podpora po prodeji',
      it: 'Supporto Post-Vendita'
    },
    subtitle: {
      en: 'Ongoing Assistance',
      cs: 'Průběžná pomoc',
      it: 'Assistenza continua'
    },
    description: {
      en: 'Our relationship doesn\'t end at closing. We provide ongoing support with property management, renovations, utilities setup, and local services.',
      cs: 'Náš vztah nekončí uzavřením. Poskytujeme průběžnou podporu se správou nemovitostí, renovacemi, nastavením sítí a místních služeb.',
      it: 'Il nostro rapporto non finisce alla chiusura. Forniamo supporto continuo con gestione immobiliare, ristrutturazioni, allacciamento utenze e servizi locali.'
    },
    duration: {
      en: 'Ongoing',
      cs: 'Průběžně',
      it: 'Continuo'
    },
    icon: <Heart className="h-8 w-8" />,
    includes: [
      {
        en: 'Property management services',
        cs: 'Služby správy nemovitostí',
        it: 'Servizi di gestione immobiliare'
      },
      {
        en: 'Renovation & contractor coordination',
        cs: 'Koordinace renovací a dodavatelů',
        it: 'Coordinamento ristrutturazioni e appaltatori'
      },
      {
        en: 'Utility connections & local services setup',
        cs: 'Připojení k sítím a nastavení místních služeb',
        it: 'Collegamenti utenze e configurazione servizi locali'
      },
      {
        en: 'Ongoing legal & tax support',
        cs: 'Průběžná právní a daňová podpora',
        it: 'Supporto legale e fiscale continuo'
      }
    ]
  }
]

const TIMELINE_OVERVIEW = {
  total: {
    en: '3-6 months average',
    cs: '3-6 měsíců v průměru',
    it: '3-6 mesi in media'
  },
  phases: [
    {
      name: { en: 'Search & Selection', cs: 'Vyhledávání a výběr', it: 'Ricerca e selezione' },
      duration: { en: '2-6 weeks', cs: '2-6 týdnů', it: '2-6 settimane' }
    },
    {
      name: { en: 'Viewings & Due Diligence', cs: 'Prohlídky a Due Diligence', it: 'Visite e Due Diligence' },
      duration: { en: '3-5 weeks', cs: '3-5 týdnů', it: '3-5 settimane' }
    },
    {
      name: { en: 'Offer & Negotiation', cs: 'Nabídka a vyjednávání', it: 'Offerta e negoziazione' },
      duration: { en: '1-2 weeks', cs: '1-2 týdny', it: '1-2 settimane' }
    },
    {
      name: { en: 'Legal & Closing', cs: 'Právní a uzavření', it: 'Legale e chiusura' },
      duration: { en: '4-8 weeks', cs: '4-8 týdnů', it: '4-8 settimane' }
    }
  ]
}

const COSTS_OVERVIEW = [
  {
    title: { en: 'Purchase Tax – First Property + Residency', cs: 'Daň z nabytí – první nemovitost + trvalý pobyt', it: 'Imposta di acquisto – prima casa + residenza' },
    amount: { en: '2% of purchase price', cs: '2 % z kupní ceny', it: '2% del prezzo di acquisto' },
    description: { 
      en: 'Applies when buying your first property in Italy and establishing permanent residence',
      cs: 'Platí při koupi první nemovitosti v Itálii a zřízení trvalého pobytu',
      it: 'Si applica all\'acquisto della prima proprietà in Italia e stabilimento della residenza permanente'
    }
  },
  {
    title: { en: 'Purchase Tax – Non-Residence', cs: 'Daň z nabytí – bez trvalého pobytu', it: 'Imposta di acquisto – senza residenza' },
    amount: { en: '9% of purchase price', cs: '9 % z kupní ceny', it: '9% del prezzo di acquisto' },
    description: { 
      en: 'Applies when Italy will not be your permanent residence (most Czech buyers)',
      cs: 'Platí, pokud se v Itálii nebude jednat o trvalé bydliště (většina českých kupujících)',
      it: 'Si applica quando l\'Italia non sarà la vostra residenza permanente (la maggior parte degli acquirenti cechi)'
    }
  },
  {
    title: { en: 'VAT (New/Renovated Properties)', cs: 'DPH (nové/zrekonstruované nemovitosti)', it: 'IVA (immobili nuovi/ristrutturati)' },
    amount: { en: '10% (or 4% with residency)', cs: '10 % (nebo 4 % při trvalém pobytu)', it: '10% (o 4% con residenza)' },
    description: { 
      en: 'Applies to new or recently renovated properties (replaces purchase tax in these cases)',
      cs: 'Platí u nových nebo nově zrekonstruovaných nemovitostí (nahrazuje daň z nabytí)',
      it: 'Si applica a immobili nuovi o ristrutturati di recente (sostituisce l\'imposta di acquisto)'
    }
  },
  {
    title: { en: 'Notary Fees', cs: 'Notářské poplatky', it: 'Spese notarili' },
    amount: { en: '1-2.5% of property value', cs: '1–2,5 % hodnoty nemovitosti', it: '1-2,5% valore immobile' },
    description: { 
      en: 'Set by law (notary decree). Includes deed preparation, tax collection, and property transfer oversight',
      cs: 'Stanoveny zákonem (notářský dekret). Zahrnuje přípravu smlouvy, výběr daní a dohled nad převodem',
      it: 'Stabilite per legge (decreto notarile). Include preparazione atto, riscossione tasse e supervisione trasferimento'
    }
  },
  {
    title: { en: 'Reservation Deposit', cs: 'Rezervační poplatek', it: 'Deposito di prenotazione' },
    amount: { en: '~10% of purchase price', cs: 'cca 10 % z kupní ceny', it: '~10% del prezzo di acquisto' },
    description: { 
      en: 'Paid when signing the reservation contract (exact amount depends on agreement)',
      cs: 'Platí se při podpisu rezervační smlouvy (přesná výše závisí na dohodě)',
      it: 'Pagato alla firma del contratto di prenotazione (importo esatto dipende dall\'accordo)'
    }
  },
  {
    title: { en: 'Additional Costs', cs: 'Další náklady', it: 'Costi aggiuntivi' },
    amount: { en: '€1,000-3,000+', cs: '1 000–3 000+ €', it: '€1.000-3.000+' },
    description: { 
      en: 'Translations, interpretation at notary, technical inspections, land registry registration',
      cs: 'Překlady, tlumočení u notáře, technické kontroly, zápis do katastru nemovitostí',
      it: 'Traduzioni, interpretariato dal notaio, ispezioni tecniche, registrazione catastale'
    }
  }
]

export default function ProcessPage() {
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

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Modern Navigation */}
      <Navigation />

      <div className="pt-32 pb-12">
        {/* Hero Section */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm mb-12">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent px-2">
                {language === 'cs' ? 'Jak koupit dům v Itálii – praktický průvodce pro Čechy' :
                 language === 'it' ? 'Come acquistare una casa in Italia - guida pratica per i cechi' :
                 'How to Buy a House in Italy - Practical Guide for Czechs'}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 px-4">
                {language === 'cs' ? 'Plánujete koupi domu nebo bytu v Itálii, ale nechcete riskovat chyby, zbytečné náklady ani právní problémy? Proces koupě nemovitosti v Itálii se v mnoha ohledech liší od České republiky – nejen právně, ale i v postupu, roli notáře a odpovědnosti jednotlivých stran.' :
                 language === 'it' ? 'State pianificando l\'acquisto di una casa o appartamento in Italia, ma non volete rischiare errori, costi inutili o problemi legali? Il processo di acquisto di un immobile in Italia differisce in molti aspetti dalla Repubblica Ceca - non solo legalmente, ma anche nella procedura, nel ruolo del notaio e nelle responsabilità delle singole parti.' :
                 'Are you planning to buy a house or apartment in Italy, but don\'t want to risk mistakes, unnecessary costs, or legal problems? The process of buying property in Italy differs in many respects from the Czech Republic - not only legally, but also in procedure, the role of the notary, and the responsibilities of individual parties.'}
              </p>
              <p className="text-lg text-gray-600 leading-relaxed px-4">
                {language === 'cs' ? 'Proto jsme připravili praktického průvodce, který vám pomůže pochopit, jak celý proces skutečně funguje ještě předtím, než uděláte první krok.' :
                 language === 'it' ? 'Per questo abbiamo preparato una guida pratica che vi aiuterà a capire come funziona realmente l\'intero processo prima ancora di fare il primo passo.' :
                 'That\'s why we\'ve prepared a practical guide that will help you understand how the whole process really works before you take the first step.'}
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 px-4">
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="text-3xl font-bold text-slate-700 mb-1">8</div>
                  <div className="text-sm text-gray-600">
                    {language === 'cs' ? 'Kroků' : language === 'it' ? 'Passi' : 'Steps'}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="text-3xl font-bold text-slate-700 mb-1">3-6</div>
                  <div className="text-sm text-gray-600">
                    {language === 'cs' ? 'Měsíců' : language === 'it' ? 'Mesi' : 'Months'}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="text-3xl font-bold text-slate-700 mb-1">100%</div>
                  <div className="text-sm text-gray-600">
                    {language === 'cs' ? 'Podpora' : language === 'it' ? 'Supporto' : 'Support'}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="text-3xl font-bold text-slate-700 mb-1">15+</div>
                  <div className="text-sm text-gray-600">
                    {language === 'cs' ? 'Let' : language === 'it' ? 'Anni' : 'Years'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          {/* What You'll Learn Section */}
          <div className="max-w-5xl mx-auto mb-16">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-gray-100">
                <CardTitle className="text-2xl font-bold text-slate-800">
                  {language === 'cs' ? 'Co se v tomto průvodci dozvíte' :
                   language === 'it' ? 'Cosa imparerete in questa guida' :
                   'What You\'ll Learn in This Guide'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                  {language === 'cs' ? 'Získáte přehled o tom:' :
                   language === 'it' ? 'Otterrete una panoramica di:' :
                   'You will get an overview of:'}
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 leading-relaxed">
                      {language === 'cs' ? 'Jak probíhá koupě nemovitosti v Itálii od prvního zájmu až po podpis u notáře' :
                       language === 'it' ? 'Come funziona l\'acquisto di un immobile in Italia dal primo interesse fino alla firma dal notaio' :
                       'How the purchase of property in Italy works from the first interest to signing with the notary'}
                    </p>
                  </div>

                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 leading-relaxed">
                      {language === 'cs' ? 'Jaké jsou reálné náklady, daně a poplatky (nejen kupní cena)' :
                       language === 'it' ? 'Quali sono i costi reali, tasse e spese (non solo il prezzo di acquisto)' :
                       'What are the real costs, taxes and fees (not just the purchase price)'}
                    </p>
                  </div>

                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 leading-relaxed">
                      {language === 'cs' ? 'Jaká je skutečná role realitní kanceláře a notáře' :
                       language === 'it' ? 'Qual è il ruolo reale dell\'agenzia immobiliare e del notaio' :
                       'What is the actual role of the real estate agency and notary'}
                    </p>
                  </div>

                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 leading-relaxed">
                      {language === 'cs' ? 'Na co si dát pozor ještě před podpisem jakékoliv smlouvy' :
                       language === 'it' ? 'A cosa fare attenzione prima di firmare qualsiasi contratto' :
                       'What to watch out for before signing any contract'}
                    </p>
                  </div>

                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 leading-relaxed">
                      {language === 'cs' ? 'Jak se vyhnout nejčastějším chybám českých i zahraničních kupujících' :
                       language === 'it' ? 'Come evitare gli errori più comuni degli acquirenti cechi e stranieri' :
                       'How to avoid the most common mistakes of Czech and foreign buyers'}
                    </p>
                  </div>

                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 leading-relaxed">
                      {language === 'cs' ? 'Ve kterých regionech dává koupě domu největší smysl podle cíle a rozpočtu' :
                       language === 'it' ? 'In quali regioni l\'acquisto di una casa ha più senso in base all\'obiettivo e al budget' :
                       'In which regions buying a house makes the most sense according to goal and budget'}
                    </p>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-slate-700 leading-relaxed">
                    <strong>
                      {language === 'cs' ? 'Tento obsah je určen speciálně pro české zájemce o nemovitosti v Itálii' :
                       language === 'it' ? 'Questo contenuto è destinato specificamente agli interessati cechi agli immobili in Italia' :
                       'This content is specifically designed for Czech interested in Italian property'}
                    </strong>
                    {' '}
                    {language === 'cs' ? ', kteří chtějí mít jasno, přehled a rozhodovat se s klidem.' :
                     language === 'it' ? ', che vogliono avere chiarezza, panoramica e decidere con calma.' :
                     ', who want to have clarity, overview and decide with peace of mind.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Process Steps */}
          <div className="max-w-5xl mx-auto mb-16">
            <div className="space-y-8">
              {PROCESS_STEPS.map((step, index) => (
                <Card 
                  key={index} 
                  className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden"
                >
                  <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-gray-100">
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-2xl font-bold text-white">{step.number}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2">
                          <div>
                            <CardTitle className="text-xl md:text-2xl font-bold text-slate-800 mb-1">
                              {step.title[language]}
                            </CardTitle>
                            <p className="text-slate-600 font-medium">
                              {step.subtitle[language]}
                            </p>
                          </div>
                          <Badge className="bg-slate-100 text-slate-700 border-slate-200 px-3 py-1 mt-2 md:mt-0 w-fit">
                            <Clock className="h-3 w-3 mr-1" />
                            {step.duration[language]}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {step.description[language]}
                    </p>
                    
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                        <CheckSquare className="h-4 w-4 mr-2" />
                        {language === 'cs' ? 'Co je zahrnuto:' : language === 'it' ? 'Cosa include:' : 'What\'s Included:'}
                      </h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {step.includes.map((item, idx) => (
                          <li key={idx} className="flex items-start text-sm text-gray-700">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{item[language]}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Timeline Overview */}
          <div className="max-w-5xl mx-auto mb-16">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-slate-700 to-slate-800 text-white">
                <CardTitle className="text-2xl font-bold flex items-center">
                  <Calendar className="h-6 w-6 mr-3" />
                  {language === 'cs' ? 'Časový plán' : language === 'it' ? 'Cronologia' : 'Timeline Overview'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="text-4xl font-bold text-slate-800 mb-2">
                    {TIMELINE_OVERVIEW.total[language]}
                  </div>
                  <p className="text-gray-600">
                    {language === 'cs' ? 'Pro většinu koupí nemovitostí' : 
                     language === 'it' ? 'Per la maggior parte degli acquisti immobiliari' : 
                     'For most property purchases'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {TIMELINE_OVERVIEW.phases.map((phase, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-slate-700 font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-1">
                          {phase.name[language]}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {phase.duration[language]}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Costs Overview */}
          <div className="max-w-5xl mx-auto mb-16">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-gray-100">
                <CardTitle className="text-2xl font-bold text-slate-800 flex items-center">
                  <Euro className="h-6 w-6 mr-3" />
                  {language === 'cs' ? 'Přehled nákladů' : language === 'it' ? 'Panoramica costi' : 'Costs Overview'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {language === 'cs' ? 'Kromě kupní ceny nemovitosti, zde jsou typické dodatečné náklady spojené s koupí italské nemovitosti:' :
                   language === 'it' ? 'Oltre al prezzo di acquisto dell\'immobile, ecco i costi aggiuntivi tipici associati all\'acquisto di una proprietà italiana:' :
                   'In addition to the property purchase price, here are the typical additional costs associated with buying Italian property:'}
                </p>

                <div className="space-y-4">
                  {COSTS_OVERVIEW.map((cost, index) => (
                    <div key={index} className="flex flex-col md:flex-row md:items-start md:justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 gap-2 md:gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800 mb-1">
                          {cost.title[language]}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {cost.description[language]}
                        </p>
                      </div>
                      <div className="md:text-right md:ml-4">
                        <span className="font-bold text-lg text-slate-700">
                          {cost.amount[language]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-800">
                    <strong>
                      {language === 'cs' ? 'Poznámka:' : language === 'it' ? 'Nota:' : 'Note:'}
                    </strong>
                    {' '}
                    {language === 'cs' ? 'Skutečné náklady se mohou lišit v závislosti na hodnotě nemovitosti, umístění a specifických okolnostech. Poskytneme vám podrobný rozpis nákladů během konzultace.' :
                     language === 'it' ? 'I costi effettivi possono variare in base al valore dell\'immobile, alla posizione e alle circostanze specifiche. Vi forniremo un dettaglio completo dei costi durante la consulenza.' :
                     'Actual costs may vary based on property value, location, and specific circumstances. We\'ll provide you with a detailed cost breakdown during consultation.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <Card className="bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-2xl rounded-2xl overflow-hidden">
              <CardContent className="p-12">
                <Key className="h-16 w-16 mx-auto mb-6 opacity-90" />
                <h2 className="text-3xl font-bold mb-4">
                  {language === 'cs' ? 'Jak pokračovat dál?' :
                   language === 'it' ? 'Come continuare?' :
                   'How to Continue?'}
                </h2>
                <p className="text-slate-200 text-lg mb-8 leading-relaxed">
                  {language === 'cs' ? 'Podle vaší aktuální situace doporučujeme pokračovat jednou z těchto cest:' :
                   language === 'it' ? 'In base alla vostra situazione attuale, raccomandiamo di continuare con uno di questi percorsi:' :
                   'Based on your current situation, we recommend continuing with one of these paths:'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    size="lg" 
                    className="bg-white hover:bg-gray-100 text-slate-800 font-semibold px-6 py-6 text-sm transition-all duration-300 hover:scale-105 shadow-lg"
                    onClick={() => window.location.href = 'mailto:info@domyvitalii.cz'}
                  >
                    <Mail className="h-5 w-5 mr-2" />
                    {language === 'cs' ? 'info@domyvitalii.cz' :
                     language === 'it' ? 'info@domyvitalii.cz' :
                     'info@domyvitalii.cz'}
                  </Button>
                  <Link href="/regions">
                    <Button size="lg" className="bg-white hover:bg-gray-100 text-slate-800 font-semibold px-6 py-6 text-sm transition-all duration-300 hover:scale-105 shadow-lg w-full">
                      {language === 'cs' ? 'Regiony Itálie' :
                       language === 'it' ? 'Regioni d\'Italia' :
                       'Italian Regions'}
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button size="lg" className="bg-white hover:bg-gray-100 text-slate-800 font-semibold px-6 py-6 text-sm transition-all duration-300 hover:scale-105 shadow-lg w-full">
                      {language === 'cs' ? 'Kontaktujte nás' :
                       language === 'it' ? 'Contattateci' :
                       'Contact Us'}
                    </Button>
                  </Link>
                  <Link href="/properties">
                    <Button size="lg" className="bg-white hover:bg-gray-100 text-slate-800 font-semibold px-6 py-6 text-sm transition-all duration-300 hover:scale-105 shadow-lg w-full">
                      {language === 'cs' ? 'Procházet nemovitosti' :
                       language === 'it' ? 'Sfoglia proprietà' :
                       'Browse Properties'}
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking.com Section */}
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-12">
                <h3 className="text-2xl font-bold mb-4 text-slate-800">
                  {language === 'cs' ? 'Chcete poznat Itálii osobně ještě před koupí?' :
                   language === 'it' ? 'Volete conoscere l\'Italia di persona prima dell\'acquisto?' :
                   'Want to Experience Italy Personally Before Buying?'}
                </h3>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  {language === 'cs' ? 'Mnoho našich klientů si před finálním rozhodnutím vybírá region osobně – udělají si krátký pobyt, projdou okolí, porovnají lokality i styl života.' :
                   language === 'it' ? 'Molti dei nostri clienti prima della decisione finale scelgono la regione di persona - fanno un breve soggiorno, esplorano i dintorni, confrontano località e stile di vita.' :
                   'Many of our clients choose their region personally before the final decision - they take a short stay, explore the surroundings, compare locations and lifestyle.'}
                </p>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-105 shadow-lg w-full sm:w-auto"
                  onClick={() => window.open('https://www.dpbolvw.net/click-101629596-15735418', '_blank')}
                >
                  {language === 'cs' ? 'Najít ubytování v Itálii (Booking.com)' :
                   language === 'it' ? 'Trova alloggio in Italia (Booking.com)' :
                   'Find Accommodation in Italy (Booking.com)'}
                </Button>
                <Button 
                  variant="outline"
                  size="lg" 
                  className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                  onClick={() => window.open('https://gyg.me/O0X6ZC2R', '_blank')}
                >
                  {language === 'cs' ? 'Výlety a průvodce (GetYourGuide)' :
                   language === 'it' ? 'Escursioni e guide (GetYourGuide)' :
                   'Tours & Guides (GetYourGuide)'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer language={language} />
    </div>
  )
}