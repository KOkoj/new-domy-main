const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const pptxgen = require("pptxgenjs");
const { extractListingData } = require("./extract-listing-data.cjs");

const ROOT = path.resolve(__dirname, "..");
const HAR_DIR = "C:/Users/39327/Desktop/har calabria";
const OUT_DIR = path.join(ROOT, "tmp", "ppt-build", "har-calabria-2026-07-08");
const OUTPUT = path.join(ROOT, "tmp", "kalabria.pptx");
const ICON_STRIP = path.join(ROOT, "tmp", "ppt-build", "extracted", "ppt", "media", "image1.png");

const ITEMS = [
  { index: 1, har: "1har.har", url: "https://www.immobiliare.it/annunci/127039949/" },
  { index: 2, har: "2har.har", url: "https://www.immobiliare.it/annunci/119389703/" },
  { index: 3, har: "3har.har", url: "https://www.immobiliare.it/annunci/121113808/" },
  { index: 4, har: "4har.har", url: "https://www.immobiliare.it/annunci/129609258/" },
  { index: 5, har: "5har.har", url: "https://www.immobiliare.it/annunci/127398383/" },
  { index: 6, har: "6har.har", url: "https://www.immobiliare.it/annunci/118734105/" },
  { index: 7, har: "7har.har", url: "https://www.immobiliare.it/annunci/127572642/" },
  { index: 8, har: "8har.har", url: "https://www.immobiliare.it/annunci/119923464/" },
  { index: 9, har: "9har.har", url: "https://www.immobiliare.it/annunci/128310154/" },
  { index: 10, har: "10har.har", url: "https://www.immobiliare.it/annunci/129813442/" },
  { index: 11, har: "11har.har", url: "https://www.immobiliare.it/annunci/91989868/" },
  { index: 12, har: "12har.har", url: "https://www.immobiliare.it/annunci/126719313/" },
  { index: 13, har: "13har.har", url: "https://www.immobiliare.it/annunci/124220971/" },
  { index: 14, har: "14har.har", url: "https://www.immobiliare.it/annunci/121533366/" },
];

const COLORS = { bg: "FFFFFF", text: "111111", muted: "5D6670" };

