'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Clock, Calendar, AlertCircle, TrendingUp, FileCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import AuthModal from '../../../components/AuthModal'

export default function TimelineGuidePage() {
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

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)
    document.documentElement.lang = newLanguage
    localStorage.setItem('preferred-language', newLanguage)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f4ed] via-amber-50/20 to-slate-50">
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
        <div className="container mx-auto px-4 mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-slate-700">{language === 'cs' ? 'Domů' : language === 'it' ? 'Casa' : 'Home'}</Link>
            <span>/</span>
            <Link href="/process" className="hover:text-slate-700">{language === 'cs' ? 'Průvodce' : language === 'it' ? 'Guida' : 'Guide'}</Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">
              {language === 'cs' ? 'Časová náročnost' : language === 'it' ? 'Tempistiche' : 'Timeline'}
            </span>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {language === 'cs' ? 'Jak dlouho trvá koupě domu v Itálii a co celý proces nejčastěji zdržuje' :
                 language === 'it' ? 'Quanto tempo ci vuole per acquistare una casa in Italia e cosa ritarda più spesso l\'intero processo' :
                 'How Long Does It Take to Buy a House in Italy and What Most Often Delays the Whole Process'}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                {language === 'cs' ? 'Jednou z nejčastějších otázek českých zájemců o koupi domu v Itálii je, jak dlouho celý proces skutečně trvá a co jej může zbytečně prodloužit.' :
                 language === 'it' ? 'Una delle domande più frequenti degli interessati cechi all\'acquisto di una casa in Italia è quanto tempo ci vuole veramente per l\'intero processo e cosa può prolungarlo inutilmente.' :
                 'One of the most frequent questions from Czech interested in buying a house in Italy is how long the whole process really takes and what can unnecessarily prolong it.'}
              </p>
            </div>

            <Card className="bg-blue-50 border-blue-200 mb-8">
              <CardContent className="p-6">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {language === 'cs' ? 'Důležitá poznámka' :
                   language === 'it' ? 'Nota importante' :
                   'Important Note'}
                </h3>
                <p className="text-blue-800 leading-relaxed">
                  {language === 'cs' ? 'Právě neznalost jednotlivých kroků často vede ke stresu, špatným rozhodnutím a zbytečným zdržení. Na rozdíl od České republiky má koupě nemovitosti v Itálii svá specifika a časový průběh se může výrazně lišit podle typu nemovitosti, regionu a připravenosti kupujícího.' :
                   language === 'it' ? 'Proprio la mancanza di conoscenza dei singoli passaggi spesso porta a stress, decisioni sbagliate e ritardi inutili. A differenza della Repubblica Ceca, l\'acquisto di un immobile in Italia ha le sue specificità e il decorso temporale può variare notevolmente in base al tipo di proprietà, regione e preparazione dell\'acquirente.' :
                   'Precisely the lack of knowledge of individual steps often leads to stress, bad decisions, and unnecessary delays. Unlike the Czech Republic, buying property in Italy has its specifics and the time course can vary significantly depending on the type of property, region, and buyer\'s preparation.'}
                </p>
              </CardContent>
            </Card>

            <div className="space-y-8">
              {/* Typical Duration */}
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <Clock className="h-6 w-6 mr-3" />
                    {language === 'cs' ? 'Jak dlouho koupě domu v Itálii obvykle trvá' :
                     language === 'it' ? 'Quanto tempo ci vuole di solito per acquistare una casa in Italia' :
                     'How Long Does Buying a House in Italy Usually Take'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {language === 'cs' ? 'Ve většině případů trvá proces koupě několik měsíců od prvního výběru nemovitosti až po podpis kupní smlouvy u notáře.' :
                     language === 'it' ? 'Nella maggior parte dei casi, il processo di acquisto richiede diversi mesi dalla prima selezione della proprietà fino alla firma del contratto di acquisto dal notaio.' :
                     'In most cases, the purchase process takes several months from the first property selection to signing the purchase contract with the notary.'}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                      <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="font-bold text-green-900 text-lg mb-1">2-4 {language === 'cs' ? 'měsíce' : language === 'it' ? 'mesi' : 'months'}</p>
                      <p className="text-green-800 text-sm">{language === 'cs' ? 'Rychlý proces' : language === 'it' ? 'Processo rapido' : 'Fast process'}</p>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                      <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="font-bold text-blue-900 text-lg mb-1">4-8 {language === 'cs' ? 'měsíců' : language === 'it' ? 'mesi' : 'months'}</p>
                      <p className="text-blue-800 text-sm">{language === 'cs' ? 'Běžná délka' : language === 'it' ? 'Durata normale' : 'Normal duration'}</p>
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
                      <Calendar className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                      <p className="font-bold text-amber-900 text-lg mb-1">8+ {language === 'cs' ? 'měsíců' : language === 'it' ? 'mesi' : 'months'}</p>
                      <p className="text-amber-800 text-sm">{language === 'cs' ? 'Složitější případy' : language === 'it' ? 'Casi più complessi' : 'More complex cases'}</p>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mt-6 italic">
                    {language === 'cs' ? 'U některých nemovitostí může být proces rychlejší, u jiných naopak delší – zejména u starších domů nebo objektů vyžadujících dodatečné prověření.' :
                     language === 'it' ? 'Per alcune proprietà il processo può essere più veloce, per altre più lungo – soprattutto per case più vecchie o edifici che richiedono ulteriori verifiche.' :
                     'For some properties the process can be faster, for others longer – especially for older houses or buildings requiring additional verification.'}
                  </p>
                </CardContent>
              </Card>

              {/* Common Delays */}
              <Card className="bg-white/90 backdrop-blur-sm border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center text-red-900">
                    <AlertCircle className="h-6 w-6 mr-3" />
                    {language === 'cs' ? 'Co celý proces nejčastěji zdržuje' :
                     language === 'it' ? 'Cosa ritarda più spesso l\'intero processo' :
                     'What Most Often Delays the Whole Process'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {language === 'cs' ? 'Mezi nejběžnější faktory patří:' :
                     language === 'it' ? 'I fattori più comuni includono:' :
                     'The most common factors include:'}
                  </p>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 border-l-4 border-l-red-400 rounded">
                      <p className="font-semibold text-red-900 mb-2">
                        {language === 'cs' ? 'Neúplná nebo neaktuální dokumentace nemovitosti' :
                         language === 'it' ? 'Documentazione della proprietà incompleta o non aggiornata' :
                         'Incomplete or outdated property documentation'}
                      </p>
                      <p className="text-gray-700 text-sm">
                        {language === 'cs' ? 'Chybějící povolení, nesrovnalosti v katastru' :
                         language === 'it' ? 'Permessi mancanti, discrepanze nel catasto' :
                         'Missing permits, cadastral discrepancies'}
                      </p>
                    </div>

                    <div className="p-4 bg-orange-50 border-l-4 border-l-orange-400 rounded">
                      <p className="font-semibold text-orange-900 mb-2">
                        {language === 'cs' ? 'Nutnost technických nebo právních kontrol' :
                         language === 'it' ? 'Necessità di controlli tecnici o legali' :
                         'Need for technical or legal checks'}
                      </p>
                      <p className="text-gray-700 text-sm">
                        {language === 'cs' ? 'Dodatečné prověření stavu nebo vlastnických práv' :
                         language === 'it' ? 'Ulteriore verifica dello stato o dei diritti di proprietà' :
                         'Additional verification of condition or property rights'}
                      </p>
                    </div>

                    <div className="p-4 bg-yellow-50 border-l-4 border-l-yellow-400 rounded">
                      <p className="font-semibold text-yellow-900 mb-2">
                        {language === 'cs' ? 'Zdlouhavá komunikace mezi jednotlivými stranami' :
                         language === 'it' ? 'Comunicazione prolungata tra le singole parti' :
                         'Prolonged communication between individual parties'}
                      </p>
                      <p className="text-gray-700 text-sm">
                        {language === 'cs' ? 'Jazyková bariéra, časové zóny, různé systémy' :
                         language === 'it' ? 'Barriera linguistica, fusi orari, sistemi diversi' :
                         'Language barrier, time zones, different systems'}
                      </p>
                    </div>

                    <div className="p-4 bg-amber-50 border-l-4 border-l-amber-400 rounded">
                      <p className="font-semibold text-amber-900 mb-2">
                        {language === 'cs' ? 'Nejasný rozpočet nebo nepřipravenost kupujícího' :
                         language === 'it' ? 'Budget poco chiaro o mancanza di preparazione dell\'acquirente' :
                         'Unclear budget or buyer unpreparedness'}
                      </p>
                      <p className="text-gray-700 text-sm">
                        {language === 'cs' ? 'Nedostatek informací o celkových nákladech a procesu' :
                         language === 'it' ? 'Mancanza di informazioni sui costi totali e sul processo' :
                         'Lack of information about total costs and process'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Regional Differences */}
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <TrendingUp className="h-6 w-6 mr-3" />
                    {language === 'cs' ? 'Rozdíly podle regionu' :
                     language === 'it' ? 'Differenze per regione' :
                     'Differences by Region'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {language === 'cs' ? 'Délka procesu se může lišit také podle regionu. V některých oblastech probíhá koupě rychleji, jinde je potřeba počítat s delší administrativou.' :
                     language === 'it' ? 'La durata del processo può variare anche in base alla regione. In alcune aree l\'acquisto procede più velocemente, in altre è necessario considerare una amministrazione più lunga.' :
                     'The length of the process may also vary by region. In some areas the purchase proceeds faster, in others longer administration needs to be considered.'}
                  </p>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-slate-800 leading-relaxed">
                      {language === 'cs' ? 'Administrativní postupy se v Itálii liší region od regionu. To, co je v jedné oblasti standardní, může být jinde komplikovanější.' :
                       language === 'it' ? 'Le procedure amministrative in Italia variano da regione a regione. Ciò che è standard in un\'area può essere più complicato altrove.' :
                       'Administrative procedures in Italy vary from region to region. What is standard in one area may be more complicated elsewhere.'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* How to Prepare */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center text-green-900">
                    <FileCheck className="h-6 w-6 mr-3" />
                    {language === 'cs' ? 'Jak se na proces správně připravit' :
                     language === 'it' ? 'Come prepararsi correttamente al processo' :
                     'How to Properly Prepare for the Process'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-900 font-semibold mb-4">
                    {language === 'cs' ? 'Základem je:' :
                     language === 'it' ? 'La base è:' :
                     'The basis is:'}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                      <span className="text-green-900 font-semibold">
                        {language === 'cs' ? 'Realistický rozpočet' :
                         language === 'it' ? 'Budget realistico' :
                         'Realistic budget'}
                      </span>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                      <span className="text-green-900 font-semibold">
                        {language === 'cs' ? 'Přehled o celém postupu koupě' :
                         language === 'it' ? 'Panoramica dell\'intera procedura di acquisto' :
                         'Overview of the entire purchase procedure'}
                      </span>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                      <span className="text-green-900 font-semibold">
                        {language === 'cs' ? 'Trpělivost a dobrá příprava' :
                         language === 'it' ? 'Pazienza e buona preparazione' :
                         'Patience and good preparation'}
                      </span>
                    </div>
                  </div>

                  <p className="text-green-900 mt-6 leading-relaxed">
                    {language === 'cs' ? 'Pokud chcete pochopit celý proces koupě přehledně a krok za krokem, doporučujeme začít naším praktickým průvodcem.' :
                     language === 'it' ? 'Se volete comprendere l\'intero processo di acquisto in modo chiaro e passo dopo passo, raccomandiamo di iniziare con la nostra guida pratica.' :
                     'If you want to understand the entire purchase process clearly and step by step, we recommend starting with our practical guide.'}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/process">
                <Button variant="outline" size="lg" className="w-full">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  {language === 'cs' ? 'Zpět na průvodce' :
                   language === 'it' ? 'Torna alla guida' :
                   'Back to Guide'}
                </Button>
              </Link>
              <Link href="/guides/costs">
                <Button size="lg" className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white">
                  {language === 'cs' ? 'Náklady a daně' :
                   language === 'it' ? 'Costi e tasse' :
                   'Costs and Taxes'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => setUser(user)}
      />
    </div>
  )
}
