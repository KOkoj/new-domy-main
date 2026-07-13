'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, Clock, Euro } from 'lucide-react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import PropertySlider from '@/components/PropertySlider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import InformationalDisclaimer from '@/components/legal/InformationalDisclaimer'

const PUBLISHED_AT = '2026-05-10'

const TRAVEL_PARTNER_LINKS = {
  booking: 'https://www.booking.com/searchresults.cs.html?ss=Italia&order=early_year_deals_upsorter&label=gen173rf-10Eg5kZWFscy1jYW1wYWlnbiiCAjjoB0gFWANoOogBAZgBM7gBF8gBDNgBA-gBAfgBAYgCAaICDm1lbWJlcnMuY2ouY29tqAIBuAKpjMzNBsACAdICJGQzM2IxZGFiLWM0NjUtNGRlMS04Zjc1LTEwNWQyNjJkZTAyM9gCAeACAQ&aid=304142&lang=cs&sb=1&src_elem=sb&dest_id=104&dest_type=country&ac_position=0&ac_click_type=b&ac_langcode=it&ac_suggestion_list_length=5&search_selected=true&search_pageview_id=fd70821489bb0dca&ac_meta=GhBmZDcwODIxNDg5YmIwZGNhIAAoATICaXQ6Bkl0YWxpYQ%3D%3D&checkin=2026-03-13&checkout=2026-03-14&group_adults=2&no_rooms=1&group_children=0&lpsrc=sb',
  getYourGuide: 'https://gyg.me/fnMmh4S3'
}

