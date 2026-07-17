const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const pptxgen = require("pptxgenjs");
const { extractListingData } = require("./extract-listing-data.cjs");

const ROOT = path.resolve(__dirname, "..");
const HAR_DIR = "C:/Users/39327/Desktop/har toscana";
const OUT_DIR = path.join(ROOT, "tmp", "ppt-build", "tosna-terka-2-2026-07-08");
const OUTPUT = path.join(ROOT, "tmp", "tosna terka 2.pptx");
const ICON_STRIP = path.join(ROOT, "tmp", "ppt-build", "extracted", "ppt", "media", "image1.png");

const ITEMS = [
  { index: 1, har: "1har.har", url: "https://www.immobiliare.it/annunci/111804461/" },
  { index: 2, har: "2har.har", url: "https://www.immobiliare.it/annunci/122950630/" },
  { index: 3, har: "3har.har", url: "https://www.immobiliare.it/annunci/125413975/" },
  { index: 4, har: "4har.har", url: "https://www.immobiliare.it/annunci/129178902/" },
  { index: 5, har: "5har.har", url: "https://www.immobiliare.it/annunci/121291110/" },
  { index: 6, har: "6har.har", url: "https://www.immobiliare.it/annunci/129911682/" },
  { index: 7, har: "7har.har", url: "https://www.immobiliare.it/annunci/126715495/" },
  { index: 8, har: "8har.har", url: "https://www.immobiliare.it/annunci/129923294/" },
  { index: 9, har: "9har.har", url: "https://www.immobiliare.it/annunci/129774864/" },
];

