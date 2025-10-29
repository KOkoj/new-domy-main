'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  FileSearch, 
  Home, 
  CheckCircle, 
  Calendar,
  Users,
  Shield,
  FileText,
  MapPin,
  Heart,
  Key,
  Briefcase,
  Clock,
  CheckSquare,
  Menu,
  X,
  User,
  ChevronRight,
  Euro,
  Building,
  Landmark,
  Video,
  Phone,
  Mail
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import AuthModal from '../../components/AuthModal'

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
    title: { en: 'Purchase Tax', cs: 'Daň z nabytí', it: 'Imposta di acquisto' },
    amount: { en: '2-10% of property value', cs: '2-10% hodnoty nemovitosti', it: '2-10% valore immobile' },
    description: { 
      en: 'Varies based on property type and buyer status',
      cs: 'Liší se podle typu nemovitosti a statusu kupujícího',
      it: 'Varia in base al tipo di proprietà e stato acquirente'
    }
  },
  {
    title: { en: 'Notary Fees', cs: 'Notářské poplatky', it: 'Spese notarili' },
    amount: { en: '1-2.5% of property value', cs: '1-2,5% hodnoty nemovitosti', it: '1-2,5% valore immobile' },
    description: { 
      en: 'Legal fees for deed preparation and registration',
      cs: 'Právní poplatky za přípravu a registraci aktu',
      it: 'Spese legali per preparazione e registrazione atto'
    }
  },
  {
    title: { en: 'Agency Commission', cs: 'Provize agentury', it: 'Commissione agenzia' },
    amount: { en: '3% of property value', cs: '3% hodnoty nemovitosti', it: '3% valore immobile' },
    description: { 
      en: 'Our service fee for complete assistance',
      cs: 'Náš poplatek za služby pro kompletní pomoc',
      it: 'Il nostro compenso per assistenza completa'
    }
  },
  {
    title: { en: 'Additional Costs', cs: 'Další náklady', it: 'Costi aggiuntivi' },
    amount: { en: '€1,000-3,000', cs: '1 000-3 000 €', it: '€1.000-3.000' },
    description: { 
      en: 'Surveys, translations, registrations',
      cs: 'Průzkumy, překlady, registrace',
      it: 'Rilievi, traduzioni, registrazioni'
    }
  }
]

