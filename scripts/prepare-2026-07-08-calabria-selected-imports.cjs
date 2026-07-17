const fs = require("fs");
const path = require("path");
const { extractListingData } = require("./extract-listing-data.cjs");

const ROOT = path.resolve(__dirname, "..");
const HAR_DIR = "C:/Users/39327/Desktop/har calabria";
const PPT_BUILD_DIR = path.join(ROOT, "tmp", "ppt-build", "har-calabria-2026-07-08");
const IMPORT_ROOT = path.join(ROOT, "data", "import", "properties");

const ITEMS = [
  {
    index: 1,
    slug: "calabria-casa-belvedere-marittimo-laise",
    source_url: "https://www.immobiliare.it/annunci/127039949/",
    title_it: "Casa indipendente con terrazza a Belvedere Marittimo",
    title_en: "Independent House with Terrace in Belvedere Marittimo",
    title_cs: "Samostatný dům s terasou u Belvedere Marittimo",
    propertyType: "house",
    city: "Belvedere Marittimo",
    address: "Contrada Laise, Belvedere Marittimo, Calabria",
    price: 75000,
    rooms: 5,
    bedrooms: 3,
    bathrooms: 3,
    square_meters: 120,
    features: [
      ["Casa su tre livelli", "House over three levels", "Dům ve třech úrovních"],
      ["Terrazza e spazio esterno privato", "Terrace and private outdoor area", "Terasa a soukromý venkovní prostor"],
      ["Studio indipendente per ospiti", "Independent guest studio", "Samostatné studio pro hosty"],
      ["Terreno di pertinenza", "Private plot", "Vlastní pozemek"],
    ],
    description_it:
      "A Belvedere Marittimo, in località Laise, casa indipendente di circa 120 m2 su tre livelli, a circa 7 km dal mare. Al piano terra si trovano salone con angolo cottura, bagno e spazio esterno privato. Il primo piano offre due camere, bagno e terrazza. Il piano sottostrada aggiunge un monolocale indipendente con bagno e un magazzino. Completa la proprietà un terreno utilizzabile come giardino, orto o spazio verde.",
    description_en:
      "In the Laise area of Belvedere Marittimo, this independent house of about 120 sqm is arranged over three levels and lies around 7 km from the sea. The ground floor includes a living room with kitchenette, bathroom and private outdoor area. The first floor has two bedrooms, bathroom and terrace. The lower level adds an independent studio with bathroom and a storage room. A private plot completes the property.",
    description_cs:
      "V lokalitě Laise u Belvedere Marittimo je nabízen samostatný dům o ploše přibližně 120 m2, rozložený do tří úrovní a vzdálený asi 7 km od moře.\n\nV přízemí je světlý obytný salon s kuchyňským koutem, koupelna a soukromý venkovní prostor pro posezení. V patře jsou dvě ložnice, další koupelna a terasa s výhledem. Spodní úroveň přidává samostatné studio s koupelnou, vhodné pro hosty, a sklad. K domu patří také pozemek využitelný jako zahrada, orto nebo zelená plocha.",
  },
  {
    index: 2,
    slug: "calabria-casa-ristrutturata-rovito-san-nicola",
    source_url: "https://www.immobiliare.it/annunci/119389703/",
    title_it: "Casa ristrutturata nel centro di Rovito",
    title_en: "Renovated House in the Centre of Rovito",
    title_cs: "Zrekonstruovaný dům v centru Rovita",
    propertyType: "house",
    city: "Rovito",
    address: "Piazza San Nicola 13, Rovito, Calabria",
    price: 58000,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 2,
    square_meters: 80,
    features: [
      ["Completamente ristrutturata", "Fully renovated", "Po kompletní rekonstrukci"],
      ["Soggiorno con camino", "Living room with fireplace", "Obývací pokoj s krbem"],
      ["Due balconi", "Two balconies", "Dva balkony"],
      ["Soffitta ampliabile", "Attic with potential", "Půda s možností další místnosti"],
    ],
    description_it:
      "Nel centro di Rovito, a circa 10 minuti da Cosenza, casa indipendente su due livelli completamente ristrutturata. Il piano inferiore comprende ingresso, soggiorno con camino, cucinotto, bagno e balcone. Il piano superiore ospita due camere, un secondo bagno e un altro balcone con vista. La soffitta ampia permette di valutare la creazione di un ulteriore vano.",
    description_en:
      "In the centre of Rovito, around 10 minutes from Cosenza, this independent two-level house has been fully renovated. The lower level includes an entrance, living room with fireplace, kitchenette, bathroom and balcony. Upstairs there are two bedrooms, a second bathroom and another balcony with views. The large attic offers potential for an additional room.",
    description_cs:
      "V centru Rovita, přibližně 10 minut od Cosenzy, stojí samostatný dům po kompletní rekonstrukci.\n\nDispozice je ve dvou podlažích: dole vstup, obývací pokoj s krbem, kuchyňský kout, koupelna a balkon; nahoře dvě ložnice, druhá koupelna a další balkon s výhledem. Nad domem je prostorná půda, kde lze podle inzerátu vytvořit ještě další místnost. Popis zdůrazňuje nové výplně, tepelný plášť a lepší energetické vlastnosti.",
  },
  {
    index: 3,
    slug: "calabria-casa-fiumefreddo-bruzio-piano-san-salvatore",
    source_url: "https://www.immobiliare.it/annunci/121113808/",
    title_it: "Fabbricato con terreno agricolo a Fiumefreddo Bruzio",
    title_en: "Building with Agricultural Land in Fiumefreddo Bruzio",
    title_cs: "Dům s velkým zemědělským pozemkem ve Fiumefreddo Bruzio",
    propertyType: "house",
    city: "Fiumefreddo Bruzio",
    address: "Località Piano San Salvatore 2, Fiumefreddo Bruzio, Calabria",
    price: 80000,
    rooms: 4,
    bedrooms: 3,
    bathrooms: 1,
    square_meters: 94,
    lotSize: 10400,
    features: [
      ["Intero fabbricato su due piani", "Entire two-floor building", "Celý dvoupodlažní objekt"],
      ["Tre magazzini al piano terra", "Three ground-floor storage rooms", "Tři sklady v přízemí"],
      ["Terreno agricolo di circa 10.400 m2", "Approx. 10,400 sqm agricultural land", "Zemědělský pozemek asi 10 400 m2"],
      ["Ulteriori spazi agricoli e di deposito", "Additional agricultural and storage spaces", "Další hospodářské a skladové prostory"],
    ],
    description_it:
      "In località Piano San Salvatore, intero fabbricato su due piani con forte componente agricola. Il piano terra è composto da tre magazzini di circa 90 m2 complessivi. Il primo piano contiene l'abitazione con ingresso-corridoio, cucina abitabile, tre camere e bagno. La proprietà comprende anche circa 10.400 m2 di terreno agricolo e ulteriori magazzini o strutture rurali per circa 180 m2.",
    description_en:
      "In Piano San Salvatore, this entire two-floor building has a strong agricultural component. The ground floor consists of three storage rooms totalling around 90 sqm. The first floor contains the home, with entrance corridor, eat-in kitchen, three rooms and bathroom. The property also includes about 10,400 sqm of agricultural land and further rural/storage buildings of around 180 sqm.",
    description_cs:
      "V lokalitě Piano San Salvatore u Fiumefreddo Bruzio je nabízen celý dvoupodlažní objekt s výrazným hospodářským zázemím.\n\nPřízemí tvoří tři sklady o celkové ploše kolem 90 m2. Obytná část v prvním patře zahrnuje vstupní chodbu, obytnou kuchyni, tři pokoje a koupelnu. Součástí prodeje je zemědělský pozemek o ploše přibližně 10 400 m2 a další skladové nebo hospodářské prostory o ploše kolem 180 m2.",
  },
  {
    index: 5,
    slug: "calabria-villa-san-lucido-ss18",
    source_url: "https://www.immobiliare.it/annunci/127398383/",
    title_it: "Villetta su due livelli con giardino a San Lucido",
    title_en: "Two-Level Terraced Villa with Garden in San Lucido",
    title_cs: "Řadová vila se zahradou v San Lucidu",
    propertyType: "house",
    city: "San Lucido",
    address: "Strada Statale 18 Tirrena Inferiore 7, San Lucido, Calabria",
    price: 75000,
    rooms: 5,
    bedrooms: 3,
    bathrooms: 2,
    square_meters: 115,
    lotSize: 390,
    features: [
      ["Villetta su due livelli", "Two-level villa", "Dům ve dvou podlažích"],
      ["Ampio giardino di circa 390 m2", "Large garden of about 390 sqm", "Velká zahrada asi 390 m2"],
      ["Tre camere al primo piano", "Three bedrooms upstairs", "Tři ložnicové místnosti v patře"],
      ["Terrazze e balcone", "Terraces and balcony", "Terasy a balkon"],
    ],
    description_it:
      "A San Lucido, villetta a schiera di circa 115 m2 su due livelli con giardino di circa 390 m2. Il piano terra comprende ingresso, soggiorno, cucina e servizio. Il primo piano ospita tre vani letto e un secondo servizio. Le fotografie mostrano anche terrazze, balcone e spazi esterni, elementi importanti per un uso estivo o familiare.",
    description_en:
      "In San Lucido, this terraced villa of about 115 sqm is arranged over two levels and includes a garden of around 390 sqm. The ground floor has entrance, living room, kitchen and bathroom. The first floor contains three bedroom rooms and a second bathroom. Photos also show terraces, a balcony and outdoor spaces, important for summer or family use.",
    description_cs:
      "V San Lucidu je nabízen dům ve dvou podlažích o ploše přibližně 115 m2. Stručný inzerát staví nabídku hlavně na jednoduché dispozici a velké zahradě o ploše kolem 390 m2.\n\nV přízemí je vstup, obývací část, kuchyň a koupelna. V patře jsou tři ložnicové místnosti a druhá koupelna. Fotografie ukazují také terasy, balkon a venkovní části.",
  },
  {
    index: 7,
    slug: "calabria-casa-panoramica-sellia-verdi",
    source_url: "https://www.immobiliare.it/annunci/127572642/",
    title_it: "Casa ristrutturata con vista panoramica a Sellia",
    title_en: "Renovated House with Panoramic Views in Sellia",
    title_cs: "Dům s panoramatickým balkonem v borgu Sellia",
    propertyType: "house",
    city: "Sellia",
    address: "Via Giuseppe Verdi 4, Sellia, Calabria",
    price: 60000,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 2,
    square_meters: 108,
    features: [
      ["Casa ristrutturata e arredata", "Renovated and furnished house", "Zrekonstruovaný a zařízený dům"],
      ["Balconata panoramica", "Panoramic balcony", "Panoramatický balkon"],
      ["Camera con bagno privato", "Bedroom with private bathroom", "Ložnice s vlastní koupelnou"],
      ["Deposito da rifinire", "Storage space to finish", "Skladový prostor k dokončení"],
    ],
    description_it:
      "Nel borgo di Sellia, casa indipendente ristrutturata e arredata di circa 108 m2. La zona giorno comprende soggiorno-cucina, bagno e balconata con vista sul borgo, sulla valle e verso il mare. Su un altro livello si trova una camera ampia con servizio privato. La corte di pertinenza offre uno spazio esterno, mentre un deposito separato può essere rifinito secondo le esigenze.",
    description_en:
      "In the village of Sellia, this renovated and furnished independent house measures about 108 sqm. The living level includes a living-kitchen area, bathroom and panoramic balcony overlooking the village, valley and towards the sea. Another level contains a large bedroom with private bathroom. A small private courtyard provides outdoor space, while a separate storage room can be finished as needed.",
    description_cs:
      "V Sellii, starém borgu v provincii Catanzaro, je nabízen samostatný dům po rekonstrukci a s vybavením.\n\nDům má dvě úrovně propojené vnitřním schodištěm. Denní část tvoří obývací prostor s kuchyní, koupelna a balkon s výhledem na borgo, údolí a směrem k moři. V další úrovni je velká ložnice s vlastní koupelnou. K dispozici je i venkovní dvorek a skladový prostor, který čeká na dokončení.",
  },
  {
    index: 11,
    slug: "calabria-casa-lamezia-terme-vico-vetriera",
    source_url: "https://www.immobiliare.it/annunci/91989868/",
    title_it: "Casa autonoma su tre livelli a Nicastro",
    title_en: "Three-Level Independent House in Nicastro",
    title_cs: "Třípodlažní dům v centru Nicastro",
    propertyType: "house",
    city: "Lamezia Terme",
    address: "Vico Vetriera, Nicastro, Lamezia Terme, Calabria",
    price: 65000,
    rooms: 4,
    bedrooms: 2,
    bathrooms: 2,
    square_meters: 90,
    features: [
      ["Soluzione autonoma su tre livelli", "Independent home over three levels", "Samostatná jednotka ve třech úrovních"],
      ["Cucina abitabile in muratura", "Built-in eat-in kitchen", "Zděná obytná kuchyně"],
      ["Due servizi", "Two bathrooms", "Dvě koupelny"],
      ["Posizione centrale a Nicastro", "Central Nicastro location", "Centrální poloha v Nicastro"],
    ],
    description_it:
      "In Vico Vetriera, nel centro di Nicastro, soluzione autonoma su tre livelli. Il piano terra comprende cucina abitabile in muratura, soggiorno e pertinenza del sottoscala. Il primo piano si apre su un disimpegno con balconi e conduce a una camera e a un servizio. Il secondo piano presenta una struttura simile e aggiunge un secondo bagno con doccia.",
    description_en:
      "In Vico Vetriera, in central Nicastro, this independent home is arranged over three levels. The ground floor includes a built-in eat-in kitchen, living room and under-stair storage. The first floor opens onto a hallway with balconies and leads to a bedroom and bathroom. The second floor has a similar structure and includes a second bathroom with shower.",
    description_cs:
      "Ve Vico Vetriera, v centrální části Nicastro v Lamezia Terme, je nabízena samostatná jednotka ve třech úrovních.\n\nV přízemí je zděná obytná kuchyně, vstup do pohodlného obývacího pokoje a praktický prostor pod schody. První patro má chodbu s typickými balkony, pokoj a koupelnu. Druhé patro opakuje podobné uspořádání a přidává druhou koupelnu se sprchou.",
  },
  {
    index: 13,
    slug: "calabria-villino-panoramico-badolato",
    source_url: "https://www.immobiliare.it/annunci/124220971/",
    title_it: "Villino panoramico arredato a Badolato Superiore",
    title_en: "Furnished Panoramic House in Badolato Superiore",
    title_cs: "Panoramatický domek s terasou v Badolatu",
    propertyType: "house",
    city: "Badolato",
    address: "Corso Umberto I 2, Badolato, Calabria",
    price: 80000,
    rooms: 2,
    bedrooms: 2,
    bathrooms: 1,
    square_meters: 68,
    features: [
      ["Venduto arredato", "Sold furnished", "Prodává se zařízený"],
      ["Terrazzo panoramico", "Panoramic terrace", "Panoramatická terasa"],
      ["Giardino privato", "Private garden", "Soukromá zahrada"],
      ["Vista dal mare ai monti", "Views from sea to mountains", "Výhled od moře k horám"],
    ],
    description_it:
      "A Badolato Superiore, villino a schiera recente, arredato e in ottime condizioni. Il piano terra offre living con angolo cottura, camera e bagno, oltre a un giardino privato utilizzabile per pranzi e cene all'aperto. Al piano superiore la camera matrimoniale si apre direttamente sul terrazzo panoramico, con vista dal mare Ionio ai monti.",
    description_en:
      "In Badolato Superiore, this recent terraced house is furnished and in very good condition. The ground floor offers a living area with kitchenette, bedroom and bathroom, plus a private garden suitable for outdoor meals. Upstairs, the double bedroom opens directly onto the panoramic terrace, with views from the Ionian Sea to the mountains.",
    description_cs:
      "V Badolato Superiore je nabízen menší řadový domek ve velmi dobrém stavu, kompletně zařízený a připravený k užívání.\n\nDům má dvě úrovně. V přízemí je obytný prostor s kuchyňským koutem, ložnice a koupelna, venku pak soukromá zahrada vhodná pro venkovní jídlo a odpočinek. V horním patře je manželská ložnice s přímým vstupem na panoramatickou terasu s výhledem od Jónského moře až k horám.",
  },
];

