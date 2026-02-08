'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Eye, CheckCircle, Home, AlertCircle, FileSearch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import AuthModal from '../../../components/AuthModal'

export default function InspectionsGuidePage() {
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
              {language === 'cs' ? 'Prohlídky nemovitostí' : language === 'it' ? 'Visite immobiliari' : 'Property Inspections'}
            </span>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {language === 'cs' ? 'Jak probíhají prohlídky nemovitostí v Itálii' :
                 language === 'it' ? 'Come funzionano le visite immobiliari in Italia' :
                 'How Property Inspections Work in Italy'}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                {language === 'cs' ? 'Jak probíhají prohlídky nemovitostí v Itálii, co se při nich kontroluje a proč jsou klíčové ještě před zapojením notáře.' :
                 language === 'it' ? 'Come funzionano le visite immobiliari in Italia, cosa si controlla durante di esse e perché sono fondamentali ancora prima del coinvolgimento del notaio.' :
                 'How property inspections work in Italy, what is checked during them, and why they are crucial even before involving the notary.'}
              </p>
            </div>

            <Card className="bg-amber-50 border-amber-200 mb-8">
              <CardContent className="p-6">
                <h3 className="font-bold text-amber-900 mb-3 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {language === 'cs' ? 'Klíčové poznatky' :
                   language === 'it' ? 'Informazioni chiave' :
                   'Key Insights'}
                </h3>
                <p className="text-amber-800 leading-relaxed">
                  {language === 'cs' ? 'Prohlídka nemovitosti v Itálii není jen „návštěva domu". Je to klíčový krok, ve kterém se rozhoduje o tom, zda bude koupě bezpečná – nebo problémová.' :
                   language === 'it' ? 'La visita immobiliare in Italia non è solo una "visita alla casa". È un passo fondamentale in cui si decide se l\'acquisto sarà sicuro – o problematico.' :
                   'A property inspection in Italy is not just a "house visit". It is a crucial step in which it is decided whether the purchase will be safe – or problematic.'}
                </p>
              </CardContent>
            </Card>

            <div className="space-y-8">
              {/* Purpose */}
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <Eye className="h-6 w-6 mr-3" />
                    {language === 'cs' ? 'Co je cílem prohlídky nemovitosti' :
                     language === 'it' ? 'Qual è lo scopo della visita immobiliare' :
                     'What Is the Purpose of Property Inspection'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {language === 'cs' ? 'Cílem prohlídky není jen zjistit, zda se vám dům líbí, ale především:' :
                     language === 'it' ? 'Lo scopo della visita non è solo scoprire se la casa vi piace, ma soprattutto:' :
                     'The purpose of the inspection is not just to find out if you like the house, but mainly:'}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        {language === 'cs' ? 'Ověřit skutečný stav nemovitosti' :
                         language === 'it' ? 'Verificare lo stato reale della proprietà' :
                         'Verify the actual condition of the property'}
                      </span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        {language === 'cs' ? 'Pochopit souvislosti (okolí, přístup, omezení)' :
                         language === 'it' ? 'Comprendere i contesti (dintorni, accesso, restrizioni)' :
                         'Understand the context (surroundings, access, restrictions)'}
                      </span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        {language === 'cs' ? 'Odhalit možné právní nebo technické problémy' :
                         language === 'it' ? 'Scoprire possibili problemi legali o tecnici' :
                         'Detect possible legal or technical problems'}
                      </span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        {language === 'cs' ? 'Získat reálný obraz ještě před rezervací' :
                         language === 'it' ? 'Ottenere un quadro reale prima della prenotazione' :
                         'Get a real picture before reservation'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* How Inspections Work */}
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {language === 'cs' ? 'Jak prohlídky v Itálii obvykle probíhají' :
                     language === 'it' ? 'Come funzionano solitamente le visite in Italia' :
                     'How Inspections Usually Work in Italy'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {language === 'cs' ? 'V Itálii je běžné, že:' :
                     language === 'it' ? 'In Italia è normale che:' :
                     'In Italy it is common that:'}
                  </p>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 border-l-4 border-l-blue-500 rounded">
                      <p className="font-semibold text-slate-800 mb-2">
                        {language === 'cs' ? 'První prohlídka je orientační' :
                         language === 'it' ? 'La prima visita è esplorativa' :
                         'First inspection is exploratory'}
                      </p>
                      <p className="text-gray-700 text-sm">
                        {language === 'cs' ? 'Slouží k prvnímu dojmu a základnímu posouzení' :
                         language === 'it' ? 'Serve per una prima impressione e valutazione di base' :
                         'Serves for first impression and basic assessment'}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 border-l-4 border-l-green-500 rounded">
                      <p className="font-semibold text-slate-800 mb-2">
                        {language === 'cs' ? 'Další návštěvy se zaměřují na detaily' :
                         language === 'it' ? 'Le visite successive si concentrano sui dettagli' :
                         'Subsequent visits focus on details'}
                      </p>
                      <p className="text-gray-700 text-sm">
                        {language === 'cs' ? 'Kontrola konkrétních prvků, měření, technický stav' :
                         language === 'it' ? 'Controllo di elementi specifici, misure, stato tecnico' :
                         'Checking specific elements, measurements, technical condition'}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 border-l-4 border-l-purple-500 rounded">
                      <p className="font-semibold text-slate-800 mb-2">
                        {language === 'cs' ? 'Technické a právní otázky se řeší postupně' :
                         language === 'it' ? 'Le questioni tecniche e legali si risolvono gradualmente' :
                         'Technical and legal issues are resolved gradually'}
                      </p>
                      <p className="text-gray-700 text-sm">
                        {language === 'cs' ? 'Důležité je klást otázky a žádat vysvětlení' :
                         language === 'it' ? 'È importante fare domande e chiedere spiegazioni' :
                         'It\'s important to ask questions and request explanations'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* What to Check */}
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <FileSearch className="h-6 w-6 mr-3" />
                    {language === 'cs' ? 'Co se při prohlídce skutečně ověřuje' :
                     language === 'it' ? 'Cosa si verifica realmente durante la visita' :
                     'What Is Actually Verified During Inspection'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {language === 'cs' ? 'Během prohlídek se řeší zejména:' :
                     language === 'it' ? 'Durante le visite si affrontano soprattutto:' :
                     'During inspections, the following are mainly addressed:'}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Home className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-800">
                          {language === 'cs' ? 'Skutečný stav nemovitosti' :
                           language === 'it' ? 'Stato reale della proprietà' :
                           'Actual condition of the property'}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {language === 'cs' ? 'Konstrukční stav, izolace, instalace, vlhkost' :
                           language === 'it' ? 'Stato strutturale, isolamento, impianti, umidità' :
                           'Structural condition, insulation, installations, humidity'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <FileSearch className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-800">
                          {language === 'cs' ? 'Dispozice a možnosti úprav' :
                           language === 'it' ? 'Disposizione e possibilità di modifiche' :
                           'Layout and modification possibilities'}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {language === 'cs' ? 'Co lze upravit, co je pod ochranou' :
                           language === 'it' ? 'Cosa si può modificare, cosa è protetto' :
                           'What can be modified, what is protected'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-800">
                          {language === 'cs' ? 'Soulad reality s dokumentací' :
                           language === 'it' ? 'Conformità della realtà con la documentazione' :
                           'Compliance of reality with documentation'}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {language === 'cs' ? 'Zda odpovídá katastr skutečnosti' :
                           language === 'it' ? 'Se il catasto corrisponde alla realtà' :
                           'Whether the cadastre corresponds to reality'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-900 font-semibold">
                      ⚠️ {language === 'cs' ? 'Notář technický stav nekontroluje. Spoléhat se pouze na notáře je jednou z nejčastějších chyb.' :
                           language === 'it' ? 'Il notaio non controlla lo stato tecnico. Affidarsi solo al notaio è uno degli errori più comuni.' :
                           'The notary does not check the technical condition. Relying only on the notary is one of the most common mistakes.'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Presence */}
              <Card className="bg-gradient-to-br from-slate-700 to-slate-800 text-white">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">
                    {language === 'cs' ? 'Proč je důležité být při prohlídkách na místě' :
                     language === 'it' ? 'Perché è importante essere presenti alle visite' :
                     'Why It\'s Important to Be Present at Inspections'}
                  </h3>
                  <p className="text-slate-200 leading-relaxed mb-4">
                    {language === 'cs' ? 'Osobní účast při prohlídkách umožňuje:' :
                     language === 'it' ? 'La presenza personale alle visite permette di:' :
                     'Personal presence at inspections allows:'}
                  </p>
                  <ul className="space-y-2">
                    <li className="text-slate-200">• {language === 'cs' ? 'Vidět věci, které na fotografiích nejsou' : language === 'it' ? 'Vedere cose che non sono nelle foto' : 'See things that are not in photos'}</li>
                    <li className="text-slate-200">• {language === 'cs' ? 'Pochopit lokalitu a okolí' : language === 'it' ? 'Comprendere la località e i dintorni' : 'Understand the location and surroundings'}</li>
                    <li className="text-slate-200">• {language === 'cs' ? 'Porovnat více nemovitostí' : language === 'it' ? 'Confrontare più proprietà' : 'Compare multiple properties'}</li>
                    <li className="text-slate-200">• {language === 'cs' ? 'Klást správné otázky ve správný čas' : language === 'it' ? 'Fare le domande giuste al momento giusto' : 'Ask the right questions at the right time'}</li>
                  </ul>
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
              <Link href="/guides/notary">
                <Button size="lg" className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white">
                  {language === 'cs' ? 'Role notáře' :
                   language === 'it' ? 'Ruolo del notaio' :
                   'Role of Notary'}
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
