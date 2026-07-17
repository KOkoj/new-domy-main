const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const https = require("https");
const pptxgen = require("pptxgenjs");
const { extractListingData } = require("./extract-listing-data.cjs");

const ROOT = path.resolve(__dirname, "..");
const HAR_DIR = "C:\\Users\\39327\\Desktop\\har toscana";
const OUT_DIR = path.join(ROOT, "tmp", "ppt-build", "har-toscana-2026-07-08");
const OUTPUT = path.join(ROOT, "tmp", "selezione-toscana-har-2026-07-08.pptx");
const ICON_STRIP = path.join(ROOT, "tmp", "ppt-build", "extracted", "ppt", "media", "image1.png");

const ITEMS = [
  { index: 1, har: "1har.har", url: "https://www.immobiliare.it/annunci/129665090/" },
  { index: 2, har: "2har.har", url: "https://www.immobiliare.it/annunci/129711630/" },
  { index: 3, har: "3har.har", url: "https://www.immobiliare.it/annunci/127493192/" },
  { index: 4, har: "4har.har", url: "https://www.immobiliare.it/annunci/95687224/" },
  { index: 5, har: "5har.har", url: "https://www.immobiliare.it/annunci/129887142/" },
  { index: 6, har: "6har.har", url: "https://www.immobiliare.it/annunci/120675624/" },
  { index: 7, har: "7har.har", url: "https://www.immobiliare.it/annunci/120308516/" },
  { index: 8, har: "8har.har", url: "https://www.immobiliare.it/annunci/116431699/" },
  { index: 9, har: "9har.har", url: "https://www.immobiliare.it/annunci/128926330/" },
  { index: 10, har: "10har.har", url: "https://www.immobiliare.it/annunci/118255017/" },
  { index: 11, har: "11har.har", url: "https://www.immobiliare.it/annunci/127380719/" },
  { index: 12, har: "12har.har", url: "https://www.immobiliare.it/annunci/130495616/" },
  { index: 13, har: "13har.har", url: "https://www.immobiliare.it/annunci/129726914/" },
  { index: 14, har: "14har.har", url: "https://www.immobiliare.it/annunci/128340314/" },
  { index: 15, har: "15har.har", url: "https://www.immobiliare.it/annunci/129939054/" },
];

const COLORS = {
  bg: "FFFFFF",
  text: "111111",
  muted: "5D6670",
};

