import { NextResponse } from 'next/server'
import { client, writeClient } from '@/lib/sanity'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// All existing hardcoded blog articles
const BLOG_ARTICLES = [
  {
    slug: 'costs-2026',
    title: {
      en: 'How Much Does Buying a House in Italy Really Cost in 2026',
      cs: 'Kolik skutečně stojí koupě domu v Itálii v roce 2026',
      it: 'Quanto costa realmente acquistare una casa in Italia nel 2026'
    },
    excerpt: {
      en: 'An overview of real costs, taxes, and fees you need to account for before signing a contract. The purchase price is just the beginning.',
      cs: 'Přehled reálných nákladů, daní a poplatků, se kterými je nutné počítat ještě před podpisem smlouvy. Kupní cena je pouze začátek.',
      it: "Una panoramica dei costi reali, tasse e spese da considerare prima di firmare un contratto. Il prezzo di acquisto è solo l'inizio."
    },
    date: '2026-01-06',
    readTime: '8 min',
    category: { en: 'Costs', cs: 'Náklady', it: 'Costi' },
    link: '/guides/costs',
    articleType: 'blog',
    author: '',
    image: '',
    content: { en: '', cs: '', it: '' },
    tags: [],
    relatedRegions: []
  },
  {
    slug: 'common-mistakes',
    title: {
      en: 'Most Common Mistakes Czechs Make When Buying a House in Italy',
      cs: 'Nejčastější chyby Čechů při koupi domu v Itálii',
      it: 'Gli errori più comuni dei cechi quando acquistano una casa in Italia'
    },
    excerpt: {
      en: "What to watch out for so you don't waste time and money. The biggest problems arise not from carelessness but from unfamiliarity with the Italian system.",
      cs: 'Na co si dát pozor, abyste neztratili čas a peníze. Největší problémy vznikají ne z nepozornosti, ale z neznalosti italského systému.',
      it: 'A cosa fare attenzione per non perdere tempo e denaro. I maggiori problemi non nascono dalla disattenzione ma dalla scarsa conoscenza del sistema italiano.'
    },
    date: '2026-01-15',
    readTime: '7 min',
    category: { en: 'Guide', cs: 'Průvodce', it: 'Guida' },
    link: '/guides/mistakes',
    articleType: 'blog',
    author: '',
    image: '',
    content: { en: '', cs: '', it: '' },
    tags: [],
    relatedRegions: []
  },
  {
    slug: 'one-euro-houses',
    title: {
      en: '1 Euro Houses in Italy – Reality or Trap?',
      cs: 'Dům za 1 euro v Itálii – realita nebo past?',
      it: 'Case a 1 euro in Italia – realtà o trappola?'
    },
    excerpt: {
      en: "What do the 1 euro house offers really mean? We look at the conditions, hidden costs, and whether it's worth considering these offers seriously.",
      cs: 'Co skutečně znamenají nabídky domů za 1 euro? Podíváme se na podmínky, skryté náklady a zda stojí za to tyto nabídky brát vážně.',
      it: 'Cosa significano realmente le offerte di case a 1 euro? Esaminiamo le condizioni, i costi nascosti e se vale la pena considerare seriamente queste offerte.'
    },
    date: '2026-01-18',
    readTime: '6 min',
    category: { en: 'Analysis', cs: 'Analýza', it: 'Analisi' },
    link: '/blog/one-euro-houses',
    articleType: 'blog',
    author: '',
    image: '',
    content: { en: '', cs: '', it: '' },
    tags: [],
    relatedRegions: []
  },
  {
    slug: 'choose-region',
    title: {
      en: 'How to Choose the Right Region in Italy for Buying a House (Sea, Mountains, Investment)',
      cs: 'Jak vybrat správný region v Itálii pro koupi domu (moře, hory, investice)',
      it: 'Come scegliere la regione giusta in Italia per acquistare una casa (mare, montagna, investimento)'
    },
    excerpt: {
      en: "Italy offers very different regions. Learn how to choose based on your goal – whether it's a vacation home, investment, or a place for a new life.",
      cs: 'Itálie nabízí velmi odlišné regiony. Zjistěte, jak vybrat podle vašeho cíle – ať už jde o rekreační dům, investici nebo místo pro nový život.',
      it: "L'Italia offre regioni molto diverse. Scopri come scegliere in base al tuo obiettivo – che si tratti di una casa vacanze, investimento o posto per una nuova vita."
    },
    date: '2026-01-20',
    readTime: '10 min',
    category: { en: 'Regions', cs: 'Regiony', it: 'Regioni' },
    link: '/regions',
    articleType: 'blog',
    author: '',
    image: '',
    content: { en: '', cs: '', it: '' },
    tags: [],
    relatedRegions: []
  },
  {
    slug: 'property-inspections',
    title: {
      en: 'How Property Viewings Work in Italy',
      cs: 'Jak probíhají prohlídky nemovitostí v Itálii',
      it: 'Come funzionano le visite immobiliari in Italia'
    },
    excerpt: {
      en: 'What to expect during property viewings in Italy, how to prepare, and what to look for. A practical guide from experience.',
      cs: 'Co očekávat při prohlídkách nemovitostí v Itálii, jak se připravit a na co se zaměřit. Praktický průvodce ze zkušenosti.',
      it: "Cosa aspettarsi durante le visite immobiliari in Italia, come prepararsi e a cosa prestare attenzione. Una guida pratica dall'esperienza."
    },
    date: '2026-01-21',
    readTime: '6 min',
    category: { en: 'Guide', cs: 'Průvodce', it: 'Guida' },
    link: '/guides/inspections',
    articleType: 'blog',
    author: '',
    image: '',
    content: { en: '', cs: '', it: '' },
    tags: [],
    relatedRegions: []
  },
  {
    slug: 'notary-role',
    title: {
      en: 'Notary in Italy: Role and Costs When Buying a House',
      cs: 'Notář v Itálii: role a náklady při koupi domu',
      it: "Il notaio in Italia: ruolo e costi nell'acquisto di una casa"
    },
    excerpt: {
      en: "The notary's role in Italy differs significantly from the Czech Republic. Learn what to expect, what they verify, and what they don't.",
      cs: 'Role notáře v Itálii se výrazně liší od České republiky. Zjistěte, co očekávat, co notář kontroluje a co ne.',
      it: 'Il ruolo del notaio in Italia differisce significativamente dalla Repubblica Ceca. Scopri cosa aspettarti, cosa verifica e cosa no.'
    },
    date: '2026-01-21',
    readTime: '7 min',
    category: { en: 'Legal', cs: 'Právo', it: 'Legale' },
    link: '/guides/notary',
    articleType: 'blog',
    author: '',
    image: '',
    content: { en: '', cs: '', it: '' },
    tags: [],
    relatedRegions: []
  },
  {
    slug: 'buying-timeline',
    title: {
      en: 'How Long Does Buying a House in Italy Take and What Delays the Process Most',
      cs: 'Jak dlouho trvá koupě domu v Itálii a co celý proces nejčastěji zdržuje',
      it: 'Quanto tempo ci vuole per acquistare una casa in Italia e cosa ritarda di più il processo'
    },
    excerpt: {
      en: 'A realistic look at the timeline of buying Italian property – from the first viewing to receiving the keys. What causes the most common delays.',
      cs: 'Realistický pohled na časový plán koupě italské nemovitosti – od první prohlídky po předání klíčů. Co způsobuje nejčastější zdržení.',
      it: "Uno sguardo realistico alla tempistica dell'acquisto di un immobile italiano – dalla prima visita alla consegna delle chiavi. Cosa causa i ritardi più comuni."
    },
    date: '2026-01-21',
    readTime: '8 min',
    category: { en: 'Guide', cs: 'Průvodce', it: 'Guida' },
    link: '/guides/timeline',
    articleType: 'blog',
    author: '',
    image: '',
    content: { en: '', cs: '', it: '' },
    tags: [],
    relatedRegions: []
  }
]