export default function ProcessPage() {
  const [user, setUser] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [language, setLanguage] = useState('en')
  const [expandedStep, setExpandedStep] = useState(null)

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
    }
  }, [])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
    }
  }

  const handleAuthSuccess = (user) => {
    setUser(user)
    setIsAuthModalOpen(false)
  }

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)
    document.documentElement.lang = newLanguage
    localStorage.setItem('preferred-language', newLanguage)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f4ed] via-amber-50/20 to-slate-50 home-page-custom-border">
      {/* Modern Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md shadow-lg overflow-visible border-b border-white/20" style={{ backgroundColor: 'rgba(14, 21, 46, 0.9)' }}>
        <div className="container mx-auto px-4 pt-4 pb-3 overflow-visible">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="relative overflow-visible">
                <img 
                  src="/logo domy.svg" 
                  alt="Domy v Itálii"
                  className="h-12 w-auto cursor-pointer" 
                  style={{ filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4))' }}
                />
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/" className="text-gray-200 hover:text-copper-400 transition-colors">
                  {language === 'cs' ? 'Domů' : language === 'it' ? 'Casa' : 'Home'}
                </Link>
                <Link href="/properties" className="text-gray-200 hover:text-copper-400 transition-colors">
                  {language === 'cs' ? 'Nemovitosti' : language === 'it' ? 'Proprietà' : 'Properties'}
                </Link>
                <Link href="/regions" className="text-gray-200 hover:text-copper-400 transition-colors">
                  {language === 'cs' ? 'Regiony' : language === 'it' ? 'Regioni' : 'Regions'}
                </Link>
                <Link href="/about" className="text-gray-200 hover:text-copper-400 transition-colors">
                  {language === 'cs' ? 'O nás' : language === 'it' ? 'Chi siamo' : 'About'}
                </Link>
                <Link href="/process" className="text-gray-200 hover:text-copper-400 transition-colors border-b-2 border-white pb-1">
                  {language === 'cs' ? 'Proces' : language === 'it' ? 'Processo' : 'Process'}
                </Link>
                <Link href="/contact" className="text-gray-200 hover:text-copper-400 transition-colors">
                  {language === 'cs' ? 'Kontakt' : language === 'it' ? 'Contatto' : 'Contact'}
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="group flex items-center bg-white/10 backdrop-blur-md rounded-full px-3 py-2 shadow-lg border border-white/20 transition-all duration-300 hover:shadow-xl hover:bg-white/20 hover:px-6 w-auto gap-2">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                    language === 'en' 
                      ? 'bg-white/20 text-white shadow-md backdrop-blur-sm' 
                      : 'text-white/60 hover:text-white/90 hover:bg-white/5 opacity-0 group-hover:opacity-100 absolute group-hover:relative group-hover:mx-1'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => handleLanguageChange('cs')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                    language === 'cs' 
                      ? 'bg-white/20 text-white shadow-md backdrop-blur-sm' 
                      : 'text-white/60 hover:text-white/90 hover:bg-white/5 opacity-0 group-hover:opacity-100 absolute group-hover:relative group-hover:mx-1'
                  }`}
                >
                  CS
                </button>
                <button
                  onClick={() => handleLanguageChange('it')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                    language === 'it' 
                      ? 'bg-white/20 text-white shadow-md backdrop-blur-sm' 
                      : 'text-white/60 hover:text-white/90 hover:bg-white/5 opacity-0 group-hover:opacity-100 absolute group-hover:relative group-hover:mx-1'
                  }`}
                >
                  IT
                </button>
              </div>

              {/* User Authentication */}
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-200" />
                    <span className="text-sm text-gray-200">
                      {user.user_metadata?.name || user.email}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleLogout} 
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-200 rounded-full px-6 py-4 text-sm font-medium"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-white/20 transition-all duration-300 hover:shadow-xl hover:bg-white/20">
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="text-sm font-medium text-white/90 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full px-2 py-1 hover:bg-white/5"
                  >
                    {language === 'cs' ? 'Přihlásit' : (language === 'it' ? 'Accedi' : 'Login')}
                  </button>
                  <span className="text-white/40 mx-1">/</span>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="text-sm font-medium text-white/90 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full px-2 py-1 hover:bg-white/5"
                  >
                    {language === 'cs' ? 'Registrovat' : (language === 'it' ? 'Registrati' : 'Register')}
                  </button>
                </div>
              )}
              
              {/* Mobile menu button */}
              <button
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6 text-gray-200" /> : <Menu className="h-6 w-6 text-gray-200" />}
              </button>
            </div>
          </div>
          
          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-[#0e152e]">
              <div className="flex flex-col space-y-4">
                <Link 
                  href="/properties" 
                  className="text-gray-200 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {language === 'cs' ? 'Nemovitosti' : language === 'it' ? 'Proprietà' : 'Properties'}
                </Link>
                <Link 
                  href="/regions" 
                  className="text-gray-200 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {language === 'cs' ? 'Regiony' : language === 'it' ? 'Regioni' : 'Regions'}
                </Link>
                <Link 
                  href="/about" 
                  className="text-gray-200 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {language === 'cs' ? 'O nás' : language === 'it' ? 'Chi siamo' : 'About'}
                </Link>
                <Link 
                  href="/process" 
                  className="text-gray-200 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {language === 'cs' ? 'Proces' : language === 'it' ? 'Processo' : 'Process'}
                </Link>
                <Link 
                  href="/contact" 
                  className="text-gray-200 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {language === 'cs' ? 'Kontakt' : language === 'it' ? 'Contatto' : 'Contact'}
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="pt-28 pb-12">
        {/* Hero Section */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm mb-12">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {language === 'cs' ? 'Náš proces' :
                 language === 'it' ? 'Il nostro processo' :
                 'Our Process'}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                {language === 'cs' ? 'Od první konzultace po předání klíčů - transparentní, profesionální cesta k vaší italské nemovitosti.' :
                 language === 'it' ? 'Dalla prima consulenza alla consegna delle chiavi - un percorso trasparente e professionale verso la tua proprietà italiana.' :
                 'From first consultation to keys in hand - a transparent, professional journey to your Italian property.'}
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
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
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <CardTitle className="text-2xl font-bold text-slate-800 mb-1">
                              {step.title[language]}
                            </CardTitle>
                            <p className="text-slate-600 font-medium">
                              {step.subtitle[language]}
                            </p>
                          </div>
                          <Badge className="bg-slate-100 text-slate-700 border-slate-200 px-3 py-1">
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
                    <div key={index} className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800 mb-1">
                          {cost.title[language]}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {cost.description[language]}
                        </p>
                      </div>
                      <div className="text-right ml-4">
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
          <div className="max-w-4xl mx-auto text-center">
            <Card className="bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-2xl rounded-2xl overflow-hidden">
              <CardContent className="p-12">
                <Key className="h-16 w-16 mx-auto mb-6 opacity-90" />
                <h2 className="text-3xl font-bold mb-4">
                  {language === 'cs' ? 'Připraveni začít svou cestu?' :
                   language === 'it' ? 'Pronti a iniziare il vostro viaggio?' :
                   'Ready to Start Your Journey?'}
                </h2>
                <p className="text-slate-200 text-lg mb-8 leading-relaxed">
                  {language === 'cs' ? 'Kontaktujte nás ještě dnes pro bezplatnou konzultaci a pojďme najít vaši dokonalou italskou nemovitost.' :
                   language === 'it' ? 'Contattateci oggi per una consulenza gratuita e troviamo insieme la vostra proprietà italiana perfetta.' :
                   'Contact us today for a free consultation and let\'s find your perfect Italian property together.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/contact">
                    <Button size="lg" className="text-white font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-105 shadow-lg" style={{ background: 'linear-gradient(to right, rgba(199, 137, 91), rgb(153, 105, 69))' }}>
                      <Phone className="h-5 w-5 mr-2" />
                      {language === 'cs' ? 'Naplánovat konzultaci' :
                       language === 'it' ? 'Pianifica consultazione' :
                       'Schedule Consultation'}
                    </Button>
                  </Link>
                  <Link href="/properties">
                    <Button size="lg" className="bg-white hover:bg-gray-100 text-slate-800 font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-105 shadow-lg">
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
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}