const CONTENT = {
  cs: {
    navGuide: 'Průvodce Itálií',
    navArticles: 'Články',
    badge: 'Průvodce Itálií',
    title: 'Kolik stojí jídlo v Itálii v roce 2026? Reálné ceny restaurací, pizzerií a supermarketů',
    readTime: '11 min',
    intro: [
      'Náklady na jídlo v Itálii v roce 2026 se mohou výrazně lišit podle regionu, sezóny a typu podniku.',
      'Jiné ceny uvidíte v historickém centru Říma nebo Benátek, jiné v menších městech a mimo hlavní turistické zóny.',
      'V tomto přehledu najdete praktické orientační ceny restaurací, pizzerií a supermarketů pro české cestovatele, kteří chtějí plánovat realisticky.'
    ],
    partnerTop: {
      title: 'Plánujte pobyt i zážitky dopředu',
      text: 'Lepší poměr cena/výkon obvykle získáte při včasné rezervaci ubytování a aktivit.',
      booking: 'Najít ubytování (Booking.com)',
      gyg: 'Najít aktivity (GetYourGuide)'
    },
    quickTitle: 'Rychlý přehled cen jídla v Itálii (2026)',
    quickNote:
      'Orientační rozmezí pro běžné cestování. Skutečná cena závisí na lokalitě, sezóně, denní době a typu podniku.',
    quickItems: [
      {
        label: 'Běžné jídlo v levnější restauraci',
        value: 'cca 12-22 EUR / osoba',
        note: 'Ve větších turistických centrech bývá horní hranice častější.'
      },
      {
        label: 'Večeře pro 2 ve střední restauraci (3 chody)',
        value: 'cca 50-95 EUR / 2 osoby',
        note: 'Orientační střed trhu se pohybuje kolem 70 EUR.'
      },
      {
        label: 'Pizza Margherita v pizzerii',
        value: 'cca 7-14 EUR',
        note: 'V top lokalitách nebo s premium surovinami může být cena vyšší.'
      },
      {
        label: 'Espresso na baru',
        value: 'cca 1,20-1,80 EUR',
        note: 'Při obsluze u stolu bývá cena vyšší než na baru.'
      },
      {
        label: 'Cappuccino',
        value: 'cca 1,50-2,50 EUR',
        note: 'Praktický střed se pohybuje zhruba kolem 1,75 EUR.'
      }
    ],
    restaurantsTitle: 'Restaurace a pizzerie: kde se přeplácí nejčastěji',
    restaurantsIntro:
      'Samotné jídlo nebývá hlavní problém. Rozpočet často roste kvůli lokaci, doplňkům na účtu a špatnému načasování.',
    restaurants: [
      'Historická centra a nejvíce exponované ulice mívají vyšší ceny i nižší poměr kvality k ceně.',
      'Na účtu se může objevit coperto (krytý servis/stolné), někdy i servizio.',
      'Nápoje (voda, víno, koktejly) často tvoří výraznou část finální útraty.',
      'V turistických zónách bývá běžné, že podobné menu stojí o desítky procent více než o pár ulic dál.'
    ],
    supermarketTitle: 'Supermarket v roce 2026: orientační ceny základního nákupu',
    supermarketIntro:
      'Pokud chcete držet rozpočet pod kontrolou, kombinace restaurací a nákupů v supermarketu funguje velmi dobře, hlavně u delších pobytů.',
    supermarketItems: [
      'Mléko 1 l: cca 1,10-1,50 EUR',
      'Chléb 500 g: cca 1,50-3,00 EUR',
      'Vejce (12 ks): cca 2,80-4,20 EUR',
      'Kuřecí prsa 1 kg: cca 8,50-13,50 EUR',
      'Rajčata 1 kg: cca 1,80-3,80 EUR',
      'Voda 1,5 l v obchodě: cca 0,30-0,90 EUR'
    ],
    supermarketNote:
      'Jde o orientační spotřebitelská rozmezí aktualizovaná pro rok 2026. Cena se může měnit podle řetězce, regionu, značky a sezony.',
    partnerMid: {
      title: 'Chcete mít jídlo, ubytování i program na jednom místě?',
      text: 'Vyberte si ubytování podle lokality a doplňte ho o lokální zážitky.',
      booking: 'Najít ubytování',
      gyg: 'Najít gastronomické a lokální aktivity'
    },
    hiddenTitle: 'Skryté náklady, na které se často zapomíná',
    hidden: [
      'Coperto nebo servisní poplatek v některých podnicích.',
      'Rozdíl mezi cenou na baru a cenou při obsluze u stolu.',
      'Nápoje a dezerty, které výrazně zvednou finální účet.',
      'Turistická taxa u ubytování, která nepřímo ovlivní denní rozpočet na jídlo.'
    ],
    saveTitle: 'Jak jíst v Itálii dobře a zároveň rozumně',
    save: [
      'Hledejte podniky mimo hlavní turistické tahy.',
      'Využívejte polední menu ve všední dny.',
      'Kombinujte restaurace s nákupy v supermarketu.',
      'U kávy preferujte konzumaci na baru, pokud chcete nižší cenu.',
      'Rezervujte oblíbené podniky dopředu, abyste se vyhnuli nouzové volbě dražších míst.'
    ],
    bridge: {
      title: 'Zaujala vás některá část Itálie i mimo dovolenou?',
      text: 'Mnoho Čechů poznává Itálii nejprve přes jídlo, cestování a atmosféru jednotlivých regionů.',
      button: 'Prohlédnout regiony Itálie'
    },
    conclusionTitle: 'Závěr',
    conclusion: [
      'Jídlo v Itálii v roce 2026 nemusí být drahé, pokud plánujete podle lokality a stylu cesty.',
      'Největší rozdíl obvykle dělá výběr podniku, práce s denním rozpočtem a kombinace restaurací se supermarketem.',
      'Díky tomu můžete jíst kvalitně, autenticky a bez zbytečných přeplatků.'
    ]
  },
  en: {
    navGuide: 'Italy Travel Guide',
    navArticles: 'Articles',
    badge: 'Italy Travel Guide',
    title: 'How Much Does Food Cost in Italy in 2026? Real Prices for Restaurants, Pizzerias, and Supermarkets',
    readTime: '11 min',
    intro: [
      'Food spending in Italy in 2026 can vary significantly by region, season, and venue type.',
      'Prices in central Rome, Milan, or Venice are usually different from smaller towns and less touristy districts.',
      'This guide gives Czech travelers a practical and realistic overview of restaurant, pizzeria, and supermarket costs.'
    ],
    partnerTop: {
      title: 'Plan stay and experiences in advance',
      text: 'You usually get a better price/quality ratio when accommodation and activities are booked early.',
      booking: 'Find Accommodation (Booking.com)',
      gyg: 'Find Activities (GetYourGuide)'
    },
    quickTitle: 'Quick Food Price Snapshot in Italy (2026)',
    quickNote:
      'Indicative ranges for standard travel. Real prices depend on location, season, time slot, and venue positioning.',
    quickItems: [
      {
        label: 'Meal in an inexpensive restaurant',
        value: 'approx. EUR 12-22 / person',
        note: 'Upper values are more common in top tourist zones.'
      },
      {
        label: 'Dinner for 2 in a mid-range restaurant (3 courses)',
        value: 'approx. EUR 50-95 / 2 people',
        note: 'Market benchmarks place the practical midpoint near EUR 70.'
      },
      {
        label: 'Margherita pizza in a pizzeria',
        value: 'approx. EUR 7-14',
        note: 'Premium ingredients and prime locations can push prices higher.'
      },
      {
        label: 'Espresso at the bar',
        value: 'approx. EUR 1.20-1.80',
        note: 'Table service is often priced higher than standing at the bar.'
      },
      {
        label: 'Cappuccino',
        value: 'approx. EUR 1.50-2.50',
        note: 'The practical midpoint is close to EUR 1.75.'
      }
    ],
    restaurantsTitle: 'Restaurants and Pizzerias: where overspending happens most',
    restaurantsIntro:
      'The dish itself is rarely the problem. Overspending often comes from location premium, extra charges, and timing choices.',
    restaurants: [
      'Historic centers and high-footfall streets often come with a significant price premium.',
      'Bills may include coperto and, in some places, servizio.',
      'Drinks (water, wine, cocktails) can represent a large share of total spend.',
      'In tourist zones, similar menus can cost much more than a few streets away.'
    ],
    supermarketTitle: 'Supermarket in 2026: indicative prices for a basic grocery basket',
    supermarketIntro:
      'If you want better budget control, mixing restaurants with supermarket shopping works very well, especially for longer stays.',
    supermarketItems: [
      'Milk 1 l: approx. EUR 1.10-1.50',
      'Bread 500 g: approx. EUR 1.50-3.00',
      'Eggs (12): approx. EUR 2.80-4.20',
      'Chicken breast 1 kg: approx. EUR 8.50-13.50',
      'Tomatoes 1 kg: approx. EUR 1.80-3.80',
      'Water 1.5 l (store price): approx. EUR 0.30-0.90'
    ],
    supermarketNote:
      'These are indicative consumer ranges updated for 2026. Prices can change by chain, region, brand, and season.',
    partnerMid: {
      title: 'Want food, stay, and activities aligned in one plan?',
      text: 'Choose accommodation by location and add local experiences smartly.',
      booking: 'Find Accommodation',
      gyg: 'Find Food & Local Activities'
    },
    hiddenTitle: 'Hidden costs travelers often overlook',
    hidden: [
      'Coperto or service charge in some venues.',
      'Price differences between bar counter service and table service.',
      'Drinks and desserts increasing the final bill more than expected.',
      'Tourist tax at accommodation level, indirectly affecting daily food budget.'
    ],
    saveTitle: 'How to eat well in Italy and still stay budget-aware',
    save: [
      'Prefer places slightly outside the main tourist streets.',
      'Use weekday lunch menus when available.',
      'Combine restaurant meals with supermarket shopping.',
      'For coffee, bar counter service is usually cheaper.',
      'Book popular places in advance to avoid expensive last-minute options.'
    ],
    bridge: {
      title: 'Did a region in Italy interest you beyond a short trip?',
      text: 'Many Czech travelers first connect with Italy through food, travel rhythm, and regional lifestyle.',
      button: 'Explore Italian Regions'
    },
    conclusionTitle: 'Conclusion',
    conclusion: [
      'Food costs in Italy in 2026 can stay manageable if you plan by location and travel style.',
      'The biggest difference usually comes from venue choice, budget discipline, and mixing restaurants with groceries.',
      'That way, you can eat authentically and well without unnecessary overspending.'
    ]
  },
  it: {
    navGuide: 'Guida all’Italia',
    navArticles: 'Articoli',
    badge: 'Guida all’Italia',
    title: 'Quanto costa mangiare in Italia nel 2026? Prezzi reali di ristoranti, pizzerie e supermercati',
    readTime: '11 min',
    intro: [
      'Nel 2026 la spesa per mangiare in Italia cambia molto in base a regione, stagione e tipo di locale.',
      'I prezzi nel centro storico di Roma, Milano o Venezia non sono gli stessi delle città minori o delle zone meno turistiche.',
      'In questa guida trovi un quadro pratico e credibile dei costi di ristoranti, pizzerie e supermercati, pensato per viaggiatori cechi.'
    ],
    partnerTop: {
      title: 'Pianifica in anticipo alloggio ed esperienze',
      text: 'Il miglior rapporto qualità/prezzo arriva spesso con prenotazione anticipata.',
      booking: 'Trova alloggio (Booking.com)',
      gyg: 'Trova attività (GetYourGuide)'
    },
    quickTitle: 'Panoramica rapida prezzi cibo in Italia (2026)',
    quickNote:
      'Intervalli orientativi per viaggi standard. I prezzi reali dipendono da zona, stagione, orario e posizionamento del locale.',
    quickItems: [
      {
        label: 'Pasto in ristorante economico',
        value: 'circa 12-22 EUR / persona',
        note: 'Nelle aree turistiche principali è più frequente la fascia alta.'
      },
      {
        label: 'Cena per 2 in ristorante medio (3 portate)',
        value: 'circa 50-95 EUR / 2 persone',
        note: 'Il valore centrale pratico resta vicino a 70 EUR.'
      },
      {
        label: 'Pizza Margherita in pizzeria',
        value: 'circa 7-14 EUR',
        note: 'Nelle location premium o con ingredienti speciali i prezzi possono salire.'
      },
      {
        label: 'Espresso al banco',
        value: 'circa 1,20-1,80 EUR',
        note: 'Al tavolo il prezzo è spesso più alto rispetto al banco.'
      },
      {
        label: 'Cappuccino',
        value: 'circa 1,50-2,50 EUR',
        note: 'La media pratica resta vicina a 1,75 EUR.'
      }
    ],
    restaurantsTitle: 'Ristoranti e pizzerie: dove si spende più del necessario',
    restaurantsIntro:
      'Il problema raramente è il singolo piatto. Le spese extra nascono più spesso da posizione, supplementi e scelte di timing.',
    restaurants: [
      'Centri storici e vie ad altissimo passaggio hanno spesso un premium di prezzo rilevante.',
      'Nel conto possono comparire coperto e, in alcuni casi, servizio.',
      'Le bevande incidono molto sul totale finale.',
      'Nelle aree turistiche, menu simili possono costare molto di più rispetto a zone vicine.'
    ],
    supermarketTitle: 'Supermercato nel 2026: prezzi orientativi per una spesa base',
    supermarketIntro:
      'Per tenere sotto controllo il budget, la combinazione ristorante + supermercato funziona molto bene, soprattutto nei soggiorni più lunghi.',
    supermarketItems: [
      'Latte 1 l: circa 1,10-1,50 EUR',
      'Pane 500 g: circa 1,50-3,00 EUR',
      'Uova (12): circa 2,80-4,20 EUR',
      'Petto di pollo 1 kg: circa 8,50-13,50 EUR',
      'Pomodori 1 kg: circa 1,80-3,80 EUR',
      'Acqua 1,5 l (prezzo supermercato): circa 0,30-0,90 EUR'
    ],
    supermarketNote:
      'Sono intervalli orientativi aggiornati al 2026. Il prezzo può cambiare per insegna, regione, marca e stagione.',
    partnerMid: {
      title: 'Vuoi coordinare cibo, alloggio e attività in modo semplice?',
      text: 'Scegli la base giusta e aggiungi esperienze locali senza perdere controllo del budget.',
      booking: 'Trova alloggio',
      gyg: 'Trova attività locali e food'
    },
    hiddenTitle: 'Costi nascosti che spesso sfuggono',
    hidden: [
      'Coperto o servizio in alcuni locali.',
      'Differenza di prezzo tra consumazione al banco e servizio al tavolo.',
      'Bevande e dessert che fanno salire il conto più del previsto.',
      'Tassa di soggiorno sull’alloggio, che incide indirettamente sul budget giornaliero.'
    ],
    saveTitle: 'Come mangiare bene in Italia senza rinunciare al controllo costi',
    save: [
      'Preferisci locali leggermente fuori dai flussi turistici principali.',
      'Sfrutta i menu pranzo nei giorni feriali quando disponibili.',
      'Alterna ristoranti e spesa al supermercato.',
      'Per il caffè, il banco è spesso la scelta più conveniente.',
      'Prenota i locali più richiesti per evitare scelte last minute più costose.'
    ],
    bridge: {
      title: 'Ti ha colpito una zona d’Italia più di una semplice vacanza?',
      text: 'Molti cechi iniziano dall’esperienza gastronomica e dal viaggio, poi approfondiscono i singoli territori.',
      button: 'Scopri le regioni d’Italia'
    },
    conclusionTitle: 'Conclusione',
    conclusion: [
      'Nel 2026 mangiare bene in Italia può restare gestibile se pianifichi in base alla località e allo stile di viaggio.',
      'La differenza principale la fanno scelta dei locali, gestione del budget e combinazione ristoranti + supermercato.',
      'Così puoi vivere un’esperienza autentica, con qualità alta e senza spese superflue.'
    ]
  }
}