// Existing region blog articles
const REGION_ARTICLES = [
  {
    slug: 'tuscany',
    title: { 
      en: "Discovering Tuscany: Italy's Timeless Treasure", 
      it: "Scoprire la Toscana: Il Tesoro Senza Tempo dell'Italia",
      cs: 'Objevování Toskánska: Italský poklad bez času'
    },
    excerpt: {
      en: 'From rolling vineyards to Renaissance masterpieces, Tuscany offers an unparalleled blend of natural beauty, rich history, and world-class culture.',
      it: 'Dai vigneti ondulati ai capolavori rinascimentali, la Toscana offre una combinazione impareggiabile di bellezza naturale, ricca storia e cultura di classe mondiale.',
      cs: 'Od zvlněných vinic až po renesanční mistrovská díla nabízí Toskánsko neporovnatelnou směs přírodní krásy, bohaté historie a světové kultury.'
    },
    author: 'Maria Rossi',
    date: '2024-01-15',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=600&fit=crop',
    content: {
      en: `<h2>The Heart of Italian Renaissance</h2>
<p>Tuscany, often called the cradle of the Renaissance, is a region that has captivated travelers for centuries. Its rolling hills, dotted with cypress trees and medieval hill towns, create a landscape that seems to have been painted by the masters themselves.</p>

<h3>Florence: The Artistic Capital</h3>
<p>No visit to Tuscany is complete without exploring Florence, the region's magnificent capital. Home to the Uffizi Gallery, the Duomo, and countless Renaissance treasures, Florence is a living museum where every street corner tells a story of artistic genius.</p>

<h3>The Wine Country</h3>
<p>The Chianti region, stretching between Florence and Siena, is world-renowned for its exceptional wines. Driving through the scenic wine roads, visitors can taste some of Italy's finest vintages while enjoying breathtaking views of the Tuscan countryside.</p>

<h3>Medieval Hill Towns</h3>
<p>Towns like San Gimignano, Volterra, and Cortona offer a glimpse into medieval Italy. These perfectly preserved hill towns boast ancient walls, stone towers, and charming piazzas that transport visitors back in time.</p>`,
      it: `<h2>Il Cuore del Rinascimento Italiano</h2>
<p>La Toscana, spesso chiamata la culla del Rinascimento, è una regione che ha affascinato i viaggiatori per secoli. Le sue colline ondulate, punteggiate di cipressi e borghi medievali, creano un paesaggio che sembra essere stato dipinto dai maestri stessi.</p>

<h3>Firenze: La Capitale Artistica</h3>
<p>Nessuna visita alla Toscana è completa senza esplorare Firenze, la magnifica capitale della regione. Casa della Galleria degli Uffizi, del Duomo e di innumerevoli tesori rinascimentali, Firenze è un museo vivente dove ogni angolo di strada racconta una storia di genio artistico.</p>`,
      cs: `<h2>Srdce italské renesance</h2>
<p>Toskánsko, často nazývané kolébkou renesance, je oblast, která fascinuje cestovatele po staletí. Jeho zvlněné kopce, poseté cypřiši a středověkými městečky, vytvářejí krajinu, která vypadá, jako by ji namalovali samotní mistři.</p>

<h3>Florencie: Umělecké hlavní město</h3>
<p>Žádná návštěva Toskánska není kompletní bez prozkoumání Florencie, nádherného hlavního města regionu. Domov galerie Uffizi, dómu a nespočtu renesančních pokladů, Florencie je živé muzeum, kde každý roh ulice vypráví příběh uměleckého génia.</p>`
    },
    tags: ['Travel', 'Culture', 'Wine', 'History', 'Architecture'],
    relatedRegions: ['lombardy', 'liguria', 'emilia-romagna'],
    category: { en: 'Region', cs: 'Region', it: 'Regione' },
    link: '/blog/regions/tuscany',
    articleType: 'region'
  },
  {
    slug: 'lake-como',
    title: { 
      en: 'Lake Como: Where Luxury Meets Natural Beauty', 
      it: 'Lago di Como: Dove il Lusso Incontra la Bellezza Naturale',
      cs: 'Lago di Como: Kde se luxus setkává s přírodní krásou'
    },
    excerpt: {
      en: "Discover the glamorous shores of Lake Como, where celebrity villas, charming villages, and dramatic mountain scenery create Italy's most exclusive lakeside destination.",
      it: "Scopri le rive glamour del Lago di Como, dove ville di celebrità, villaggi incantevoli e scenari montani drammatici creano la destinazione lacustre più esclusiva d'Italia.",
      cs: 'Objevte glamourní břehy Lago di Como, kde celebrity vily, půvabné vesnice a dramatické horské scenérie vytvářejí nejexkluzivnější italskou destinaci u jezera.'
    },
    author: 'Giuseppe Bianchi',
    date: '2024-01-10',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1734173071981-b16ee4f9867f?w=1200&h=600&fit=crop',
    content: {
      en: `<h2>The Jewel of Lombardy</h2>
<p>Lake Como, shaped like an inverted Y, is one of Italy's most beautiful and prestigious lakes. Surrounded by dramatic mountains and dotted with elegant villas, it has been a favorite retreat for aristocrats, artists, and celebrities for centuries.</p>

<h3>Bellagio: The Pearl of the Lake</h3>
<p>Often called the "Pearl of the Lake," Bellagio sits at the junction of Como's three branches. This charming town offers stunning views, elegant boutiques, and some of the lake's most beautiful gardens.</p>

<h3>Villa del Balbianello</h3>
<p>This magnificent villa, featured in movies like "Casino Royale," showcases the opulence that defines Lake Como. Its terraced gardens and dramatic architecture make it one of the lake's most photographed locations.</p>`,
      it: `<h2>Il Gioiello della Lombardia</h2>
<p>Il Lago di Como, dalla forma di Y rovesciata, è uno dei laghi più belli e prestigiosi d'Italia. Circondato da montagne drammatiche e punteggiato di ville eleganti, è stato per secoli un ritiro preferito di aristocratici, artisti e celebrità.</p>`,
      cs: `<h2>Klenot Lombardie</h2>
<p>Lago di Como, ve tvaru obráceného Y, je jedním z nejkrásnějších a nejprestižnějších italských jezer. Obklopené dramatickými horami a poseté elegantními vilami, je po staletí oblíbeným útočištěm aristokratů, umělců a celebrit.</p>`
    },
    tags: ['Luxury', 'Nature', 'Villas', 'Celebrities', 'Mountains'],
    relatedRegions: ['lombardy', 'tuscany', 'liguria'],
    category: { en: 'Region', cs: 'Region', it: 'Regione' },
    link: '/blog/regions/lake-como',
    articleType: 'region'
  }
]