const CS = {
  1: {
    title: "Byt se samostatným vstupem v kopcích u Buti",
    description:
      "V Buti, v kopcovité poloze mezi Cascine di Buti a La Croce, je nabízen byt se samostatným vstupem o ploše přibližně 71 m2. Dispozice působí velmi prakticky: otevřená denní část s kuchyňským koutem navazuje přímo na obyvatelnou soukromou terasu, která je hlavní venkovní hodnotou této nabídky.\n\nNoční část tvoří dvě prostorné ložnice, koupelna s oknem a praktická komora. Velkým bonusem je obyvatelné podkroví, které může sloužit jako třetí ložnice, pracovna nebo univerzální prostor. Nemovitost je zajímavá pro klienta, který hledá klid, zeleň a venkovní plochu, ale nechce být úplně odříznutý od služeb.",
  },
  2: {
    title: "Řadový dům s dlážděným dvorem u Altopascia",
    description:
      "V Badia Pozzeveri u Altopascia je nabízen středový řadový dům na dvou podlažích o ploše přibližně 80 m2. Hlavní výhodou je samostatný charakter bydlení, vlastní dlážděný dvůr a dvě parkovací místa, což je v této cenové hladině praktická kombinace.\n\nV přízemí je velká kuchyně s jídelní částí, obývací pokoj s komorou a koupelna s oknem a sprchou. V patře je ložnice a prostorná chodba s oknem, kde lze podle inzerátu vytvořit druhou ložnici. Dům je volný ihned a může dávat smysl jak pro vlastní bydlení, tak jako investice k pronájmu.",
  },
  3: {
    title: "Dvoupodlažní byt u lázní v San Giuliano Terme",
    description:
      "V San Giuliano Terme, jen pár kroků od lázní, je nabízen byt v malé budově se dvěma jednotkami. Plocha je přibližně 75 m2 a dispozice je řešena ve dvou úrovních: v přízemí je obytná část se soggiornem, jídelnou, kuchyňským koutem a komorou, v horním patře pak ložnicová část.\n\nV patře se nachází velká manželská ložnice se dvěma okny, pracovna nebo šatna a nová koupelna. Nabídka je zajímavá i investičně díky blízkosti lázní a potenciálu krátkodobých pronájmů. U této nemovitosti je důležité ověřit přesnou adresu, správu domu a technický stav společných částí.",
  },
  4: {
    title: "Řadový dům se čtyřmi ložnicemi u Capannori",
    description:
      "V zelené části Gragnano u Capannori je nabízen řadový dům o ploše přes 100 m2. Dům je rozložen do tří podlaží a oproti mnoha levnějším nabídkám má výrazně lepší obytnou kapacitu: podle inzerátu nabízí čtyři ložnice, dvě parkovací místa a menší venkovní resede.\n\nPřízemí tvoří vstup do obývací části, obytná kuchyně a koupelna. V prvním patře jsou dvě velké ložnice, ve druhém patře další dvě pokoje a druhé hygienické zázemí uvedené v popisu. Nabídka je silná poměrem ceny, plochy a počtu pokojů, zejména pro rodinu nebo klienta hledajícího více místností poblíž Luccy.",
  },
  5: {
    title: "Toskánský řadový dům se zahradou v Cascině",
    description:
      "V San Casciano, v menší části obce Cascina, je nabízen řadový dům na dvou podlažích o ploše přibližně 81 m2. Dům si zachovává charakter venkovského toskánského bydlení: v přízemí je obytný prostor s valenou klenbou a velká světlá kuchyně s výhledem do ulice a na náměstí.\n\nV patře je manželská ložnice, víceúčelová místnost nyní využívaná jako pracovna a koupelna s oknem a sprchou. Hlavním bonusem je samostatná zahrada nebo orto oddělené od domu, vhodné pro relax, pěstování nebo venkovní posezení. Nabídka je vhodná pro klienta, který chce autentický dům v obci a ne anonymní byt.",
  },
  6: {
    title: "Třípokojový byt u Navacchia v Cascině",
    description:
      "U Navacchia, v části San Prospero u Casciny, je nabízen třípokojový byt o ploše přibližně 60 m2. Nachází se v prvním patře malé budovy se dvěma jednotkami, v poloze blízko hlavních služeb a zároveň trochu stranou od rušné komunikace.\n\nInteriér je podle inzerátu obyvatelný a funkční, ale povrchově starší. Dispozici tvoří obytná kuchyně, obývací pokoj nebo druhá ložnice, chodba, manželská ložnice a koupelna s oknem. Výhodou je autonomní vytápění a absence společných nákladů; nevýhodou je chybějící balkon, zahrada i vlastní parkovací místo.",
  },
  7: {
    title: "Velký řadový dům v San Lorenzo a Vaccoli",
    description:
      "V San Lorenzo a Vaccoli u Luccy je nabízen větší řadový dům o ploše přibližně 114 m2, ihned obyvatelný a rozložený do tří úrovní. Nabídka kombinuje obytnou část, taverna prostor, cantinu a menší resede, což dává domu praktičtější charakter než běžnému bytu.\n\nV přízemí je cantina se samostatným vstupem a taverna, zvýšené přízemí nabízí obytný prostor s kuchyňským koutem, další pokoj, menší pokoj nebo pracovnu a koupelnu s oknem. V horním patře jsou dvě ložnice, z toho jedna velká. Poloha je klidná, ale s dobrým napojením na Luccu i Pisu.",
  },
  8: {
    title: "Byt s cantinami a zahradou v Bucine",
    description:
      "V Bucine, blízko centra v okolí Via Calimara, jsou nabízeny byty v malé budově se dvěma jednotkami. Každý byt má přibližně 90 m2 a cenu 70 000 EUR, což vytváří zajímavý poměr plochy, příslušenství a ceny.\n\nDispozice zahrnuje vstup, velký obývací pokoj, kuchyni s krbem, dvě manželské ložnice, pracovnu, koupelnu a balkon. K jednotce patří také dva prostory v přízemí o celkové ploše kolem 40 m2, dvojitá cantina a resede se soukromou zahradou. Nabídka může být vhodná pro rodinu, dva příbuzné okruhy nebo jako investiční držení v klidnější části Valdarna.",
  },
  9: {
    title: "Světlý třípokojový byt v Montevarchi",
    description:
      "V Montevarchi, několik minut od centra, je nabízen světlý třípokojový byt v přízemí historické budovy. Plocha je přibližně 86 m2 a cena 78 000 EUR, přičemž inzerát zdůrazňuje dobré světlo a příjemný obytný charakter.\n\nDispozice zahrnuje velký obývací pokoj s otevřenou kuchyní, menší zvýšený terasový výstup a praktický úložný prostor pod schody. Dále je zde salonek a manželská ložnice, případně možnost řešit dvě ložnice podle potřeb. Byt je vhodný i jako investice, ale před koupí je nutné ověřit stav historické budovy a skutečné provozní náklady.",
  },
  10: {
    title: "Třípokojový byt s balkonem a ortem v Laterině",
    description:
      "V centru Lateriny je nabízen třípokojový byt o ploše přibližně 75 m2 ve druhém patře menšího domu. Dispozice je jednoduchá a praktická: soggiorno s jídelní částí, samostatný kuchyňský kout, dvě ložnice, komora, koupelna a balkon.\n\nZajímavým doplňkem je orto, tedy malá užitková venkovní plocha, která u bytu v centru rozšiřuje možnosti využití. Nabídka je cenově velmi dostupná a může dávat smysl pro klienta, který hledá jednoduchou základnu ve Valdarnu. Je však potřeba ověřit, zda jde skutečně o prodejní nabídku a ne chybný text převzatý z pronájmu.",
  },
  11: {
    title: "Toskánský byt s krbem v Cicogně",
    description:
      "V části Cicogna u Terranuova Bracciolini je nabízena čtyřpokojová bytová jednotka o ploše přibližně 80 m2. Byt se nachází v prvním patře malé budovy, v klidné poloze s výhledy do zeleně, a popis ho prezentuje jako nemovitost v toskánském stylu.\n\nDispozici tvoří obytná kuchyně, obývací pokoj s krbem, dvě ložnice a koupelna. Podle inzerátu jsou vnitřní i vnější podmínky dobré, což z nabídky dělá méně rizikovou variantu v této cenové hladině. Při kontrole je vhodné zaměřit se na vytápění, stav střechy, společné části a dostupnost služeb.",
  },
  12: {
    title: "Velký byt s vlastním vstupem v Montevarchi",
    description:
      "V Montevarchi, v žádané části Pestello a blízko hlavních služeb, je nabízen velký byt o ploše přibližně 100 m2 se samostatným vstupem. Hlavní obytný prostor tvoří světlý dvojitý salon s otevřenou kuchyňskou částí, vhodný pro pohodlné každodenní bydlení.\n\nNoční část má dvě prostorné manželské ložnice a koupelnu s oknem. Venku je dlážděné resede obklopené zelení a část zahrady ve výlučném užívání podle kondominiální dohody. K bytu patří také cantina nebo sottoscala a výhodou je absence společných poplatků. Nabídka je ihned obyvatelná, ale umožňuje i další modernizaci.",
  },
  13: {
    title: "Byt v kopcovité části Montemarciano",
    description:
      "V Montemarcianu u Terranuova Bracciolini je nabízen byt v klidné kopcovité rezidenční poloze. Plocha je přibližně 72 m2 a jednotka se nachází v prvním patře malé budovy se soukromým vstupem sdíleným pouze dvěma rodinami.\n\nDispozice zahrnuje prostornou kuchyni, světlý obývací pokoj, dvě ložnice, koupelnu a komoru. V přízemí jsou dva velké cantina prostory vhodné pro uskladnění věcí, kola, motorku nebo sportovní vybavení. Důležité upozornění: podle inzerátu je nutné instalovat rozvody, takže jde o nabídku s potenciálem, ale také s jasnými náklady na dokončení.",
  },
  14: {
    title: "Byt v historickém centru San Giovanni Valdarno",
    description:
      "V historickém centru San Giovanni Valdarno je nabízen třípokojový byt o ploše přibližně 60 m2 ve druhém patře malé budovy. Dispozice je kompaktní: obývací část s kuchyňským koutem, manželská ložnice, menší ložnice, koupelna s oknem a malá terasa s umyvadlem.\n\nK bytu patří také cantina v přízemí. Podle inzerátu je nemovitost v dobrém obecném stavu a bez správce kondominia, což může znamenat nízké společné náklady, ale je nutné ověřit reálnou správu domu. Nabídka je vhodná pro kupujícího, který chce dostupnou městskou základnu přímo v centru.",
  },
  15: {
    title: "Zařízený byt v borgu Moncioni u Montevarchi",
    description:
      "V Moncioni, přibližně 6 km od centra Montevarchi, je nabízen příjemný byt v charakteristickém borgu. Byt je v prvním patře, má soukromý vstup po vlastním venkovním schodišti a nabízí přibližně 65 m2 v jedné úrovni.\n\nDispozice zahrnuje tři prostorné místnosti a terasu, přičemž prodej zahrnuje kvalitní stávající vybavení. V přízemí je navíc malý sklad, použitelný pro uložení vybavení nebo jako praktické zázemí. Nabídka je zajímavá pro klienta, který hledá hotový byt v klidné toskánské krajině, s atmosférou malého sídla a potenciálem rekreačního i investičního využití.",
  },
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function extractLabel(value) {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") return value.label || value.value || value.name || value.formatted || value.text || "";
  return "";
}

function selectImageVariant(urls = {}) {
  return urls.xxl || urls.large || urls.medium || urls.photo || urls.image || urls.m || urls["m-c"] || urls["cover-m-c"] || urls.small || null;
}

function extFromUrl(url) {
  const clean = String(url || "").split("?")[0].toLowerCase();
  if (clean.endsWith(".png")) return ".png";
  if (clean.endsWith(".webp")) return ".webp";
  if (clean.endsWith(".jpeg")) return ".jpeg";
  return ".jpg";
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

function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    if (!url) return resolve(null);
    if (fs.existsSync(filePath)) return resolve(filePath);
    ensureDir(path.dirname(filePath));
    const agent = new https.Agent({ rejectUnauthorized: false });
    const request = https.get(url, { agent, headers: { "user-agent": "Mozilla/5.0" } }, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode) && response.headers.location) {
        response.resume();
        downloadImage(new URL(response.headers.location, url).toString(), filePath).then(resolve, reject);
        return;
      }
      if (response.statusCode < 200 || response.statusCode >= 300) {
        response.resume();
        reject(new Error(`Image download failed ${response.statusCode}: ${url}`));
        return;
      }
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => {
        fs.writeFileSync(filePath, Buffer.concat(chunks));
        resolve(filePath);
      });
    });
    request.on("error", reject);
    request.setTimeout(30000, () => request.destroy(new Error(`Image download timeout: ${url}`)));
  });
}