const CS = {
  1: {
    title: "Samostatný dům s terasou u Belvedere Marittimo",
    description:
      "V lokalitě Laise u Belvedere Marittimo je nabízen samostatný dům přibližně 7 km od moře. Má tři úrovně a působí jako dobrá volba pro klienta, který hledá prostor, klid a vlastní venkovní zázemí.\n\nV přízemí je světlý obytný salon s kuchyňským koutem, koupelna a soukromý venkovní prostor pro posezení. V patře jsou dvě ložnice, další koupelna a terasa s výhledem. Spodní úroveň přidává samostatné studio s koupelnou, vhodné pro hosty, a sklad. K domu patří také pozemek využitelný jako zahrada nebo zelená plocha.",
  },
  2: {
    title: "Zrekonstruovaný dům v centru Rovita",
    description:
      "V historickém jádru Rovita, přibližně 10 minut od Cosenzy, stojí samostatný dům po kompletní rekonstrukci. Popis zdůrazňuje nové výplně, tepelný plášť a lepší energetické vlastnosti, takže nejde o původní zanedbaný dům, ale o hotovější městské bydlení.\n\nDispozice je ve dvou podlažích: dole vstup, obývací pokoj s krbem, kuchyňský kout, koupelna a balkon; nahoře dvě ložnice, druhá koupelna a další balkon s výhledem. Nad domem je prostorná půda, kde lze podle inzerátu vytvořit ještě další místnost.",
  },
  3: {
    title: "Dům s velkým zemědělským pozemkem ve Fiumefreddo Bruzio",
    description:
      "V lokalitě Piano San Salvatore u Fiumefreddo Bruzio je nabízen celý dvoupodlažní objekt s výrazným hospodářským zázemím. Nabídka je zajímavá hlavně díky rozsahu pozemku a příslušenství, ne kvůli luxusnímu interiéru.\n\nPřízemí tvoří tři sklady o celkové ploše kolem 90 m2. Obytná část v prvním patře zahrnuje vstupní chodbu, obytnou kuchyni, tři pokoje a koupelnu. Součástí prodeje je zemědělský pozemek o ploše přibližně 10 400 m2 a další skladové nebo hospodářské prostory o ploše kolem 180 m2.",
  },
  4: {
    title: "Zrekonstruovaný dům s terasou a výhledem na moře",
    description:
      "V Belvedere Marittimo je nabízen dům po rekonstrukci, rozložený do tří úrovní. Jeho hlavní hodnotou je terasa s výhledem na Tyrhénské moře a atmosféra historického kalábrijského města.\n\nDům má obytnou kuchyňskou část, dvě prostorné ložnice a tři koupelny, takže každé podlaží má praktické zázemí. Podle popisu je připravený k užívání a nový majitel ho může dokončit vybavením podle vlastního vkusu. Nabídka má spíše charakter rekreačního domu s výhledy než velké rodinné vily.",
  },
  5: {
    title: "Řadová vila se zahradou v San Lucidu",
    description:
      "V San Lucidu, u Strada Statale 18 Tirrena Inferiore, je nabízen dům ve dvou podlažích o ploše přibližně 115 m2. Stručný inzerát staví nabídku hlavně na jednoduché dispozici a velké zahradě o ploše kolem 390 m2.\n\nV přízemí je vstup, obývací část, kuchyň a koupelna. V patře jsou tři ložnicové místnosti a druhá koupelna. Fotografie ukazují také terasy, balkon a venkovní části, takže dům může dobře fungovat jako letní základna u pobřeží nebo jako rodinné bydlení po osobní kontrole technického stavu.",
  },
  6: {
    title: "Zařízený horský dům v Camigliatello Silano",
    description:
      "V Camigliatello Silano, v oblasti Sila, je nabízen zařízený dům o ploše přibližně 120 m2. Má spíše horský charakter: hlavním prvkem denní části je obývací prostor s krbem a kuchyňským koutem.\n\nDispozice dále zahrnuje komoru, koupelnu, pokoj se dvěma lůžky a dvě manželské ložnice. Popis uvádí nové vybavení, nové dveře a nové podlahy. Nabídka je vhodná pro klienta, který nehledá mořský dům, ale základnu v kalábrijských horách pro víkendy, zimu i letní únik z horka.",
  },
  7: {
    title: "Dům s panoramatickým balkonem v borgu Sellia",
    description:
      "V Sellii, starém borgu v provincii Catanzaro, je nabízen samostatný dům po rekonstrukci a s vybavením. Silnou stránkou není velikost počtu pokojů, ale poloha, výhledy a atmosféra malé historické obce.\n\nDům má dvě úrovně propojené vnitřním schodištěm. Denní část tvoří obývací prostor s kuchyní, koupelna a balkon s výhledem na borgo, údolí a směrem k moři. V další úrovni je velká ložnice s vlastní koupelnou. K dispozici je i venkovní dvorek a skladový prostor, který čeká na dokončení.",
  },
  8: {
    title: "Rustikální objekt s hektarovým pozemkem u Petilia Policastro",
    description:
      "V Contrada Taglio u Petilia Policastro je nabízena rustikální nemovitost o ploše přibližně 75 m2, aktuálně vedená jako skladový objekt C/2 s možností změny užívání na bydlení. Je to nabídka pro kupujícího, který chce prostor, pozemek a potenciál.\n\nObjekt je v dobrém stavu, má dvě místnosti, koupelnu, krb a velkou terasu s panoramatickým výhledem. K nemovitosti patří pozemek o ploše přibližně 10 000 m2. Jižní orientace dává domu dobré světlo a venkovní plocha je hlavním důvodem, proč o nabídce uvažovat.",
  },
  9: {
    title: "Lesní vilka s krbem ve Villaggio Racise",
    description:
      "Ve Villaggio Racise, v srdci oblasti Sila u obce Taverna, je nabízena menší vilka zasazená do klidného přírodního prostředí. Nabídka má jasně horský a rekreační charakter.\n\nVstup vede do útulného salonku s krbem. Na stejné úrovni je prostorná obytná kuchyně s dvojím přístupem a praktická koupelna za schodištěm. V patře jsou dvě ložnice a další zázemí. Dům působí jako dobrá základna pro pobyty v přírodě, s atmosférou dřeva, krbu a silanského lesa.",
  },
  10: {
    title: "Dům v zeleni u Fiumefreddo Bruzio",
    description:
      "V lokalitě San Biase u Fiumefreddo Bruzio je nabízen samostatný dům ve dvou podlažích. Popis je jednoduchý, ale důležitá je kombinace klidného zeleného prostředí a vzdálenosti přibližně 7 km od pobřeží.\n\nV přízemí je vstup, kuchyně, obývací pokoj a menší koupelna. V patře jsou dvě ložnice, koupelna a balkon. Fotografie doplňují terasu, fasádu, pozemek a výhledy, takže nabídka dává smysl pro klienta, který chce skromnější dům mimo ruch přímořských center.",
  },
  11: {
    title: "Třípodlažní dům v centru Nicastro",
    description:
      "Ve Vico Vetriera, v centrální části Nicastro v Lamezia Terme, je nabízena samostatná jednotka ve třech úrovních. Charakter nabídky je městský a kompaktní: dům stojí v centru a pracuje hlavně s vertikální dispozicí.\n\nV přízemí je zděná obytná kuchyně, vstup do pohodlného obývacího pokoje a praktický prostor pod schody. První patro má chodbu s typickými balkony, pokoj a koupelnu. Druhé patro opakuje podobné uspořádání a přidává druhou koupelnu se sprchou. Jde o dům pro kupujícího, který chce nezávislost v centru města.",
  },
  12: {
    title: "Novější venkovský dům s portikem u Limbadi",
    description:
      "Na náhorní plošině Monte Poro u Limbadi je nabízen novější venkovský dům obklopený zelení. Leží u provinční silnice směrem na Nicoteru, přibližně 15 minut autem od Tropey a 20 minut od Vibo Valentia.\n\nHlavní obytná jednotka má asi 95 m2 a navazuje na portikus o ploše kolem 45 m2. Uvnitř je vstup, velká denní část s otevřenou kuchyní a rustikálním krbem, dvě ložnice, z nichž jedna má mezipatro, a koupelna. Zvenku je přístupná ještě další koupelna se sprchou a pračkou. Pozemek má přibližně 600 m2.",
  },
  13: {
    title: "Panoramatický domek s terasou v Badolatu",
    description:
      "V Badolato Superiore je nabízen menší řadový domek ve velmi dobrém stavu, kompletně zařízený a připravený k užívání. Jeho hlavní hodnotou je horní terasa s výhledem od Jónského moře až k horám.\n\nDům má dvě úrovně. V přízemí je obytný prostor s kuchyňským koutem, ložnice a koupelna, venku pak soukromá zahrada vhodná pro venkovní jídlo a odpočinek. V horním patře je manželská ložnice s přímým vstupem na panoramatickou terasu. Nabídka má silný rekreační charakter a jasnou vizuální identitu.",
  },
  14: {
    title: "Zařízený dům s výhledem na moře u Joppola",
    description:
      "V oblasti Joppolo, přibližně 800 metrů od moře, je nabízen zařízený menší dům po velmi nedávné rekonstrukci. Je vhodný jako první bydlení i jako druhý dům u pobřeží.\n\nInteriér tvoří vstup do kuchyně, dvě ložnice a koupelna. Venku je asfaltovaný dvůr vhodný pro parkování jednoho auta, dlážděný portikus využitelný v teplých dnech a soukromá zahrada. Celý objekt podle popisu těží z výhledu na moře, západy slunce a Liparské ostrovy.",
  },
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanText(value) {
  return String(value || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function formatMetric(value) {
  return cleanText(value).replace(/m(?:\u00b2|\u00c2\u00b2|\u02db)|mq/gi, "m2") || "-";
}

function formatPrice(raw) {
  const digits = String(raw || "").replace(/[^\d]/g, "");
  return digits ? `${Number(digits).toLocaleString("cs-CZ")} EUR` : "neuvedeno";
}

function compactTitle(listing) {
  const raw = cleanText(CS[listing.index]?.title || listing.title).split("|")[0].trim();
  return raw.length <= 52 ? raw : `${raw.slice(0, 49).trim()}...`;
}

function buildMapUrl(listing) {
  if (listing.latitude != null && listing.longitude != null) return `https://www.google.com/maps/search/?api=1&query=${listing.latitude},${listing.longitude}`;
  const query = [listing.address, listing.streetNumber, listing.city].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || listing.url)}`;
}

function shortDescription(listing) {
  const text = cleanText(CS[listing.index]?.description || listing.description);
  if (text.length <= 1450) return text;
  return `${text.slice(0, 1447).trim()}...`;
}

function hasAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function imageEntries(listing) {
  const entries = [];
  const add = (filePath, caption, role, order) => {
    if (!filePath || !fs.existsSync(filePath)) return;
    if (entries.some((item) => item.path === filePath)) return;
    const hash = crypto.createHash("sha1").update(fs.readFileSync(filePath)).digest("hex");
    entries.push({ path: filePath, caption: cleanText(caption).toLowerCase(), role, order, hash });
  };
  add(listing.saved?.mainPath, listing.galleryDetails?.[0]?.caption, "main", -1);
  (listing.saved?.galleryPaths || []).forEach((file, index) => add(file, listing.galleryDetails?.[index]?.caption, "gallery", index));
  return entries;
}

function dedupeImageEntries(entries) {
  const seen = new Set();
  const unique = [];
  for (const item of entries) {
    if (seen.has(item.hash)) continue;
    seen.add(item.hash);
    unique.push(item);
  }
  return unique;
}

function heroScore(item) {
  const caption = item.caption;
  let score = item.role === "main" ? 12 : 0;
  if (hasAny(caption, ["vista", "panorama", "mare", "facciata", "esterno", "giardino", "terreno", "terrazzo", "balcone", "veranda", "portico"])) score += 120;
  if (hasAny(caption, ["zona"])) score += 35;
  if (hasAny(caption, ["cucina", "salone", "soggiorno", "camera", "bagno", "scala", "corridoio", "interno", "planimetria"])) score -= 70;
  return score - Math.max(item.order, 0) * 0.4;
}

function pickHeroImage(listing) {
  const entries = dedupeImageEntries(imageEntries(listing));
  return entries.sort((a, b) => heroScore(b) - heroScore(a))[0]?.path || null;
}

function pickGalleryImages(listing) {
  const hero = pickHeroImage(listing);
  const entries = dedupeImageEntries(imageEntries(listing)).filter((item) => item.path !== hero && !hasAny(item.caption, ["planimetria"]));
  const selected = [];
  const used = new Set();
  const addBest = (keywords, avoid = []) => {
    const item = entries.find((entry) => !used.has(entry.path) && hasAny(entry.caption, keywords) && !hasAny(entry.caption, avoid));
    if (!item) return;
    selected.push(item.path);
    used.add(item.path);
  };
  addBest(["cucina"]);
  addBest(["salone", "soggiorno", "living", "ambiente"], ["scala", "corridoio"]);
  addBest(["camera", "letto", "stanza"]);
  addBest(["bagno"]);
  addBest(["terrazzo", "balcone", "giardino", "veranda", "portico", "vista", "terreno"]);
  addBest(["cantina", "magazzino", "studio", "ripostiglio", "soffitta", "scala"]);
  for (const entry of entries) {
    if (selected.length >= 6) break;
    if (used.has(entry.path)) continue;
    selected.push(entry.path);
    used.add(entry.path);
  }
  return selected.slice(0, 6);
}

function addImageIfExists(slide, filePath, options) {
  if (filePath && fs.existsSync(filePath)) slide.addImage({ path: filePath, ...options });
  else slide.addShape("rect", { x: options.x, y: options.y, w: options.w, h: options.h, fill: { color: "F0F0F0" }, line: { color: "F0F0F0" } });
}

function addFadeOverlay(slide) {
  [
    { x: 2.758, w: 0.472, transparency: 12 },
    { x: 3.227, w: 0.389, transparency: 26 },
    { x: 3.619, w: 0.305, transparency: 42 },
    { x: 3.93, w: 0.222, transparency: 58 },
    { x: 4.151, w: 0.139, transparency: 72 },
  ].forEach((band) => {
    slide.addShape("rect", {
      x: band.x,
      y: 0,
      w: band.w,
      h: 7.5,
      line: { color: "FFFFFF", transparency: 100 },
      fill: { color: "FFFFFF", transparency: band.transparency },
    });
  });
}

function addSlideOne(pptx, listing) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bg };
  addImageIfExists(slide, pickHeroImage(listing), {
    x: 3.37,
    y: 0,
    w: 9.97,
    h: 7.5,
    sizing: { type: "cover", x: 3.37, y: 0, w: 9.97, h: 7.5 },
  });
  addFadeOverlay(slide);
  if (fs.existsSync(ICON_STRIP)) addImageIfExists(slide, ICON_STRIP, { x: 0.38, y: 1.55, w: 0.8, h: 4.89 });
  slide.addText(`${listing.index}. ${compactTitle(listing)}`, {
    x: 0.11,
    y: 0.15,
    w: 3.95,
    h: 0.82,
    fontFace: "Aptos Display",
    fontSize: 20,
    color: COLORS.text,
    margin: 0,
    fit: "shrink",
  });
  const metricX = 1.52;
  const metricStyle = { fontFace: "Aptos", fontSize: 18, color: COLORS.text, margin: 0, valign: "mid", align: "left" };
  slide.addText(formatMetric(listing.surface), { x: metricX, y: 1.72, w: 1.45, h: 0.36, ...metricStyle });
  slide.addText(formatMetric(listing.rooms), { x: metricX, y: 2.56, w: 1.45, h: 0.36, ...metricStyle });
  slide.addText(formatMetric(listing.bedrooms), { x: metricX, y: 3.39, w: 1.45, h: 0.36, ...metricStyle });
  slide.addText(formatMetric(listing.bathrooms), { x: metricX, y: 4.24, w: 1.45, h: 0.36, ...metricStyle });
  slide.addText("mapa", { x: metricX, y: 5.13, w: 1.45, h: 0.36, ...metricStyle, hyperlink: { url: buildMapUrl(listing) }, underline: { color: COLORS.text } });
  slide.addText(formatPrice(listing.priceLabel), {
    x: metricX,
    y: 6.17,
    w: 1.95,
    h: 0.4,
    fontFace: "Aptos",
    fontSize: 18,
    color: COLORS.text,
    margin: 0,
    fit: "shrink",
  });
  slide.addText([listing.city, listing.address].filter(Boolean).join(" | "), {
    x: 0.13,
    y: 6.93,
    w: 3.1,
    h: 0.27,
    fontFace: "Aptos",
    fontSize: 8.4,
    color: COLORS.muted,
    margin: 0,
    fit: "shrink",
  });
}

function addSlideTwo(pptx, listing) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bg };
  const slots = [
    { x: 0.0, y: 0.0, w: 4.07, h: 2.42 },
    { x: 4.12, y: 0.0, w: 4.07, h: 2.42 },
    { x: 0.0, y: 2.5, w: 4.07, h: 2.42 },
    { x: 4.12, y: 2.5, w: 4.07, h: 2.42 },
    { x: 0.0, y: 5.0, w: 4.07, h: 2.5 },
    { x: 4.12, y: 5.0, w: 4.07, h: 2.5 },
  ];
  pickGalleryImages(listing).forEach((filePath, index) => {
    const slot = slots[index];
    addImageIfExists(slide, filePath, { x: slot.x, y: slot.y, w: slot.w, h: slot.h, sizing: { type: "cover", x: slot.x, y: slot.y, w: slot.w, h: slot.h } });
  });
  slide.addText(String(listing.index), { x: 8.28, y: 0.22, w: 0.6, h: 0.32, fontFace: "Aptos", fontSize: 20, bold: true, color: COLORS.text, margin: 0 });
  slide.addText(compactTitle(listing), {
    x: 8.28,
    y: 0.58,
    w: 4.72,
    h: 0.55,
    fontFace: "Aptos Display",
    fontSize: 15,
    bold: true,
    color: COLORS.text,
    margin: 0,
    fit: "shrink",
  });
  slide.addText(shortDescription(listing), {
    x: 8.28,
    y: 1.2,
    w: 4.78,
    h: 5.62,
    fontFace: "Aptos",
    fontSize: 11.2,
    color: COLORS.text,
    margin: 0,
    valign: "top",
    fit: "shrink",
  });
  slide.addText(`Zdroj: ${listing.url}`, { x: 8.28, y: 7.02, w: 4.78, h: 0.2, fontFace: "Aptos", fontSize: 6.5, color: COLORS.muted, margin: 0, fit: "shrink" });
}

function loadListings() {
  ensureDir(OUT_DIR);
  return ITEMS.map((item) => {
    const listingDir = path.join(OUT_DIR, `listing-${item.index}`);
    ensureDir(listingDir);
    const data = extractListingData(path.join(HAR_DIR, item.har), listingDir);
    return {
      ...data,
      ...item,
      title: cleanText(data.title),
      city: cleanText(data.city),
      address: cleanText(data.address),
      streetNumber: cleanText(data.streetNumber),
      description: cleanText(data.description),
      priceLabel: cleanText(data.priceLabel),
      surface: cleanText(data.surface),
      rooms: cleanText(data.rooms),
      bedrooms: cleanText(data.bedrooms),
      bathrooms: cleanText(data.bathrooms),
      url: item.url,
    };
  });
}

async function main() {
  const outPath = process.argv[2] || OUTPUT;
  ensureDir(path.dirname(outPath));
  const listings = loadListings();
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "OpenAI Codex";
  pptx.company = "OpenAI";
  pptx.subject = "Výběr nemovitostí Kalábrie z HAR Immobiliare.it";
  pptx.title = "Výběr nemovitostí Kalábrie - červenec 2026";
  pptx.lang = "cs-CZ";
  pptx.theme = { headFontFace: "Aptos Display", bodyFontFace: "Aptos", lang: "cs-CZ" };
  listings.forEach((listing) => {
    addSlideOne(pptx, listing);
    addSlideTwo(pptx, listing);
  });
  fs.writeFileSync(
    path.join(OUT_DIR, "listings-summary.json"),
    JSON.stringify(
      listings.map((listing) => ({
        index: listing.index,
        url: listing.url,
        title: listing.title,
        titleCs: CS[listing.index]?.title,
        city: listing.city,
        price: listing.priceLabel,
        surface: listing.surface,
        hero: pickHeroImage(listing),
        gallery: pickGalleryImages(listing),
        captions: (listing.galleryDetails || []).map((photo) => photo.caption),
      })),
      null,
      2,
    ),
  );
  await pptx.writeFile({ fileName: outPath });
  console.log(`Creato ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
