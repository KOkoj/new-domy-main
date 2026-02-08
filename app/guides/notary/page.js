'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Scale, Euro, Shield, FileCheck, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import AuthModal from '../../../components/AuthModal'

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
              {language === 'cs' ? 'Notář v Itálii' : language === 'it' ? 'Notaio in Italia' : 'Notary in Italy'}
            </span>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {language === 'cs' ? 'Notář v Itálii: role a náklady při koupi domu' :
                 language === 'it' ? 'Notaio in Italia: ruolo e costi nell\'acquisto di una casa' :
                 'Notary in Italy: Role and Costs When Buying a House'}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                {language === 'cs' ? 'Notář hraje při koupi domu v Itálii zásadní roli. Jeho funkce se ale v mnoha ohledech liší od toho, na co jsou čeští kupující zvyklí.' :
                 language === 'it' ? 'Il notaio gioca un ruolo fondamentale nell\'acquisto di una casa in Italia. La sua funzione, però, differisce in molti aspetti da ciò a cui gli acquirenti cechi sono abituati.' :
                 'The notary plays a crucial role when buying a house in Italy. However, his function differs in many respects from what Czech buyers are used to.'}
              </p>
            </div>

            <div className="space-y-8">
              {/* Role of Notary */}
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <Scale className="h-6 w-6 mr-3" />
                    {language === 'cs' ? 'Jaká je role notáře v Itálii' :
                     language === 'it' ? 'Qual è il ruolo del notaio in Italia' :
                     'What Is the Role of the Notary in Italy'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {language === 'cs' ? 'Notář v Itálii není pouze svědek podpisu. Je to nezávislý veřejný činitel, který zodpovídá za právní správnost převodu nemovitosti.' :
                     language === 'it' ? 'Il notaio in Italia non è solo un testimone della firma. È un pubblico ufficiale indipendente che risponde della correttezza legale del trasferimento immobiliare.' :
                     'The notary in Italy is not just a witness to the signature. He is an independent public official responsible for the legal correctness of the property transfer.'}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <FileCheck className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-800">
                          {language === 'cs' ? 'Ověřit vlastnická práva prodávajícího' :
                           language === 'it' ? 'Verificare i diritti di proprietà del venditore' :
                           'Verify seller\'s property rights'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FileCheck className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-800">
                          {language === 'cs' ? 'Zkontrolovat zápisy v katastru' :
                           language === 'it' ? 'Controllare le iscrizioni al catasto' :
                           'Check cadastral records'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FileCheck className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-800">
                          {language === 'cs' ? 'Zajistit, aby byl převod v souladu se zákonem' :
                           language === 'it' ? 'Assicurarsi che il trasferimento sia conforme alla legge' :
                           'Ensure the transfer is in accordance with the law'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-900 font-semibold">
                      {language === 'cs' ? 'Notář nezastupuje kupujícího ani prodávajícího. Garantuje zákonnost převodu jako takového.' :
                       language === 'it' ? 'Il notaio non rappresenta né l\'acquirente né il venditore. Garantisce la legalità del trasferimento in sé.' :
                       'The notary does not represent the buyer or seller. He guarantees the legality of the transfer itself.'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* When Notary Enters */}
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {language === 'cs' ? 'Kdy notář vstupuje do procesu' :
                     language === 'it' ? 'Quando il notaio entra nel processo' :
                     'When the Notary Enters the Process'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {language === 'cs' ? 'Notář se zapojuje v závěrečné fázi koupě, při podpisu kupní smlouvy (atto notarile). Je důležité vědět, že:' :
                     language === 'it' ? 'Il notaio si coinvolge nella fase finale dell\'acquisto, durante la firma del contratto di acquisto (atto notarile). È importante sapere che:' :
                     'The notary gets involved in the final phase of the purchase, when signing the purchase contract (atto notarile). It\'s important to know that:'}
                  </p>
                  <ul className="space-y-2 ml-6">
                    <li className="text-gray-700">• {language === 'cs' ? 'Nevybírá nemovitost' : language === 'it' ? 'Non seleziona la proprietà' : 'Does not select the property'}</li>
                    <li className="text-gray-700">• {language === 'cs' ? 'Neposuzuje výhodnost koupě' : language === 'it' ? 'Non valuta la convenienza dell\'acquisto' : 'Does not assess the purchase\'s advantages'}</li>
                    <li className="text-gray-700">• {language === 'cs' ? 'Nekontroluje technický stav domu' : language === 'it' ? 'Non controlla lo stato tecnico della casa' : 'Does not check the technical condition of the house'}</li>
                  </ul>
                </CardContent>
              </Card>

              {/* What Notary Checks */}
              <Card className="bg-white/90 backdrop-blur-sm border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <Shield className="h-6 w-6 mr-3 text-green-600" />
                    {language === 'cs' ? 'Co notář kontroluje – a co ne' :
                     language === 'it' ? 'Cosa controlla il notaio – e cosa no' :
                     'What the Notary Checks – and What Not'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <h4 className="font-bold text-green-900 mb-3">
                      {language === 'cs' ? 'Notář KONTROLUJE:' :
                       language === 'it' ? 'Il notaio CONTROLLA:' :
                       'Notary CHECKS:'}
                    </h4>
                    <ul className="space-y-2 ml-6">
                      <li className="text-gray-700">✓ {language === 'cs' ? 'Vlastnická práva' : language === 'it' ? 'Diritti di proprietà' : 'Property rights'}</li>
                      <li className="text-gray-700">✓ {language === 'cs' ? 'Právní omezení, dluhy a zástavy' : language === 'it' ? 'Restrizioni legali, debiti e gravami' : 'Legal restrictions, debts and liens'}</li>
                      <li className="text-gray-700">✓ {language === 'cs' ? 'Správnost dokumentace' : language === 'it' ? 'Correttezza della documentazione' : 'Correctness of documentation'}</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-bold text-red-900 mb-3">
                      {language === 'cs' ? 'Notář NEKONTROLUJE:' :
                       language === 'it' ? 'Il notaio NON CONTROLLA:' :
                       'Notary DOES NOT CHECK:'}
                    </h4>
                    <p className="text-red-800 leading-relaxed">
                      {language === 'cs' ? 'Technický stav nemovitosti. Spoléhat se pouze na notáře je častou chybou.' :
                       language === 'it' ? 'Lo stato tecnico della proprietà. Affidarsi solo al notaio è un errore comune.' :
                       'The technical condition of the property. Relying only on the notary is a common mistake.'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Who Chooses and Pays */}
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <Euro className="h-6 w-6 mr-3" />
                    {language === 'cs' ? 'Kdo notáře vybírá a kdo ho platí' :
                     language === 'it' ? 'Chi sceglie il notaio e chi lo paga' :
                     'Who Chooses the Notary and Who Pays'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {language === 'cs' ? 'V Itálii je běžné, že:' :
                     language === 'it' ? 'In Italia è normale che:' :
                     'In Italy it is common that:'}
                  </p>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="font-semibold text-slate-800 mb-2">
                        {language === 'cs' ? 'Notáře vybírá kupující' :
                         language === 'it' ? 'L\'acquirente sceglie il notaio' :
                         'The buyer chooses the notary'}
                      </p>
                      <p className="text-gray-700 text-sm">
                        {language === 'cs' ? 'Kupující má právo zvolit si notáře podle svých preferencí' :
                         language === 'it' ? 'L\'acquirente ha il diritto di scegliere il notaio secondo le proprie preferenze' :
                         'The buyer has the right to choose the notary according to their preferences'}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="font-semibold text-slate-800 mb-2">
                        {language === 'cs' ? 'Náklady na notáře hradí kupující' :
                         language === 'it' ? 'I costi del notaio sono a carico dell\'acquirente' :
                         'The buyer pays the notary costs'}
                      </p>
                      <p className="text-gray-700 text-sm">
                        {language === 'cs' ? 'Jde o standardní praxi, se kterou je dobré počítat už při plánování rozpočtu' :
                         language === 'it' ? 'È una prassi standard, con cui è bene fare i conti già in fase di pianificazione del budget' :
                         'This is standard practice, which should be accounted for when planning the budget'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Costs */}
              <Card className="bg-gradient-to-br from-slate-700 to-slate-800 text-white">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">
                    {language === 'cs' ? 'Kolik stojí notář v Itálii' :
                     language === 'it' ? 'Quanto costa il notaio in Italia' :
                     'How Much Does the Notary Cost in Italy'}
                  </h3>
                  <p className="text-slate-200 leading-relaxed mb-4">
                    {language === 'cs' ? 'Cena notáře se liší podle:' :
                     language === 'it' ? 'Il prezzo del notaio varia in base a:' :
                     'The notary\'s price varies according to:'}
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="text-slate-200">• {language === 'cs' ? 'Kupní ceny nemovitosti' : language === 'it' ? 'Prezzo di acquisto della proprietà' : 'Purchase price of the property'}</li>
                    <li className="text-slate-200">• {language === 'cs' ? 'Typu převodu' : language === 'it' ? 'Tipo di trasferimento' : 'Type of transfer'}</li>
                    <li className="text-slate-200">• {language === 'cs' ? 'Výše daní' : language === 'it' ? 'Ammontare delle tasse' : 'Amount of taxes'}</li>
                  </ul>
                  <div className="p-4 bg-white/10 border border-white/20 rounded-lg">
                    <p className="text-white font-semibold mb-2">
                      {language === 'cs' ? 'Notářské náklady obvykle zahrnují:' :
                       language === 'it' ? 'I costi notarili solitamente includono:' :
                       'Notary costs usually include:'}
                    </p>
                    <ul className="space-y-1 text-slate-200">
                      <li>• {language === 'cs' ? 'Odměnu notáře' : language === 'it' ? 'Onorario del notaio' : 'Notary\'s fee'}</li>
                      <li>• {language === 'cs' ? 'Povinné daně' : language === 'it' ? 'Tasse obbligatorie' : 'Mandatory taxes'}</li>
                      <li>• {language === 'cs' ? 'Administrativní poplatky' : language === 'it' ? 'Spese amministrative' : 'Administrative fees'}</li>
                    </ul>
                  </div>
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
                  {language === 'cs' ? 'Náklady a poplatky' :
                   language === 'it' ? 'Costi e spese' :
                   'Costs and Fees'}
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