const CS = {
  1: {
    title: "Byt v historickém domě v centru Pomarance",
    description:
      "V centru Pomarance, v historické budově, je nabízen byt ve druhém patře o ploše přibližně 90 m2. Dispozice je klasická a praktická: vstup, obývací pokoj, obytná kuchyně a samostatná spíž s oknem.\n\nNoční část tvoří dvě prostorné ložnice a koupelna. K bytu patří také sklep o ploše přibližně 15 m2. Nemovitost se prodává částečně zařízená a může fungovat jako hlavní bydlení, rekreační byt i investice v menším toskánském městě.",
  },
  2: {
    title: "Světlý byt s terasami v Chianciano Terme",
    description:
      "V Chianciano Terme je nabízen prostorný byt v prvním patře domu se třemi jednotkami. Má klidnější, panoramatickou polohu a kombinuje velkou obytnou plochu s příslušenstvím, které u bytů nebývá samozřejmé.\n\nUvnitř je obytná kuchyně s kamny na dřevo a přímým vstupem na terasu, světlý obývací pokoj, koupelna s oknem a vanou, dvě velké manželské ložnice a komora. Hodnotu doplňují dvě panoramatické terasy, půda, garáž, sklep, prádelna a menší soukromý pozemek vhodný jako zahrada nebo orto.",
  },
  3: {
    title: "Světlý bilocale s výhledem u Lamporecchia",
    description:
      "V kopcovité části Lamporecchia je nabízen světlý bilocale s výhledem na toskánské kopce. Popis staví nabídku hlavně na světle, soukromí a venkovním prostoru, ne na velké ploše.\n\nByt má ložnici, koupelnu se sprchou a druhou místnost, kde je kuchyně řešena tak, aby vznikl i malý pohodlný obývací kout. Venkovní část a výhledy dávají nemovitosti rekreační charakter a zároveň potenciál pro pronájem.",
  },
  4: {
    title: "Byt s vlastním vstupem v Abbadia San Salvatore",
    description:
      "V klidné části Abbadia San Salvatore, v prostředí Monte Amiata, je nabízen byt s nezávislým vstupem v rezidenčním komplexu. Nabídka působí jako horská toskánská základna s teplou obytnou atmosférou.\n\nDispozice zahrnuje světlý salon, samostatnou kuchyni, ložnici, koupelny a podkrovní prostor, který lze využít jako další pokoj, pracovnu nebo pokoj pro hosty. Fotografie ukazují také balkon, terasu, fasádu a garážové zázemí.",
  },
  5: {
    title: "Bilocale s výhledem v borgu Tatti",
    description:
      "V charakteristickém borgu Tatti u Massa Marittima je nabízen byt ve druhém patře o ploše přibližně 67 m2. Hlavní silou této nabídky je poloha v Maremně, dobré světlo a panoramatický výhled.\n\nDispozice zahrnuje ložnici, světlý obývací prostor s otevřenou kuchyní, koupelnu a malou terasu s výhledem. Byt má zdravou konstrukci a dobrou expozici, ale je určený k personalizaci. Vytápění zatím není instalováno, je však připraveno napojení pro kotel na metan.",
  },
  6: {
    title: "Byt s balkonem u dómu v Massa Marittima",
    description:
      "V historickém centru Massa Marittima, jen pár kroků od Piazza del Duomo, je nabízen byt ve druhém patře s výrazným potenciálem. Poloha ve Via Albizzeschi je klidná, autentická a přitom velmi blízko hlavních památek.\n\nByt tvoří obývací část s kuchyňským koutem, tři prostorné místnosti využitelné jako ložnice nebo jiné pokoje podle potřeb a koupelna se sprchou. Velkou hodnotou je balkon, protože soukromý venkovní prostor je v centru Massa Marittima vzácný.",
  },
  7: {
    title: "Byt v historickém centru Reggella",
    description:
      "V centru Reggella, v historické budově, je nabízen světlý byt ve druhém a posledním patře. Má přibližně 86 m2 a jednoduchou dispozici vhodnou pro vlastní bydlení i rekreační využití.\n\nObytnou část tvoří denní zóna se samostatnou obytnou kuchyní. Noční část nabízí dvě velké ložnice, koupelnu s oknem a praktickou komoru. Nabídka je zajímavá pro klienta, který chce menší městské zázemí s dostupností Florencie a Chianti.",
  },
  8: {
    title: "Dům k rekonstrukci se samostatným fondem u Pontassieve",
    description:
      "V Santa Brigida u Pontassieve, v kopcích nad Florencií, je nabízena nemovitost k rekonstrukci s obytnou částí a samostatným komerčním fondem. Je to spíše projekt s potenciálem než hotové bydlení.\n\nObytná část má denní zónu s kuchyňským koutem, ložnici, koupelnu, prádelnu a velkou komoru. Součástí je také samostatný fond o ploše přibližně 30 m2 v kategorii C/1 s vlastním vstupem, využitelný jako pracovní, skladový nebo obchodní prostor podle možností území.",
  },
  9: {
    title: "Dvoupodlažní byt s výhledy ve Fucecchiu",
    description:
      "V historickém centru Fucecchia je nabízen byt o ploše přibližně 124 m2, rozložený do druhého a třetího patra domu se dvěma jednotkami. Nabídka má výrazný toskánský charakter díky trámovým stropům a výhledům přes střechy a okolní krajinu.\n\nDům má nedávno obnovenou střechu i fasády. Byt je obyvatelný ihned a může být prodán i se zařízením. Díky dvěma úrovním a větší ploše dává smysl také jako investice, protože dispozičně nabízí možnost rozdělení na dvě samostatné jednotky.",
  },
};

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function cleanText(v) { return String(v || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim(); }
function formatMetric(v) { return cleanText(v).replace(/m(?:\u00b2|\u00c2\u00b2)|mq/gi, "m2") || "-"; }
function formatPrice(v) { const d = String(v || "").replace(/[^\d]/g, ""); return d ? `${Number(d).toLocaleString("cs-CZ")} EUR` : "neuvedeno"; }
function hasAny(text, words) { return words.some((word) => text.includes(word)); }
function compactTitle(listing) { const t = cleanText(CS[listing.index]?.title || listing.title); return t.length <= 52 ? t : `${t.slice(0, 49).trim()}...`; }
function buildMapUrl(listing) { return listing.latitude != null && listing.longitude != null ? `https://www.google.com/maps/search/?api=1&query=${listing.latitude},${listing.longitude}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([listing.address, listing.city].filter(Boolean).join(", ") || listing.url)}`; }
function shortDescription(listing) { return cleanText(CS[listing.index]?.description || listing.description).slice(0, 1450); }

function imageEntries(listing) {
  const entries = [];
  const add = (filePath, caption, role, order) => {
    if (!filePath || !fs.existsSync(filePath)) return;
    if (entries.some((x) => x.path === filePath)) return;
    const hash = crypto.createHash("sha1").update(fs.readFileSync(filePath)).digest("hex");
    entries.push({ path: filePath, caption: cleanText(caption).toLowerCase(), role, order, hash });
  };
  add(listing.saved?.mainPath, listing.galleryDetails?.[0]?.caption, "main", -1);
  (listing.saved?.galleryPaths || []).forEach((file, index) => add(file, listing.galleryDetails?.[index]?.caption, "gallery", index));
  const seen = new Set();
  return entries.filter((entry) => {
    if (seen.has(entry.hash)) return false;
    seen.add(entry.hash);
    return true;
  });
}

function heroScore(item) {
  const c = item.caption;
  let score = item.role === "main" ? 20 : 0;
  if (hasAny(c, ["vista", "panorama", "facciata", "esterno", "giardino", "terrazzo", "balcone", "zona", "cortile"])) score += 120;
  if (hasAny(c, ["cucina", "salone", "camera", "bagno", "corridoio", "interno", "scala", "lavanderia"])) score -= 65;
  return score - Math.max(item.order, 0) * 0.35;
}

function pickHeroImage(listing) {
  return imageEntries(listing).sort((a, b) => heroScore(b) - heroScore(a))[0]?.path || null;
}

function pickGalleryImages(listing) {
  const hero = pickHeroImage(listing);
  const entries = imageEntries(listing).filter((entry) => entry.path !== hero && !hasAny(entry.caption, ["planimetria"]));
  const selected = [];
  const used = new Set();
  const add = (words, avoid = []) => {
    const item = entries.find((entry) => !used.has(entry.path) && hasAny(entry.caption, words) && !hasAny(entry.caption, avoid));
    if (!item) return;
    used.add(item.path);
    selected.push(item.path);
  };
  add(["cucina", "sala da pranzo"]);
  add(["salone", "soggiorno"]);
  add(["camera", "letto", "stanza"]);
  add(["bagno"]);
  add(["terrazzo", "balcone", "giardino", "vista", "cortile"]);
  add(["ripostiglio", "cantina", "studio", "lavanderia", "magazzino", "scala"]);
  for (const entry of entries) {
    if (selected.length >= 6) break;
    if (!used.has(entry.path)) selected.push(entry.path);
  }
  return selected.slice(0, 6);
}

function addImage(slide, filePath, options) {
  if (filePath && fs.existsSync(filePath)) slide.addImage({ path: filePath, ...options });
  else slide.addShape("rect", { x: options.x, y: options.y, w: options.w, h: options.h, fill: { color: "F0F0F0" }, line: { color: "F0F0F0" } });
}

function addFade(slide) {
  [{ x: 2.758, w: 0.472, t: 12 }, { x: 3.227, w: 0.389, t: 26 }, { x: 3.619, w: 0.305, t: 42 }, { x: 3.93, w: 0.222, t: 58 }, { x: 4.151, w: 0.139, t: 72 }].forEach((b) => {
    slide.addShape("rect", { x: b.x, y: 0, w: b.w, h: 7.5, line: { color: "FFFFFF", transparency: 100 }, fill: { color: "FFFFFF", transparency: b.t } });
  });
}

function addSlideOne(pptx, listing) {
  const slide = pptx.addSlide();
  slide.background = { color: "FFFFFF" };
  addImage(slide, pickHeroImage(listing), { x: 3.37, y: 0, w: 9.97, h: 7.5, sizing: { type: "cover", x: 3.37, y: 0, w: 9.97, h: 7.5 } });
  addFade(slide);
  if (fs.existsSync(ICON_STRIP)) addImage(slide, ICON_STRIP, { x: 0.38, y: 1.55, w: 0.8, h: 4.89 });
  slide.addText(`${listing.index}. ${compactTitle(listing)}`, { x: 0.11, y: 0.15, w: 3.95, h: 0.82, fontFace: "Aptos Display", fontSize: 20, color: "111111", margin: 0, fit: "shrink" });
  const s = { fontFace: "Aptos", fontSize: 18, color: "111111", margin: 0, valign: "mid", align: "left" };
  slide.addText(formatMetric(listing.surface), { x: 1.52, y: 1.72, w: 1.45, h: 0.36, ...s });
  slide.addText(formatMetric(listing.rooms), { x: 1.52, y: 2.56, w: 1.45, h: 0.36, ...s });
  slide.addText(formatMetric(listing.bedrooms), { x: 1.52, y: 3.39, w: 1.45, h: 0.36, ...s });
  slide.addText(formatMetric(listing.bathrooms), { x: 1.52, y: 4.24, w: 1.45, h: 0.36, ...s });
  slide.addText("mapa", { x: 1.52, y: 5.13, w: 1.45, h: 0.36, ...s, hyperlink: { url: buildMapUrl(listing) }, underline: { color: "111111" } });
  slide.addText(formatPrice(listing.priceLabel), { x: 1.52, y: 6.17, w: 1.95, h: 0.4, fontFace: "Aptos", fontSize: 18, color: "111111", margin: 0, fit: "shrink" });
  slide.addText([listing.city, listing.address].filter(Boolean).join(" | "), { x: 0.13, y: 6.93, w: 3.1, h: 0.27, fontFace: "Aptos", fontSize: 8.4, color: "5D6670", margin: 0, fit: "shrink" });
}

function addSlideTwo(pptx, listing) {
  const slide = pptx.addSlide();
  slide.background = { color: "FFFFFF" };
  const slots = [{ x: 0, y: 0, w: 4.07, h: 2.42 }, { x: 4.12, y: 0, w: 4.07, h: 2.42 }, { x: 0, y: 2.5, w: 4.07, h: 2.42 }, { x: 4.12, y: 2.5, w: 4.07, h: 2.42 }, { x: 0, y: 5, w: 4.07, h: 2.5 }, { x: 4.12, y: 5, w: 4.07, h: 2.5 }];
  pickGalleryImages(listing).forEach((file, index) => addImage(slide, file, { ...slots[index], sizing: { type: "cover", ...slots[index] } }));
  slide.addText(String(listing.index), { x: 8.28, y: 0.22, w: 0.6, h: 0.32, fontFace: "Aptos", fontSize: 20, bold: true, color: "111111", margin: 0 });
  slide.addText(compactTitle(listing), { x: 8.28, y: 0.58, w: 4.72, h: 0.55, fontFace: "Aptos Display", fontSize: 15, bold: true, color: "111111", margin: 0, fit: "shrink" });
  slide.addText(shortDescription(listing), { x: 8.28, y: 1.2, w: 4.78, h: 5.62, fontFace: "Aptos", fontSize: 11.2, color: "111111", margin: 0, valign: "top", fit: "shrink" });
  slide.addText(`Zdroj: ${listing.url}`, { x: 8.28, y: 7.02, w: 4.78, h: 0.2, fontFace: "Aptos", fontSize: 6.5, color: "5D6670", margin: 0, fit: "shrink" });
}

async function main() {
  ensureDir(OUT_DIR);
  const listings = ITEMS.map((item) => {
    const dir = path.join(OUT_DIR, `listing-${item.index}`);
    ensureDir(dir);
    const data = extractListingData(path.join(HAR_DIR, item.har), dir);
    return { ...data, ...item, title: cleanText(data.title), city: cleanText(data.city), address: cleanText(data.address), streetNumber: cleanText(data.streetNumber), description: cleanText(data.description), priceLabel: cleanText(data.priceLabel), surface: cleanText(data.surface), rooms: cleanText(data.rooms), bedrooms: cleanText(data.bedrooms), bathrooms: cleanText(data.bathrooms), url: item.url };
  });
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "OpenAI Codex";
  pptx.title = "Tosna Terka 2";
  pptx.lang = "cs-CZ";
  pptx.theme = { headFontFace: "Aptos Display", bodyFontFace: "Aptos", lang: "cs-CZ" };
  listings.forEach((listing) => { addSlideOne(pptx, listing); addSlideTwo(pptx, listing); });
  fs.writeFileSync(path.join(OUT_DIR, "listings-summary.json"), JSON.stringify(listings.map((listing) => ({ index: listing.index, url: listing.url, title: listing.title, titleCs: CS[listing.index].title, hero: pickHeroImage(listing), gallery: pickGalleryImages(listing) })), null, 2));
  await pptx.writeFile({ fileName: OUTPUT });
  console.log(`Creato ${OUTPUT}`);
}

main().catch((error) => { console.error(error); process.exit(1); });
