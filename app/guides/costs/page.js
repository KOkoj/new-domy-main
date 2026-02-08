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
            <Card className="bg-blue-50 border-blue-200 mb-8">
              <CardContent className="p-6">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  {language === 'cs' ? 'Rychlá orientace' :
                   language === 'it' ? 'Orientamento rapido' :
                   'Quick Overview'}
                </h3>
                <p className="text-blue-800 leading-relaxed">
                  {language === 'cs' ? 'Tento článek vysvětluje reálné náklady koupě domu v Itálii – nejen cenu nemovitosti, ale i daně, notáře, poplatky a vedlejší výdaje. Pokud jste na začátku, doporučujeme začít také zde: Průvodce a zdroje ke koupi domu v Itálii.' :
                   language === 'it' ? 'Questo articolo spiega i costi reali dell\'acquisto di una casa in Italia - non solo il prezzo dell\'immobile, ma anche tasse, notaio, spese e costi accessori. Se siete all\'inizio, raccomandiamo di iniziare anche qui: Guida e risorse per l\'acquisto di una casa in Italia.' :
                   'This article explains the real costs of buying a house in Italy - not just the property price, but also taxes, notary, fees, and incidental expenses. If you\'re at the beginning, we also recommend starting here: Guide and resources for buying a house in Italy.'}
                </p>
              </CardContent>
            </Card>

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