function isSanityConfigured() {
  return process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && 
         process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'placeholder'
}

export async function POST(request) {
  if (!isSanityConfigured()) {
    return NextResponse.json({ error: 'Sanity CMS not configured' }, { status: 503 })
  }

  if (!process.env.SANITY_API_TOKEN) {
    return NextResponse.json({ 
      error: 'Sanity API token not configured. Write operations require SANITY_API_TOKEN.' 
    }, { status: 503 })
  }

  try {
    // Check if articles already exist
    const existingArticles = await client.fetch(
      `*[_type == "article"]{ slug }`
    )
    const existingSlugs = new Set(existingArticles.map(a => a.slug))

    const allArticles = [...BLOG_ARTICLES, ...REGION_ARTICLES]
    const results = []
    const skipped = []

    for (const article of allArticles) {
      if (existingSlugs.has(article.slug)) {
        skipped.push(article.slug)
        continue
      }

      const document = {
        _type: 'article',
        ...article
      }

      const result = await writeClient.create(document)
      results.push({ slug: article.slug, id: result._id })
    }

    return NextResponse.json({ 
      success: true, 
      created: results.length,
      skipped: skipped.length,
      details: {
        created: results,
        skipped
      }
    })
  } catch (error) {
    console.error('Error seeding articles:', error)
    return NextResponse.json({ 
      error: 'Failed to seed articles',
      details: error?.message || null
    }, { status: 500 })
  }
}
