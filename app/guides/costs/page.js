'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Euro, FileText, Home, Calculator, CheckCircle, AlertTriangle, Menu, X, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import AuthModal from '../../../components/AuthModal'

export default function CostsGuidePage() {
  const [user, setUser] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [checkoutLoadingProduct, setCheckoutLoadingProduct] = useState('')
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
    if (!supabase) return
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

  const startPremiumCheckout = async (productKey, cancelPath) => {
    const target = '/premium?product=premium-domy'
    window.location.assign(target)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f4ed] via-amber-50/20 to-slate-50">
      {/* Navigation - Same as other pages */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md shadow-lg overflow-visible border-b border-white/20" style={{ backgroundColor: 'rgba(14, 21, 46, 0.9)' }}>
        <div className="container mx-auto px-4 pt-4 pb-3">
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
                className="hidden md:inline-flex items-center text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3 py-2 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {language === 'cs' ? 'Články' : language === 'it' ? 'Articoli' : 'Articles'}
              </Link>
              {/* Language Selector */}
              <div className="group flex items-center bg-white/10 backdrop-blur-md rounded-full px-3 py-2 shadow-lg border border-white/20">
                <button onClick={() => handleLanguageChange('en')} className={`px-3 py-1 rounded-full text-sm font-medium ${language === 'en' ? 'bg-white/20 text-white' : 'text-white/60'}`}>EN</button>
                <button onClick={() => handleLanguageChange('cs')} className={`px-3 py-1 rounded-full text-sm font-medium ${language === 'cs' ? 'bg-white/20 text-white' : 'text-white/60'}`}>CS</button>
                <button onClick={() => handleLanguageChange('it')} className={`px-3 py-1 rounded-full text-sm font-medium ${language === 'it' ? 'bg-white/20 text-white' : 'text-white/60'}`}>IT</button>
              </div>

              {user && (
                <Button variant="outline" onClick={handleLogout} className="bg-white/10 border-white/30 text-white">
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-28 pb-12">
        {/* Breadcrumbs */}
        <div className="container mx-auto px-4 mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-slate-700">{language === 'cs' ? 'Domů' : language === 'it' ? 'Casa' : 'Home'}</Link>
            <span>/</span>
            <Link href="/process" className="hover:text-slate-700">{language === 'cs' ? 'Průvodce' : language === 'it' ? 'Guida' : 'Guide'}</Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">
              {language === 'cs' ? 'Náklady' : language === 'it' ? 'Costi' : 'Costs'}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {language === 'cs' ? 'Kolik skutečně stojí koupě domu v Itálii v roce 2026' :
                 language === 'it' ? 'Quanto costa veramente acquistare una casa in Italia nel 2026' :
                 'How Much Does Buying a House in Italy Really Cost in 2026'}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                {language === 'cs' ? 'V článku se podíváme na reálné náklady, daně a poplatky, se kterými je nutné počítat ještě před podpisem smlouvy.' :
                 language === 'it' ? 'Nell\'articolo esamineremo i costi reali, le tasse e le spese che è necessario considerare prima di firmare il contratto.' :
                 'In this article, we\'ll look at the real costs, taxes, and fees that need to be considered before signing the contract.'}
              </p>
            </div>

            {/* Quick Overview Card */}
            <Card className="bg-green-50 border-green-200 mb-8">
              <CardContent className="p-6">
                <h3 className="font-bold text-green-900 mb-3 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  {language === 'cs' ? 'Rychlá orientace' :
                   language === 'it' ? 'Orientamento rapido' :
                   'Quick Overview'}
                </h3>
                <p className="text-green-800 leading-relaxed">
                  {language === 'cs' ? 'Tento článek vysvětluje reálné náklady koupě domu v Itálii – nejen cenu nemovitosti, ale i daně, notáře, poplatky a vedlejší výdaje. Pokud jste na začátku, doporučujeme začít také zde: Průvodce a zdroje ke koupi domu v Itálii.' :
                   language === 'it' ? 'Questo articolo spiega i costi reali dell\'acquisto di una casa in Italia - non solo il prezzo dell\'immobile, ma anche tasse, notaio, spese e costi accessori. Se siete all\'inizio, raccomandiamo di iniziare anche qui: Guida e risorse per l\'acquisto di una casa in Italia.' :
                   'This article explains the real costs of buying a house in Italy - not just the property price, but also taxes, notary, fees, and incidental expenses. If you\'re at the beginning, we also recommend starting here: Guide and resources for buying a house in Italy.'}
                </p>
              </CardContent>
            </Card>

            <p className="text-slate-800 leading-relaxed text-lg font-bold whitespace-pre-line mb-8">
              {language === 'cs' ? 'Mnoho kupujících vychází z „orientačního“ odhadu nákladů.\nProblém je, že v Itálii se částky výrazně mění\npodle právního stavu nemovitosti, regionu\na typu koupě.\n\nPrávě tady vznikají nepříjemná překvapení.' :
               language === 'it' ? 'Molti acquirenti partono da una stima “indicativa” dei costi.\nIl problema è che in Italia le cifre cambiano sensibilmente\nin base alla situazione giuridica dell’immobile, alla regione\ne al tipo di acquisto.\n\nÈ qui che nascono le sorprese.' :
               'Many buyers start from an “indicative” cost estimate.\nThe problem is that in Italy figures change significantly\nbased on the legal status of the property, the region,\nand the type of purchase.\n\nThis is where surprises are born.'}
            </p>

            {/* Main Content Sections */}
            <div className="space-y-8">
              {/* Section 1 */}
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {language === 'cs' ? 'Cena nemovitosti není konečná částka' :
                     language === 'it' ? 'Il prezzo dell\'immobile non è l\'importo finale' :
                     'Property Price Is Not the Final Amount'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {language === 'cs' ? 'Kupní cena domu nebo bytu je pouze začátek. Celkové náklady se skládají z několika položek, které se liší podle typu nemovitosti, regionu a způsobu koupě.' :
                     language === 'it' ? 'Il prezzo di acquisto di una casa o appartamento è solo l\'inizio. I costi totali sono composti da diversi elementi, che variano in base al tipo di proprietà, regione e modalità di acquisto.' :
                     'The purchase price of a house or apartment is just the beginning. Total costs consist of several items that vary according to property type, region, and purchase method.'}
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-3 whitespace-pre-line">
                    {language === 'cs' ? 'Dvě nemovitosti se stejnou kupní cenou mohou mít velmi odlišné konečné náklady.\n\nRozdíl nedělá samotná cena,\nale vše, co v inzerátu NENÍ vidět:' :
                     language === 'it' ? 'Due immobili con lo stesso prezzo di acquisto possono avere\ncosti finali molto diversi.\n\nLa differenza non la fa il prezzo,\nma tutto ciò che NON è visibile nell’annuncio:' :
                     'Two properties with the same purchase price can have\nvery different final costs.\n\nThe difference is not the price,\nbut everything that is NOT visible in the listing:'}
                  </p>
                  <ul className="space-y-1 ml-6 text-gray-700">
                    <li>• {language === 'cs' ? 'použitelný daňový režim' : language === 'it' ? 'regime fiscale applicabile' : 'applicable tax regime'}</li>
                    <li>• {language === 'cs' ? 'katastrální kategorie' : language === 'it' ? 'categoria catastale' : 'cadastral category'}</li>
                    <li>• {language === 'cs' ? 'první nebo druhé bydlení' : language === 'it' ? 'prima o seconda casa' : 'primary or second home'}</li>
                    <li>• {language === 'cs' ? 'původ nemovitosti' : language === 'it' ? 'provenienza dell’immobile' : 'property provenance'}</li>
                    <li>• {language === 'cs' ? 'přítomnost (nebo absence) souladu' : language === 'it' ? 'presenza (o assenza) di conformità' : 'presence (or absence) of compliance'}</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Cost Breakdown */}
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <Calculator className="h-6 w-6 mr-3" />
                    {language === 'cs' ? 'Nejčastější náklady při koupi domu v Itálii' :
                     language === 'it' ? 'Costi più comuni nell\'acquisto di una casa in Italia' :
                     'Most Common Costs When Buying a House in Italy'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-slate-800">
                          {language === 'cs' ? 'Daň z nabytí nemovitosti' :
                           language === 'it' ? 'Imposta di acquisto immobiliare' :
                           'Property Acquisition Tax'}
                        </h4>
                        <p className="text-gray-600">{language === 'cs' ? '2-10% hodnoty nemovitosti' : language === 'it' ? '2-10% del valore dell\'immobile' : '2-10% of property value'}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-slate-800">
                          {language === 'cs' ? 'Notářské poplatky' :
                           language === 'it' ? 'Spese notarili' :
                           'Notary Fees'}
                        </h4>
                        <p className="text-gray-600">{language === 'cs' ? '1-2,5% hodnoty nemovitosti' : language === 'it' ? '1-2,5% del valore dell\'immobile' : '1-2.5% of property value'}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-slate-800">
                          {language === 'cs' ? 'Poplatky realitní kanceláři' :
                           language === 'it' ? 'Commissioni agenzia immobiliare' :
                           'Real Estate Agency Fees'}
                        </h4>
                        <p className="text-gray-600">{language === 'cs' ? '3-4% hodnoty nemovitosti' : language === 'it' ? '3-4% del valore dell\'immobile' : '3-4% of property value'}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-slate-800">
                          {language === 'cs' ? 'Registrační a administrativní poplatky' :
                           language === 'it' ? 'Spese di registrazione e amministrative' :
                           'Registration and Administrative Fees'}
                        </h4>
                        <p className="text-gray-600">{language === 'cs' ? 'Cca €1 000-3 000' : language === 'it' ? 'Circa €1.000-3.000' : 'Approx €1,000-3,000'}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-slate-800">
                          {language === 'cs' ? 'Případné právní služby' :
                           language === 'it' ? 'Eventuali servizi legali' :
                           'Possible Legal Services'}
                        </h4>
                        <p className="text-gray-600">{language === 'cs' ? 'Podle potřeby' : language === 'it' ? 'A seconda delle necessità' : 'As needed'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="font-bold text-amber-900 mb-2">
                      {language === 'cs' ? '⚠️ Důležitá poznámka' :
                       language === 'it' ? '⚠️ Nota importante' :
                       '⚠️ Important Note'}
                    </p>
                    <p className="text-amber-900 leading-relaxed whitespace-pre-line">
                      {language === 'cs' ? 'Uvedená procenta jsou průměrné hodnoty.\nV praxi se skutečné náklady počítají případ od případu.\nBez předběžného ověření,\nmnoho kupujících zjistí konečnou částku\naž když je pozdě se vrátit zpět.' :
                       language === 'it' ? 'Le percentuali indicate sono valori medi.\nNella pratica, il costo reale viene calcolato caso per caso.\nSenza una verifica preventiva,\nmolti acquirenti scoprono l’importo finale\nsolo quando è troppo tardi per tornare indietro.' :
                       'The percentages shown are average values.\nIn practice, the real cost is calculated case by case.\nWithout prior verification,\nmany buyers discover the final amount\nonly when it is too late to go back.'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-gray-100">
                  <CardTitle className="text-2xl font-bold text-slate-800 flex items-center">
                    <Euro className="h-6 w-6 mr-3" />
                    {language === 'cs' ? 'Přehled nákladů' :
                     language === 'it' ? 'Panoramica costi' :
                     'Costs Overview'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {language === 'cs' ? 'Kromě kupní ceny nemovitosti, zde jsou typické dodatečné náklady spojené s koupí italské nemovitosti:' :
                     language === 'it' ? 'Oltre al prezzo di acquisto dell\'immobile, ecco i costi aggiuntivi tipici associati all\'acquisto di una proprietà italiana:' :
                     'In addition to the property purchase price, here are the typical additional costs associated with buying Italian property:'}
                  </p>

                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 gap-2 md:gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800 mb-1">
                          {language === 'cs' ? 'Daň z nabytí – první nemovitost + trvalý pobyt' :
                           language === 'it' ? 'Imposta di acquisto – prima casa + residenza' :
                           'Purchase Tax – First Property + Residency'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {language === 'cs' ? 'Platí při koupi první nemovitosti v Itálii a zřízení trvalého pobytu' :
                           language === 'it' ? 'Si applica all\'acquisto della prima proprietà in Italia e stabilimento della residenza permanente' :
                           'Applies when buying your first property in Italy and establishing permanent residence'}
                        </p>
                      </div>
                      <div className="md:text-right md:ml-4">
                        <span className="font-bold text-lg text-slate-700">
                          {language === 'cs' ? '2 % z katastrální hodnoty' :
                           language === 'it' ? '2% del valore catastale' :
                           '2% of cadastral value'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 gap-2 md:gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800 mb-1">
                          {language === 'cs' ? 'Daň z nabytí – bez trvalého pobytu' :
                           language === 'it' ? 'Imposta di acquisto – senza residenza' :
                           'Purchase Tax – Non-Residence'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {language === 'cs' ? 'Platí, pokud se v Itálii nebude jednat o trvalé bydliště (většina českých kupujících)' :
                           language === 'it' ? 'Si applica quando l\'Italia non sarà la vostra residenza permanente (la maggior parte degli acquirenti cechi)' :
                           'Applies when Italy will not be your permanent residence (most Czech buyers)'}
                        </p>
                      </div>
                      <div className="md:text-right md:ml-4">
                        <span className="font-bold text-lg text-slate-700">
                          {language === 'cs' ? '9 % z katastrální hodnoty' :
                           language === 'it' ? '9% del valore catastale' :
                           '9% of cadastral value'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 gap-2 md:gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800 mb-1">
                          {language === 'cs' ? 'DPH (nové/zrekonstruované nemovitosti)' :
                           language === 'it' ? 'IVA (immobili nuovi/ristrutturati)' :
                           'VAT (New/Renovated Properties)'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {language === 'cs' ? 'Platí u nových nebo nově zrekonstruovaných nemovitostí (nahrazuje daň z nabytí)' :
                           language === 'it' ? 'Si applica a immobili nuovi o ristrutturati di recente (sostituisce l\'imposta di acquisto)' :
                           'Applies to new or recently renovated properties (replaces purchase tax in these cases)'}
                        </p>
                      </div>
                      <div className="md:text-right md:ml-4">
                        <span className="font-bold text-lg text-slate-700">
                          {language === 'cs' ? '10 % (nebo 4 % při trvalém pobytu)' :
                           language === 'it' ? '10% (o 4% con residenza)' :
                           '10% (or 4% with residency)'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 gap-2 md:gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800 mb-1">
                          {language === 'cs' ? 'Notářské poplatky' :
                           language === 'it' ? 'Spese notarili' :
                           'Notary Fees'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {language === 'cs' ? 'Stanoveny zákonem (notářský dekret). Zahrnuje přípravu smlouvy, výběr daní a dohled nad převodem' :
                           language === 'it' ? 'Stabilite per legge (decreto notarile). Include preparazione atto, riscossione tasse e supervisione trasferimento' :
                           'Set by law (notary decree). Includes deed preparation, tax collection, and property transfer oversight'}
                        </p>
                      </div>
                      <div className="md:text-right md:ml-4">
                        <span className="font-bold text-lg text-slate-700">
                          {language === 'cs' ? '1–2,5 % hodnoty nemovitosti' :
                           language === 'it' ? '1-2,5% valore immobile' :
                           '1-2.5% of property value'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 gap-2 md:gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800 mb-1">
                          {language === 'cs' ? 'Další náklady' :
                           language === 'it' ? 'Costi aggiuntivi' :
                           'Additional Costs'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {language === 'cs' ? 'Překlady, tlumočení u notáře, technické kontroly, zápis do katastru nemovitostí' :
                           language === 'it' ? 'Traduzioni, interpretariato dal notaio, ispezioni tecniche, registrazione catastale' :
                           'Translations, interpretation at notary, technical inspections, land registry registration'}
                        </p>
                      </div>
                      <div className="md:text-right md:ml-4">
                        <span className="font-bold text-lg text-slate-700">
                          {language === 'cs' ? '€1 000-3 000+' :
                           language === 'it' ? '€1.000-3.000+' :
                           '€1,000-3,000+'}
                        </span>
                      </div>
                    </div>
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

              {/* Summary Card */}
              <Card className="bg-gradient-to-br from-slate-700 to-slate-800 text-white">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">
                    {language === 'cs' ? 'Kolik si připravit navíc?' :
                     language === 'it' ? 'Quanto preparare in più?' :
                     'How Much Extra to Prepare?'}
                  </h3>
                  <p className="text-slate-200 text-lg leading-relaxed mb-4">
                    {language === 'cs' ? 'Obecně lze říci, že kromě ceny nemovitosti je rozumné počítat s rezervou přibližně 10–15 % z kupní ceny.' :
                     language === 'it' ? 'In generale, oltre al prezzo dell\'immobile è ragionevole prevedere una riserva di circa il 10-15% del prezzo di acquisto.' :
                     'Generally speaking, in addition to the property price, it\'s reasonable to budget for a reserve of approximately 10-15% of the purchase price.'}
                  </p>
                  <p className="text-slate-200 leading-relaxed">
                    {language === 'cs' ? 'Každý případ je však individuální a přesná částka se může lišit.' :
                     language === 'it' ? 'Tuttavia, ogni caso è individuale e l\'importo esatto può variare.' :
                     'However, each case is individual and the exact amount may vary.'}
                  </p>
                  <p className="text-slate-200 leading-relaxed mt-4 whitespace-pre-line">
                    {language === 'cs' ? 'Tato rezerva neslouží jen k pokrytí „extra“ výdajů,\nale k řešení nečekaných situací typických pro italský systém,\nnapříklad:' :
                     language === 'it' ? 'Questa riserva non serve solo a coprire spese “extra”,\nma a gestire imprevisti tipici del sistema italiano,\ncome:' :
                     'This reserve is not only to cover “extra” expenses,\nbut to manage issues typical of the Italian system,\nsuch as:'}
                  </p>
                  <ul className="space-y-2 mt-3 text-slate-200">
                    <li>• {language === 'cs' ? 'doplnění či úpravy dokumentace' : language === 'it' ? 'adeguamenti documentali' : 'document adjustments'}</li>
                    <li>• {language === 'cs' ? 'technické náklady zjištěné po podání nabídky' : language === 'it' ? 'costi tecnici emersi dopo la proposta' : 'technical costs emerging after the offer'}</li>
                    <li>• {language === 'cs' ? 'rozdíly mezi počátečním odhadem a reálnými náklady' : language === 'it' ? 'differenze tra stima iniziale e costi reali' : 'differences between the initial estimate and real costs'}</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <p className="text-blue-900 font-semibold text-lg leading-relaxed whitespace-pre-line mb-4">
                    {language === 'cs' ? '📘 Chcete vědět, kolik opravdu stojí VAŠE koupě?\n\nPřipravili jsme podrobného průvodce reálnými náklady\nna koupi domu v Itálii,\ns praktickými příklady a konkrétními scénáři.' :
                     language === 'it' ? '📘 Vuoi sapere quanto costa davvero il TUO acquisto?\n\nAbbiamo preparato un documento dettagliato sui costi reali\ndell’acquisto di una casa in Italia,\ncon esempi pratici e scenari concreti.' :
                     '📘 Want to know how much YOUR purchase really costs?\n\nWe prepared a detailed guide to the real costs\nof buying a house in Italy,\nwith practical examples and concrete scenarios.'}
                  </p>
                  <Button
                    className="bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 text-amber-950 hover:from-amber-200 hover:via-yellow-200 hover:to-amber-300 border border-amber-200/70 shadow-sm"
                    onClick={() => startPremiumCheckout('premium-domy', '/guides/costs')}
                    disabled={checkoutLoadingProduct === 'premium-domy'}
                  >
                    {checkoutLoadingProduct === 'premium-domy'
                      ? (language === 'cs' ? 'Načítání...' : language === 'it' ? 'Caricamento...' : 'Loading...')
                      : (language === 'cs' ? 'Reálné náklady koupě v Itálii' :
                         language === 'it' ? 'Costi reali di acquisto in Italia' :
                         'Real Purchase Costs in Italy')}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-l-4 border-l-amber-500">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {language === 'cs' ? 'Proč je odhad nákladů ze zahraničí obtížný' :
                     language === 'it' ? 'Perché stimare i costi dall\'estero è difficile' :
                     'Why Estimating Costs from Abroad Is Difficult'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {language === 'cs' ? 'Kupující ze zahraničí často vycházejí z tabulek a procent.\nV Itálii to ale nestačí.\n\nKaždý nákup je samostatný případ.\nBez kompletního posouzení kontextu\nnehrozí jen to, že utratíte „o něco víc“,\nale že se úplně spletete v počátečním odhadu.' :
                     language === 'it' ? 'Chi acquista dall’estero spesso parte da tabelle e percentuali.\nIn Italia, però, queste non bastano.\n\nOgni acquisto è un caso a sé.\nSenza una lettura completa del contesto,\nil rischio non è spendere “un po’ di più”,\nma sbagliare completamente la valutazione iniziale.' :
                     'Buyers purchasing from abroad often start from tables and percentages.\nIn Italy, however, these are not enough.\n\nEvery purchase is a case on its own.\nWithout a complete reading of the context,\nthe risk is not spending “a little more”,\nbut getting the initial evaluation completely wrong.'}
                  </p>
                </CardContent>
              </Card>

              {/* How to Avoid Surprises */}
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {language === 'cs' ? 'Jak se vyhnout nepříjemným překvapením' :
                     language === 'it' ? 'Come evitare spiacevoli sorprese' :
                     'How to Avoid Unpleasant Surprises'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {language === 'cs' ? 'Nejlepší cestou je mít:' :
                     language === 'it' ? 'Il modo migliore è avere:' :
                     'The best way is to have:'}
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        {language === 'cs' ? 'Přehled o celém procesu koupě' :
                         language === 'it' ? 'Panoramica dell\'intero processo di acquisto' :
                         'Overview of the entire purchase process'}
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        {language === 'cs' ? 'Jasno v reálných nákladech' :
                         language === 'it' ? 'Chiarezza sui costi reali' :
                         'Clarity on real costs'}
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        {language === 'cs' ? 'Podporu někoho, kdo zná italské prostředí' :
                         language === 'it' ? 'Supporto di qualcuno che conosce l\'ambiente italiano' :
                         'Support from someone who knows the Italian environment'}
                      </span>
                    </li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    {language === 'cs' ? 'Díky tomu se vyhnete chybám, zbytečným výdajům a stresu.' :
                     language === 'it' ? 'Grazie a questo eviterete errori, spese inutili e stress.' :
                     'Thanks to this, you will avoid mistakes, unnecessary expenses, and stress.'}
                  </p>
                </CardContent>
              </Card>

            </div>

            {/* Navigation Footer */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/process">
                <Button variant="outline" size="lg" className="w-full">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  {language === 'cs' ? 'Zpět na průvodce' :
                   language === 'it' ? 'Torna alla guida' :
                   'Back to Guide'}
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white">
                  {language === 'cs' ? 'Kontaktujte nás' :
                   language === 'it' ? 'Contattateci' :
                   'Contact Us'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}
