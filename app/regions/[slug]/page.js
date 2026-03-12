'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { MapPin, Euro, Home, Sun, Mountain, Waves, ChevronRight, CheckCircle, MessageSquare, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Script from 'next/script'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { REGION_DATA_OVERRIDES } from '../regionContent'
import { REGION_CURIOSITIES } from '../regionCuriosities'

const DEFAULT_BOOKING_LINK = 'https://www.dpbolvw.net/click-101629596-15735418'
const REGION_BOOKING_LINKS = {
  lombardia:
    'https://www.booking.com/searchresults.cs.html?aid=1522416&label=affnetcj-15735418_pub-7711899_site-101629596_pname-Creavita+sro_clkid-_cjevent-23f68d511e0e11f183fd00400a18ba73&lang=cs&sid=f9245db3ab66c6aaf5f923e76887184f&sb=1&sb_lp=1&src=index&src_elem=sb&error_url=https%3A%2F%2Fwww.booking.com%2Findex.cs.html%3Faid%3D1522416%26label%3Daffnetcj-15735418_pub-7711899_site-101629596_pname-Creavita%2520sro_clkid-_cjevent-23f68d511e0e11f183fd00400a18ba73%26sid%3Df9245db3ab66c6aaf5f923e76887184f%26sb_price_type%3Dtotal%26&ss=Riva+del+Garda%2C+Trentino-Alto+Adige%2C+Italia&is_ski_area=&checkin_year=&checkin_month=&checkout_year=&checkout_month=&flex_window=0&efdco=1&group_adults=2&group_children=0&no_rooms=1&b_h4u_keep_filters=&from_sf=1&ss_raw=lago+di+garda&ac_position=1&ac_langcode=it&ac_click_type=b&ac_meta=GhA2YTdmNTcxNGExNmIwMjlmIAEoATICaXQ6DWxhZ28gZGkgZ2FyZGFAAEoAUAA%3D&dest_id=-126468&dest_type=city&place_id_lat=45.88506&place_id_lon=10.838951&search_pageview_id=8f4d570d21da0186&search_selected=true&search_pageview_id=8f4d570d21da0186&ac_suggestion_list_length=5&ac_suggestion_theme_list_length=0',
  lombardy:
    'https://www.booking.com/searchresults.cs.html?aid=1522416&label=affnetcj-15735418_pub-7711899_site-101629596_pname-Creavita+sro_clkid-_cjevent-23f68d511e0e11f183fd00400a18ba73&lang=cs&sid=f9245db3ab66c6aaf5f923e76887184f&sb=1&sb_lp=1&src=index&src_elem=sb&error_url=https%3A%2F%2Fwww.booking.com%2Findex.cs.html%3Faid%3D1522416%26label%3Daffnetcj-15735418_pub-7711899_site-101629596_pname-Creavita%2520sro_clkid-_cjevent-23f68d511e0e11f183fd00400a18ba73%26sid%3Df9245db3ab66c6aaf5f923e76887184f%26sb_price_type%3Dtotal%26&ss=Riva+del+Garda%2C+Trentino-Alto+Adige%2C+Italia&is_ski_area=&checkin_year=&checkin_month=&checkout_year=&checkout_month=&flex_window=0&efdco=1&group_adults=2&group_children=0&no_rooms=1&b_h4u_keep_filters=&from_sf=1&ss_raw=lago+di+garda&ac_position=1&ac_langcode=it&ac_click_type=b&ac_meta=GhA2YTdmNTcxNGExNmIwMjlmIAEoATICaXQ6DWxhZ28gZGkgZ2FyZGFAAEoAUAA%3D&dest_id=-126468&dest_type=city&place_id_lat=45.88506&place_id_lon=10.838951&search_pageview_id=8f4d570d21da0186&search_selected=true&search_pageview_id=8f4d570d21da0186&ac_suggestion_list_length=5&ac_suggestion_theme_list_length=0'
}
const DEFAULT_GYG_LINK = 'https://gyg.me/O0X6ZC2R'
const REGION_GYG_LINKS = {
  lombardia: 'https://gyg.me/tVi5p3To',
  toscana: 'https://www.getyourguide.com/toscana-l558/',
  'trentino-alto-adige': 'https://www.getyourguide.com/trentino-alto-adigesudtirol-l2493/',
  liguria: 'https://www.getyourguide.com/liguria-l221/',
  piemonte: 'https://www.getyourguide.com/piemonte-l598/',
  'friuli-venezia-giulia': 'https://www.getyourguide.com/friuli-venezia-giulia-l1130/',
  veneto: 'https://www.getyourguide.com/veneto-l222/',
  'valle-d-aosta': 'https://www.getyourguide.com/valle-d-aosta-l2478/',
  'emilia-romagna': 'https://www.getyourguide.com/emilia-romagna-l252/',
  marche: 'https://www.getyourguide.com/marche-l257/',
  umbria: 'https://www.getyourguide.com/comune-di-perugia-l1507/',
  lazio: 'https://www.getyourguide.com/lazio-l862/',
  molise: 'https://www.getyourguide.com/molise-l197924/',
  abruzzo: 'https://www.getyourguide.com/abruzzo-l1174/',
  campania: 'https://www.getyourguide.com/pompei-campania-l156880/',
  puglia: 'https://www.getyourguide.com/puglia-l727/',
  calabria: 'https://www.getyourguide.com/calabria-l733/',
  sicilia: 'https://www.getyourguide.com/sicilia-l65/',
  sardegna: 'https://www.getyourguide.com/sardegna-l249/'
}
const REGION_GYG_WIDGET_CONFIGS = {
  lombardia: { query: 'lombardia', destinationLink: 'https://www.getyourguide.com/lombardia-l310/' },
  toscana: { locationId: '558', destinationLink: 'https://www.getyourguide.com/toscana-l558/' },
  'trentino-alto-adige': { locationId: '2493', destinationLink: 'https://www.getyourguide.com/trentino-alto-adigesudtirol-l2493/' },
  liguria: { locationId: '221', destinationLink: 'https://www.getyourguide.com/liguria-l221/' },
  piemonte: { locationId: '598', destinationLink: 'https://www.getyourguide.com/piemonte-l598/' },
  'friuli-venezia-giulia': { locationId: '1130', destinationLink: 'https://www.getyourguide.com/friuli-venezia-giulia-l1130/' },
  veneto: { locationId: '222', destinationLink: 'https://www.getyourguide.com/veneto-l222/' },
  'valle-d-aosta': { locationId: '2478', destinationLink: 'https://www.getyourguide.com/valle-d-aosta-l2478/' },
  'emilia-romagna': { locationId: '252', destinationLink: 'https://www.getyourguide.com/emilia-romagna-l252/' },
  marche: { locationId: '257', destinationLink: 'https://www.getyourguide.com/marche-l257/' },
  umbria: { locationId: '1507', destinationLink: 'https://www.getyourguide.com/comune-di-perugia-l1507/' },
  lazio: { locationId: '862', destinationLink: 'https://www.getyourguide.com/lazio-l862/' },
  molise: { locationId: '197924', destinationLink: 'https://www.getyourguide.com/molise-l197924/' },
  abruzzo: { locationId: '1174', destinationLink: 'https://www.getyourguide.com/abruzzo-l1174/' },
  campania: { locationId: '156880', destinationLink: 'https://www.getyourguide.com/pompei-campania-l156880/' },
  puglia: { locationId: '727', destinationLink: 'https://www.getyourguide.com/puglia-l727/' },
  calabria: { locationId: '733', destinationLink: 'https://www.getyourguide.com/calabria-l733/' },
  sicilia: { locationId: '65', destinationLink: 'https://www.getyourguide.com/sicilia-l65/' },
  sardegna: { locationId: '249', destinationLink: 'https://www.getyourguide.com/sardegna-l249/' }
}

