const fs = require("fs");
const path = require("path");
const { extractListingData } = require("./extract-listing-data.cjs");

const ROOT = path.resolve(__dirname, "..");
const HAR_DIR = "C:/Users/39327/Desktop/har toscana";
const PPT_BUILD_DIR = path.join(ROOT, "tmp", "ppt-build", "tosna-terka-2-2026-07-08");
const IMPORT_ROOT = path.join(ROOT, "data", "import", "properties");

const ITEMS = [
  {
    index: 2,
    slug: "toscana-appartamento-chianciano-terme-cavine-valli",
    source_url: "https://www.immobiliare.it/annunci/122950630/",
    title_it: "Appartamento luminoso con terrazze a Chianciano Terme",
    title_en: "Bright Apartment with Terraces in Chianciano Terme",
    title_cs: "Světlý byt s terasami v Chianciano Terme",
    city: "Chianciano Terme",
    address: "Strada delle Cavine e Valli 33, Chianciano Terme, Toscana",
    price: 70000,
    rooms: 4,
    bedrooms: 2,
    bathrooms: 1,
    square_meters: 118,
    features: [
      ["Primo piano in trifamiliare", "First floor in a three-family house", "První patro v domě se třemi jednotkami"],
      ["Due terrazzi panoramici", "Two panoramic terraces", "Dvě panoramatické terasy"],
      ["Garage, cantina e lavanderia", "Garage, cellar and laundry", "Garáž, sklep a prádelna"],
      ["Piccola rata di terreno esclusiva", "Small private plot", "Menší soukromý pozemek"],
    ],
    description_it:
      "A Chianciano Terme, appartamento ampio e luminoso al primo piano di una trifamiliare, in posizione tranquilla e panoramica. La casa comprende cucina abitabile con stufa a legna e accesso al terrazzo, soggiorno, bagno finestrato con vasca, due camere matrimoniali e ripostiglio. Completano la proprietà due terrazzi, soffitta, garage, cantina, lavanderia e una piccola rata di terreno esclusiva.",
    description_en:
      "In Chianciano Terme, this spacious and bright apartment is on the first floor of a three-family house in a quiet panoramic position. It includes an eat-in kitchen with wood stove and terrace access, living room, windowed bathroom with bathtub, two double bedrooms and storage room. Two terraces, attic, garage, cellar, laundry room and a small private plot complete the property.",
    description_cs:
      "V Chianciano Terme je nabízen prostorný a světlý byt v prvním patře domu se třemi jednotkami, v klidné a panoramatické poloze.\n\nUvnitř je obytná kuchyně s kamny na dřevo a přímým vstupem na terasu, světlý obývací pokoj, koupelna s oknem a vanou, dvě velké manželské ložnice a komora. Hodnotu doplňují dvě panoramatické terasy, půda, garáž, sklep, prádelna a menší soukromý pozemek vhodný jako zahrada nebo orto.",
  },
  {
    index: 5,
    slug: "toscana-bilocale-tatti-massa-marittima-posta-vecchia",
    source_url: "https://www.immobiliare.it/annunci/121291110/",
    title_it: "Bilocale con vista nel borgo di Tatti",
    title_en: "One-Bedroom Apartment with Views in the Village of Tatti",
    title_cs: "Bilocale s výhledem v borgu Tatti",
    city: "Massa Marittima",
    address: "Via Posta Vecchia 6, Tatti, Massa Marittima, Toscana",
    price: 90000,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    square_meters: 67,
    features: [
      ["Secondo piano nel borgo di Tatti", "Second floor in the village of Tatti", "Druhé patro v borgu Tatti"],
      ["Terrazzo con vista", "Terrace with views", "Terasa s výhledem"],
      ["Soggiorno luminoso con cucina a vista", "Bright living room with open kitchen", "Světlý obývací prostor s otevřenou kuchyní"],
      ["Predisposizione per caldaia a metano", "Prepared for methane boiler connection", "Příprava pro kotel na metan"],
    ],
    description_it:
      "Nel borgo di Tatti, appartamento al secondo piano di circa 67 m2. La disposizione comprende una camera da letto, soggiorno luminoso con cucina a vista, bagno e piccolo terrazzo con vista panoramica. La struttura è sana e ben esposta, ma l'abitazione è da personalizzare. Il riscaldamento non è installato; è già predisposto l'allaccio per una caldaia a metano.",
    description_en:
      "In the village of Tatti, this second-floor apartment measures about 67 sqm. It includes one bedroom, a bright living room with open kitchen, bathroom and a small terrace with panoramic views. The structure is sound and well exposed, but the home is to be personalised. Heating is not installed; the connection for a methane boiler is already prepared.",
    description_cs:
      "V charakteristickém borgu Tatti u Massa Marittima je nabízen byt ve druhém patře o ploše přibližně 67 m2.\n\nDispozice zahrnuje ložnici, světlý obývací prostor s otevřenou kuchyní, koupelnu a malou terasu s panoramatickým výhledem. Byt má zdravou konstrukci a dobrou expozici, ale je určený k personalizaci. Vytápění zatím není instalováno, je však připraveno napojení pro kotel na metan.",
  },
  {
    index: 6,
    slug: "toscana-appartamento-massa-marittima-albizzeschi",
    source_url: "https://www.immobiliare.it/annunci/129911682/",
    title_it: "Appartamento con balcone nel centro di Massa Marittima",
    title_en: "Apartment with Balcony in Historic Massa Marittima",
    title_cs: "Byt s balkonem u dómu v Massa Marittima",
    city: "Massa Marittima",
    address: "Via Bernardino degli Albizzeschi 38, Massa Marittima, Toscana",
    price: 80000,
    rooms: 4,
    bedrooms: 3,
    bathrooms: 1,
    square_meters: 74,
    features: [
      ["Secondo piano nel centro storico", "Second floor in the historic centre", "Druhé patro v historickém centru"],
      ["A pochi passi da Piazza del Duomo", "A short walk from Piazza del Duomo", "Jen pár kroků od Piazza del Duomo"],
      ["Tre stanze adattabili", "Three adaptable rooms", "Tři prostorné místnosti s variabilním využitím"],
      ["Balcone raro per il centro storico", "Rare balcony for the historic centre", "Vzácný balkon v historickém centru"],
    ],
    description_it:
      "Nel centro storico di Massa Marittima, vicino a Piazza del Duomo, appartamento al secondo piano in Via Albizzeschi. La casa comprende soggiorno con angolo cottura, tre ampie stanze adattabili a camere o ad altri usi, e bagno con doccia. Il balcone è un elemento raro e molto interessante per una proprietà nel centro storico.",
    description_en:
      "In the historic centre of Massa Marittima, near Piazza del Duomo, this second-floor apartment is located on Via Albizzeschi. It includes a living area with kitchenette, three large rooms adaptable as bedrooms or other uses, and a bathroom with shower. The balcony is a rare and valuable feature for a property in the historic centre.",
    description_cs:
      "V historickém centru Massa Marittima, jen pár kroků od Piazza del Duomo, je nabízen byt ve druhém patře ve Via Albizzeschi.\n\nByt tvoří obývací část s kuchyňským koutem, tři prostorné místnosti využitelné jako ložnice nebo jiné pokoje podle potřeb a koupelna se sprchou. Velkou hodnotou je balkon, protože soukromý venkovní prostor je v centru Massa Marittima vzácný.",
  },
  {
    index: 8,
    slug: "toscana-terratetto-pontassieve-santa-brigida",
    source_url: "https://www.immobiliare.it/annunci/129923294/",
    title_it: "Terratetto da ristrutturare con fondo a Santa Brigida",
    title_en: "House to Renovate with Independent Commercial Space in Santa Brigida",
    title_cs: "Dům k rekonstrukci se samostatným fondem u Pontassieve",
    city: "Pontassieve",
    address: "Via del Cimitero 10, Santa Brigida, Pontassieve, Toscana",
    price: 98000,
    rooms: 3,
    bedrooms: 1,
    bathrooms: 1,
    square_meters: 84,
    features: [
      ["Da ristrutturare", "To renovate", "K rekonstrukci"],
      ["Zona giorno con angolo cottura", "Living area with kitchenette", "Denní zóna s kuchyňským koutem"],
      ["Fondo C/1 indipendente di circa 30 m2", "Independent C/1 space of about 30 sqm", "Samostatný fond C/1 asi 30 m2"],
      ["Colline fiorentine", "Florentine hills", "Florentské kopce"],
    ],
    description_it:
      "A Santa Brigida, nelle colline fiorentine, proprietà da ristrutturare composta da abitazione e fondo commerciale indipendente. La parte abitativa comprende zona giorno con angolo cottura, camera, bagno, lavanderia e ampio ripostiglio. Il fondo commerciale di circa 30 m2, categoria C/1, dispone di accesso indipendente e offre uno spazio versatile.",
    description_en:
      "In Santa Brigida, in the Florentine hills, this property to renovate includes a residential portion and an independent commercial space. The home contains a living area with kitchenette, bedroom, bathroom, laundry and large storage room. The commercial unit of about 30 sqm, category C/1, has independent access and offers versatile space.",
    description_cs:
      "V Santa Brigida u Pontassieve, v kopcích nad Florencií, je nabízena nemovitost k rekonstrukci s obytnou částí a samostatným komerčním fondem.\n\nObytná část má denní zónu s kuchyňským koutem, ložnici, koupelnu, prádelnu a velkou komoru. Součástí je také samostatný fond o ploše přibližně 30 m2 v kategorii C/1 s vlastním vstupem, využitelný jako pracovní, skladový nebo obchodní prostor podle možností území.",
  },
];

