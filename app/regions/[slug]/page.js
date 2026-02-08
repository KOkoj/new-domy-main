'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { MapPin, Euro, Home, Sun, Mountain, Waves, ChevronRight, CheckCircle, Mail, MessageSquare, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const REGION_DATA = {
  'friuli-venezia-giulia': {
    name: { en: 'Friuli Venezia Giulia', cs: 'Friuli Venezia Giulia', it: 'Friuli Venezia Giulia' },
    image: '/Friuli-Venezia Giulia.avif',
    tagline: {
      en: 'Where the Alps meet the Adriatic – close to Austria and Slovenia',
      cs: 'Kde se Alpy setkávají s Jadranem – blízko Rakouska a Slovinska',
      it: 'Dove le Alpi incontrano l\'Adriatico – vicino ad Austria e Slovenia'
    },
    description: {
      en: 'Friuli Venezia Giulia is one of the most popular choices for Czech buyers thanks to its excellent accessibility from the Czech Republic. The region offers a unique combination of alpine landscapes, Adriatic coastline, and rich cultural heritage influenced by Austrian, Slovenian, and Italian traditions.',
      cs: 'Friuli Venezia Giulia je jednou z nejoblíbenějších voleb českých kupujících díky vynikající dostupnosti z České republiky. Region nabízí unikátní kombinaci alpské krajiny, jadranského pobřeží a bohatého kulturního dědictví ovlivněného rakouskými, slovinskými a italskými tradicemi.',
      it: 'Il Friuli Venezia Giulia è una delle scelte più popolari per gli acquirenti cechi grazie alla sua eccellente accessibilità dalla Repubblica Ceca. La regione offre una combinazione unica di paesaggi alpini, costa adriatica e ricco patrimonio culturale influenzato da tradizioni austriache, slovene e italiane.'
    },
    highlights: {
      en: ['Close to Austria and Slovenia', 'Alps and Adriatic sea', 'Excellent accessibility from CZ', 'Lower prices than Veneto', 'Rich wine culture', 'Trieste – multicultural capital'],
      cs: ['Blízkost Rakouska a Slovinska', 'Alpy i Jaderské moře', 'Vynikající dostupnost z ČR', 'Nižší ceny než Veneto', 'Bohatá vinařská kultura', 'Terst – multikulturní hlavní město'],
      it: ['Vicino ad Austria e Slovenia', 'Alpi e mare Adriatico', 'Eccellente accessibilità dalla CZ', 'Prezzi più bassi del Veneto', 'Ricca cultura vinicola', 'Trieste – capitale multiculturale']
    },
    priceRange: '€50,000 – €500,000',
    bestFor: { en: 'Accessibility, year-round use, wine lovers', cs: 'Dostupnost, celoroční využití, milovníci vína', it: 'Accessibilità, uso tutto l\'anno, amanti del vino' },
    topCities: ['Trieste', 'Udine', 'Gorizia', 'Pordenone']
  },
  'puglia': {
    name: { en: 'Puglia', cs: 'Puglia (Apulie)', it: 'Puglia' },
    image: '/Puglia.webp',
    tagline: {
      en: 'Authentic southern Italy – sea, sun, and trulli houses',
      cs: 'Autentická jižní Itálie – moře, slunce a domy trulli',
      it: 'Autentica Italia meridionale – mare, sole e trulli'
    },
    description: {
      en: 'Puglia is the heel of Italy\'s boot, offering some of the country\'s most beautiful coastline, whitewashed villages, and authentic Italian culture. The region has become increasingly popular among foreign buyers seeking the genuine southern Italian lifestyle at still reasonable prices.',
      cs: 'Puglia je podpatek italské boty, nabízí jedny z nejkrásnějších pobřeží země, bíle natřené vesnice a autentickou italskou kulturu. Region se stává stále populárnějším mezi zahraničními kupujícími, kteří hledají autentický jihoitalský životní styl za stále rozumné ceny.',
      it: 'La Puglia è il tacco dello stivale italiano, che offre alcune delle più belle coste del paese, villaggi imbiancati e autentica cultura italiana. La regione è diventata sempre più popolare tra gli acquirenti stranieri che cercano l\'autentico stile di vita del sud Italia a prezzi ancora ragionevoli.'
    },
    highlights: {
      en: ['Beautiful Adriatic coastline', 'Authentic Italian culture', 'Trulli houses in Alberobello', 'Excellent cuisine', 'Warm climate year-round', 'Growing investment potential'],
      cs: ['Krásné jadranské pobřeží', 'Autentická italská kultura', 'Domy trulli v Alberobello', 'Vynikající kuchyně', 'Teplé klima po celý rok', 'Rostoucí investiční potenciál'],
      it: ['Bellissima costa adriatica', 'Autentica cultura italiana', 'Trulli di Alberobello', 'Eccellente cucina', 'Clima caldo tutto l\'anno', 'Crescente potenziale di investimento']
    },
    priceRange: '€30,000 – €400,000',
    bestFor: { en: 'Sea, authentic Italy, affordable prices', cs: 'Moře, autentická Itálie, dostupné ceny', it: 'Mare, Italia autentica, prezzi accessibili' },
    topCities: ['Lecce', 'Bari', 'Ostuni', 'Alberobello', 'Polignano a Mare']
  },
  'calabria': {
    name: { en: 'Calabria', cs: 'Kalábrie', it: 'Calabria' },
    image: '/calabria.jpg',
    tagline: {
      en: 'Beautiful coastline and some of Italy\'s most attractive prices',
      cs: 'Krásné pobřeží a jedny z nejzajímavějších cen v Itálii',
      it: 'Bellissima costa e alcuni dei prezzi più interessanti d\'Italia'
    },
    description: {
      en: 'Calabria, the toe of Italy\'s boot, is known for its stunning Tyrrhenian and Ionian coastlines, dramatic mountain scenery, and remarkably affordable real estate. It\'s one of the regions where Czech buyers can find properties at very attractive prices while enjoying authentic southern Italian lifestyle.',
      cs: 'Kalábrie, špička italské boty, je známá svým úchvatným tyrhénským a iónským pobřežím, dramatickou horskou scenérií a pozoruhodně dostupnými nemovitostmi. Je to jeden z regionů, kde čeští kupující mohou najít nemovitosti za velmi zajímavé ceny a přitom si užívat autentický jihoitalský životní styl.',
      it: 'La Calabria, la punta dello stivale italiano, è nota per le sue splendide coste tirreniche e ioniche, il drammatico paesaggio montano e gli immobili sorprendentemente accessibili.'
    },
    highlights: {
      en: ['Very affordable prices', 'Beautiful coastline', 'Dramatic mountains', 'Authentic culture', 'Mild winters', 'Low cost of living'],
      cs: ['Velmi dostupné ceny', 'Krásné pobřeží', 'Dramatické hory', 'Autentická kultura', 'Mírné zimy', 'Nízké životní náklady'],
      it: ['Prezzi molto accessibili', 'Bellissima costa', 'Montagne spettacolari', 'Cultura autentica', 'Inverni miti', 'Basso costo della vita']
    },
    priceRange: '€20,000 – €250,000',
    bestFor: { en: 'Budget-friendly, coastline, quiet life', cs: 'Nízký rozpočet, pobřeží, klidný život', it: 'Economico, costa, vita tranquilla' },
    topCities: ['Tropea', 'Cosenza', 'Reggio Calabria', 'Catanzaro']
  },
  'sicilia': {
    name: { en: 'Sicily', cs: 'Sicílie', it: 'Sicilia' },
    image: '/Sicilia.jpg',
    tagline: {
      en: 'Italy\'s largest island – wide selection and diverse locations',
      cs: 'Největší italský ostrov – široký výběr a různorodé lokality',
      it: 'La più grande isola d\'Italia – ampia scelta e località diverse'
    },
    description: {
      en: 'Sicily is a world unto itself – Italy\'s largest island offering everything from ancient Greek temples to Baroque cities, volcanic landscapes to pristine beaches. The property market is remarkably diverse, with options ranging from renovation projects to luxury coastal villas.',
      cs: 'Sicílie je svět sám pro sebe – největší italský ostrov nabízející vše od starověkých řeckých chrámů po barokní města, od sopečné krajiny po panenské pláže. Trh s nemovitostmi je pozoruhodně rozmanitý, s možnostmi od rekonstrukčních projektů po luxusní pobřežní vily.',
      it: 'La Sicilia è un mondo a sé – la più grande isola d\'Italia che offre di tutto, dai templi greci antichi alle città barocche, dai paesaggi vulcanici alle spiagge incontaminate.'
    },
    highlights: {
      en: ['Wide selection of properties', 'Rich history and culture', 'Affordable to luxury options', 'Beautiful beaches', 'Excellent food', 'Diverse landscapes'],
      cs: ['Široký výběr nemovitostí', 'Bohatá historie a kultura', 'Od dostupných po luxusní', 'Krásné pláže', 'Vynikající jídlo', 'Rozmanité krajiny'],
      it: ['Ampia scelta di immobili', 'Ricca storia e cultura', 'Da economiche a lussuose', 'Bellissime spiagge', 'Eccellente cibo', 'Paesaggi diversi']
    },
    priceRange: '€25,000 – €1,000,000',
    bestFor: { en: 'Diversity, culture, island lifestyle', cs: 'Různorodost, kultura, ostrovní životní styl', it: 'Diversità, cultura, stile di vita isolano' },
    topCities: ['Palermo', 'Catania', 'Taormina', 'Syracuse', 'Cefalù']
  },
  'toscana': {
    name: { en: 'Tuscany', cs: 'Toskánsko', it: 'Toscana' },
    image: '/Toscana.png',
    tagline: {
      en: 'Iconic Italian landscape – tradition, vineyards, and higher prices',
      cs: 'Ikonická italská krajina – tradice, vinice a vyšší ceny',
      it: 'Iconico paesaggio italiano – tradizione, vigneti e prezzi più alti'
    },
    description: {
      en: 'Tuscany is perhaps the most iconic Italian region for foreign buyers. The rolling hills, medieval hilltop towns, world-class wines, and Renaissance art create an irresistible appeal. However, this popularity comes with higher price tags compared to southern regions.',
      cs: 'Toskánsko je možná nejikoničtějším italským regionem pro zahraniční kupující. Zvlněné kopce, středověká městečka na vrcholcích kopců, vína světové úrovně a renesanční umění vytvářejí neodolatelnou přitažlivost. Tato popularita však přichází s vyššími cenami ve srovnání s jižními regiony.',
      it: 'La Toscana è forse la regione italiana più iconica per gli acquirenti stranieri. Le colline ondulate, i borghi medievali, i vini di classe mondiale e l\'arte rinascimentale creano un\'attrattiva irresistibile.'
    },
    highlights: {
      en: ['World-famous landscape', 'Florence and historic cities', 'Wine regions (Chianti)', 'Renaissance art', 'Established expat communities', 'Strong rental market'],
      cs: ['Světově proslulá krajina', 'Florencie a historická města', 'Vinařské oblasti (Chianti)', 'Renesanční umění', 'Zavedené komunity expatů', 'Silný trh s pronájmy'],
      it: ['Paesaggio famoso in tutto il mondo', 'Firenze e città storiche', 'Regioni vinicole (Chianti)', 'Arte rinascimentale', 'Comunità di espatriati', 'Forte mercato degli affitti']
    },
    priceRange: '€150,000 – €5,000,000',
    bestFor: { en: 'Prestige, wine, culture, rental income', cs: 'Prestiž, víno, kultura, příjem z pronájmu', it: 'Prestigio, vino, cultura, reddito da affitto' },
    topCities: ['Florence', 'Siena', 'Lucca', 'Pisa', 'Arezzo']
  },
  'liguria': {
    name: { en: 'Liguria', cs: 'Ligurie', it: 'Liguria' },
    image: '/Liguria.webp',
    tagline: {
      en: 'Italian Riviera – coastline and proximity to France',
      cs: 'Italská riviera – pobřeží a blízkost Francie',
      it: 'Riviera italiana – costa e vicinanza alla Francia'
    },
    description: {
      en: 'Liguria is home to the famous Italian Riviera, Cinque Terre, and elegant coastal towns like Portofino and Sanremo. The narrow strip of coastline backed by mountains offers a unique microclimate and stunning scenery. Properties here tend to be compact but with exceptional views.',
      cs: 'Ligurie je domovem slavné italské rivieéry, Cinque Terre a elegantních pobřežních městeček jako Portofino a Sanremo. Úzký pás pobřeží podepřený horami nabízí unikátní mikroklima a úchvatnou scenérii. Nemovitosti zde bývají kompaktní, ale s výjimečnými výhledy.',
      it: 'La Liguria ospita la famosa Riviera italiana, le Cinque Terre e le eleganti città costiere come Portofino e Sanremo. La stretta striscia di costa sostenuta dalle montagne offre un microclima unico e un paesaggio mozzafiato.'
    },
    highlights: {
      en: ['Italian Riviera', 'Cinque Terre', 'Mild Mediterranean climate', 'Close to France', 'Portofino and Sanremo', 'Excellent seafood'],
      cs: ['Italská riviéra', 'Cinque Terre', 'Mírné středomořské klima', 'Blízkost Francie', 'Portofino a Sanremo', 'Vynikající mořské plody'],
      it: ['Riviera italiana', 'Cinque Terre', 'Clima mediterraneo mite', 'Vicino alla Francia', 'Portofino e Sanremo', 'Eccellenti frutti di mare']
    },
    priceRange: '€100,000 – €3,000,000',
    bestFor: { en: 'Coastal lifestyle, mild climate, France access', cs: 'Pobřežní životní styl, mírné klima, blízkost Francie', it: 'Stile di vita costiero, clima mite, accesso alla Francia' },
    topCities: ['Genoa', 'Sanremo', 'Portofino', 'La Spezia']
  },
  'lago-di-garda': {
    name: { en: 'Lake Garda Area', cs: 'Lago di Garda', it: 'Lago di Garda' },
    image: '/Veneto.webp',
    tagline: {
      en: 'Great accessibility from CZ and high demand',
      cs: 'Dobrá dostupnost z ČR a vysoká poptávka',
      it: 'Ottima accessibilità dalla CZ e alta domanda'
    },
    description: {
      en: 'Lake Garda, Italy\'s largest lake, spans three regions (Veneto, Lombardy, Trentino) and is one of the most sought-after areas for Czech buyers. Its proximity to the Czech Republic (6-7 hours by car), stunning lake scenery, and year-round usability make it a perennial favorite.',
      cs: 'Lago di Garda, největší italské jezero, se rozprostírá přes tři regiony (Veneto, Lombardie, Trentino) a je jednou z nejvyhledávanějších oblastí pro české kupující. Blízkost České republiky (6-7 hodin autem), úchvatná jezerní scenérie a celoroční využitelnost z něj dělají trvalého favorita.',
      it: 'Il Lago di Garda, il più grande lago italiano, si estende su tre regioni (Veneto, Lombardia, Trentino) ed è una delle aree più ricercate dagli acquirenti cechi. La vicinanza alla Repubblica Ceca (6-7 ore in auto) e l\'usabilità tutto l\'anno lo rendono un favorito perenne.'
    },
    highlights: {
      en: ['6-7 hours from Czech Republic', 'Year-round usability', 'Water sports and outdoor activities', 'Mild microclimate', 'Strong property market', 'Excellent infrastructure'],
      cs: ['6-7 hodin z České republiky', 'Celoroční využitelnost', 'Vodní sporty a outdoorové aktivity', 'Mírné mikroklima', 'Silný trh s nemovitostmi', 'Vynikající infrastruktura'],
      it: ['6-7 ore dalla Repubblica Ceca', 'Usabilità tutto l\'anno', 'Sport acquatici e attività all\'aperto', 'Microclima mite', 'Forte mercato immobiliare', 'Eccellente infrastruttura']
    },
    priceRange: '€150,000 – €2,000,000',
    bestFor: { en: 'Accessibility, lake lifestyle, year-round use', cs: 'Dostupnost, jezerní životní styl, celoroční využití', it: 'Accessibilità, stile di vita lacustre, uso tutto l\'anno' },
    topCities: ['Desenzano', 'Sirmione', 'Malcesine', 'Riva del Garda', 'Bardolino']
  },
  'alpy': {
    name: { en: 'Italian Alps / Northern Italy', cs: 'Alpy / sever Itálie', it: 'Alpi / Nord Italia' },
    image: '/Trentino-Alto Adige.jpg',
    tagline: {
      en: 'Year-round use – mountains, skiing, and hiking',
      cs: 'Celoroční využití – hory, lyžování a turistika',
      it: 'Uso tutto l\'anno – montagna, sci ed escursionismo'
    },
    description: {
      en: 'The Italian Alps, primarily in Trentino-Alto Adige and Valle d\'Aosta, offer Czech buyers a familiar mountain environment with Italian flair. These regions are ideal for those seeking year-round usability – skiing in winter, hiking in summer – combined with excellent food, wine, and a high quality of life.',
      cs: 'Italské Alpy, především v Trentino-Alto Adige a Valle d\'Aosta, nabízejí českým kupujícím známé horské prostředí s italským nádechem. Tyto regiony jsou ideální pro ty, kteří hledají celoroční využitelnost – lyžování v zimě, turistiku v létě – v kombinaci s vynikajícím jídlem, vínem a vysokou kvalitou života.',
      it: 'Le Alpi italiane, principalmente in Trentino-Alto Adige e Valle d\'Aosta, offrono agli acquirenti cechi un ambiente montano familiare con un tocco italiano. Queste regioni sono ideali per chi cerca un utilizzo tutto l\'anno.'
    },
    highlights: {
      en: ['Skiing and winter sports', 'Summer hiking trails', 'Year-round usability', 'High quality of life', 'Alpine cuisine', 'Austrian/German influence'],
      cs: ['Lyžování a zimní sporty', 'Letní turistické trasy', 'Celoroční využitelnost', 'Vysoká kvalita života', 'Alpská kuchyně', 'Rakouský/německý vliv'],
      it: ['Sci e sport invernali', 'Sentieri escursionistici estivi', 'Usabilità tutto l\'anno', 'Alta qualità della vita', 'Cucina alpina', 'Influenza austriaca/tedesca']
    },
    priceRange: '€100,000 – €1,500,000',
    bestFor: { en: 'Mountains, skiing, year-round activities', cs: 'Hory, lyžování, celoroční aktivity', it: 'Montagna, sci, attività tutto l\'anno' },
    topCities: ['Bolzano', 'Trento', 'Merano', 'Courmayeur', 'Cortina d\'Ampezzo']
  },
  'abruzzo': {
    name: { en: 'Abruzzo', cs: 'Abruzzo', it: 'Abruzzo' },
    image: '/abruzzo.jpg',
    tagline: {
      en: 'Mountains, nature, tranquility, and affordable prices',
      cs: 'Hory, příroda, klid a dostupné ceny',
      it: 'Montagne, natura, tranquillità e prezzi accessibili'
    },
    description: {
      en: 'Abruzzo is often called the "greenest region in Europe" thanks to its national parks covering nearly a third of its territory. It combines dramatic mountain scenery with Adriatic coastline and offers some of the most affordable property prices in central Italy.',
      cs: 'Abruzzo je často nazýváno „nejzelenějším regionem Evropy" díky národním parkům pokrývajícím téměř třetinu jeho území. Kombinuje dramatickou horskou scenérii s jadranským pobřežím a nabízí jedny z nejdostupnějších cen nemovitostí ve střední Itálii.',
      it: 'L\'Abruzzo è spesso chiamata la "regione più verde d\'Europa" grazie ai parchi nazionali che coprono quasi un terzo del suo territorio.'
    },
    highlights: {
      en: ['National parks', 'Affordable prices', 'Mountains and sea', 'Quiet lifestyle', 'Good food traditions', 'Growing expat community'],
      cs: ['Národní parky', 'Dostupné ceny', 'Hory i moře', 'Klidný životní styl', 'Dobré kulinářské tradice', 'Rostoucí komunita expatů'],
      it: ['Parchi nazionali', 'Prezzi accessibili', 'Montagne e mare', 'Stile di vita tranquillo', 'Buone tradizioni culinarie', 'Comunità di espatriati in crescita']
    },
    priceRange: '€25,000 – €300,000',
    bestFor: { en: 'Nature, quiet, budget-friendly', cs: 'Příroda, klid, nízký rozpočet', it: 'Natura, tranquillità, economico' },
    topCities: ['L\'Aquila', 'Pescara', 'Chieti', 'Teramo']
  },
  'umbria': {
    name: { en: 'Umbria', cs: 'Umbrie', it: 'Umbria' },
    image: '/Umbria.webp',
    tagline: {
      en: 'The green heart of Italy – history, countryside, rural life',
      cs: 'Zelené srdce Itálie – historie, venkov, venkovský život',
      it: 'Il cuore verde d\'Italia – storia, campagna, vita rurale'
    },
    description: {
      en: 'Umbria is often called "the green heart of Italy" and offers a quieter, more affordable alternative to neighboring Tuscany. The region features medieval hilltop towns, rolling countryside, and a deeply rooted rural culture. It\'s perfect for those seeking authentic Italian country life.',
      cs: 'Umbrie je často nazývána „zeleným srdcem Itálie" a nabízí klidnější a cenově dostupnější alternativu sousedního Toskánska. Region se vyznačuje středověkými městečky na kopcích, zvlněnou krajinou a hluboce zakořeněnou venkovskou kulturou. Je ideální pro ty, kteří hledají autentický italský venkovský život.',
      it: 'L\'Umbria è spesso chiamata "il cuore verde d\'Italia" e offre un\'alternativa più tranquilla e accessibile alla vicina Toscana.'
    },
    highlights: {
      en: ['Quieter than Tuscany', 'Medieval hilltop towns', 'Rolling countryside', 'Excellent food and wine', 'Lower prices', 'Authentic rural culture'],
      cs: ['Klidnější než Toskánsko', 'Středověká městečka na kopcích', 'Zvlněná krajina', 'Vynikající jídlo a víno', 'Nižší ceny', 'Autentická venkovská kultura'],
      it: ['Più tranquilla della Toscana', 'Borghi medievali', 'Campagna ondulata', 'Eccellente cibo e vino', 'Prezzi più bassi', 'Autentica cultura rurale']
    },
    priceRange: '€60,000 – €800,000',
    bestFor: { en: 'Countryside, history, Tuscany alternative', cs: 'Venkov, historie, alternativa k Toskánsku', it: 'Campagna, storia, alternativa alla Toscana' },
    topCities: ['Perugia', 'Assisi', 'Orvieto', 'Spoleto', 'Todi']
  },
  'sardegna': {
    name: { en: 'Sardinia', cs: 'Sardinie', it: 'Sardegna' },
    image: '/Sardegna.jpg',
    tagline: {
      en: 'Sea, nature, and exclusive locations',
      cs: 'Moře, příroda a exkluzivní lokality',
      it: 'Mare, natura e località esclusive'
    },
    description: {
      en: 'Sardinia is an island of stunning contrasts – from the ultra-exclusive Costa Smeralda to remote, affordable inland villages. The island offers some of the most beautiful beaches in the Mediterranean, unique Nuragic archaeological sites, and a distinct culture that sets it apart from mainland Italy.',
      cs: 'Sardinie je ostrov úchvatných kontrastů – od ultraexkluzivní Costa Smeralda po odlehlé, cenově dostupné vnitrozemské vesnice. Ostrov nabízí jedny z nejkrásnějších pláží ve Středozemním moři, unikátní nurážské archeologické lokality a odlišnou kulturu, která ho odlišuje od pevninské Itálie.',
      it: 'La Sardegna è un\'isola di contrasti mozzafiato – dall\'ultraesclusiva Costa Smeralda ai remoti villaggi dell\'entroterra. L\'isola offre alcune delle più belle spiagge del Mediterraneo.'
    },
    highlights: {
      en: ['Stunning beaches', 'Costa Smeralda luxury', 'Unique culture', 'Archaeological sites', 'Clear turquoise water', 'Excellent diving'],
      cs: ['Úchvatné pláže', 'Luxus Costa Smeralda', 'Unikátní kultura', 'Archeologické lokality', 'Čistá tyrkysová voda', 'Vynikající potápění'],
      it: ['Spiagge mozzafiato', 'Lusso Costa Smeralda', 'Cultura unica', 'Siti archeologici', 'Acqua turchese cristallina', 'Eccellenti immersioni']
    },
    priceRange: '€50,000 – €5,000,000',
    bestFor: { en: 'Beach, exclusivity, nature', cs: 'Pláže, exkluzivita, příroda', it: 'Spiaggia, esclusività, natura' },
    topCities: ['Cagliari', 'Olbia', 'Alghero', 'Porto Cervo', 'Sassari']
  }
}