function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function readData(index) {
  return extractListingData(path.join(HAR_DIR, `${index}har.har`));
}

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
    const ext = path.extname(file).toLowerCase();
    const safe = file.replace(/[^a-zA-Z0-9.-]/g, "-");
    fs.copyFileSync(path.join(sourceDir, file), path.join(targetDir, `${String(idx + 1).padStart(2, "0")}-${safe}${ext === path.extname(safe) ? "" : ext}`));
  });
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

for (const item of ITEMS) {
  const data = readData(item.index);
  const listing = {
    slug: item.slug,
    title_it: item.title_it,
    title_en: item.title_en,
    title_cs: item.title_cs,
    propertyType: item.propertyType,
    propertyType_it: "casa",
    region_it: "Calabria",
    city_it: item.city,
    city_en: item.city,
    city_cs: item.city,
    address_it: item.address,
    address_en: item.address.replace("Calabria", "Calabria"),
    address_cs: item.address.replace("Calabria", "Kalábrie"),
    price: item.price,
    rooms: item.rooms,
    bedrooms: item.bedrooms,
    bathrooms: item.bathrooms,
    square_meters: item.square_meters,
    ...(item.lotSize ? { lotSize: item.lotSize } : {}),
    features: item.features.map(([it, en, cs]) => ({ it, en, cs })),
    description_it: item.description_it,
    description_en: item.description_en,
    description_cs: item.description_cs,
    seo_title_it: item.title_it,
    seo_title_en: `${item.title_en} for Sale in Calabria`,
    seo_title_cs: `${item.title_cs} na prodej v Kalábrii`,
    seo_description_it: `${item.title_it}: ${item.square_meters} m2, ${item.rooms} locali, ${item.bedrooms} camere, ${item.bathrooms} bagni, prezzo ${item.price.toLocaleString("it-IT")} euro.`,
    seo_description_en: `${item.title_en}: ${item.square_meters} sqm, ${item.rooms} rooms, ${item.bedrooms} bedrooms, ${item.bathrooms} bathrooms, asking price EUR ${item.price.toLocaleString("en-US")}.`,
    seo_description_cs: `${item.title_cs}: ${item.square_meters} m2, ${item.rooms} místnosti, ${item.bedrooms} ložnice, ${item.bathrooms} koupelny, cena ${item.price.toLocaleString("cs-CZ")} EUR.`,
    status: "available",
    featured: false,
    source_url: item.source_url,
    keywords: ["calabria", item.city.toLowerCase(), "immobiliare", item.propertyType],
    image_urls: [],
    ...(data.latitude != null && data.longitude != null ? { lat: data.latitude, lng: data.longitude } : {}),
    original_title: data.title,
    original_source_summary: {
      city: data.city,
      address: normalizeWhitespace([data.address, data.streetNumber].filter(Boolean).join(" ")),
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
