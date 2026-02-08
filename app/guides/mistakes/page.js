'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, AlertTriangle, XCircle, CheckCircle, FileWarning } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import AuthModal from '../../../components/AuthModal'

export default function MistakesGuidePage() {
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
              {language === 'cs' ? 'Nejčastější chyby' : language === 'it' ? 'Errori comuni' : 'Common Mistakes'}
            </span>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {language === 'cs' ? 'Nejčastější chyby, které Češi dělají při koupi domu v Itálii' :
                 language === 'it' ? 'Gli errori più comuni che i cechi commettono nell\'acquisto di una casa in Italia' :
                 'Most Common Mistakes Czechs Make When Buying a House in Italy'}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                {language === 'cs' ? 'Při koupi domu v Itálii Češi velmi často opakují stejné chyby. Ne proto, že by byli neopatrní, ale proto, že neznají místní pravidla, procesy a souvislosti.' :
                 language === 'it' ? 'Nell\'acquisto di una casa in Italia, i cechi ripetono molto spesso gli stessi errori. Non perché siano incauti, ma perché non conoscono le regole, i processi e i contesti locali.' :
                 'When buying a house in Italy, Czechs very often repeat the same mistakes. Not because they are careless, but because they don\'t know the local rules, processes, and contexts.'}
              </p>
            </div>

            <Card className="bg-red-50 border-red-200 mb-8">
              <CardContent className="p-6">
                <h3 className="font-bold text-red-900 mb-3 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  {language === 'cs' ? 'Důležité upozornění' :
                   language === 'it' ? 'Avviso importante' :
                   'Important Notice'}
                </h3>
                <p className="text-red-800 leading-relaxed">
                  {language === 'cs' ? 'Koupě domu v Itálii může být splněným snem, ale bez správných informací se může snadno změnit ve zdroj zbytečných komplikací, stresu a nečekaných výdajů.' :
                   language === 'it' ? 'L\'acquisto di una casa in Italia può essere un sogno realizzato, ma senza le giuste informazioni può facilmente trasformarsi in una fonte di complicazioni inutili, stress e spese impreviste.' :
                   'Buying a house in Italy can be a dream come true, but without proper information it can easily turn into a source of unnecessary complications, stress, and unexpected expenses.'}
                </p>
              </CardContent>
            </Card>

            <div className="space-y-8">
              {/* Mistake 1 */}
              <Card className="bg-white/90 backdrop-blur-sm border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <XCircle className="h-6 w-6 mr-3 text-red-600" />
                    {language === 'cs' ? '1. Spoléhání se pouze na cenu nemovitosti' :
                     language === 'it' ? '1. Affidarsi solo al prezzo dell\'immobile' :
                     '1. Relying Only on Property Price'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {language === 'cs' ? 'Jednou z nejčastějších chyb je zaměření se pouze na kupní cenu. Kupující často podceňují další povinné náklady:' :
                     language === 'it' ? 'Uno degli errori più comuni è concentrarsi solo sul prezzo di acquisto. Gli acquirenti spesso sottovalutano altri costi obbligatori:' :
                     'One of the most common mistakes is focusing only on the purchase price. Buyers often underestimate other mandatory costs:'}
                  </p>
                  <ul className="space-y-2 ml-6">
                    <li className="text-gray-700">• {language === 'cs' ? 'Daně' : language === 'it' ? 'Tasse' : 'Taxes'}</li>
                    <li className="text-gray-700">• {language === 'cs' ? 'Notářské poplatky' : language === 'it' ? 'Spese notarili' : 'Notary fees'}</li>
                    <li className="text-gray-700">• {language === 'cs' ? 'Administrativní a technické kontroly' : language === 'it' ? 'Controlli amministrativi e tecnici' : 'Administrative and technical checks'}</li>
                  </ul>
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-900 font-semibold">
                      ⚠️ {language === 'cs' ? 'Cena na inzerátu není konečná cena.' :
                           language === 'it' ? 'Il prezzo nell\'annuncio non è il prezzo finale.' :
                           'The price in the listing is not the final price.'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Mistake 2 */}
              <Card className="bg-white/90 backdrop-blur-sm border-l-4 border-l-orange-500">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <XCircle className="h-6 w-6 mr-3 text-orange-600" />
                    {language === 'cs' ? '2. Podcenění právní kontroly' :
                     language === 'it' ? '2. Sottovalutazione del controllo legale' :
                     '2. Underestimating Legal Control'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {language === 'cs' ? 'Neověření vlastnických práv, případných dluhů nebo zástav, stavebních povolení a souladu s katastrem může vést k vážným problémům i dlouho po podpisu smlouvy.' :
                     language === 'it' ? 'La mancata verifica dei diritti di proprietà, eventuali debiti o gravami, permessi edilizi e conformità catastale può portare a seri problemi anche molto tempo dopo la firma del contratto.' :
                     'Failure to verify property rights, possible debts or liens, building permits, and cadastral compliance can lead to serious problems long after signing the contract.'}
                  </p>
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-900 font-semibold">
                      ⚠️ {language === 'cs' ? 'V Itálii není právní kontrola formalita – je to zásadní krok, který nelze vynechat.' :
                           language === 'it' ? 'In Italia il controllo legale non è una formalità – è un passo fondamentale che non può essere saltato.' :
                           'In Italy, legal control is not a formality – it\'s a crucial step that cannot be skipped.'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Mistake 3 */}
              <Card className="bg-white/90 backdrop-blur-sm border-l-4 border-l-yellow-500">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <XCircle className="h-6 w-6 mr-3 text-yellow-600" />
                    {language === 'cs' ? '3. Neznalost místních pravidel a rozdílů' :
                     language === 'it' ? '3. Ignoranza delle regole e differenze locali' :
                     '3. Lack of Knowledge of Local Rules and Differences'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {language === 'cs' ? 'Postupy v Itálii se liší region od regionu a nefungují stejně jako v České republice. To, co je běžné doma, zde často neplatí vůbec.' :
                     language === 'it' ? 'Le procedure in Italia variano da regione a regione e non funzionano allo stesso modo della Repubblica Ceca. Ciò che è comune a casa spesso qui non vale affatto.' :
                     'Procedures in Italy vary from region to region and don\'t work the same as in the Czech Republic. What is common at home often doesn\'t apply here at all.'}
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {language === 'cs' ? 'Ignorování místních zvyklostí vede ke zdržení, chybám a stresu.' :
                     language === 'it' ? 'Ignorare le usanze locali porta a ritardi, errori e stress.' :
                     'Ignoring local customs leads to delays, mistakes, and stress.'}
                  </p>
                </CardContent>
              </Card>

              {/* Mistake 4 */}
              <Card className="bg-white/90 backdrop-blur-sm border-l-4 border-l-purple-500">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <XCircle className="h-6 w-6 mr-3 text-purple-600" />
                    {language === 'cs' ? '4. Chybějící dlouhodobý plán' :
                     language === 'it' ? '4. Mancanza di piano a lungo termine' :
                     '4. Missing Long-Term Plan'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {language === 'cs' ? 'Mnoho kupujících řeší jen samotnou koupi, ale ne:' :
                     language === 'it' ? 'Molti acquirenti si occupano solo dell\'acquisto stesso, ma non di:' :
                     'Many buyers only deal with the purchase itself, but not:'}
                  </p>
                  <ul className="space-y-2 ml-6">
                    <li className="text-gray-700">• {language === 'cs' ? 'Budoucí náklady na údržbu' : language === 'it' ? 'Costi futuri di manutenzione' : 'Future maintenance costs'}</li>
                    <li className="text-gray-700">• {language === 'cs' ? 'Možnosti pronájmu' : language === 'it' ? 'Possibilità di affitto' : 'Rental possibilities'}</li>
                    <li className="text-gray-700">• {language === 'cs' ? 'Dlouhodobé daňové povinnosti' : language === 'it' ? 'Obblighi fiscali a lungo termine' : 'Long-term tax obligations'}</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    {language === 'cs' ? 'Bez realistického plánu se i dobrá koupě může časem stát zátěží.' :
                     language === 'it' ? 'Senza un piano realistico, anche un buon acquisto può diventare un peso nel tempo.' :
                     'Without a realistic plan, even a good purchase can become a burden over time.'}
                  </p>
                </CardContent>
              </Card>

              {/* Mistake 5 */}
              <Card className="bg-white/90 backdrop-blur-sm border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <XCircle className="h-6 w-6 mr-3 text-blue-600" />
                    {language === 'cs' ? '5. Komunikace bez místní znalosti' :
                     language === 'it' ? '5. Comunicazione senza conoscenza locale' :
                     '5. Communication Without Local Knowledge'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {language === 'cs' ? 'Jazyková bariéra a neznalost místního prostředí často vedou k nedorozuměním, špatným rozhodnutím a zbytečnému stresu.' :
                     language === 'it' ? 'La barriera linguistica e la mancanza di conoscenza dell\'ambiente locale spesso portano a incomprensioni, decisioni sbagliate e stress inutile.' :
                     'Language barrier and lack of local environmental knowledge often lead to misunderstandings, bad decisions, and unnecessary stress.'}
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {language === 'cs' ? 'V Itálii hraje osobní přístup a kontext mnohem větší roli, než se na první pohled zdá.' :
                     language === 'it' ? 'In Italia l\'approccio personale e il contesto giocano un ruolo molto più importante di quanto sembri a prima vista.' :
                     'In Italy, personal approach and context play a much bigger role than it seems at first glance.'}
                  </p>
                </CardContent>
              </Card>

              {/* How to Avoid */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center text-green-900">
                    <CheckCircle className="h-6 w-6 mr-3" />
                    {language === 'cs' ? 'Jak se těmto chybám vyhnout?' :
                     language === 'it' ? 'Come evitare questi errori?' :
                     'How to Avoid These Mistakes?'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-900 font-semibold mb-4">
                    {language === 'cs' ? 'Klíčem je:' :
                     language === 'it' ? 'La chiave è:' :
                     'The key is:'}
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-green-900">{language === 'cs' ? 'Dobrá příprava' : language === 'it' ? 'Buona preparazione' : 'Good preparation'}</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-green-900">{language === 'cs' ? 'Realistický rozpočet' : language === 'it' ? 'Budget realistico' : 'Realistic budget'}</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-green-900">{language === 'cs' ? 'Znalost celého procesu ještě před prvním rozhodnutím' : language === 'it' ? 'Conoscenza dell\'intero processo prima della prima decisione' : 'Knowledge of the entire process before the first decision'}</span>
                    </li>
                  </ul>
                  <p className="text-green-900 mt-6 leading-relaxed">
                    {language === 'cs' ? 'Vyhnout se těmto chybám je možné – pokud máte správné informace hned na začátku.' :
                     language === 'it' ? 'Evitare questi errori è possibile – se avete le informazioni giuste fin dall\'inizio.' :
                     'Avoiding these mistakes is possible – if you have the right information from the start.'}
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
        onAuthSuccess={(user) => setUser(user)}
      />
    </div>
  )
}