function copyImages(index, slug) {
  const sourceDir = path.join(PPT_BUILD_DIR, `listing-${index}`);
  const targetDir = path.join(IMPORT_ROOT, slug, "images");
  fs.rmSync(targetDir, { recursive: true, force: true });
  fs.mkdirSync(targetDir, { recursive: true });
  const files = fs
    .readdirSync(sourceDir)
    .filter((file) => /\.(jpe?g|png|webp|avif)$/i.test(file))
    .sort((a, b) => {
      if (a === "main.jpg") return -1;
      if (b === "main.jpg") return 1;
      return a.localeCompare(b, undefined, { numeric: true });
    })
    .slice(0, 14);
  files.forEach((file, idx) => {
    const safe = file.replace(/[^a-zA-Z0-9.-]/g, "-");
    fs.copyFileSync(path.join(sourceDir, file), path.join(targetDir, `${String(idx + 1).padStart(2, "0")}-${safe}`));
  });
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

for (const item of ITEMS) {
  const data = extractListingData(path.join(HAR_DIR, `${item.index}har.har`));
  const listing = {
    slug: item.slug,
    title_it: item.title_it,
    title_en: item.title_en,
    title_cs: item.title_cs,
    propertyType: item.index === 8 ? "house" : "apartment",
    propertyType_it: item.index === 8 ? "casa" : "appartamento",
    region_it: "Toscana",
    city_it: item.city,
    city_en: item.city,
    city_cs: item.city,
    address_it: item.address,
    address_en: item.address.replace("Toscana", "Tuscany"),
    address_cs: item.address.replace("Toscana", "Toskánsko"),
    price: item.price,
    rooms: item.rooms,
    bedrooms: item.bedrooms,
    bathrooms: item.bathrooms,
    square_meters: item.square_meters,
    features: item.features.map(([it, en, cs]) => ({ it, en, cs })),
    description_it: item.description_it,
    description_en: item.description_en,
    description_cs: item.description_cs,
    seo_title_it: item.title_it,
    seo_title_en: `${item.title_en} for Sale in Tuscany`,
    seo_title_cs: `${item.title_cs} na prodej v Toskánsku`,
    seo_description_it: `${item.title_it}: ${item.square_meters} m2, ${item.rooms} locali, ${item.bedrooms} camere, ${item.bathrooms} bagno, prezzo ${item.price.toLocaleString("it-IT")} euro.`,
    seo_description_en: `${item.title_en}: ${item.square_meters} sqm, ${item.rooms} rooms, ${item.bedrooms} bedrooms, ${item.bathrooms} bathroom, asking price EUR ${item.price.toLocaleString("en-US")}.`,
    seo_description_cs: `${item.title_cs}: ${item.square_meters} m2, ${item.rooms} místnosti, ${item.bedrooms} ložnice, ${item.bathrooms} koupelna, cena ${item.price.toLocaleString("cs-CZ")} EUR.`,
    status: "available",
    featured: false,
    source_url: item.source_url,
    keywords: ["toscana", item.city.toLowerCase(), "immobiliare"],
    image_urls: [],
    ...(data.latitude != null && data.longitude != null ? { lat: data.latitude, lng: data.longitude } : {}),
    original_title: data.title,
    original_source_summary: {
      city: data.city,
      address: [data.address, data.streetNumber].filter(Boolean).join(" "),
      price: data.priceLabel,
      surface: data.surface,
      rooms: data.rooms,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
    },
  };
  const folder = path.join(IMPORT_ROOT, item.slug);
  fs.mkdirSync(folder, { recursive: true });
  writeJson(path.join(folder, "listing.json"), listing);
  copyImages(item.index, item.slug);
  console.log(`Prepared ${item.slug}`);
}