const REGION_DATA = {
  'friuli-venezia-giulia': {
    name: { en: 'Friuli Venezia Giulia', cs: 'Friuli Venezia Giulia', it: 'Friuli Venezia Giulia' },
    image: '/Friuli-Venezia Giulia.avif',
    tagline: {
      en: 'Where the Alps meet the Adriatic A aas close to Austria and Slovenia',
      cs: 'Kde se Alpy setkAEvajAA s Jadranem A aas blAAzko Rakouska a Slovinska',
      it: 'Dove le Alpi incontrano l\'Adriatico A aas vicino ad Austria e Slovenia'
    },
    description: {
      en: 'Friuli Venezia Giulia is one of the most popular choices for Czech buyers thanks to its excellent accessibility from the Czech Republic. The region offers a unique combination of alpine landscapes, Adriatic coastline, and rich cultural heritage influenced by Austrian, Slovenian, and Italian traditions.',
      cs: 'Friuli Venezia Giulia je jednou z nejoblAAbenAasjAaEAAch voleb ALeskAEtch kupujAAcAAch dAAky vynikajAAcAA dostupnosti z ALseskAA republiky. Region nabAAzAA unikAEtnAA kombinaci alpskAA krajiny, jadranskAAho pobAaa eAaAlAA a bohatAAho kulturnAAho dAasdictvAA ovlivnAasnAAho rakouskAEtmi, slovinskAEtmi a italskAEtmi tradicemi.',
      it: 'Il Friuli Venezia Giulia AA  una delle scelte piAA... popolari per gli acquirenti cechi grazie alla sua eccellente accessibilitAA  dalla Repubblica Ceca. La regione offre una combinazione unica di paesaggi alpini, costa adriatica e ricco patrimonio culturale influenzato da tradizioni austriache, slovene e italiane.'
    },
    highlights: {
      en: ['Close to Austria and Slovenia', 'Alps and Adriatic sea', 'Excellent accessibility from CZ', 'Lower prices than Veneto', 'Rich wine culture', 'Trieste A aas multicultural capital'],
      cs: ['BlAAzkost Rakouska a Slovinska', 'Alpy i JaderskAA moAaa e', 'VynikajAAcAA dostupnost z ALsR', 'NiAaAlAaEAA ceny neAaAl Veneto', 'BohatAE vinaAaa skAE kultura', 'Terst A aas multikulturnAA hlavnAA mAassto'],
      it: ['Vicino ad Austria e Slovenia', 'Alpi e mare Adriatico', 'Eccellente accessibilitAA  dalla CZ', 'Prezzi piAA... bassi del Veneto', 'Ricca cultura vinicola', 'Trieste A aas capitale multiculturale']
    },
    priceRange: '\u20AC50,000 - \u20AC500,000',
    bestFor: { en: 'Accessibility, year-round use, wine lovers', cs: 'Dostupnost, celoroALnAA vyuAaAlitAA, milovnAAci vAAna', it: 'AccessibilitAA , uso tutto l\'anno, amanti del vino' },
    topCities: ['Trieste', 'Udine', 'Gorizia', 'Pordenone']
  },
  'puglia': {
    name: { en: 'Puglia', cs: 'Puglia (Apulie)', it: 'Puglia' },
    image: '/Puglia.webp',
    tagline: {
      en: 'Authentic southern Italy A aas sea, sun, and trulli houses',
      cs: 'AutentickAE jiAaAlnAA ItAElie A aas moAaa e, slunce a domy trulli',
      it: 'Autentica Italia meridionale A aas mare, sole e trulli'
    },
    description: {
      en: 'Puglia is the heel of Italy\'s boot, offering some of the country\'s most beautiful coastline, whitewashed villages, and authentic Italian culture. The region has become increasingly popular among foreign buyers seeking the genuine southern Italian lifestyle at still reasonable prices.',
      cs: 'Puglia je podpatek italskAA boty, nabAAzAA jedny z nejkrAEsnAasjAaEAAch pobAaa eAaAlAA zemAas, bAAle natAaa enAA vesnice a autentickou italskou kulturu. Region se stAEvAE stAEle populAErnAasjAaEAAm mezi zahraniALnAAmi kupujAAcAAmi, kteAaa AA hledajAA autentickAEt jihoitalskAEt AaAlivotnAA styl za stAEle rozumnAA ceny.',
      it: 'La Puglia AA  il tacco dello stivale italiano, che offre alcune delle piAA... belle coste del paese, villaggi imbiancati e autentica cultura italiana. La regione AA  diventata sempre piAA... popolare tra gli acquirenti stranieri che cercano l\'autentico stile di vita del sud Italia a prezzi ancora ragionevoli.'
    },
    highlights: {
      en: ['Beautiful Adriatic coastline', 'Authentic Italian culture', 'Trulli houses in Alberobello', 'Excellent cuisine', 'Warm climate year-round', 'Growing investment potential'],
      cs: ['KrAEsnAA jadranskAA pobAaa eAaAlAA', 'AutentickAE italskAE kultura', 'Domy trulli v Alberobello', 'VynikajAAcAA kuchynAas', 'TeplAA klima po celAEt rok', 'RostoucAA investiALnAA potenciAEl'],
      it: ['Bellissima costa adriatica', 'Autentica cultura italiana', 'Trulli di Alberobello', 'Eccellente cucina', 'Clima caldo tutto l\'anno', 'Crescente potenziale di investimento']
    },
    priceRange: '\u20AC30,000 - \u20AC400,000',
    bestFor: { en: 'Sea, authentic Italy, affordable prices', cs: 'MoAaa e, autentickAE ItAElie, dostupnAA ceny', it: 'Mare, Italia autentica, prezzi accessibili' },
    topCities: ['Lecce', 'Bari', 'Ostuni', 'Alberobello', 'Polignano a Mare']
  },
  'calabria': {
    name: { en: 'Calabria', cs: 'KalAEbrie', it: 'Calabria' },
    image: '/calabria.jpg',
    tagline: {
      en: 'Beautiful coastline and some of Italy\'s most attractive prices',
      cs: 'KrAEsnAA pobAaa eAaAlAA a jedny z nejzajAAmavAasjAaEAAch cen v ItAElii',
      it: 'Bellissima costa e alcuni dei prezzi piAA... interessanti d\'Italia'
    },
    description: {
      en: 'Calabria, the toe of Italy\'s boot, is known for its stunning Tyrrhenian and Ionian coastlines, dramatic mountain scenery, and remarkably affordable real estate. It\'s one of the regions where Czech buyers can find properties at very attractive prices while enjoying authentic southern Italian lifestyle.',
      cs: 'KalAEbrie, AaEpiALka italskAA boty, je znAEmAE svAEtm ALzchvatnAEtm tyrhAAnskAEtm a iALnskAEtm pobAaa eAaAlAAm, dramatickou horskou scenAAriAA a pozoruhodnAas dostupnAEtmi nemovitostmi. Je to jeden z regionAaL, kde ALeAaEtAA kupujAAcAA mohou najAAt nemovitosti za velmi zajAAmavAA ceny a pAaa itom si uAaAlAAvat autentickAEt jihoitalskAEt AaAlivotnAA styl.',
      it: 'La Calabria, la punta dello stivale italiano, AA  nota per le sue splendide coste tirreniche e ioniche, il drammatico paesaggio montano e gli immobili sorprendentemente accessibili.'
    },
    highlights: {
      en: ['Very affordable prices', 'Beautiful coastline', 'Dramatic mountains', 'Authentic culture', 'Mild winters', 'Low cost of living'],
      cs: ['Velmi dostupnAA ceny', 'KrAEsnAA pobAaa eAaAlAA', 'DramatickAA hory', 'AutentickAE kultura', 'MAArnAA zimy', 'NAAzkAA AaAlivotnAA nAEklady'],
      it: ['Prezzi molto accessibili', 'Bellissima costa', 'Montagne spettacolari', 'Cultura autentica', 'Inverni miti', 'Basso costo della vita']
    },
    priceRange: '\u20AC20,000 - \u20AC250,000',
    bestFor: { en: 'Budget-friendly, coastline, quiet life', cs: 'NAAzkAEt rozpoALet, pobAaa eAaAlAA, klidnAEt AaAlivot', it: 'Economico, costa, vita tranquilla' },
    topCities: ['Tropea', 'Cosenza', 'Reggio Calabria', 'Catanzaro']
  },
  'sicilia': {
    name: { en: 'Sicily', cs: 'SicAAlie', it: 'Sicilia' },
    image: '/Sicilia.jpg',
    tagline: {
      en: 'Italy\'s largest island A aas wide selection and diverse locations',
      cs: 'NejvAastAaEAA italskAEt ostrov A aas AaEirokAEt vAEtbAasr a rAaLznorodAA lokality',
      it: 'La piAA... grande isola d\'Italia A aas ampia scelta e localitAA  diverse'
    },
    description: {
      en: 'Sicily is a world unto itself A aas Italy\'s largest island offering everything from ancient Greek temples to Baroque cities, volcanic landscapes to pristine beaches. The property market is remarkably diverse, with options ranging from renovation projects to luxury coastal villas.',
      cs: 'SicAAlie je svAast sAEm pro sebe A aas nejvAastAaEAA italskAEt ostrov nabAAzejAAcAA vAaEe od starovAaskAEtch Aaa eckAEtch chrAEmAaL po baroknAA mAassta, od sopeALnAA krajiny po panenskAA plAEAaAle. Trh s nemovitostmi je pozoruhodnAas rozmanitAEt, s moAaAlnostmi od rekonstrukALnAAch projektAaL po luxusnAA pobAaa eAaAlnAA vily.',
      it: 'La Sicilia AA  un mondo a sAA A aas la piAA... grande isola d\'Italia che offre di tutto, dai templi greci antichi alle cittAA  barocche, dai paesaggi vulcanici alle spiagge incontaminate.'
    },
    highlights: {
      en: ['Wide selection of properties', 'Rich history and culture', 'Affordable to luxury options', 'Beautiful beaches', 'Excellent food', 'Diverse landscapes'],
      cs: ['Siroky vyber nemovitosti', 'Bohata historie a kultura', 'Od dostupnych po luxusni', 'Krasne plaze', 'Vynikajici jidlo', 'Rozmanite krajiny'],
      it: ['Ampia scelta di immobili', 'Ricca storia e cultura', 'Da economiche a lussuose', 'Bellissime spiagge', 'Eccellente cibo', 'Paesaggi diversi']
    },
    priceRange: '\u20AC25,000 - \u20AC1,000,000',
    bestFor: { en: 'Diversity, culture, island lifestyle', cs: 'RAaLznorodost, kultura, ostrovnAA AaAlivotnAA styl', it: 'DiversitAA , cultura, stile di vita isolano' },
    topCities: ['Palermo', 'Catania', 'Taormina', 'Syracuse', 'CefalAA...']
  },
  'toscana': {
    name: { en: 'Tuscany', cs: 'Toskansko', it: 'Toscana' },
    image: '/Toscana.png',
    tagline: {
      en: 'Iconic landscapes, strong rental demand, historic cities and premium pricing - Tuscany is one of the most sought-after regions in Italy for international buyers.',
      cs: 'Ikonicka italska krajina - tradice, vinice a vyssi ceny',
      it: 'Paesaggi iconici, forte domanda di affitto, citta storiche e prezzi premium - la Toscana e tra le regioni piu richieste in Italia dagli acquirenti internazionali.'
    },
    description: {
      en: 'Tuscany is one of the most internationally recognized regions in Italy. For Czech buyers, it represents prestige, stability, and long-term value.\\n\\nThe region combines strong tourism demand, world-famous cultural heritage, and a solid rental market - especially in Florence and Chianti areas.\\n\\nHowever, Tuscany also comes with higher purchase prices and strong competition in prime locations. Proper due diligence, technical checks, and legal coordination are essential before making an offer.',
      cs: 'Toskansko je pro mnoho zahranicnich kupujicich symbolem prestize, stability a dlouhodobe hodnoty. Region kombinuje silnou turistickou poptavku, kulturni dedictvi a solidni trh pronajmu, ale take vyssi ceny a silnou konkurenci v premium lokalitach.',
      it: 'La Toscana e una delle regioni italiane piu riconoscibili a livello internazionale. Per gli acquirenti cechi rappresenta prestigio, stabilita e valore nel lungo termine. La regione combina una forte domanda turistica, patrimonio culturale e un mercato affitti solido, ma anche prezzi piu alti e forte competizione nelle zone prime.'
    },
    highlights: {
      en: [
        'Global brand recognition',
        'Strong short-term rental potential',
        'Stable long-term property values',
        'High international liquidity',
        'Developed infrastructure',
        'Established expat communities'
      ],
      cs: ['Svetove jmeno regionu', 'Silny potencial kratkodobeho pronajmu', 'Stabilni dlouhodoba hodnota', 'Vysoka mezinarodni likvidita', 'Rozvinuta infrastruktura', 'Zavedene expat komunity'],
      it: ['Riconoscimento globale del brand', 'Forte potenziale di affitto breve', 'Valori immobiliari stabili nel lungo periodo', 'Alta liquidita internazionale', 'Infrastrutture sviluppate', 'Comunita expat consolidate']
    },
    priceRange: '\u20AC180,000 - \u20AC1,500,000',
    priceNotes: {
      en: [
        'Small apartment in secondary towns: from \u20AC150-200k',
        'Renovated farmhouse: \u20AC400k-1.5M',
        'Luxury villa with land: \u20AC2M+'
      ],
      cs: [
        'Mensi byt v mensich mestech: od \u20AC150-200k',
        'Zrekonstruovany statek: \u20AC400k-1.5M',
        'Luxusni vila s pozemkem: \u20AC2M+'
      ],
      it: [
        'Piccolo appartamento in centri secondari: da \u20AC150-200k',
        'Casale ristrutturato: \u20AC400k-1.5M',
        'Villa di lusso con terreno: \u20AC2M+'
      ]
    },
    bestFor: { en: 'Prestige, wine, culture, rental income', cs: 'Prestiz, vino, kultura, prijem z pronajmu', it: 'Prestigio, vino, cultura, reddito da affitto' },
    bestForList: {
      en: ['Investment with short-term rentals', 'Prestige second home', 'Buyers seeking a stable market'],
      cs: ['Investice s kratkodobym pronajmem', 'Prestizni druhe bydleni', 'Kupujici hledajici stabilni trh'],
      it: ['Investimento con affitto breve', 'Seconda casa di prestigio', 'Chi vuole mercato stabile']
    },
    topCitiesDetailed: {
      en: [
        'Florence - Premium urban investment and strong tourist rental demand',
        'Siena - Historic charm and stable mid-range pricing',
        'Lucca - Elegant living with growing international demand',
        'Pisa - University city with mixed investment potential',
        'Arezzo - More affordable entry level options'
      ],
      cs: [
        'Florencie - Premium mestska investice a silna turisticka poptavka po pronajmu',
        'Siena - Historicky charakter a stabilni stredni cenova hladina',
        'Lucca - Elegantni zivot s rostouci mezinarodni poptavkou',
        'Pisa - Univerzitni mesto se smisenym investicnim potencialem',
        'Arezzo - Dostupnejsi vstupni cenove moznosti'
      ],
      it: [
        'Firenze - Investimento urbano premium e forte domanda di affitto turistico',
        'Siena - Fascino storico e prezzi medi stabili',
        'Lucca - Vita elegante con domanda internazionale in crescita',
        'Pisa - Citta universitaria con potenziale di investimento misto',
        'Arezzo - Opzioni di ingresso piu accessibili'
      ]
    },
    topCities: ['Florence', 'Siena', 'Lucca', 'Pisa', 'Arezzo']
  },
  'lombardia': {
    name: { en: 'Lombardy', cs: 'Lombardie', it: 'Lombardia' },
    image: '/Lombardia.jpg',
    tagline: {
      en: 'Milan, Lake Como, and strategic micro-markets for different buyer goals',
      cs: 'Milan, Lago di Como a strategicke mikro-lokality pro ruzne cile kupujicich',
      it: 'Milano, Lago di Como e micro-mercati strategici per obiettivi diversi'
    },
    description: {
      en: 'Placeholder: this detailed Lombardy guide is being prepared. We will soon add full local strategy, city-by-city analysis, legal/technical checkpoints, and practical buyer scenarios.',
      cs: 'Placeholder: tento detailni pruvodce Lombardii pripravujeme. Brzy doplnime lokalni strategii, analyzu mest, pravni a technicke kontroly i prakticke scenare kupujicich.',
      it: 'Placeholder: questa guida dettagliata sulla Lombardia e in preparazione. A breve aggiungeremo strategia locale, analisi citta per citta, controlli legali/tecnici e scenari pratici.'
    },
    highlights: {
      en: [
        'Milan city market',
        'Lake Como premium segment',
        'Strong rental and resale liquidity',
        'Diverse micro-zones'
      ],
      cs: [
        'Mestsky trh v Milane',
        'Premium segment Lago di Como',
        'Silna likvidita pronajmu i prodeje',
        'Ruznorode mikro-lokality'
      ],
      it: [
        'Mercato urbano di Milano',
        'Segmento premium Lago di Como',
        'Forte liquidita su affitto e rivendita',
        'Micro-zone molto diverse'
      ]
    },
    priceRange: '\u20AC180,000 - \u20AC2,500,000',
    priceNotes: {
      en: [
        'Milan city: often \u20AC350k-\u20AC1.5M+',
        'Lake Como: often above \u20AC1M',
        'Luxury properties: \u20AC2M-\u20AC5M+'
      ],
      cs: [
        'Mesto Milan: casto \u20AC350k-\u20AC1.5M+',
        'Lago di Como: bezne nad \u20AC1M',
        'Luxusni nemovitosti: \u20AC2M-\u20AC5M+'
      ],
      it: [
        'Milano citta: spesso 350k-1.5M+',
        'Lago di Como: facilmente oltre 1M',
        'Immobili luxury: 2-5M+'
      ]
    },
    bestFor: {
      en: 'Urban market, premium lakeside, strong liquidity',
      cs: 'Mestsky trh, premium jezero, silna likvidita',
      it: 'Mercato urbano, lago premium, forte liquidita'
    },
    bestForList: {
      en: [
        'Buyers targeting Milan city',
        'Premium second-home buyers',
        'Investors needing liquid markets'
      ],
      cs: [
        'Kupujici mirici na Milan',
        'Kupujici premium druheho bydleni',
        'Investori hledajici likvidni trhy'
      ],
      it: [
        'Chi punta su Milano citta',
        'Acquirenti di seconde case premium',
        'Investitori che cercano mercati liquidi'
      ]
    },
    topCitiesDetailed: {
      en: [
        'Milan - broad range from core urban apartments to premium neighborhoods',
        'Como and lake area - highly competitive premium demand',
        'Bergamo - strong value/quality profile',
        'Brescia - larger stock and mixed price points',
        'Monza - strategic location near Milan'
      ],
      cs: [
        'Milan - siroka nabidka od mestskych bytu po premium ctvrt',
        'Como a jezerni oblast - vysoce konkurencni premium poptavka',
        'Bergamo - silny pomer hodnoty a kvality',
        'Brescia - velka nabidka a smiseny cenovy profil',
        'Monza - strategicka poloha blizko Milana'
      ],
      it: [
        'Milano - ampia gamma da appartamenti urbani a quartieri premium',
        'Como e area lago - domanda premium molto competitiva',
        'Bergamo - profilo forte tra valore e qualita',
        'Brescia - stock ampio e prezzi eterogenei',
        'Monza - posizione strategica vicino a Milano'
      ]
    },
    topCities: ['Milan', 'Como', 'Bergamo', 'Brescia', 'Monza']
  },
  'liguria': {
    name: { en: 'Liguria', cs: 'Ligurie', it: 'Liguria' },
    image: '/Liguria.webp',
    tagline: {
      en: 'Italian Riviera A aas coastline and proximity to France',
      cs: 'ItalskAE riviera A aas pobAaa eAaAlAA a blAAzkost Francie',
      it: 'Riviera italiana A aas costa e vicinanza alla Francia'
    },
    description: {
      en: 'Liguria is home to the famous Italian Riviera, Cinque Terre, and elegant coastal towns like Portofino and Sanremo. The narrow strip of coastline backed by mountains offers a unique microclimate and stunning scenery. Properties here tend to be compact but with exceptional views.',
      cs: 'Ligurie je domovem slavnAA italskAA rivieAAry, Cinque Terre a elegantnAAch pobAaa eAaAlnAAch mAassteALek jako Portofino a Sanremo. ALzkAEt pAEs pobAaa eAaAlAA podepAaa enAEt horami nabAAzAA unikAEtnAA mikroklima a ALzchvatnou scenAArii. Nemovitosti zde bAEtvajAA kompaktnAA, ale s vAEtjimeALnAEtmi vAEthledy.',
      it: 'La Liguria ospita la famosa Riviera italiana, le Cinque Terre e le eleganti cittAA  costiere come Portofino e Sanremo. La stretta striscia di costa sostenuta dalle montagne offre un microclima unico e un paesaggio mozzafiato.'
    },
    highlights: {
      en: ['Italian Riviera', 'Cinque Terre', 'Mild Mediterranean climate', 'Close to France', 'Portofino and Sanremo', 'Excellent seafood'],
      cs: ['ItalskAE riviAAra', 'Cinque Terre', 'MAArnAA stAaa edomoAaa skAA klima', 'BlAAzkost Francie', 'Portofino a Sanremo', 'VynikajAAcAA moAaa skAA plody'],
      it: ['Riviera italiana', 'Cinque Terre', 'Clima mediterraneo mite', 'Vicino alla Francia', 'Portofino e Sanremo', 'Eccellenti frutti di mare']
    },
    priceRange: '\u20AC100,000 - \u20AC3,000,000',
    bestFor: { en: 'Coastal lifestyle, mild climate, France access', cs: 'PobAaa eAaAlnAA AaAlivotnAA styl, mAArnAA klima, blAAzkost Francie', it: 'Stile di vita costiero, clima mite, accesso alla Francia' },
    topCities: ['Genoa', 'Sanremo', 'Portofino', 'La Spezia']
  },
  'lago-di-garda': {
    name: { en: 'Lake Garda Area', cs: 'Lago di Garda', it: 'Lago di Garda' },
    image: '/Veneto.webp',
    tagline: {
      en: 'Great accessibility from CZ and high demand',
      cs: 'DobrAE dostupnost z ALsR a vysokAE poptAEvka',
      it: 'Ottima accessibilitAA  dalla CZ e alta domanda'
    },
    description: {
      en: 'Lake Garda, Italy\'s largest lake, spans three regions (Veneto, Lombardy, Trentino) and is one of the most sought-after areas for Czech buyers. Its proximity to the Czech Republic (6-7 hours by car), stunning lake scenery, and year-round usability make it a perennial favorite.',
      cs: 'Lago di Garda, nejvAastAaEAA italskAA jezero, se rozprostAArAE pAaa es tAaa i regiony (Veneto, Lombardie, Trentino) a je jednou z nejvyhledAEvanAasjAaEAAch oblastAA pro ALeskAA kupujAAcAA. BlAAzkost ALseskAA republiky (6-7 hodin autem), ALzchvatnAE jezernAA scenAArie a celoroALnAA vyuAaAlitelnost z nAasj dAaslajAA trvalAAho favorita.',
      it: 'Il Lago di Garda, il piAA... grande lago italiano, si estende su tre regioni (Veneto, Lombardia, Trentino) ed AA  una delle aree piAA... ricercate dagli acquirenti cechi. La vicinanza alla Repubblica Ceca (6-7 ore in auto) e l\'usabilitAA  tutto l\'anno lo rendono un favorito perenne.'
    },
    highlights: {
      en: ['6-7 hours from Czech Republic', 'Year-round usability', 'Water sports and outdoor activities', 'Mild microclimate', 'Strong property market', 'Excellent infrastructure'],
      cs: ['6-7 hodin z ALseskAA republiky', 'CeloroALnAA vyuAaAlitelnost', 'VodnAA sporty a outdoorovAA aktivity', 'MAArnAA mikroklima', 'SilnAEt trh s nemovitostmi', 'VynikajAAcAA infrastruktura'],
      it: ['6-7 ore dalla Repubblica Ceca', 'UsabilitAA  tutto l\'anno', 'Sport acquatici e attivitAA  all\'aperto', 'Microclima mite', 'Forte mercato immobiliare', 'Eccellente infrastruttura']
    },
    priceRange: '\u20AC150,000 - \u20AC2,000,000',
    bestFor: { en: 'Accessibility, lake lifestyle, year-round use', cs: 'Dostupnost, jezernAA AaAlivotnAA styl, celoroALnAA vyuAaAlitAA', it: 'AccessibilitAA , stile di vita lacustre, uso tutto l\'anno' },
    topCities: ['Desenzano', 'Sirmione', 'Malcesine', 'Riva del Garda', 'Bardolino']
  },
  'alpy': {
    name: { en: 'Italian Alps / Northern Italy', cs: 'Alpy / sever ItAElie', it: 'Alpi / Nord Italia' },
    image: '/Trentino-Alto Adige.jpg',
    tagline: {
      en: 'Year-round use A aas mountains, skiing, and hiking',
      cs: 'CeloroALnAA vyuAaAlitAA A aas hory, lyAaAlovAEnAA a turistika',
      it: 'Uso tutto l\'anno A aas montagna, sci ed escursionismo'
    },
    description: {
      en: 'The Italian Alps, primarily in Trentino-Alto Adige and Valle d\'Aosta, offer Czech buyers a familiar mountain environment with Italian flair. These regions are ideal for those seeking year-round usability A aas skiing in winter, hiking in summer A aas combined with excellent food, wine, and a high quality of life.',
      cs: 'ItalskAA Alpy, pAaa edevAaEAAm v Trentino-Alto Adige a Valle d\'Aosta, nabAAzejAA ALeskAEtm kupujAAcAAm znAEmAA horskAA prostAaa edAA s italskAEtm nAEdechem. Tyto regiony jsou ideAElnAA pro ty, kteAaa AA hledajAA celoroALnAA vyuAaAlitelnost A aas lyAaAlovAEnAA v zimAas, turistiku v lAAtAas A aas v kombinaci s vynikajAAcAAm jAAdlem, vAAnem a vysokou kvalitou AaAlivota.',
      it: 'Le Alpi italiane, principalmente in Trentino-Alto Adige e Valle d\'Aosta, offrono agli acquirenti cechi un ambiente montano familiare con un tocco italiano. Queste regioni sono ideali per chi cerca un utilizzo tutto l\'anno.'
    },
    highlights: {
      en: ['Skiing and winter sports', 'Summer hiking trails', 'Year-round usability', 'High quality of life', 'Alpine cuisine', 'Austrian/German influence'],
      cs: ['LyAaAlovAEnAA a zimnAA sporty', 'LetnAA turistickAA trasy', 'CeloroALnAA vyuAaAlitelnost', 'VysokAE kvalita AaAlivota', 'AlpskAE kuchynAas', 'RakouskAEt/nAasmeckAEt vliv'],
      it: ['Sci e sport invernali', 'Sentieri escursionistici estivi', 'UsabilitAA  tutto l\'anno', 'Alta qualitAA  della vita', 'Cucina alpina', 'Influenza austriaca/tedesca']
    },
    priceRange: '\u20AC100,000 - \u20AC1,500,000',
    bestFor: { en: 'Mountains, skiing, year-round activities', cs: 'Hory, lyAaAlovAEnAA, celoroALnAA aktivity', it: 'Montagna, sci, attivitAA  tutto l\'anno' },
    topCities: ['Bolzano', 'Trento', 'Merano', 'Courmayeur', 'Cortina d\'Ampezzo']
  },
  'abruzzo': {
    name: { en: 'Abruzzo', cs: 'Abruzzo', it: 'Abruzzo' },
    image: '/abruzzo.jpg',
    tagline: {
      en: 'Mountains, nature, tranquility, and affordable prices',
      cs: 'Hory, pAaa AAroda, klid a dostupnAA ceny',
      it: 'Montagne, natura, tranquillitAA  e prezzi accessibili'
    },
    description: {
      en: 'Abruzzo is often called the "greenest region in Europe" thanks to its national parks covering nearly a third of its territory. It combines dramatic mountain scenery with Adriatic coastline and offers some of the most affordable property prices in central Italy.',
      cs: 'Abruzzo je ALasto nazAEtvAEno A aLlnejzelenAasjAaEAAm regionem Evropy" dAAky nAErodnAAm parkAaLm pokrAEtvajAAcAAm tAAmAasAaa  tAaa etinu jeho ALzzemAA. Kombinuje dramatickou horskou scenAArii s jadranskAEtm pobAaa eAaAlAAm a nabAAzAA jedny z nejdostupnAasjAaEAAch cen nemovitostAA ve stAaa ednAA ItAElii.',
      it: 'L\'Abruzzo AA  spesso chiamata la "regione piAA... verde d\'Europa" grazie ai parchi nazionali che coprono quasi un terzo del suo territorio.'
    },
    highlights: {
      en: ['National parks', 'Affordable prices', 'Mountains and sea', 'Quiet lifestyle', 'Good food traditions', 'Growing expat community'],
      cs: ['NAErodnAA parky', 'DostupnAA ceny', 'Hory i moAaa e', 'KlidnAEt AaAlivotnAA styl', 'DobrAA kulinAEAaa skAA tradice', 'RostoucAA komunita expatAaL'],
      it: ['Parchi nazionali', 'Prezzi accessibili', 'Montagne e mare', 'Stile di vita tranquillo', 'Buone tradizioni culinarie', 'ComunitAA  di espatriati in crescita']
    },
    priceRange: '\u20AC25,000 - \u20AC300,000',
    bestFor: { en: 'Nature, quiet, budget-friendly', cs: 'PAaa AAroda, klid, nAAzkAEt rozpoALet', it: 'Natura, tranquillitAA , economico' },
    topCities: ['L\'Aquila', 'Pescara', 'Chieti', 'Teramo']
  },
  'umbria': {
    name: { en: 'Umbria', cs: 'Umbrie', it: 'Umbria' },
    image: '/Umbria.webp',
    tagline: {
      en: 'The green heart of Italy A aas history, countryside, rural life',
      cs: 'ZelenAA srdce ItAElie A aas historie, venkov, venkovskAEt AaAlivot',
      it: 'Il cuore verde d\'Italia A aas storia, campagna, vita rurale'
    },
    description: {
      en: 'Umbria is often called "the green heart of Italy" and offers a quieter, more affordable alternative to neighboring Tuscany. The region features medieval hilltop towns, rolling countryside, and a deeply rooted rural culture. It\'s perfect for those seeking authentic Italian country life.',
      cs: 'Umbrie je ALasto nazAEtvAEna A aLlzelenAEtm srdcem ItAElie" a nabAAzAA klidnAasjAaEAA a cenovAas dostupnAasjAaEAA alternativu sousednAAho ToskAEnska. Region se vyznaALuje stAaa edovAaskAEtmi mAassteALky na kopcAAch, zvlnAasnou krajinou a hluboce zakoAaa enAasnou venkovskou kulturou. Je ideAElnAA pro ty, kteAaa AA hledajAA autentickAEt italskAEt venkovskAEt AaAlivot.',
      it: 'L\'Umbria AA  spesso chiamata "il cuore verde d\'Italia" e offre un\'alternativa piAA... tranquilla e accessibile alla vicina Toscana.'
    },
    highlights: {
      en: ['Quieter than Tuscany', 'Medieval hilltop towns', 'Rolling countryside', 'Excellent food and wine', 'Lower prices', 'Authentic rural culture'],
      cs: ['KlidnAasjAaEAA neAaAl ToskAEnsko', 'StAaa edovAaskAE mAassteALka na kopcAAch', 'ZvlnAasnAE krajina', 'VynikajAAcAA jAAdlo a vAAno', 'NiAaAlAaEAA ceny', 'AutentickAE venkovskAE kultura'],
      it: ['PiAA... tranquilla della Toscana', 'Borghi medievali', 'Campagna ondulata', 'Eccellente cibo e vino', 'Prezzi piAA... bassi', 'Autentica cultura rurale']
    },
    priceRange: '\u20AC60,000 - \u20AC800,000',
    bestFor: { en: 'Countryside, history, Tuscany alternative', cs: 'Venkov, historie, alternativa k ToskAEnsku', it: 'Campagna, storia, alternativa alla Toscana' },
    topCities: ['Perugia', 'Assisi', 'Orvieto', 'Spoleto', 'Todi']
  },
  'sardegna': {
    name: { en: 'Sardinia', cs: 'Sardinie', it: 'Sardegna' },
    image: '/Sardegna.jpg',
    tagline: {
      en: 'Sea, nature, and exclusive locations',
      cs: 'MoAaa e, pAaa AAroda a exkluzivnAA lokality',
      it: 'Mare, natura e localitAA  esclusive'
    },
    description: {
      en: 'Sardinia is an island of stunning contrasts A aas from the ultra-exclusive Costa Smeralda to remote, affordable inland villages. The island offers some of the most beautiful beaches in the Mediterranean, unique Nuragic archaeological sites, and a distinct culture that sets it apart from mainland Italy.',
      cs: 'Sardinie je ostrov ALzchvatnAEtch kontrastAaL A aas od ultraexkluzivnAA Costa Smeralda po odlehlAA, cenovAas dostupnAA vnitrozemskAA vesnice. Ostrov nabAAzAA jedny z nejkrAEsnAasjAaEAAch plAEAaAlAA ve StAaa edozemnAAm moAaa i, unikAEtnAA nurAEAaAlskAA archeologickAA lokality a odliAaEnou kulturu, kterAE ho odliAaEuje od pevninskAA ItAElie.',
      it: 'La Sardegna AA  un\'isola di contrasti mozzafiato A aas dall\'ultraesclusiva Costa Smeralda ai remoti villaggi dell\'entroterra. L\'isola offre alcune delle piAA... belle spiagge del Mediterraneo.'
    },
    highlights: {
      en: ['Stunning beaches', 'Costa Smeralda luxury', 'Unique culture', 'Archaeological sites', 'Clear turquoise water', 'Excellent diving'],
      cs: ['ALchvatnAA plAEAaAle', 'Luxus Costa Smeralda', 'UnikAEtnAA kultura', 'ArcheologickAA lokality', 'ALsistAE tyrkysovAE voda', 'VynikajAAcAA potAEpAasnAA'],
      it: ['Spiagge mozzafiato', 'Lusso Costa Smeralda', 'Cultura unica', 'Siti archeologici', 'Acqua turchese cristallina', 'Eccellenti immersioni']
    },
    priceRange: '\u20AC50,000 - \u20AC5,000,000',
    bestFor: { en: 'Beach, exclusivity, nature', cs: 'PlAEAaAle, exkluzivita, pAaa AAroda', it: 'Spiaggia, esclusivitAA , natura' },
    topCities: ['Cagliari', 'Olbia', 'Alghero', 'Porto Cervo', 'Sassari']
  }
}