async function extractListingDataFallback(harPath, outDir, item) {
  const html = extractHtmlFromTruncatedHar(harPath);
  const pageProps = getNextData(html)?.props?.pageProps || {};
  const realEstate = pageProps?.detailData?.realEstate || {};
  const property = realEstate?.properties?.[0] || {};
  const photoItems = Array.isArray(property.multimedia?.photos) ? property.multimedia.photos : [];
  const galleryDetails = photoItems
    .map((photo, index) => ({
      index,
      type: photo?.type || null,
      caption: normalizeWhitespace(photo?.caption || ""),
      url: selectImageVariant(photo?.urls || {}),
    }))
    .filter((photo) => photo.url);
  const mainPhoto = selectImageVariant(property.photo?.urls || {}) || galleryDetails[0]?.url || null;
  const saved = { mainPath: null, galleryPaths: [], planPath: null };
  saved.mainPath = mainPhoto ? await downloadImage(mainPhoto, path.join(outDir, `main${extFromUrl(mainPhoto)}`)) : null;
  for (let index = 0; index < galleryDetails.length; index += 1) {
    const url = galleryDetails[index].url;
    saved.galleryPaths.push(await downloadImage(url, path.join(outDir, `gallery-${index + 1}${extFromUrl(url)}`)));
  }
  return {
    url: item.url,
    title: normalizeWhitespace(realEstate.title),
    typology: normalizeWhitespace(extractLabel(realEstate.typology || realEstate.type)),
    city: normalizeWhitespace(property.location?.city || property.location?.label || ""),
    zone: normalizeWhitespace(property.location?.zone || ""),
    address: normalizeWhitespace(property.location?.address || ""),
    streetNumber: normalizeWhitespace(property.location?.streetNumber || ""),
    latitude: property.location?.latitude ?? null,
    longitude: property.location?.longitude ?? null,
    description: normalizeWhitespace(property.description || property.defaultDescription),
    priceLabel: normalizeWhitespace(extractLabel(realEstate.price) || extractLabel(property.price)),
    surface: normalizeWhitespace(extractLabel(property.surface) || extractLabel(property.surfaceValue)),
    rooms: normalizeWhitespace(extractLabel(property.rooms) || extractLabel(property.roomsValue)),
    bedrooms: normalizeWhitespace(extractLabel(property.bedRoomsNumber)),
    bathrooms: normalizeWhitespace(extractLabel(property.bathrooms)),
    mainPhoto,
    gallery: galleryDetails.map((photo) => photo.url),
    galleryDetails,
    saved,
  };
}