const UPDATED_REPORT = {
  cs: {
    marketTitle: 'Co se v roce 2026 změnilo v cenách',
    marketIntro:
      'Aktualizace k 10. květnu 2026: Itálie zůstává cenově velmi rozdílná země. Celková inflace v dubnu zrychlila na 2,8 % meziročně, běžný nákupní koš rostl o 2,5 % a čerstvé potraviny o 6,0 %. To je důležité hlavně u ovoce, zeleniny, masa, ryb a jídel v místech se silnou sezonní poptávkou.',
    marketItems: [
      'Největší tlak v jídle je vidět u čerstvých surovin a produktů s vyšší závislostí na energii, dopravě a sezoně.',
      'Služby v restauracích nerostou stejně rychle jako energie a čerstvé potraviny, ale v turistických městech se do ceny promítá nájem, personál i poptávka.',
      'U delšího pobytu je rozdíl mezi čistě restauračním režimem a kombinací supermarket + lokální podniky často 25-40 EUR denně pro dvě osoby.',
      'Itálie měla v roce 2025 přibližně 479 milionů turistických přenocování. V hlavní sezoně to zvyšuje tlak na ceny v Benátkách, Římě, Florencii, u moře a v ikonických regionech.'
    ],
    dailyTitle: 'Reálný denní rozpočet na jídlo',
    dailyIntro:
      'Pro soukromé plánování je praktičtější počítat denní scénáře než jen cenu jedné pizzy.',
    dailyItems: [
      'Úsporný režim: 25-40 EUR na osobu a den při snídani z baru nebo supermarketu, jednoduchém obědě a jedné levnější večeři.',
      'Vyvážený režim: 45-75 EUR na osobu a den při kombinaci kavárny, pizzerie nebo trattorie a běžného nákupu.',
      'Komfortní režim: 80-130+ EUR na osobu a den, pokud se jí hlavně v restauracích, s vínem, dezerty a podniky v centru.'
    ],
    regionalTitle: 'Regionální rozdíly, které jsou na účtu vidět',
    regionalIntro:
      'Průměr za Itálii je užitečný jen jako start. Pro reálný rozpočet je nutné rozlišit region a typ místa.',
    regionalItems: [
      'Milán, Benátky, Florencie, centrum Říma a pobřežní top lokality patří mezi dražší oblasti pro kávu u stolu, večeře i víno.',
      'Menší města v Abruzzu, Molise, Basilicatě, vnitrozemí Kalábrie nebo části Marche často nabídnou lepší cenu při stejné kvalitě surovin.',
      'Na jihu se dá stále dobře najíst levněji, ale v ikonických místech jako Amalfi, Capri, Taormina nebo centrum Neapole už rozhoduje turistická poloha, ne zeměpisný jih.',
      'U moře a v horských destinacích počítejte s větším sezonním rozdílem mezi pracovním dnem mimo sezonu a víkendem v létě.'
    ],
    rankingsTitle: 'Mini žebříčky 2026: kde hledat cenu nebo kvalitu',
    rankingsIntro:
      'Tyto žebříčky nejsou reklamní doporučení ani garance nejlepší ceny v každém městě. Jde o praktický výběr podle veřejných cenových průzkumů, spotřebitelských hodnocení a gastronomických průvodců dostupných pro sezonu 2026.',
    supermarketRankTitle: 'Supermarkety a discounty: cena / kvalita',
    supermarketRankItems: [
      'Eurospin - nejsilnější volba pro nejnižší cenu základního nákupu a levné privátní značky.',
      'In’s Mercato - velmi dobrý discount pro smíšený koš a rychlý nákup v běžných městech.',
      'Famila / Famila Superstore - dobrý kompromis, když chcete kombinovat značkové produkty a úsporu.',
      'Carrefour - zajímavý hlavně u produktů pod vlastní značkou a při akcích.',
      'Esselunga - silná kvalita, sortiment a online služba; ne vždy nejlevnější, ale často dobrý poměr pohodlí a kvality.'
    ],
    pizzeriaRankTitle: 'Pizzerie: kvalita, která stále dává smysl',
    pizzeriaRankItems: [
      'I Masanielli - Francesco Martucci, Caserta: špičková pizza v městě, kde cena obvykle není tak extrémní jako v prémiových turistických centrech.',
      'Diego Vitagliano Pizzeria, Neapol: vysoká kvalita a silná neapolská pozice, vhodné pro cestovatele, kteří chtějí jistotu.',
      'Seu Pizza Illuminati, Řím: jedna z nejlepších adres v hlavním městě pro modernější styl pizzy.',
      '50 Kalò, Neapol: velmi dobrá volba pro klasickou neapolskou zkušenost s kontrolovatelným rozpočtem.',
      'Sestogusto, Turín: severní Itálie, dobrá kvalita a zajímavý poměr oproti dražším adresám v Miláně.'
    ],
    restaurantRankTitle: 'Restaurace: kvalita / cena bez fine dining rozpočtu',
    restaurantRankItems: [
      'Bib Gourmand je nejbezpečnější filtr: v Itálii 2026 zahrnuje 255 restaurací s dobrým poměrem kvality a ceny.',
      'Emilia-Romagna a Piemonte mají největší koncentraci Bib Gourmand, každá zhruba 34 adres.',
      'Toscana drží velmi silnou pozici pro tradiční kuchyni s přibližně 26 adresami.',
      'Lombardie má široký výběr včetně míst mimo nejdražší centrum Milána, přibližně 23 adres.',
      'Veneto nabízí solidní síť dostupnějších restaurací pro cestu mezi městy, jezerem a pobřežím, přibližně 18 adres.'
    ],
    supermarketNote:
      'Jde o orientační spotřebitelská rozmezí aktualizovaná pro rok 2026. Cena se může měnit podle řetězce, regionu, značky a sezony.',
    legalTitle: 'Poznámka k cenám',
    legalText:
      'Uvedené částky jsou informační cenová rozpětí aktualizovaná k 10. květnu 2026. Nejde o oficiální ceník ani garanci konečné ceny. Před objednávkou vždy ověřte menu, coperto, servizio a případné příplatky.',
    dinnerMidpoint: 'Orientační střed trhu se pohybuje kolem 70 EUR.',
    cappuccinoMidpoint: 'Praktický střed se pohybuje zhruba kolem 1,75 EUR.'
  },
  en: {
    marketTitle: 'What changed in food prices in 2026',
    marketIntro:
      'Updated on 10 May 2026: Italy remains a country with wide price differences. Headline inflation accelerated to 2.8% year on year in April, the everyday shopping basket rose by 2.5%, and fresh food rose by 6.0%. This matters most for fruit, vegetables, meat, fish, and meals in places with strong seasonal demand.',
    marketItems: [
      'The strongest pressure is visible in fresh ingredients and products more exposed to energy, transport, and seasonality.',
      'Restaurant services are not rising as quickly as energy and fresh food, but tourist cities still price in rent, staffing, and demand.',
      'On longer stays, the gap between eating only in restaurants and mixing supermarket shopping with local venues is often EUR 25-40 per day for two people.',
      'Italy recorded roughly 479 million tourist nights in 2025. In high season, that adds pressure in Venice, Rome, Florence, seaside areas, and iconic regions.'
    ],
    dailyTitle: 'Realistic daily food budget',
    dailyIntro:
      'For private planning, daily scenarios are more useful than looking only at the price of one pizza.',
    dailyItems: [
      'Budget mode: EUR 25-40 per person per day with breakfast at a bar or supermarket, a simple lunch, and one cheaper dinner.',
      'Balanced mode: EUR 45-75 per person per day with a mix of cafes, pizzerias or trattorias, and grocery shopping.',
      'Comfort mode: EUR 80-130+ per person per day when most meals are in restaurants, with wine, desserts, and central locations.'
    ],
    regionalTitle: 'Regional differences that show up on the bill',
    regionalIntro:
      'The Italian average is only a starting point. A realistic budget has to separate region, city type, and venue position.',
    regionalItems: [
      'Milan, Venice, Florence, central Rome, and prime coastal areas are among the more expensive locations for table-service coffee, dinner, and wine.',
      'Smaller towns in Abruzzo, Molise, Basilicata, inland Calabria, or parts of Marche often offer better value at similar ingredient quality.',
      'Southern Italy can still be cheaper, but in places such as Amalfi, Capri, Taormina, or central Naples the tourist position matters more than geography.',
      'At the seaside and in mountain destinations, expect a bigger gap between a weekday off season and a summer weekend.'
    ],
    rankingsTitle: 'Mini rankings 2026: where to look for price or value',
    rankingsIntro:
      'These rankings are not advertising recommendations and do not guarantee the lowest price in every city. They are practical shortlists based on public price surveys, consumer ratings, and food guides available for the 2026 season.',
    supermarketRankTitle: 'Supermarkets and discounters: price / quality',
    supermarketRankItems: [
      'Eurospin - the strongest choice for the lowest basic grocery basket and low-cost private-label products.',
      'In’s Mercato - a very good discounter for mixed baskets and quick shopping in everyday cities.',
      'Famila / Famila Superstore - a solid compromise when mixing branded products with savings.',
      'Carrefour - interesting mainly for own-brand products and promotions.',
      'Esselunga - strong quality, assortment, and online service; not always the cheapest, but often good for convenience and reliability.'
    ],
    pizzeriaRankTitle: 'Pizzerias: quality that still makes sense',
    pizzeriaRankItems: [
      'I Masanielli - Francesco Martucci, Caserta: top-level pizza in a city where prices are usually less extreme than premium tourist centers.',
      'Diego Vitagliano Pizzeria, Naples: high quality and a strong Neapolitan benchmark, useful for travelers who want certainty.',
      'Seu Pizza Illuminati, Rome: one of the best addresses in the capital for a more modern pizza style.',
      '50 Kalò, Naples: a very good option for a classic Neapolitan experience with a controllable budget.',
      'Sestogusto, Turin: northern Italy, strong quality, and interesting value compared with more expensive Milan addresses.'
    ],
    restaurantRankTitle: 'Restaurants: value without a fine-dining budget',
    restaurantRankItems: [
      'Bib Gourmand is the safest filter: in Italy 2026 it includes 255 restaurants with strong value for money.',
      'Emilia-Romagna and Piedmont have the largest concentration of Bib Gourmand restaurants, about 34 addresses each.',
      'Tuscany remains very strong for traditional food with about 26 addresses.',
      'Lombardy offers a broad choice, including places outside Milan’s most expensive center, about 23 addresses.',
      'Veneto has a solid network of more accessible restaurants for trips between cities, lake areas, and the coast, about 18 addresses.'
    ],
    supermarketNote:
      'These are indicative consumer ranges updated for 2026. Prices can change by chain, region, brand, and season.',
    legalTitle: 'Price note',
    legalText:
      'The amounts shown are informational price ranges updated on 10 May 2026. They are not an official price list or a guarantee of the final bill. Always check the menu, coperto, servizio, and any extra charges before ordering.',
    dinnerMidpoint: 'Market benchmarks place the practical midpoint near EUR 70.',
    cappuccinoMidpoint: 'The practical midpoint is close to EUR 1.75.'
  },
  it: {
    marketTitle: 'Cosa è cambiato nei prezzi nel 2026',
    marketIntro:
      'Aggiornamento al 10 maggio 2026: l’Italia resta un Paese con differenze di prezzo molto ampie. Ad aprile l’inflazione generale è salita al 2,8% annuo, il carrello della spesa al 2,5% e gli alimentari freschi al 6,0%. Questo pesa soprattutto su frutta, verdura, carne, pesce e pasti nelle zone con domanda stagionale forte.',
    marketItems: [
      'La pressione maggiore si vede sulle materie prime fresche e sui prodotti più esposti a energia, trasporto e stagionalità.',
      'I servizi di ristorazione non stanno correndo come energia e alimentari freschi, ma nelle città turistiche entrano comunque in conto affitti, personale e domanda.',
      'Nei soggiorni lunghi, la differenza tra mangiare solo fuori e alternare supermercato + locali del posto vale spesso 25-40 EUR al giorno per due persone.',
      'Nel 2025 l’Italia ha registrato circa 479 milioni di presenze turistiche. In alta stagione questo aumenta la pressione su Venezia, Roma, Firenze, coste e regioni iconiche.'
    ],
    dailyTitle: 'Budget giornaliero realistico per mangiare',
    dailyIntro:
      'Per un file privato e operativo è più utile ragionare per scenari giornalieri che guardare solo il prezzo di una pizza.',
    dailyItems: [
      'Modalità risparmio: 25-40 EUR a persona al giorno con colazione al bar o supermercato, pranzo semplice e una cena economica.',
      'Modalità equilibrata: 45-75 EUR a persona al giorno alternando caffè, pizzeria o trattoria e spesa base.',
      'Modalità comfort: 80-130+ EUR a persona al giorno se si mangia soprattutto al ristorante, con vino, dolci e locali centrali.'
    ],
    regionalTitle: 'Differenze regionali che si vedono sul conto',
    regionalIntro:
      'La media italiana serve solo come punto di partenza. Per un budget vero bisogna distinguere regione, città e posizione del locale.',
    regionalItems: [
      'Milano, Venezia, Firenze, centro di Roma e località costiere premium sono tra le aree più care per caffè al tavolo, cena e vino.',
      'Piccole città in Abruzzo, Molise, Basilicata, entroterra calabrese o alcune zone delle Marche offrono spesso migliore rapporto qualità/prezzo.',
      'Il Sud può restare più conveniente, ma in luoghi come Amalfi, Capri, Taormina o centro di Napoli conta più la pressione turistica che la geografia.',
      'Al mare e in montagna il divario tra giorno feriale fuori stagione e weekend estivo può essere molto marcato.'
    ],
    rankingsTitle: 'Mini classifiche 2026: dove cercare prezzo o qualità',
    rankingsIntro:
      'Queste classifiche non sono consigli pubblicitari e non garantiscono il prezzo più basso in ogni città. Sono shortlist pratiche basate su indagini prezzo pubbliche, valutazioni dei consumatori e guide gastronomiche disponibili per la stagione 2026.',
    supermarketRankTitle: 'Supermercati e discount: prezzo / qualità',
    supermarketRankItems: [
      'Eurospin - scelta più forte per il carrello base più economico e i prodotti primo prezzo a marchio privato.',
      'In’s Mercato - discount molto valido per carrello misto e spesa veloce nelle città comuni.',
      'Famila / Famila Superstore - buon compromesso quando si combinano prodotti di marca e convenienza.',
      'Carrefour - interessante soprattutto sui prodotti a marchio dell’insegna e sulle promozioni.',
      'Esselunga - forte su qualità, assortimento e spesa online; non sempre la più economica, ma spesso solida per comodità e affidabilità.'
    ],
    pizzeriaRankTitle: 'Pizzerie: qualità che resta sensata',
    pizzeriaRankItems: [
      'I Masanielli - Francesco Martucci, Caserta: pizza di vertice in una città dove i prezzi sono di solito meno estremi rispetto ai centri turistici premium.',
      'Diego Vitagliano Pizzeria, Napoli: alta qualità e riferimento napoletano forte, utile per chi vuole andare sul sicuro.',
      'Seu Pizza Illuminati, Roma: una delle migliori insegne della capitale per uno stile di pizza più moderno.',
      '50 Kalò, Napoli: ottima scelta per esperienza napoletana classica con budget controllabile.',
      'Sestogusto, Torino: Nord Italia, buona qualità e rapporto interessante rispetto ad alcune insegne più care di Milano.'
    ],
    restaurantRankTitle: 'Ristoranti: qualità / prezzo senza budget da fine dining',
    restaurantRankItems: [
      'Bib Gourmand è il filtro più sicuro: in Italia 2026 raccoglie 255 ristoranti con forte rapporto qualità/prezzo.',
      'Emilia-Romagna e Piemonte hanno la concentrazione più alta di Bib Gourmand, circa 34 indirizzi ciascuna.',
      'La Toscana resta molto forte per cucina tradizionale con circa 26 indirizzi.',
      'La Lombardia offre scelta ampia, anche fuori dal centro più caro di Milano, con circa 23 indirizzi.',
      'Il Veneto ha una rete solida di ristoranti più accessibili per viaggi tra città, lago e costa, circa 18 indirizzi.'
    ],
    supermarketNote:
      'Sono intervalli orientativi aggiornati al 2026. Il prezzo può cambiare per insegna, regione, marca e stagione.',
    legalTitle: 'Nota sui prezzi',
    legalText:
      'Gli importi indicati sono fasce informative aggiornate al 10 maggio 2026. Non sono un listino ufficiale né una garanzia del prezzo finale. Prima di ordinare è sempre corretto verificare menu, coperto, servizio ed eventuali supplementi.',
    dinnerMidpoint: 'Il valore centrale pratico resta vicino a 70 EUR.',
    cappuccinoMidpoint: 'La media pratica resta vicina a 1,75 EUR.'
  }
}