Object.assign(REGION_DATA, REGION_DATA_OVERRIDES)

const REGION_BUYERS_GUIDANCE_IT = {
  toscana: {
    intro: 'Prima di acquistare in Toscana, valutate con attenzione:',
    items: [
      'Differenze di prezzo molto forti tra Firenze centro, Chianti e borghi secondari',
      'Vincoli paesaggistici e storici frequenti su casali e immobili nei centri storici',
      'Costi reali di ristrutturazione su immobili rurali (tetto, impianti, facciate)',
      'Regole comunali sugli affitti brevi nelle aree con turismo alto',
      'Distanza concreta da servizi, stazione e aeroporti per uso annuale'
    ],
    outro: 'In Toscana la micro-zona e la due diligence tecnica fanno la differenza tra acquisto emozionale e scelta solida.'
  },
  lombardia: {
    intro: 'Prima di acquistare in Lombardia, considerate:',
    items: [
      'Spread prezzi molto ampio tra Milano, cintura urbana, province e Lago di Como',
      'Spese condominiali e lavori straordinari su edifici urbani datati',
      'Liquidita di rivendita legata a metro, treni e tempi reali di collegamento',
      'Nei laghi premium la concorrenza e forte e i tempi decisionali sono brevi',
      'Verifica tecnica di impianti, classe energetica e conformita urbanistica'
    ],
    outro: 'In Lombardia la scelta della micro-zona e decisiva: dati locali e verifiche preventive riducono gli errori costosi.'
  },
  veneto: {
    intro: 'Prima di acquistare in Veneto, considerate:',
    items: [
      'Mercati molto diversi tra Venezia, Verona, Padova e localita del Garda',
      'Nei centri storici vanno pesati vincoli edilizi, umidita e costi di manutenzione',
      'Aree turistiche con domanda stagionale: rendimento e occupazione non sono uniformi',
      'Regolamenti locali su affitti brevi da verificare comune per comune',
      'Accessibilita, parcheggio e logistica quotidiana cambiano molto il valore reale'
    ],
    outro: 'In Veneto conviene decidere prima l obiettivo (uso personale, rendita, rivendita) e poi selezionare la micro-area.'
  },
  lazio: {
    intro: 'Prima di acquistare nel Lazio, considerate:',
    items: [
      'Roma ha dinamiche molto diverse da costa e province interne',
      'Nei palazzi storici servono controlli rigorosi su condominio e conformita urbanistica',
      'Costi di gestione e tassazione variano tra prima e seconda casa',
      'Domanda locativa diversa tra quartieri centrali, semicentro e comuni satelliti',
      'Tempi di spostamento reali incidono su vivibilita e valore nel lungo periodo'
    ],
    outro: 'Nel Lazio la strategia funziona quando zona, tipologia immobile e obiettivo di utilizzo sono allineati.'
  },
  sicilia: {
    intro: 'Prima di acquistare in Sicilia, considerate:',
    items: [
      'Palermo, Catania, Taormina e Siracusa hanno liquidita e prezzi molto diversi',
      'Nelle aree costiere servono verifiche su esposizione marina e stato delle strutture',
      'Documentazione catastale e urbanistica va controllata con particolare attenzione',
      'Domanda di affitto fortemente stagionale in molte localita turistiche',
      'Collegamenti con aeroporti e servizi essenziali cambiano l uso reale dell immobile'
    ],
    outro: 'In Sicilia la scelta corretta dipende dalla micro-zona: il confronto puntuale tra comuni e quartieri e fondamentale.'
  },
  liguria: {
    intro: 'Prima di acquistare in Liguria, considerate:',
    items: [
      'Le posizioni vista mare hanno premium elevato rispetto alle zone interne',
      'Accesso, parcheggio e pendenza del territorio incidono su uso e rivendita',
      'Stock limitato nei comuni top: negoziazione e tempi richiedono preparazione',
      'Spese condominiali alte in molte localita costiere con immobili d epoca',
      'Controlli su rischio idrogeologico e stato di muri di contenimento'
    ],
    outro: 'In Liguria l indirizzo preciso vale piu del nome del comune: la micro-localizzazione e tutto.'
  },
  campania: {
    intro: 'Prima di acquistare in Campania, considerate:',
    items: [
      'Napoli e mercato urbano complesso: il quartiere conta piu della media cittadina',
      'Costiera Amalfitana e Sorrento hanno ticket alto e stock molto competitivo',
      'Conformita urbanistica da verificare con attenzione in immobili storici o frazionati',
      'Logistica e parcheggio sono fattori critici in molte localita costiere',
      'Regole locali per affitti turistici possono cambiare il piano di rendimento'
    ],
    outro: 'In Campania conviene validare subito parte tecnica e legale prima di entrare in trattativa avanzata.'
  },
  piemonte: {
    intro: 'Prima di acquistare in Piemonte, considerate:',
    items: [
      'Torino segue dinamiche urbane diverse rispetto a Langhe, Monferrato e aree alpine',
      'Nei borghi collinari va verificata bene la qualita strutturale degli immobili storici',
      'Terreni agricoli e pertinenze richiedono controlli chiari su destinazione e vincoli',
      'Domanda locativa stabile in citta, piu selettiva nelle zone rurali',
      'Costi energetici invernali e isolamento incidono molto sul budget annuo'
    ],
    outro: 'In Piemonte la scelta migliore nasce da un bilanciamento realistico tra stile di vita e liquidita futura.'
  },
  'emilia-romagna': {
    intro: 'Prima di acquistare in Emilia-Romagna, considerate:',
    items: [
      'Bologna, Parma, Modena e costa adriatica hanno cicli di domanda differenti',
      'Mercato meno speculativo ma molto sensibile a servizi e infrastrutture locali',
      'Nelle aree di pianura va verificato con cura il profilo idraulico della zona',
      'Stock datato: controllare classe energetica e lavori da pianificare',
      'Strategia affitto cambia molto tra universita, business e turismo balneare'
    ],
    outro: 'In Emilia-Romagna la qualita della micro-zona e dei servizi determina gran parte della tenuta del valore.'
  },
  puglia: {
    intro: 'Prima di acquistare in Puglia, considerate:',
    items: [
      'Differenze forti tra Bari, Lecce, Valle d Itria e comuni costieri turistici',
      'Trulli, masserie e immobili rurali richiedono verifiche tecniche molto puntuali',
      'Rendita da affitto spesso legata alla stagionalita e alla gestione operativa',
      'Distanza da aeroporti e servizi essenziali pesa molto sull uso annuale',
      'Controlli urbanistici e catastali indispensabili prima di qualsiasi proposta'
    ],
    outro: 'In Puglia conviene selezionare prima la zona e solo dopo la tipologia immobile, per evitare costi nascosti.'
  },
  umbria: {
    intro: 'Prima di acquistare in Umbria, considerate:',
    items: [
      'Mercato piu tranquillo della Toscana, con tempi di vendita mediamente piu lunghi',
      'Nei casali e borghi storici servono verifiche su struttura, umidita e impianti',
      'Contesto rurale: valutare allacci, accessi stradali e servizi disponibili',
      'Domanda locativa selettiva, con picchi solo in alcune localita note',
      'Vincoli paesaggistici frequenti nelle aree di pregio storico-naturalistico'
    ],
    outro: 'In Umbria funziona una strategia orientata al medio-lungo periodo, con aspettative di rendimento realistiche.'
  },
  'friuli-venezia-giulia': {
    intro: 'Prima di acquistare in Friuli Venezia Giulia, considerate:',
    items: [
      'Mercati diversi tra Trieste urbana, costa adriatica e aree interne',
      'Vicinanza a Austria e Slovenia aumenta attrattivita in alcune micro-zone',
      'Bora e condizioni climatiche locali incidono su manutenzione e comfort',
      'Regione pratica per uso frequente grazie alla buona accessibilita dal Centro Europa',
      'Verifiche tecniche e legali restano centrali su stock datato nei centri storici'
    ],
    outro: 'In Friuli Venezia Giulia il vantaggio logistico e reale, ma la scelta deve restare guidata da dati di quartiere.'
  },
  calabria: {
    intro: 'Prima di acquistare in Calabria, considerate:',
    items: [
      'Prezzi d ingresso bassi, ma liquidita di uscita piu lenta rispetto ai mercati prime',
      'Priorita a comuni vivi tutto l anno con servizi essenziali stabili',
      'Immobili economici richiedono spesso budget extra per adeguamenti tecnici',
      'Domanda affitti fortemente stagionale in molte aree costiere',
      'Titolarita e conformita urbanistica da verificare in modo rigoroso'
    ],
    outro: 'In Calabria la convenienza e reale quando il prezzo iniziale e bilanciato da qualita della zona e costi post-acquisto.'
  },
  abruzzo: {
    intro: 'Prima di acquistare in Abruzzo, considerate:',
    items: [
      'Costa e entroterra hanno differenze marcate su prezzi, servizi e rivendibilita',
      'Nelle aree montane servono verifiche su rischio sismico e stato strutturale',
      'Comuni piccoli possono offrire valore ma con mercato meno liquido',
      'Vincoli ambientali vicino a parchi nazionali da controllare prima dell offerta',
      'Costo di gestione annuale variabile tra seconde case e uso continuativo'
    ],
    outro: 'In Abruzzo conviene puntare su immobili tecnicamente solidi in zone con servizi reali, non solo prezzo basso.'
  },
  sardegna: {
    intro: 'Prima di acquistare in Sardegna, considerate:',
    items: [
      'Mercato molto segmentato tra Costa Smeralda premium e aree piu accessibili',
      'Domanda e occupazione fortemente stagionali in molte localita balneari',
      'Collegamenti aerei e marittimi incidono su utilizzo e costi operativi',
      'Se non residenti, va pianificata in anticipo la gestione dell immobile',
      'Vincoli costieri e conformita urbanistica da verificare con particolare cura'
    ],
    outro: 'In Sardegna la redditivita dipende da micro-zona, gestione e logistica: la pianificazione operativa e parte della scelta.'
  },
  'trentino-alto-adige': {
    intro: 'Prima di acquistare in Trentino-Alto Adige, considerate:',
    items: [
      'Prezzi medi piu alti ma con standard qualitativi generalmente elevati',
      'Regole locali e condominiali possono essere restrittive in zone turistiche',
      'Uso invernale richiede controlli su isolamento, riscaldamento e accessi',
      'Domanda doppia estate/inverno, ma con forte selezione per localita',
      'Costi di gestione in montagna da stimare con prudenza'
    ],
    outro: 'In Trentino-Alto Adige il valore sta nella qualita complessiva: tecnica, servizi e posizione devono essere coerenti.'
  },
  'valle-d-aosta': {
    intro: 'Prima di acquistare in Valle d Aosta, considerate:',
    items: [
      'Mercato piccolo con stock limitato e trattative rapide nelle localita top',
      'Forte premium vicino agli impianti sciistici e ai centri piu noti',
      'Condominio e manutenzione in quota possono incidere molto sul costo annuo',
      'Regolamenti locali su seconde case e locazioni vanno verificati in anticipo',
      'Controlli tecnici su tetto, carico neve e impiantistica sono fondamentali'
    ],
    outro: 'In Valle d Aosta la finestra decisionale e spesso breve: preparazione tecnica e legale anticipata e cruciale.'
  },
  'lago-di-garda': {
    intro: 'Prima di acquistare nell area Lago di Garda, considerate:',
    items: [
      'L area copre tre regioni: regole locali e fiscalita cambiano da comune a comune',
      'Prezzi molto diversi tra sponda ovest, est e parte nord del lago',
      'Vista lago, distanza dall acqua e parcheggio creano differenze di valore importanti',
      'Affitti turistici forti ma molto stagionali in tante micro-zone',
      'Costi condominiali e servizi in residence vanno valutati nel business plan'
    ],
    outro: 'Sul Garda conta piu la micro-zona del brand lago: confrontare comuni specifici e indispensabile.'
  },
  alpy: {
    intro: 'Prima di acquistare nelle Alpi italiane, considerate:',
    items: [
      'Ogni valle ha domanda e prezzi diversi: non esiste un unico mercato alpino',
      'Accessibilita invernale e gestione neve incidono sull uso reale della casa',
      'Regole su locazione turistica e seconde case variano per comune',
      'Efficienza energetica e impianti di riscaldamento sono centrali in quota',
      'Strategia migliore quando uso personale e potenziale locativo sono bilanciati'
    ],
    outro: 'Nelle Alpi italiane la qualita tecnica dell immobile e parte essenziale della strategia di acquisto.'
  }
}