function cleanText(value) {
  return String(value || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function compactTitle(listing) {
  const raw = cleanText(CS[listing.index]?.title || listing.title).split("|")[0].trim();
  if (!raw) return `Nemovitost ${listing.index}`;
  return raw.length <= 52 ? raw : `${raw.slice(0, 49).trim()}...`;
}

function formatMetric(value) {
  return cleanText(value).replace(/m(?:\u00b2|\u00c2\u00b2|\u00c2\u02db|\u02db)|mq/gi, "m2") || "-";
}

function formatPrice(raw) {
  const digits = String(raw || "").replace(/[^\d]/g, "");
  return digits ? `${Number(digits).toLocaleString("cs-CZ")} EUR` : "neuvedeno";
}

function buildMapUrl(listing) {
  if (listing.latitude != null && listing.longitude != null) return `https://www.google.com/maps/search/?api=1&query=${listing.latitude},${listing.longitude}`;
  const query = [listing.address, listing.streetNumber, listing.city].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || listing.url)}`;
}

function descriptionFor(listing) {
  return CS[listing.index]?.description || cleanText(listing.description);
}

function shortDescription(listing) {
  const text = cleanText(descriptionFor(listing))
    .replace(/Contattaci[\s\S]*$/i, "")
    .replace(/Per informazioni[\s\S]*$/i, "")
    .replace(/Chiama[\s\S]*$/i, "")
    .trim();
  if (text.length <= 1500) return text;
  const sentences = text.split(/(?<=[.!?])\s+/);
  const kept = [];
  for (const sentence of sentences) {
    const next = [...kept, sentence].join(" ");
    if (next.length > 1500) break;
    kept.push(sentence);
  }
  return kept.join(" ").trim() || `${text.slice(0, 1497).trim()}...`;
}

function hasAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function imageEntries(listing) {
  const entries = [];
  const add = (filePath, caption, role) => {
    if (!filePath || !fs.existsSync(filePath)) return;
    if (entries.some((item) => item.path === filePath)) return;
    const hash = crypto.createHash("sha1").update(fs.readFileSync(filePath)).digest("hex");
    entries.push({ path: filePath, caption: cleanText(caption).toLowerCase(), role, hash });
  };
  add(listing.saved?.mainPath, listing.galleryDetails?.[0]?.caption, "main");
  (listing.saved?.galleryPaths || []).forEach((file, index) => add(file, listing.galleryDetails?.[index]?.caption, "gallery"));
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
  let score = item.role === "main" ? 30 : 0;
  if (hasAny(caption, ["facciata", "esterno", "vista", "panorama", "giardino", "terrazzo", "balcone", "resede"])) score += 100;
  if (hasAny(caption, ["soggiorno", "salone", "living"])) score += 30;
  if (hasAny(caption, ["cucina"])) score += 18;
  if (hasAny(caption, ["bagno", "camera", "planimetria"])) score -= 50;
  return score;
}

function pickHeroImage(listing) {
  const override = null;
  if (override) return override;
  const entries = dedupeImageEntries(imageEntries(listing));
  return entries.sort((a, b) => heroScore(b) - heroScore(a))[0]?.path || null;
}

function pickGalleryImages(listing) {
  const entries = dedupeImageEntries(imageEntries(listing)).filter((item) => item.path !== pickHeroImage(listing));
  const selected = [];
  const used = new Set();
  const addFirst = (keywords) => {
    const item = entries.find((entry) => !used.has(entry.path) && hasAny(entry.caption, keywords));
    if (!item) return;
    selected.push(item.path);
    used.add(item.path);
  };
  addFirst(["cucina"]);
  addFirst(["soggiorno", "salone", "living"]);
  addFirst(["camera", "letto"]);
  addFirst(["bagno"]);
  addFirst(["terrazzo", "balcone", "giardino", "resede", "esterno"]);
  addFirst(["cantina", "taverna", "mansarda", "studio", "ripostiglio"]);
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
  const bands = [
    { x: 2.758, w: 0.472, transparency: 12 },
    { x: 3.227, w: 0.389, transparency: 26 },
    { x: 3.619, w: 0.305, transparency: 42 },
    { x: 3.93, w: 0.222, transparency: 58 },
    { x: 4.151, w: 0.139, transparency: 72 },
  ];
  for (const band of bands) {
    slide.addShape("rect", {
      x: band.x,
      y: 0,
      w: band.w,
      h: 7.5,
      line: { color: "FFFFFF", transparency: 100 },
      fill: { color: "FFFFFF", transparency: band.transparency },
    });
  }
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
  addImageIfExists(slide, ICON_STRIP, { x: 0.38, y: 1.55, w: 0.8, h: 4.89 });
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
  slide.addText("mapa", {
    x: metricX,
    y: 5.13,
    w: 1.45,
    h: 0.36,
    ...metricStyle,
    hyperlink: { url: buildMapUrl(listing) },
    underline: { color: COLORS.text },
  });
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
  const place = [listing.city, listing.address].filter(Boolean).join(" | ");
  slide.addText(place, {
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
    addImageIfExists(slide, filePath, {
      x: slot.x,
      y: slot.y,
      w: slot.w,
      h: slot.h,
      sizing: { type: "cover", x: slot.x, y: slot.y, w: slot.w, h: slot.h },
    });
  });
  slide.addText(String(listing.index), {
    x: 8.28,
    y: 0.22,
    w: 0.6,
    h: 0.32,
    fontFace: "Aptos",
    fontSize: 20,
    bold: true,
    color: COLORS.text,
    margin: 0,
  });
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
    breakLine: false,
    fit: "shrink",
  });
  slide.addText(`Zdroj: ${listing.url}`, {
    x: 8.28,
    y: 7.02,
    w: 4.78,
    h: 0.2,
    fontFace: "Aptos",
    fontSize: 6.5,
    color: COLORS.muted,
    margin: 0,
    fit: "shrink",
  });
}

async function loadListings() {
  ensureDir(OUT_DIR);
  const listings = [];
  for (const item of ITEMS) {
    const listingDir = path.join(OUT_DIR, `listing-${item.index}`);
    ensureDir(listingDir);
    const harPath = path.join(HAR_DIR, item.har);
    let data;
    try {
      data = extractListingData(harPath, listingDir);
    } catch (error) {
      console.warn(`HAR ${item.har} non e parsabile come JSON completo, uso fallback: ${error.message}`);
      data = await extractListingDataFallback(harPath, listingDir, item);
    }
    listings.push({
      ...data,
      ...item,
      title: cleanText(data.title),
      titleCs: CS[item.index]?.title || cleanText(data.title),
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
    });
  }
  return listings;
}

async function main() {
  const outPath = process.argv[2] || OUTPUT;
  ensureDir(path.dirname(outPath));
  const listings = await loadListings();
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "OpenAI Codex";
  pptx.company = "OpenAI";
  pptx.subject = "Vyber nemovitosti Toscana z HAR Immobiliare.it";
  pptx.title = "Vyber nemovitosti Toscana - cervenec 2026";
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
      })),
      null,
      2
    )
  );
  await pptx.writeFile({ fileName: outPath });
  console.log(outPath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
