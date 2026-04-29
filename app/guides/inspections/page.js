"use client";

import { useState, useEffect } from "react";
import {
  Eye,
  CheckCircle,
  Home,
  AlertCircle,
  FileSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import InformationalDisclaimer from "@/components/legal/InformationalDisclaimer";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";

export default function InspectionsGuidePage() {
  const [language, setLanguage] = useState("cs");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferred-language");
    if (savedLanguage) {
      setLanguage(savedLanguage);
      document.documentElement.lang = savedLanguage;
    }

    const handleLanguageChange = (event) => {
      setLanguage(event.detail);
      document.documentElement.lang = event.detail;
    };
    window.addEventListener("languageChange", handleLanguageChange);
    return () => window.removeEventListener("languageChange", handleLanguageChange);
  }, []);

  const articleImage =
    language === "cs"
      ? {
          src: "/articles/inspections-couple-house.jpg",
          alt: "Pár zezadu před domem",
          caption: "Prohlídka začíná dojmem, ale rozhodnutí musí stát na tom, co si na místě skutečně ověříte."
        }
      : language === "it"
        ? {
            src: "/articles/inspections-couple-house.jpg",
            alt: "Coppia di spalle davanti a una casa",
            caption: "La visita parte dall’impressione generale, ma la decisione dipende da ciò che verifichi davvero sul posto."
          }
        : {
            src: "/articles/inspections-couple-house.jpg",
            alt: "Couple from behind looking at a house",
            caption: "A viewing starts with first impressions, but the real decision depends on what you verify on site."
          };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f4ed] via-amber-50/20 to-slate-50">
      <Navigation />

      <div className="pt-28 pb-16 md:pb-24">
        <div className="container mx-auto px-6 mb-6" style={{ maxWidth: '1200px' }}>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-slate-700">
              {language === "cs" ? "Domů" : language === "it" ? "Casa" : "Home"}
            </Link>
            <span>/</span>
            <Link href="/process" className="hover:text-slate-700">
              {language === "cs"
                ? "Průvodce"
                : language === "it"
                  ? "Guida"
                  : "Guide"}
            </Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">
              {language === "cs"
                ? "Prohlídky nemovitostí"
                : language === "it"
                  ? "Visite immobiliari"
                  : "Property Inspections"}
            </span>
          </div>
        </div>

        <div className="container mx-auto px-6" style={{ maxWidth: '1200px' }}>
          <div className="max-w-4xl mx-auto" style={{ maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto' }}>
            <div className="mb-8">
              <Button
                asChild
                variant="outline"
                className="mb-5 inline-flex items-center border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-700"
              >
                <Link href="/blog">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {language === "cs" ? "Články" : language === "it" ? "Articoli" : "Articles"}
                </Link>
              </Button>
              <h1 className="font-bold mb-8 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {language === "cs"
                  ? "Jak probíhají prohlídky nemovitostí v Itálii"
                  : language === "it"
                    ? "Come funzionano le visite immobiliari in Italia"
                    : "How Property Inspections Work in Italy"}
              </h1>
              <p className="text-gray-500 leading-relaxed" style={{color:'#4a4a4a', lineHeight:'1.75'}}>
                {language === "cs"
                  ? "Jak probíhají prohlídky nemovitostí v Itálii, co se při nich kontroluje a proč jsou klíčové ještě před zapojením notáře."
                  : language === "it"
                    ? "Come funzionano le visite immobiliari in Italia, cosa si controlla durante di esse e perché sono fondamentali ancora prima del coinvolgimento del notaio."
                    : "How property inspections work in Italy, what is checked during them, and why they are crucial even before involving the notary."}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-8">
              <Image src={articleImage.src} alt={articleImage.alt} width={1400} height={800} sizes="(min-width: 768px) 768px, 100vw" className="w-full h-64 md:h-80 object-cover" />
              <p className="px-4 py-3 text-sm text-slate-600">{articleImage.caption}</p>
            </div>

            <Card className="bg-amber-50 border-amber-200 mb-8">
              <CardContent className="p-6">
                <h3 className="font-bold text-amber-900 mb-3 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {language === "cs"
                    ? "Klíčové poznatky"
                    : language === "it"
                      ? "Informazioni chiave"
                      : "Key Insights"}
                </h3>
                <p className="text-amber-800 leading-relaxed">
                  {language === "cs"
                    ? "Prohlídka nemovitosti v Itálii není jen „návštěva domu“. Je to chvíle, kdy se ukáže, zda bude koupě skutečně bezpečná, nebo zda skrývá technické, právní či stavební problémy, které z inzerátu nejsou patrné."
                    : language === "it"
                      ? "La visita immobiliare in Italia non è solo una “visita alla casa”. È il momento in cui si capisce se l’acquisto sarà realmente sicuro o se nasconde criticità tecniche, legali o strutturali che non emergono dall’annuncio."
                      : "A property visit in Italy is not just a “house viewing.” It is the moment when you understand whether the purchase is truly safe or hides technical, legal, or structural issues that are not visible in the listing."}
                </p>
              </CardContent>
            </Card>

            <p className="text-slate-800 leading-relaxed font-semibold mb-8">
              {language === "cs"
                ? "Mnoho problémů, které vyjdou najevo až po předběžné smlouvě, bylo viditelných už při prohlídce — jen nebyly správně vyhodnoceny."
                : language === "it"
                  ? "Molti problemi che emergono dopo il preliminare erano già visibili durante la visita — ma non sono stati interpretati correttamente."
                  : "Many issues that appear after the preliminary agreement were already visible during the visit — but were not interpreted correctly."}
            </p>

            <div className="space-y-8">
              {/* Purpose */}
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center mb-8">
                    <Eye className="h-6 w-6 mr-3" />
                    {language === "cs"
                      ? "Co je cílem prohlídky nemovitosti"
                      : language === "it"
                        ? "Qual è lo scopo della visita immobiliare"
                        : "What Is the Purpose of Property Inspection"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 leading-relaxed mb-4" style={{color:'#4a4a4a', lineHeight:'1.75'}}>
                    {language === "cs"
                      ? "Cílem prohlídky není jen zjistit, zda se vám dům líbí, ale především:"
                      : language === "it"
                        ? "Lo scopo della visita non è solo scoprire se la casa vi piace, ma soprattutto:"
                        : "The purpose of the inspection is not just to find out if you like the house, but mainly:"}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        {language === "cs"
                          ? "Ověřit skutečný stav nemovitosti"
                          : language === "it"
                            ? "Verificare lo stato reale della proprietà"
                            : "Verify the actual condition of the property"}
                      </span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        {language === "cs"
                          ? "Pochopit souvislosti (okolí, přístup, omezení)"
                          : language === "it"
                            ? "Comprendere i contesti (dintorni, accesso, restrizioni)"
                            : "Understand the context (surroundings, access, restrictions)"}
                      </span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        {language === "cs"
                          ? "Odhalit možné právní nebo technické problémy"
                          : language === "it"
                            ? "Scoprire possibili problemi legali o tecnici"
                            : "Detect possible legal or technical problems"}
                      </span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        {language === "cs"
                          ? "Získat reálný obraz ještě před rezervací"
                          : language === "it"
                            ? "Ottenere un quadro reale prima della prenotazione"
                            : "Get a real picture before reservation"}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-500 leading-relaxed mt-5" style={{color:'#4a4a4a', lineHeight:'1.75'}}>
                    {language === "cs"
                      ? "V Itálii není prohlídka jen estetické posouzení. Je to první skutečný okamžik konkrétního ověření před převzetím finančního závazku."
                      : language === "it"
                        ? "In Italia, la visita non è solo una valutazione estetica. È il primo vero momento di verifica concreta prima di assumersi un impegno economico."
                        : "In Italy, the visit is not just an aesthetic assessment. It is the first real moment of concrete verification before taking on a financial commitment."}
                  </p>
                </CardContent>
              </Card>

              {/* How Inspections Work */}
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="mb-8">
                    {language === "cs"
                      ? "Jak obvykle probíhá prohlídka v Itálii"
                      : language === "it"
                        ? "Come funziona solitamente la visita in Italia"
                        : "How a Property Visit Usually Works in Italy"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 leading-relaxed mb-4" style={{color:'#4a4a4a', lineHeight:'1.75'}}>
                    {language === "cs"
                      ? "Ve většině případů kvůli vzdálenosti probíhá jedna návštěva, při které se hodnotí:"
                      : language === "it"
                        ? "Nella maggior parte dei casi, dato il tema della distanza, la visita è una e serve per valutare:"
                        : "In most cases, due to distance, there is one visit focused on evaluating:"}
                  </p>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 border-l-4 border-l-blue-500 rounded">
                      <p className="font-semibold text-slate-800 mb-2">
                        {language === "cs"
                          ? "Celkový stav nemovitosti"
                          : language === "it"
                            ? "Stato generale dell'immobile"
                            : "Overall property condition"}
                      </p>
                      <p className="text-gray-500 text-sm" style={{color:'#4a4a4a', lineHeight:'1.75'}}>
                        {language === "cs"
                          ? "Skutečný stav interiéru i exteriéru, vlhkost, praskliny a práce nutné v krátkodobém horizontu."
                          : language === "it"
                            ? "Condizioni reali di interni, esterni, umidità, crepe e lavori necessari nel breve periodo."
                            : "Actual interior and exterior condition, humidity, cracks, and work needed in the short term."}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 border-l-4 border-l-green-500 rounded">
                      <p className="font-semibold text-slate-800 mb-2">
                        {language === "cs"
                          ? "Dispozice, rozměry a světelnost"
                          : language === "it"
                            ? "Distribuzione, misure e luminosità"
                            : "Layout, measurements, and natural light"}
                      </p>
                      <p className="text-gray-500 text-sm" style={{color:'#4a4a4a', lineHeight:'1.75'}}>
                        {language === "cs"
                          ? "Praktické ověření prostoru: užitná plocha, dispozice místností, orientace a celková obyvatelnost."
                          : language === "it"
                            ? "Verifica pratica degli spazi: metrature utili, disposizione delle stanze, esposizione e vivibilità."
                            : "Practical space check: usable area, room layout, exposure, and overall livability."}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 border-l-4 border-l-purple-500 rounded">
                      <p className="font-semibold text-slate-800 mb-2">
                        {language === "cs"
                          ? "Technické vybavení a stav"
                          : language === "it"
                            ? "Impianti e stato tecnico"
                            : "Systems and technical condition"}
                      </p>
                      <p className="text-gray-500 text-sm" style={{color:'#4a4a4a', lineHeight:'1.75'}}>
                        {language === "cs"
                          ? "Vizuální kontrola elektroinstalace, vody, vytápění, oken a celkové údržby."
                          : language === "it"
                            ? "Controllo visivo di impianto elettrico, idraulico, riscaldamento, infissi e manutenzione complessiva."
                            : "Visual check of electrical, plumbing, heating, windows, and overall maintenance."}
                      </p>
                      <p className="text-gray-500 text-sm mt-2" style={{color:'#4a4a4a', lineHeight:'1.75'}}>
                        {language === "cs"
                          ? "Je důležité zjistit, zda mají instalace certifikaci, zda existují prohlášení o shodě a zda byly případné minulé práce řádně povoleny."
                          : language === "it"
                            ? "È importante capire se gli impianti sono certificati, se esistono dichiarazioni di conformità e se eventuali lavori passati sono stati regolarmente autorizzati."
                            : "It is important to understand whether the systems are certified, whether declarations of conformity exist, and whether any past works were properly authorized."}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 border-l-4 border-l-amber-500 rounded">
                      <p className="font-semibold text-slate-800 mb-2">
                        {language === "cs"
                          ? "Lokalita, přístup a dostupné dokumenty"
                          : language === "it"
                            ? "Contesto, accessi e documenti disponibili"
                            : "Area, access, and available documents"}
                      </p>
                      <p className="text-gray-500 text-sm" style={{color:'#4a4a4a', lineHeight:'1.75'}}>
                        {language === "cs"
                          ? "Lokalita, hluk, parkování, poplatky SVJ a první vyjasnění technické a právní dokumentace."
                          : language === "it"
                            ? "Zona, rumori, parcheggio, spese condominiali e primi chiarimenti su documentazione tecnica e legale."
                            : "Area, noise, parking, condo fees, and initial clarification of technical and legal documentation."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* What to Check */}
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center mb-8">
                    <FileSearch className="h-6 w-6 mr-3" />
                    {language === "cs"
                      ? "Co se při prohlídce skutečně ověřuje"
                      : language === "it"
                        ? "Cosa si verifica realmente durante la visita"
                        : "What Is Actually Verified During Inspection"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 leading-relaxed mb-4" style={{color:'#4a4a4a', lineHeight:'1.75'}}>
                    {language === "cs"
                      ? "Během prohlídek se řeší zejména:"
                      : language === "it"
                        ? "Durante le visite si affrontano soprattutto:"
                        : "During inspections, the following are mainly addressed:"}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Home className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-800">
                          {language === "cs"
                            ? "Skutečný stav nemovitosti"
                            : language === "it"
                              ? "Stato reale della proprietà"
                              : "Actual condition of the property"}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {language === "cs"
                            ? "Konstrukční stav, izolace, instalace, vlhkost"
                            : language === "it"
                              ? "Stato strutturale, isolamento, impianti, umidità"
                              : "Structural condition, insulation, installations, humidity"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <FileSearch className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-800">
                          {language === "cs"
                            ? "Dispozice a možnosti úprav"
                            : language === "it"
                              ? "Disposizione e possibilità di modifiche"
                              : "Layout and modification possibilities"}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {language === "cs"
                            ? "Co lze upravit, co je pod ochranou"
                            : language === "it"
                              ? "Cosa si può modificare, cosa è protetto"
                              : "What can be modified, what is protected"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-800">
                          {language === "cs"
                            ? "Soulad reality s dokumentací"
                            : language === "it"
                              ? "Conformità della realtà con la documentazione"
                              : "Compliance of reality with documentation"}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {language === "cs"
                            ? "Zda odpovídá katastr skutečnosti"
                            : language === "it"
                              ? "Se il catasto corrisponde alla realtà"
                              : "Whether the cadastre corresponds to reality"}
                        </p>
                        <p className="text-gray-600 text-sm mt-2">
                          {language === "cs"
                            ? "I malé rozdíly mezi katastrálním plánem a skutečným stavem mohou při notářském aktu způsobit blokaci nebo vyvolat nečekané náklady na uvedení do souladu."
                            : language === "it"
                              ? "Anche piccole differenze tra planimetria catastale e stato reale possono creare blocchi al momento dell’atto notarile o generare costi imprevisti di regolarizzazione."
                              : "Even small differences between the cadastral plan and the actual condition can create roadblocks at the notarial deed stage or generate unexpected regularization costs."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-900 font-semibold whitespace-pre-line">
                      {language === "cs"
                        ? "Notář nekontroluje technický stav nemovitosti a neprovádí fyzickou prohlídku.\nSpoléhat se výhradně na notáře je jedna z nejčastějších chyb zahraničních kupujících."
                        : language === "it"
                          ? "Il notaio non controlla lo stato tecnico dell’immobile e non effettua sopralluoghi.\nAffidarsi esclusivamente al notaio è uno degli errori più comuni degli acquirenti stranieri."
                          : "The notary does not check the technical condition of the property and does not perform on-site inspections.\nRelying exclusively on the notary is one of the most common mistakes foreign buyers make."}
                    </p>
                    <div className="mt-4">
                      <Link href="/guides/notary">
                        <Button className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white">
                          {language === "cs"
                            ? "Zjistit roli notáře"
                            : language === "it"
                              ? "Scopri il ruolo del notaio"
                              : "Learn the Notary's Role"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Presence */}
              <Card className="bg-gradient-to-br from-slate-700 to-slate-800 text-white">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">
                    {language === "cs"
                      ? "Proč je důležité být při prohlídkách na místě"
                      : language === "it"
                        ? "Perché è importante essere presenti alle visite"
                        : "Why It's Important to Be Present at Inspections"}
                  </h3>
                  <p className="text-slate-200 leading-relaxed mb-4">
                    {language === "cs"
                      ? "Osobní účast při prohlídkách umožňuje:"
                      : language === "it"
                        ? "La presenza personale alle visite permette di:"
                        : "Personal presence at inspections allows:"}
                  </p>
                  <ul className="space-y-2">
                    <li className="text-slate-200">
                      •{" "}
                      {language === "cs"
                        ? "Vidět věci, které na fotografiích nejsou"
                        : language === "it"
                          ? "Vedere cose che non sono nelle foto"
                          : "See things that are not in photos"}
                    </li>
                    <li className="text-slate-200">
                      •{" "}
                      {language === "cs"
                        ? "Pochopit lokalitu a okolí"
                        : language === "it"
                          ? "Comprendere la località e i dintorni"
                          : "Understand the location and surroundings"}
                    </li>
                    <li className="text-slate-200">
                      •{" "}
                      {language === "cs"
                        ? "Porovnat více nemovitostí"
                        : language === "it"
                          ? "Confrontare più proprietà"
                          : "Compare multiple properties"}
                    </li>
                    <li className="text-slate-200">
                      •{" "}
                      {language === "cs"
                        ? "Klást správné otázky ve správný čas"
                        : language === "it"
                          ? "Fare le domande giuste al momento giusto"
                          : "Ask the right questions at the right time"}
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-l-4 border-l-teal-500">
                <CardHeader>
                  <CardTitle className="mb-8">
                    {language === "cs"
                      ? "Jak zorganizovat cestu na prohlídky"
                      : language === "it"
                        ? "Organizzare il viaggio per le visite"
                        : "How to Plan the Trip for Property Visits"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 leading-relaxed mb-4" style={{color:'#4a4a4a', lineHeight:'1.75'}}>
                    {language === "cs"
                      ? "Pokud plánujete cestu do Itálie kvůli prohlídkám nemovitostí:"
                      : language === "it"
                        ? "Se state pianificando un viaggio in Italia per visitare immobili:"
                        : "If you are planning a trip to Italy to visit properties:"}
                  </p>
                  <ul className="space-y-2">
                    <li className="text-gray-700">
                      •{" "}
                      {language === "cs"
                        ? "porovnejte ubytování v různých lokalitách"
                        : language === "it"
                          ? "confrontate le strutture nelle diverse zone"
                          : "compare accommodations across the areas you are considering"}
                    </li>
                    <li className="text-gray-700">
                      •{" "}
                      {language === "cs"
                        ? "zvažte dopravu a spojení"
                        : language === "it"
                          ? "valutate trasporti e collegamenti"
                          : "evaluate transport and connections"}
                    </li>
                    <li className="text-gray-700">
                      •{" "}
                      {language === "cs"
                        ? "vyhraďte si alespoň 2–3 dny na porovnání více nemovitostí"
                        : language === "it"
                          ? "prevedete almeno 2–3 giorni per confrontare più proprietà"
                          : "set aside at least 2–3 days to compare multiple properties"}
                    </li>
                  </ul>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link
                      href="https://www.booking.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 border border-blue-400/40 shadow-sm">
                        {language === "cs"
                          ? "Porovnejte ubytování v lokalitách, které zvažujete"
                          : language === "it"
                            ? "Confronta alloggi nelle zone che stai valutando"
                            : "Compare accommodations in the areas you are considering"}
                      </Button>
                    </Link>
                    <Link
                      href="https://www.getyourguide.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400 border border-amber-300/50 shadow-sm">
                        {language === "cs"
                          ? "Objevte aktivity a prohlídky v okolí"
                          : language === "it"
                            ? "Scopri attività e visite guidate nella zona"
                            : "Discover activities and guided tours in the area"}
                      </Button>
                    </Link>
                  </div>
                  <div className="mt-5">
                    <p className="text-slate-800 font-semibold">
                      {language === "cs"
                        ? "Pojistete svou cestu"
                        : language === "it"
                          ? "Assicura il tuo viaggio"
                          : "Insure your trip"}
                    </p>
                    <a
                      href="https://www.dpbolvw.net/click-101629596-13502304"
                      target="_top"
                      rel="nofollow sponsored noopener noreferrer"
                      className="mt-3 inline-block max-w-full overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm"
                    >
                      <img
                        src="https://www.tqlkg.com/image-101629596-13502304"
                        width="468"
                        height="60"
                        alt="cestovni pojisteni AXA se slevou 50 %"
                        className="block h-auto max-w-full"
                      />
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-l-4 border-l-amber-500">
                <CardHeader>
                  <CardTitle className="mb-8">
                    {language === "cs"
                      ? "Proč mnoho zahraničních kupujících podceňuje prohlídku"
                      : language === "it"
                        ? "Perché molti acquirenti stranieri sottovalutano la visita"
                        : "Why Many Foreign Buyers Underestimate the Visit"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 leading-relaxed mb-4" style={{color:'#4a4a4a', lineHeight:'1.75'}}>
                    {language === "cs"
                      ? "Velmi často kupující ze zahraničí:"
                      : language === "it"
                        ? "Molto spesso chi acquista dall’estero:"
                        : "Very often, buyers purchasing from abroad:"}
                  </p>
                  <ul className="space-y-2">
                    <li className="text-gray-700">
                      •{" "}
                      {language === "cs"
                        ? "má málo času k dispozici"
                        : language === "it"
                          ? "Ha poco tempo a disposizione"
                          : "have very little time available"}
                    </li>
                    <li className="text-gray-700">
                      •{" "}
                      {language === "cs"
                        ? "organizuje pouze jednu návštěvu během několika dnů"
                        : language === "it"
                          ? "Organizza una sola visita in pochi giorni"
                          : "organize only one visit in a few days"}
                    </li>
                    <li className="text-gray-700">
                      •{" "}
                      {language === "cs"
                        ? "nezná místní postupy"
                        : language === "it"
                          ? "Non conosce le prassi locali"
                          : "do not know local practices"}
                    </li>
                    <li className="text-gray-700">
                      •{" "}
                      {language === "cs"
                        ? "neví, jaké technické otázky klást"
                        : language === "it"
                          ? "Non sa quali domande tecniche fare"
                          : "do not know which technical questions to ask"}
                    </li>
                  </ul>
                  <p className="text-gray-500 leading-relaxed mt-4" style={{color:'#4a4a4a', lineHeight:'1.75'}}>
                    {language === "cs"
                      ? "V těchto podmínkách je snadné soustředit se na emoce a přehlédnout zásadní prvky."
                      : language === "it"
                        ? "In queste condizioni è facile concentrarsi sull’emozione e trascurare elementi fondamentali."
                        : "In these conditions, it is easy to focus on emotion and overlook fundamental elements."}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <p className="text-blue-900 font-semibold text-lg leading-relaxed whitespace-pre-line mb-4">
                    {language === "cs"
                      ? "Chcete mít připravený praktický materiál před cestou na prohlídky?\n\nPřipravili jsme samostatný PDF průvodce pro návštěvy nemovitostí v Itálii."
                      : language === "it"
                        ? "Vuoi avere un materiale pratico prima delle visite?\n\nAbbiamo preparato un PDF dedicato alle visite immobiliari in Italia."
                        : "Do you want a practical resource before your visits?\n\nWe prepared a dedicated PDF guide for property visits in Italy."}
                  </p>
                  <Link
                    href="/guides/inspections/free-pdf"
                    className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    {language === "cs"
                      ? "Stáhnout PDF - návštěvy nemovitostí"
                      : language === "it"
                        ? "Scarica il PDF completo sulle visite"
                        : "Download the full inspections PDF"}
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-green-900 mb-4">
                    {language === "cs"
                      ? "Prohlídky organizované s profesionální asistencí"
                      : language === "it"
                        ? "Visite organizzate con assistenza professionale"
                        : "Visits Organized with Professional Assistance"}
                  </h3>
                  <p className="text-green-900 leading-relaxed mb-4">
                    {language === "cs"
                      ? "V rámci naší služby klienty při prohlídkách doprovázíme a pomáháme jim:"
                      : language === "it"
                        ? "Nel nostro servizio accompagniamo i clienti durante le visite, aiutandoli a:"
                        : "In our service, we accompany clients during visits, helping them to:"}
                  </p>
                  <ul className="space-y-2">
                    <li className="text-green-900">
                      •{" "}
                      {language === "cs"
                        ? "správně interpretovat technické aspekty"
                        : language === "it"
                          ? "interpretare gli aspetti tecnici"
                          : "interpret technical aspects"}
                    </li>
                    <li className="text-green-900">
                      •{" "}
                      {language === "cs"
                        ? "odhalit skryté problémy"
                        : language === "it"
                          ? "individuare criticità nascoste"
                          : "identify hidden issues"}
                    </li>
                    <li className="text-green-900">
                      •{" "}
                      {language === "cs"
                        ? "pokládat správné otázky"
                        : language === "it"
                          ? "porre le domande corrette"
                          : "ask the right questions"}
                    </li>
                    <li className="text-green-900">
                      •{" "}
                      {language === "cs"
                        ? "vyhodnotit rizika před podpisem jakékoliv nabídky"
                        : language === "it"
                          ? "valutare i rischi prima di firmare qualsiasi proposta"
                          : "assess risks before signing any offer"}
                    </li>
                  </ul>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link href="/process">
                      <Button variant="outline" size="lg" className="w-full">
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        {language === "cs"
                          ? "Zpět na proces"
                          : language === "it"
                            ? "Torna al processo"
                            : "Back to Process"}
                      </Button>
                    </Link>
                    <Link href="/contact">
                      <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white"
                      >
                        {language === "cs"
                          ? "Kontaktujte nás"
                          : language === "it"
                            ? "Contattateci"
                            : "Contact Us"}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 pb-10" style={{ maxWidth: '1200px' }}>
        <div className="max-w-6xl mx-auto">
          <InformationalDisclaimer language={language} className="mt-14" />
        </div>
      </div>

      <Footer language={language} />
    </div>
  );
}