export default function RegionDetailPage() {
  const params = useParams()
  const [language, setLanguage] = useState('en')
  const region = REGION_DATA[params.slug]

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

  if (!region) {
    return (
      <div className="min-h-screen bg-[#faf8f5]">
        <Navigation />
        <div className="pt-32 pb-12 text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            {language === 'cs' ? 'Region nenalezen' : language === 'it' ? 'Regione non trovata' : 'Region Not Found'}
          </h1>
          <Link href="/regions">
            <Button className="bg-slate-700 hover:bg-slate-600 text-white">
              {language === 'cs' ? 'Zpět na regiony' : language === 'it' ? 'Torna alle regioni' : 'Back to Regions'}
            </Button>
          </Link>
        </div>
        <Footer language={language} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navigation />

      <div className="pt-32 pb-12">
        {/* Hero with Region Image */}
        <div className="relative mb-8">
          <div className="h-64 md:h-96 overflow-hidden">
            <img 
              src={region.image} 
              alt={region.name[language]} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <div className="max-w-4xl">
                <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 mb-4">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {language === 'cs' ? 'Region Itálie' : language === 'it' ? 'Regione d\'Italia' : 'Italian Region'}
                </Badge>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
                  {region.name[language]}
                </h1>
                <p className="text-lg md:text-xl text-white/90 drop-shadow-md max-w-2xl">
                  {region.tagline[language]}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          {/* Quick Stats */}
          <div className="max-w-5xl mx-auto mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-2xl">
                <CardContent className="p-6 text-center">
                  <Euro className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-1">
                    {language === 'cs' ? 'Cenové rozpětí' : language === 'it' ? 'Fascia di prezzo' : 'Price Range'}
                  </p>
                  <p className="text-xl font-bold text-slate-800">{region.priceRange}</p>
                </CardContent>
              </Card>
              <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-2xl">
                <CardContent className="p-6 text-center">
                  <Home className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-1">
                    {language === 'cs' ? 'Nejvhodnější pro' : language === 'it' ? 'Ideale per' : 'Best For'}
                  </p>
                  <p className="text-lg font-semibold text-slate-800">{region.bestFor[language]}</p>
                </CardContent>
              </Card>
              <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-2xl">
                <CardContent className="p-6 text-center">
                  <MapPin className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-1">
                    {language === 'cs' ? 'Hlavní města' : language === 'it' ? 'Città principali' : 'Top Cities'}
                  </p>
                  <p className="text-lg font-semibold text-slate-800">{region.topCities.slice(0, 3).join(', ')}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Description */}
          <div className="max-w-5xl mx-auto mb-12">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {region.description[language]}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Highlights */}
          <div className="max-w-5xl mx-auto mb-12">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-gray-100">
                <CardTitle className="text-2xl font-bold text-slate-800">
                  {language === 'cs' ? 'Proč zvolit tento region' : language === 'it' ? 'Perché scegliere questa regione' : 'Why Choose This Region'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {region.highlights[language].map((highlight, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-base">{highlight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Cities */}
          <div className="max-w-5xl mx-auto mb-12">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-gray-100">
                <CardTitle className="text-2xl font-bold text-slate-800">
                  {language === 'cs' ? 'Hlavní města a lokality' : language === 'it' ? 'Città e località principali' : 'Top Cities & Locations'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex flex-wrap gap-3">
                  {region.topCities.map((city, index) => (
                    <Badge key={index} className="bg-slate-100 text-slate-700 border-slate-200 px-4 py-2 text-base">
                      <MapPin className="h-3.5 w-3.5 mr-1.5" />
                      {city}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking.com + GetYourGuide Section */}
          <div className="max-w-5xl mx-auto mb-12">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <h3 className="text-2xl font-bold mb-4 text-slate-800">
                  {language === 'cs' ? 'Chcete region poznat osobně?' :
                   language === 'it' ? 'Volete conoscere la regione di persona?' :
                   'Want to Experience the Region Personally?'}
                </h3>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  {language === 'cs' ? 'Mnoho klientů si před koupí vybírá region tak, že ho nejprve navštíví osobně – projde okolí, porovná lokality a atmosféru.' :
                   language === 'it' ? 'Molti clienti prima dell\'acquisto scelgono la regione visitandola di persona – esplorano i dintorni, confrontano località e atmosfera.' :
                   'Many clients choose their region by visiting it personally first – exploring the surroundings, comparing locations and atmosphere.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-105 shadow-lg"
                    onClick={() => window.open('https://www.dpbolvw.net/click-101629596-15735418', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {language === 'cs' ? 'Najít ubytování (Booking.com)' :
                     language === 'it' ? 'Trova alloggio (Booking.com)' :
                     'Find Accommodation (Booking.com)'}
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg" 
                    className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-105"
                    onClick={() => window.open('https://gyg.me/O0X6ZC2R', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {language === 'cs' ? 'Výlety a průvodce (GetYourGuide)' :
                     language === 'it' ? 'Escursioni e guide (GetYourGuide)' :
                     'Tours & Guides (GetYourGuide)'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="max-w-4xl mx-auto text-center">
            <Card className="bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-2xl rounded-2xl overflow-hidden">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold mb-4">
                  {language === 'cs' ? 'Chcete doporučení na míru?' :
                   language === 'it' ? 'Volete una raccomandazione personalizzata?' :
                   'Want Personalized Recommendations?'}
                </h2>
                <p className="text-slate-200 text-lg mb-8 leading-relaxed">
                  {language === 'cs' ? 'Každá situace je jiná. Doporučíme vám region podle rozpočtu, cíle a způsobu využití nemovitosti.' :
                   language === 'it' ? 'Ogni situazione è diversa. Vi raccomanderemo la regione in base al budget, all\'obiettivo e al modo di utilizzo dell\'immobile.' :
                   'Every situation is different. We\'ll recommend the region based on your budget, goal, and intended property use.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="https://wa.me/420731450001" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="w-full sm:w-auto bg-white hover:bg-gray-100 text-slate-800 font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-105 shadow-lg">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      WhatsApp
                    </Button>
                  </a>
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-white hover:bg-gray-100 text-slate-800 font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-105 shadow-lg"
                    onClick={() => window.location.href = 'mailto:info@domyvitalii.cz'}
                  >
                    <Mail className="h-5 w-5 mr-2" />
                    info@domyvitalii.cz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer language={language} />
    </div>
  )
}
