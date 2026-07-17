const fs = require("fs");
const path = require("path");
const { extractListingData } = require("./extract-listing-data.cjs");

const ROOT = path.resolve(__dirname, "..");
const HAR_DIR = "C:/Users/39327/Desktop/har toscana";
const PPT_BUILD_DIR = path.join(ROOT, "tmp", "ppt-build", "har-toscana-2026-07-08");
const IMPORT_ROOT = path.join(ROOT, "data", "import", "properties");

const ITEMS = [
  {
    index: 3,
    slug: "toscana-quadrilocale-san-giuliano-terme-20-settembre",
    source_url: "https://www.immobiliare.it/annunci/127493192/",
    title_it: "Quadrilocale su due livelli vicino alle Terme di San Giuliano",
    title_en: "Two-Level Apartment Near the Thermal Baths in San Giuliano Terme",
    title_cs: "Dvoupodlažní byt u lázní v San Giuliano Terme",
    propertyType: "apartment",
    city_it: "San Giuliano Terme",
    city_en: "San Giuliano Terme",
    city_cs: "San Giuliano Terme",
    address_it: "Via 20 Settembre 37, San Giuliano Terme, Toscana",
    address_en: "Via 20 Settembre 37, San Giuliano Terme, Tuscany",
    address_cs: "Via 20 Settembre 37, San Giuliano Terme, Toskánsko",
    price: 99000,
    rooms: 4,
    bedrooms: 2,
    bathrooms: 1,
    square_meters: 75,
    features: [
      ["Appartamento su due livelli in piccola palazzina", "Two-level apartment in a small building", "Byt ve dvou úrovních v malé budově"],
      ["A pochi passi dalle terme", "A short walk from the thermal baths", "Jen pár kroků od lázní"],
      ["Camera matrimoniale, studio e bagno nuovo", "Double bedroom, study and new bathroom", "Manželská ložnice, pracovna a nová koupelna"],
      ["Interessante anche per affitti brevi", "Also interesting for short-term rentals", "Zajímavé i pro krátkodobé pronájmy"],
    ],
    description_it:
      "Nel comune di San Giuliano Terme, a pochi passi dalle Terme, proponiamo un appartamento di circa 75 m2 sviluppato su due livelli in una piccola palazzina di sole due unità.\n\nL'ingresso conduce al piano terra, dove si trovano soggiorno-pranzo, cucinotto e ripostiglio. Al piano superiore si sviluppa la zona notte con disimpegno, grande camera matrimoniale con due finestre, studio o stanza armadi e bagno nuovo.\n\nLa posizione vicino alle terme rende la proprietà interessante sia come abitazione personale sia come investimento per locazioni brevi. Prima dell'acquisto è opportuno verificare la documentazione, lo stato delle parti comuni e la reale situazione urbanistica e catastale.",
    description_en:
      "In San Giuliano Terme, a short walk from the thermal baths, this approximately 75 sqm apartment is arranged over two levels in a small building with only two units.\n\nThe ground floor includes a living-dining area, kitchenette and storage room. The upper level contains the sleeping area, with a large double bedroom with two windows, a study or wardrobe room, and a new bathroom.\n\nIts location near the baths makes it interesting both as a personal home and as a short-rental investment. Before purchasing, documentation, common areas and technical compliance should be checked carefully.",
    description_cs:
      "V San Giuliano Terme, jen pár kroků od lázní, je nabízen byt o ploše přibližně 75 m2 ve dvou úrovních, v malé budově se dvěma jednotkami.\n\nV přízemí je obytná část s jídelnou, kuchyňským koutem a komorou. V horním patře se nachází ložnicová část: velká manželská ložnice se dvěma okny, pracovna nebo šatna a nová koupelna.\n\nDíky poloze u lázní může být nemovitost zajímavá jak pro vlastní užívání, tak jako investice pro krátkodobé pronájmy. Před koupí je nutné ověřit dokumentaci, stav společných částí a technickou i katastrální správnost.",
  },
  {
    index: 5,
    slug: "toscana-terratetto-cascina-san-casciano-filicaia",
    source_url: "https://www.immobiliare.it/annunci/129887142/",
    title_it: "Terratetto toscano con orto a San Casciano di Cascina",
    title_en: "Tuscan Terraced House with Garden Plot in San Casciano di Cascina",
    title_cs: "Toskánský řadový dům se zahradou v Cascině",
    propertyType: "house",
    city_it: "Cascina",
    city_en: "Cascina",
    city_cs: "Cascina",
    address_it: "Strada Comunale di Filicaia 2, San Casciano, Cascina, Toscana",
    address_en: "Strada Comunale di Filicaia 2, San Casciano, Cascina, Tuscany",
    address_cs: "Strada Comunale di Filicaia 2, San Casciano, Cascina, Toskánsko",
    price: 94000,
    rooms: 3,
    bedrooms: 1,
    bathrooms: 1,
    square_meters: 81,
    lotSize: 0,
    features: [
      ["Terratetto su due livelli", "Two-level terraced house", "Řadový dům ve dvou podlažích"],
      ["Soggiorno con volta a botte", "Living room with barrel vault", "Obývací prostor s valenou klenbou"],
      ["Cucina abitabile luminosa", "Bright eat-in kitchen", "Světlá obytná kuchyně"],
      ["Orto o giardino indipendente staccato dall'abitazione", "Separate private garden plot", "Samostatná zahrada nebo orto oddělené od domu"],
    ],
    description_it:
      "A San Casciano, nel comune di Cascina, proponiamo un terratetto su due livelli di circa 81 m2, inserito in un contesto di paese e con il fascino tipico delle case toscane.\n\nAl piano terra si entra nel soggiorno principale con volta a botte e in una cucina abitabile ampia e luminosa, affacciata sulla strada e sulla piazza. Una scala in marmo conduce al piano superiore, dove si trovano una camera matrimoniale, un vano pluriuso attualmente utilizzato come studio e un bagno finestrato con doccia.\n\nIl valore aggiunto è l'orto o giardino indipendente, separato dall'abitazione, ideale per relax, piccole coltivazioni o spazio esterno privato. La casa è adatta a chi cerca un'abitazione autentica in un contesto tranquillo ma non isolato.",
    description_en:
      "In San Casciano, in the municipality of Cascina, this two-level terraced house of about 81 sqm sits in a village setting and retains the character of traditional Tuscan homes.\n\nThe ground floor includes the main living room with barrel vault and a bright eat-in kitchen overlooking the street and square. A marble staircase leads upstairs to a double bedroom, a multi-purpose room currently used as a study, and a windowed bathroom with shower.\n\nThe separate private garden plot is a key asset, suitable for relaxing, small cultivation or private outdoor use. The house is suited to buyers looking for authentic village living in a quiet but connected setting.",
    description_cs:
      "V San Casciano, v obci Cascina, je nabízen řadový dům o ploše přibližně 81 m2 ve dvou podlažích. Dům stojí v prostředí menší obce a zachovává si charakter tradičního toskánského bydlení.\n\nV přízemí je hlavní obytný prostor s valenou klenbou a velká světlá obytná kuchyně s výhledem do ulice a na náměstí. Mramorové schodiště vede do patra, kde se nachází manželská ložnice, víceúčelová místnost nyní využívaná jako pracovna a koupelna s oknem a sprchou.\n\nHlavní přidanou hodnotou je samostatná zahrada nebo orto oddělené od domu, vhodné pro relax, pěstování nebo soukromé venkovní zázemí. Nemovitost je vhodná pro klienta, který hledá autentický dům v obci, nikoli anonymní byt.",
  },
  {
    index: 9,
    slug: "toscana-trilocale-montevarchi-marconi",
    source_url: "https://www.immobiliare.it/annunci/128926330/",
    title_it: "Trilocale luminoso in edificio storico a Montevarchi",
    title_en: "Bright Three-Room Apartment in a Historic Building in Montevarchi",
    title_cs: "Světlý třípokojový byt v Montevarchi",
    propertyType: "apartment",
    city_it: "Montevarchi",
    city_en: "Montevarchi",
    city_cs: "Montevarchi",
    address_it: "Via Guglielmo Marconi, Montevarchi, Toscana",
    address_en: "Via Guglielmo Marconi, Montevarchi, Tuscany",
    address_cs: "Via Guglielmo Marconi, Montevarchi, Toskánsko",
    price: 78000,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    square_meters: 86,
    features: [
      ["Piano terra in edificio storico", "Ground floor in a historic building", "Přízemí v historické budově"],
      ["Ampio soggiorno con cucina a vista", "Large living room with open kitchen", "Velký obývací pokoj s otevřenou kuchyní"],
      ["Piccolo terrazzino rialzato", "Small raised terrace", "Menší zvýšená terasa"],
      ["Interessante anche come investimento", "Also interesting as an investment", "Zajímavé i jako investice"],
    ],
    description_it:
      "A Montevarchi, a pochi minuti dal centro, proponiamo un trilocale luminoso di circa 86 m2 posto al piano terra di un edificio storico.\n\nLa disposizione comprende un ampio soggiorno con cucina a vista e uscita verso un piccolo disimpegno con terrazzino rialzato e comodo ripostiglio sottoscala. La zona notte può essere organizzata con salotto e camera matrimoniale oppure con due camere matrimoniali, in base alle esigenze dell'acquirente. Sono presenti bagno e ulteriore ripostiglio.\n\nLa proprietà è interessante anche come investimento, grazie alla posizione vicina al centro e al prezzo trattabile. Prima dell'acquisto è consigliabile verificare lo stato dell'edificio storico, eventuali spese comuni e la distribuzione effettiva degli ambienti.",
    description_en:
      "In Montevarchi, a few minutes from the centre, this bright three-room apartment of about 86 sqm is located on the ground floor of a historic building.\n\nThe layout includes a large living room with open kitchen and access to a small raised terrace area with convenient under-stair storage. The sleeping area can be arranged as a sitting room plus double bedroom, or as two double bedrooms, depending on the buyer's needs. A bathroom and further storage complete the property.\n\nThe apartment is also interesting as an investment thanks to its location near the centre and negotiable price. The condition of the historic building, shared costs and actual room layout should be checked before purchase.",
    description_cs:
      "V Montevarchi, několik minut od centra, je nabízen světlý třípokojový byt o ploše přibližně 86 m2 v přízemí historické budovy.\n\nDispozice zahrnuje velký obývací pokoj s otevřenou kuchyní a výstupem do menšího prostoru se zvýšenou terasou a praktickým úložným místem pod schody. Noční část lze řešit jako salonek a manželskou ložnici, případně jako dvě manželské ložnice podle potřeb kupujícího. Součástí je koupelna a další komora.\n\nNemovitost je zajímavá i jako investice díky poloze blízko centra a jednatelnější ceně. Před koupí je vhodné ověřit stav historické budovy, společné náklady a skutečné dispoziční řešení.",
  },
  {
    index: 15,
    slug: "toscana-trilocale-montevarchi-moncioni",
    source_url: "https://www.immobiliare.it/annunci/129939054/",
    title_it: "Trilocale arredato nel borgo di Moncioni a Montevarchi",
    title_en: "Furnished Three-Room Apartment in the Village of Moncioni, Montevarchi",
    title_cs: "Zařízený byt v borgu Moncioni u Montevarchi",
    propertyType: "apartment",
    city_it: "Montevarchi",
    city_en: "Montevarchi",
    city_cs: "Montevarchi",
    address_it: "Via di Moncioni, Montevarchi, Toscana",
    address_en: "Via di Moncioni, Montevarchi, Tuscany",
    address_cs: "Via di Moncioni, Montevarchi, Toskánsko",
    price: 89000,
    rooms: 3,
    bedrooms: 1,
    bathrooms: 1,
    square_meters: 65,
    features: [
      ["Appartamento in borgo collinare", "Apartment in a hill village", "Byt v kopcovitém borgu"],
      ["Ingresso privato da scala esterna esclusiva", "Private entrance from an exclusive external staircase", "Soukromý vstup po vlastním venkovním schodišti"],
      ["Terrazzo e piccolo magazzino", "Terrace and small storage room", "Terasa a malý sklad"],
      ["Venduto arredato", "Sold furnished", "Prodává se zařízený"],
    ],
    description_it:
      "Nella zona collinare di Moncioni, a circa 6 km dal centro di Montevarchi, proponiamo un appartamento arredato di circa 65 m2 situato al primo piano all'interno di un borgo caratteristico.\n\nL'abitazione si sviluppa su un unico livello e dispone di ingresso privato tramite scala esterna esclusiva. Gli ambienti comprendono tre vani ampi e un terrazzo, con arredi già inclusi nella vendita. Al piano terra è presente un piccolo magazzino utile come deposito o spazio di servizio.\n\nLa proprietà è adatta a chi cerca una base pronta all'uso nella campagna toscana, con privacy, tranquillità e un contesto di borgo. Può essere valutata anche come investimento per soggiorni brevi o uso ricreativo.",
    description_en:
      "In the hill area of Moncioni, about 6 km from the centre of Montevarchi, this furnished apartment of about 65 sqm is located on the first floor within a characteristic village setting.\n\nThe home is arranged on one level and has a private entrance via an exclusive external staircase. It includes three generous rooms and a terrace, with furnishings already included in the sale. A small ground-floor storage room provides useful additional space.\n\nThe property is suitable for buyers looking for a ready-to-use base in the Tuscan countryside, with privacy, quiet surroundings and village atmosphere. It may also be considered for short stays or recreational use.",
    description_cs:
      "V kopcovité části Moncioni, přibližně 6 km od centra Montevarchi, je nabízen zařízený byt o ploše přibližně 65 m2 v prvním patře charakteristického borgo.\n\nByt je řešen v jedné úrovni a má soukromý vstup po vlastním venkovním schodišti. Nabízí tři prostorné místnosti a terasu, přičemž vybavení je již zahrnuto v ceně. V přízemí se nachází menší sklad, vhodný pro uložení vybavení nebo jako praktické zázemí.\n\nNemovitost je vhodná pro klienta, který hledá hotovou základnu v toskánské krajině, s klidem, soukromím a atmosférou menšího sídla. Lze ji posuzovat také jako rekreační nebo investiční nemovitost pro krátkodobé pobyty.",
  },
];