const BUYER_GUIDANCE_SLUG_ALIASES = {
  lombardy: 'lombardia',
  tuscany: 'toscana',
  piedmont: 'piemonte',
  trentinoaltoadige: 'trentino-alto-adige',
  'trentino-south-tyrol': 'trentino-alto-adige',
  valledaosta: 'valle-d-aosta',
  'aosta-valley': 'valle-d-aosta',
  sicily: 'sicilia',
  sardinia: 'sardegna'
}

function formatSlugName(slug = '') {
  if (typeof slug !== 'string' || slug.trim().length === 0) return 'Region'
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function createPlaceholderRegion(slug = '') {
  const prettyName = formatSlugName(slug)
  return {
    name: {
      en: prettyName,
      cs: prettyName,
      it: prettyName
    },
    image: '/Toscana.png',
    tagline: {
      en: 'Detailed regional guide in preparation',
      cs: 'Detailni regionalni pruvodce se pripravuje',
      it: 'Guida dettagliata della regione in preparazione'
    },
    description: {
      en: 'Placeholder: this region page is being prepared. We will add detailed pricing bands, city-level breakdown, legal and technical checkpoints, and practical buyer scenarios soon.',
      cs: 'Placeholder: tato stranka regionu je v priprave. Brzy doplnime detailni cenova pasma, rozpis mest, pravni a technicke kontroly i prakticke scenare kupujicich.',
      it: 'Placeholder: questa pagina regione e in preparazione. A breve aggiungeremo fasce prezzo dettagliate, analisi delle citta, controlli legali/tecnici e scenari pratici.'
    },
    highlights: {
      en: ['Guide coming soon', 'Market mapping in progress', 'Legal and technical checks', 'Practical buyer focus'],
      cs: ['Pruvodce bude brzy', 'Mapovani trhu v priprave', 'Pravni a technicke kontroly', 'Prakticky fokus kupujiciho'],
      it: ['Guida in arrivo', 'Mappatura mercato in corso', 'Controlli legali e tecnici', 'Focus pratico per acquirenti']
    },
    priceRange: 'TBD',
    bestFor: {
      en: 'Guide preview',
      cs: 'Nahled pruvodce',
      it: 'Anteprima guida'
    },
    topCities: [prettyName]
  }
}

export default function RegionDetailPage() {
  const params = useParams()
  const [language, setLanguage] = useState('en')
  const rawSlug = Array.isArray(params?.slug) ? params.slug[0] : (params?.slug || '')
  const canonicalSlug = BUYER_GUIDANCE_SLUG_ALIASES[rawSlug] || rawSlug
  const bookingLink = REGION_BOOKING_LINKS[canonicalSlug] || REGION_BOOKING_LINKS[rawSlug] || DEFAULT_BOOKING_LINK
  const gygLink = REGION_GYG_LINKS[canonicalSlug] || REGION_GYG_LINKS[rawSlug] || DEFAULT_GYG_LINK
  const widgetConfig = REGION_GYG_WIDGET_CONFIGS[canonicalSlug] || REGION_GYG_WIDGET_CONFIGS[rawSlug] || null
  const shouldShowRegionalWidget = Boolean(widgetConfig)
  const widgetDataAttrs = widgetConfig
    ? (widgetConfig.query
      ? { 'data-gyg-q': widgetConfig.query }
      : { 'data-gyg-location-id': widgetConfig.locationId })
    : {}
  const widgetDestinationLink = widgetConfig?.destinationLink || 'https://www.getyourguide.com/'
  const region = REGION_DATA[canonicalSlug] || REGION_DATA[rawSlug] || createPlaceholderRegion(canonicalSlug || rawSlug)

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

  const normalizedDescription = typeof region.description?.[language] === 'string'
    ? region.description[language].replace(/\\n/g, '\n')
    : ''
  const hasExplicitPriceNotes = Array.isArray(region.priceNotes?.[language]) && region.priceNotes[language].length > 0
  const priceNotes = hasExplicitPriceNotes
    ? region.priceNotes[language]
    : [region.priceRange].filter(Boolean)
  const primaryPriceLine = hasExplicitPriceNotes
    ? (region.priceRange || priceNotes[0] || '')
    : (priceNotes[0] || region.priceRange || '')
  const priceBulletLines = hasExplicitPriceNotes ? priceNotes : priceNotes.slice(1)
  const bestForItems = Array.isArray(region.bestForList?.[language]) && region.bestForList[language].length > 0
    ? region.bestForList[language]
    : [region.bestFor?.[language] || region.bestFor?.en].filter(Boolean)
  const topCitiesQuick = Array.isArray(region.topCities) ? region.topCities.slice(0, 5) : []
  const topCitiesDetailed = Array.isArray(region.topCitiesDetailed?.[language]) && region.topCitiesDetailed[language].length > 0
    ? region.topCitiesDetailed[language]
    : (region.topCities || []).map((city) => (
      language === 'cs'
        ? `${city} - Přehled lokálního trhu a investičního potenciálu`
        : language === 'it'
          ? `${city} - Panoramica del mercato locale e del potenziale d'investimento`
          : `${city} - Local market overview and investment context`
    ))
  const buyerGuidanceSlug = canonicalSlug
  const buyerGuidanceIt = REGION_BUYERS_GUIDANCE_IT[buyerGuidanceSlug]
  const regionName = region.name?.[language] || region.name?.en || 'this region'
  const buyersTitle =
    language === 'cs'
      ? `Co by měli kupující vědět před koupí v regionu ${regionName}`
      : language === 'it'
        ? `Cosa devono sapere gli acquirenti prima di comprare in ${regionName}`
        : `What Buyers Should Know Before Buying in ${regionName}`
  const buyersIntro =
    language === 'it' && buyerGuidanceIt?.intro
      ? buyerGuidanceIt.intro
      : language === 'cs'
      ? 'Před koupí nemovitosti v tomto regionu zohledněte:'
      : language === 'it'
        ? 'Prima di acquistare in questa regione, considerate:'
        : 'Before purchasing property in this region, buyers should consider:'
  const buyersItems =
    language === 'it' && Array.isArray(buyerGuidanceIt?.items) && buyerGuidanceIt.items.length > 0
      ? buyerGuidanceIt.items
      : language === 'cs'
      ? [
          'Transakční náklady a regionální daňová specifika',
          'Místní stavební, krajinná a památková omezení',
          'Reálnou nabídku a konkurenci v cílových lokalitách',
          'Sezonnost a cykly poptávky po pronájmu',
          'Technické a právní kontroly před podáním nabídky'
        ]
      : language === 'it'
        ? [
            'Costi di transazione e specificita fiscali regionali',
            'Vincoli urbanistici, paesaggistici e storici locali',
            'Offerta reale e concorrenza nelle localita target',
            'Stagionalita e cicli della domanda di affitto',
            'Verifiche tecniche e legali prima di ogni offerta'
          ]
        : [
            'Transaction costs and regional tax specifics',
            'Local planning, landscape, and heritage constraints',
            'Real supply and competition in target locations',
            'Seasonality and rental demand cycles',
            'Technical and legal checks before any offer'
          ]
  const buyersOutro =
    language === 'it' && buyerGuidanceIt?.outro
      ? buyerGuidanceIt.outro
      : language === 'cs'
      ? 'Proto je zásadní profesionální koordinace mezi notářem, technikem a právními poradci.'
      : language === 'it'
        ? 'Per questo e fondamentale il coordinamento professionale tra notaio, tecnico e consulenti legali.'
        : 'This is why professional coordination between notary, surveyor, and legal advisors is crucial.'
  const curiosityTitle =
    language === 'cs'
      ? `Zajímavosti a pravidla v regionu ${regionName}`
      : language === 'it'
        ? `Curiosita e regole da conoscere in ${regionName}`
        : `Curiosities and Key Rules in ${regionName}`
  const curiosityItems =
    Array.isArray(REGION_CURIOSITIES[buyerGuidanceSlug]?.[language]) && REGION_CURIOSITIES[buyerGuidanceSlug][language].length >= 4
      ? REGION_CURIOSITIES[buyerGuidanceSlug][language]
      : language === 'cs'
        ? [
            'Regionální trh se řídí specifickými pravidly obcí a provincií.',
            'Historické zóny často podléhají přísnějším stavebním a památkovým omezením.',
            'Mikro-lokalita ovlivňuje cenu i likviditu víc než samotný název regionu.',
            'Před koupí je zásadní technická i právní due diligence.'
          ]
        : language === 'it'
          ? [
              'Ogni regione ha regole locali specifiche tra comuni e province.',
              'Nei centri storici i vincoli urbanistici e paesaggistici sono spesso piu rigidi.',
              'La micro-zona incide su prezzo e liquidita piu del nome della regione.',
              'Prima dell acquisto e fondamentale fare una due diligence tecnica e legale.'
            ]
          : [
              'Each region has specific local rules across municipalities and provinces.',
              'Historic areas often have stricter planning and heritage constraints.',
              'Micro-location affects pricing and liquidity more than the region name alone.',
              'Technical and legal due diligence is essential before purchase.'
            ]
  const processCtaLabel =
    language === 'cs'
      ? 'Zobrazit náš celý proces'
      : language === 'it'
        ? 'Vedi il nostro processo completo'
        : 'See Our Full Process'
  const finalCtaTitle =
    language === 'cs'
      ? `Přemýšlíte o oblasti ${regionName}, ale nevíte, kde začít?`
      : language === 'it'
        ? `State pensando a ${regionName}, ma non sapete da dove iniziare?`
        : `Thinking about ${regionName} but not sure where to start?`
  const finalCtaDescription =
    language === 'cs'
      ? 'Pomáháme českým kupujícím vyhodnotit správnou oblast, typ nemovitosti a investiční potenciál před jakýmkoli závazným krokem.'
      : language === 'it'
        ? 'Aiutiamo gli acquirenti cechi a valutare area, tipo di immobile e potenziale di investimento prima di qualsiasi impegno vincolante.'
        : 'We help Czech buyers evaluate the right area, property type, and investment potential before any binding commitment.'
  const consultationLabel =
    language === 'cs'
      ? 'Požádat o osobní konzultaci'
      : language === 'it'
        ? 'Richiedi consulenza personalizzata'
        : 'Request Personal Consultation'
  const finalPropertiesLabel =
    language === 'cs'
      ? `Nabídky v oblasti ${regionName}`
      : language === 'it'
        ? `Proprieta in ${regionName}`
        : `Properties in ${regionName}`

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
                  <p className="text-xl font-bold text-slate-800">{primaryPriceLine}</p>
                  {priceBulletLines.length > 0 && (
                    <ul className="mt-3 space-y-1 text-left text-xs text-gray-600 list-disc pl-4">
                      {priceBulletLines.map((note, index) => (
                        <li key={index}>{note}</li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
              <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-2xl">
                <CardContent className="p-6 text-center">
                  <Home className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-1">
                    {language === 'cs' ? 'Nejvhodnější pro' : language === 'it' ? 'Ideale per' : 'Best For'}
                  </p>
                  <div className="space-y-1">
                    {bestForItems.map((item, index) => (
                      <p key={index} className="text-sm font-medium text-slate-800">{item}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-2xl">
                <CardContent className="p-6 text-center">
                  <MapPin className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-1">
                    {language === 'cs' ? 'Hlavní města' : language === 'it' ? 'Città principali' : 'Top Cities'}
                  </p>
                  <p className="text-lg font-semibold text-slate-800">{topCitiesQuick.join(', ')}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Description */}
          <div className="max-w-5xl mx-auto mb-12">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                  {normalizedDescription}
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

          <div className="max-w-5xl mx-auto mb-12">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-gray-100">
                <CardTitle className="text-2xl font-bold text-slate-800">
                  {buyersTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {buyersIntro}
                </p>
                <ul className="space-y-2 text-gray-700 mb-6">
                  {buyersItems.map((item, index) => (
                    <li key={index}>- {item}</li>
                  ))}
                </ul>
                <p className="text-gray-700 mb-6">
                  {buyersOutro}
                </p>
                <Link href="/process">
                  <Button className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold">
                    {processCtaLabel}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-5xl mx-auto mb-12">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-gray-100">
                <CardTitle className="text-2xl font-bold text-slate-800">
                  {curiosityTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <ul className="space-y-3 text-gray-700">
                  {curiosityItems.map((item, index) => (
                    <li key={index}>- {item}</li>
                  ))}
                </ul>
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
                <div className="space-y-3 text-gray-700">
                  {topCitiesDetailed.map((line, index) => (
                    <p key={index}>{line}</p>
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
                    onClick={() => window.open(bookingLink, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {language === 'cs' ? 'Najít ubytování (Booking.com)' :
                     language === 'it' ? 'Trova alloggio (Booking.com)' :
                     'Find Accommodation (Booking.com)'}
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg" 
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white border-orange-500 font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-105"
                    onClick={() => window.open(gygLink, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {language === 'cs' ? 'Výlety a průvodce (GetYourGuide)' :
                     language === 'it' ? 'Escursioni e guide (GetYourGuide)' :
                     'Tours & Guides (GetYourGuide)'}
                  </Button>
                </div>
                {shouldShowRegionalWidget ? (
                  <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50/70 p-3">
                    <div
                      data-gyg-href="https://widget.getyourguide.com/default/activities.frame"
                      data-gyg-locale-code="cs-CZ"
                      data-gyg-widget="activities"
                      data-gyg-number-of-items="3"
                      data-gyg-partner-id="H4OKCTR"
                      {...widgetDataAttrs}
                    >
                      <span className="text-xs text-slate-600">
                        Powered by{' '}
                        <a
                          target="_blank"
                          rel="sponsored noopener noreferrer"
                          href={widgetDestinationLink}
                          className="underline underline-offset-2"
                        >
                          GetYourGuide
                        </a>
                      </span>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="max-w-4xl mx-auto text-center">
            <Card className="bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-2xl rounded-2xl overflow-hidden">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold mb-4">
                  {finalCtaTitle}
                </h2>
                <p className="text-slate-200 text-lg mb-8 leading-relaxed">
                  {finalCtaDescription}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="https://wa.me/420731450001" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="w-full sm:w-auto bg-white hover:bg-gray-100 text-slate-800 font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-105 shadow-lg">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      {consultationLabel}
                    </Button>
                  </a>
                  <Link href={`/properties?region=${canonicalSlug || rawSlug}`}>
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-white hover:bg-gray-100 text-slate-800 font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      <Home className="h-5 w-5 mr-2" />
                      {finalPropertiesLabel}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer language={language} />
      {shouldShowRegionalWidget ? (
        <Script
          src="https://widget.getyourguide.com/dist/pa.umd.production.min.js"
          strategy="afterInteractive"
          data-gyg-partner-id="H4OKCTR"
        />
      ) : null}
    </div>
  )
}