function formatDate(language, value) {
  const locale = language === 'cs' ? 'cs-CZ' : language === 'it' ? 'it-IT' : 'en-US'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })
}

function TravelPartnerCta({ title, text, bookingLabel, gygLabel }) {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
      <CardContent className="p-6 md:p-8">
        <h3 className="text-2xl font-bold mb-3 text-slate-800">{title}</h3>
        <p className="text-gray-500 mb-5 leading-relaxed" style={{color:'#4a4a4a', lineHeight:'1.75'}}>{text}</p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button asChild className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold px-6 py-5 text-sm transition-all duration-300 shadow-lg w-full sm:w-auto">
            <a href={TRAVEL_PARTNER_LINKS.booking} target="_blank" rel="nofollow sponsored noopener noreferrer">
              {bookingLabel}
            </a>
          </Button>
          <Button asChild className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-semibold px-6 py-5 text-sm transition-all duration-300 shadow-lg w-full sm:w-auto">
            <a href={TRAVEL_PARTNER_LINKS.getYourGuide} target="_blank" rel="nofollow sponsored noopener noreferrer">
              {gygLabel}
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ReporterCard({ title, intro, items, tone = 'white' }) {
  const cardClass =
    tone === 'blue'
      ? 'bg-slate-900 border-slate-800 text-white'
      : 'bg-white border border-slate-200'
  const titleClass = tone === 'blue' ? 'mb-8 text-white' : 'mb-8'
  const textClass = tone === 'blue' ? 'text-slate-100' : 'text-slate-700'
  const listClass = tone === 'blue' ? 'text-slate-100' : 'text-slate-700'

  return (
    <Card className={cardClass}>
      <CardHeader>
        <CardTitle className={titleClass}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`${textClass} leading-relaxed mb-4`}>{intro}</p>
        <ul className={`list-disc pl-6 space-y-2 ${listClass}`}>
          {items.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function MiniRankingsCard({ report }) {
  const groups = [
    { title: report.supermarketRankTitle, items: report.supermarketRankItems },
    { title: report.pizzeriaRankTitle, items: report.pizzeriaRankItems },
    { title: report.restaurantRankTitle, items: report.restaurantRankItems }
  ]

  return (
    <Card className="bg-white border border-slate-200">
      <CardHeader>
        <CardTitle className="mb-8">{report.rankingsTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-700 leading-relaxed mb-6">{report.rankingsIntro}</p>
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.title}>
              <h3 className="font-semibold text-slate-900 mb-3">{group.title}</h3>
              <ol className="list-decimal pl-6 space-y-2 text-slate-700">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function FoodCostsItaly2026Page() {
  const [language, setLanguage] = useState('cs')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
    }

    const handleLanguageChange = (event) => {
      if (!event?.detail) return
      setLanguage(event.detail)
      document.documentElement.lang = event.detail
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  const t = CONTENT[language] || CONTENT.cs
  const report = UPDATED_REPORT[language] || UPDATED_REPORT.cs
  const articleImage =
    language === 'cs'
      ? {
          src: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1400&q=80',
          alt: 'Italské jídlo a místní gastronomie',
          caption: 'Nejlepší ceny jídla obvykle najdete mimo hlavní turistické zóny a při kombinaci supermarketu s lokálními podniky.'
        }
      : language === 'it'
        ? {
            src: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1400&q=80',
            alt: 'Cibo italiano e gastronomia locale',
            caption: 'I prezzi migliori si trovano spesso fuori dalle aree più turistiche, alternando supermercati e locali del posto.'
          }
        : {
            src: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1400&q=80',
            alt: 'Italian food and local cuisine',
            caption: 'The best food prices are often found outside the busiest tourist zones by mixing supermarkets with local spots.'
          }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navigation />

      <main className="pt-28 pb-16 md:pb-24">
        <div className="container mx-auto px-6" style={{ maxWidth: '1200px' }}>
          <article className="max-w-4xl mx-auto space-y-8" style={{ maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto' }}>
            <Button asChild variant="outline" className="inline-flex items-center border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-700">
              <Link href="/články/průvodce-italii">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.navArticles}
              </Link>
            </Button>

            <header className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-slate-100 border border-slate-200 text-slate-700 mb-4">
                <Euro className="h-3.5 w-3.5" />
                {t.badge}
              </div>

              <h1 className="font-bold text-slate-900 leading-tight mb-8">{t.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6">
                <span className="inline-flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  {formatDate(language, PUBLISHED_AT)}
                </span>
                <span className="inline-flex items-center">
                  <Clock className="h-4 w-4 mr-1.5" />
                  {t.readTime}
                </span>
              </div>

              <div className="space-y-3 text-slate-700 leading-relaxed">
                {t.intro.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </header>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <Image src={articleImage.src} alt={articleImage.alt} width={1400} height={800} sizes="(min-width: 768px) 768px, 100vw" className="w-full h-64 md:h-80 object-cover" />
              <p className="text-sm text-slate-600 px-4 py-3">{articleImage.caption}</p>
            </div>

            <TravelPartnerCta
              title={t.partnerTop.title}
              text={t.partnerTop.text}
              bookingLabel={t.partnerTop.booking}
              gygLabel={t.partnerTop.gyg}
            />

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="mb-8">{t.quickTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-500">{t.quickNote}</p>
                <div className="space-y-3">
                  {t.quickItems.map((item) => (
                    <div key={item.label} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <h3 className="font-semibold text-slate-900">{item.label}</h3>
                        <span className="text-sm font-bold text-slate-800">{item.value}</span>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{item.note}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <MiniRankingsCard report={report} />

            <ReporterCard
              title={report.marketTitle}
              intro={report.marketIntro}
              items={report.marketItems}
              tone="blue"
            />

            <ReporterCard
              title={report.dailyTitle}
              intro={report.dailyIntro}
              items={report.dailyItems}
            />

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="mb-8">{t.restaurantsTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed mb-4">{t.restaurantsIntro}</p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  {t.restaurants.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="mb-8">{t.supermarketTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed mb-4">{t.supermarketIntro}</p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                  {t.supermarketItems.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <p className="text-sm text-slate-500">{report.supermarketNote}</p>
              </CardContent>
            </Card>

            <ReporterCard
              title={report.regionalTitle}
              intro={report.regionalIntro}
              items={report.regionalItems}
            />

            <TravelPartnerCta
              title={t.partnerMid.title}
              text={t.partnerMid.text}
              bookingLabel={t.partnerMid.booking}
              gygLabel={t.partnerMid.gyg}
            />

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="mb-8">{t.hiddenTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  {t.hidden.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="mb-8">{t.saveTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  {t.save.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-50 border-slate-200">
              <CardHeader>
                <CardTitle className="mb-8">{report.legalTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed">{report.legalText}</p>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-6 md:p-8">
                <h2 className="font-semibold text-amber-950 mb-8">{t.bridge.title}</h2>
                <p className="text-amber-950 leading-relaxed mb-5">{t.bridge.text}</p>
                <Button asChild className="bg-slate-800 hover:bg-slate-700 text-white">
                  <Link href="/regiony">{t.bridge.button}</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="mb-8">{t.conclusionTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-slate-700 leading-relaxed">
                {t.conclusion.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </CardContent>
            </Card>
            <InformationalDisclaimer language={language} className="mt-14" />
          </article>
        </div>
      </main>

      <PropertySlider language={language} />
      <Footer language={language} />
    </div>
  )
}