function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function extractLabel(value) {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") return value.label || value.value || value.name || value.formatted || value.text || "";
  return "";
}

function extractHtmlFromTruncatedHar(harPath) {
  const text = fs.readFileSync(harPath, "utf8");
  const marker = '"text": "<!DOCTYPE html';
  const markerIndex = text.indexOf(marker);
  if (markerIndex < 0) return "";
  const colonIndex = text.indexOf(":", markerIndex);
  const stringStart = text.indexOf('"', colonIndex + 1) + 1;
  let escaped = false;
  for (let index = stringStart; index < text.length; index += 1) {
    const char = text[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === '"') return JSON.parse(`"${text.slice(stringStart, index)}"`);
  }
  return "";
}

function getNextData(html) {
  const match = html.match(/<script[^>]+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
  return match ? JSON.parse(match[1]) : null;
}

function fallbackData(index) {
  const html = extractHtmlFromTruncatedHar(path.join(HAR_DIR, `${index}har.har`));
  const pageProps = getNextData(html)?.props?.pageProps || {};
  const realEstate = pageProps?.detailData?.realEstate || {};
  const property = realEstate?.properties?.[0] || {};
  return {
    title: normalizeWhitespace(realEstate.title),
    city: normalizeWhitespace(property.location?.city || property.location?.label || ""),
    address: normalizeWhitespace(property.location?.address || ""),
    streetNumber: normalizeWhitespace(property.location?.streetNumber || ""),
    latitude: property.location?.latitude ?? null,
    longitude: property.location?.longitude ?? null,
    priceLabel: normalizeWhitespace(extractLabel(realEstate.price) || extractLabel(property.price)),
    surface: normalizeWhitespace(extractLabel(property.surface) || extractLabel(property.surfaceValue)),
    rooms: normalizeWhitespace(extractLabel(property.rooms) || extractLabel(property.roomsValue)),
    bedrooms: normalizeWhitespace(extractLabel(property.bedRoomsNumber)),
    bathrooms: normalizeWhitespace(extractLabel(property.bathrooms)),
  };
}

function readData(index) {
  try {
    return extractListingData(path.join(HAR_DIR, `${index}har.har`));
  } catch {
    return fallbackData(index);
  }
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
  const lat = data.latitude ?? null;
  const lng = data.longitude ?? null;
  const listing = {
    slug: item.slug,
    title_it: item.title_it,
    title_en: item.title_en,
    title_cs: item.title_cs,
    propertyType: item.propertyType,
    propertyType_it: item.propertyType === "house" ? "casa" : "appartamento",
    region_it: "Toscana",
    city_it: item.city_it,
    city_en: item.city_en,
    city_cs: item.city_cs,
    address_it: item.address_it,
    address_en: item.address_en,
    address_cs: item.address_cs,
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
    seo_title_en: `${item.title_en} for Sale in Tuscany`,
    seo_title_cs: `${item.title_cs} na prodej v Toskánsku`,
    seo_description_it: `${item.title_it}: ${item.square_meters} m2, ${item.rooms} locali, ${item.bedrooms} camere, ${item.bathrooms} bagno, prezzo ${item.price.toLocaleString("it-IT")} euro.`,
    seo_description_en: `${item.title_en}: ${item.square_meters} sqm, ${item.rooms} rooms, ${item.bedrooms} bedrooms, ${item.bathrooms} bathroom, asking price EUR ${item.price.toLocaleString("en-US")}.`,
    seo_description_cs: `${item.title_cs}: ${item.square_meters} m2, ${item.rooms} místnosti, ${item.bedrooms} ložnice, ${item.bathrooms} koupelna, cena ${item.price.toLocaleString("cs-CZ")} EUR.`,
    status: "available",
    featured: false,
    source_url: item.source_url,
    keywords: ["toscana", item.city_it.toLowerCase(), "immobiliare", item.propertyType],
    image_urls: [],
    ...(lat != null && lng != null ? { lat, lng } : {}),
    original_title: data.title,
    original_source_summary: {
      city: data.city,
      address: data.address,
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
