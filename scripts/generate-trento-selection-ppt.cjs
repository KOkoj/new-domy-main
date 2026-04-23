const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const { extractListingData } = require("./extract-listing-data.cjs");

const ITEMS = Array.from({ length: 15 }, (_, index) => ({
  index: index + 1,
  har: `trento${index + 1}.har`,
}));

const COLORS = { bg: "FFFFFF", text: "111111" };
const ICON_STRIP = path.resolve("tmp", "ppt-build", "extracted", "ppt", "media", "image1.png");
const CS_COPY = {
  1: {
    title: "Koncová vila se zahradou a výhledem v Gallio",
    description:
      "V panoramatické části Sisemol v Gallio se nabízí koncová vila volná ze tří stran, rozložená do dvou podlaží a obklopená velkou zelenou zahradou. Jde o prostorné horské bydlení vhodné pro větší rodinu i rekreační využití.\n\nVe zvýšeném přízemí je samostatný vstup, velká obytná zóna s kuchyní, TV koutem, krbem na dřevo a polookružním balkonem s otevřenými výhledy. Na stejném podlaží jsou dvě manželské ložnice s vestavěným patrem a první koupelna se sprchou. V nižším, ale stále nadzemním podlaží jsou další dva pokoje a druhá koupelna.\n\nSoučástí je garáž a možnost parkování dalších dvou aut venku. Dům má samostatné plynové vytápění a celkem nabízí až deset lůžek.",
  },
  2: {
    title: "Nový podkrovní byt v Palazzo Wetterstetter",
    description:
      "V centru Calliana, přímo s výhledem na Piazza Italia, se prodává nový byt ve třetím patře historického domu Palazzo Wetterstetter. Byt je kompletně podkrovní a v hlavní ložnici je možnost vytvořit ještě galerii.\n\nDispozice zahrnuje vstup do velké denní zóny s přístupem na balkon o velikosti 4 m², chodbu, koupelnu s oknem, sprchou a sanitou, středně velký pokoj a prostornou manželskou ložnici o ploše přibližně 15 m². Dům má výtah a klidnou centrální polohu s hlavním vstupem z Via De Valentini.\n\nByt nabízí podlahové vytápění, dřevěná okna s trojsklem, bezpečnostní dveře a energetickou třídu D. V okolí jsou veřejná parkovací místa bez vyhrazení.",
  },
  3: {
    title: "Třípokojový byt se dvěma terasami v Callianu",
    description:
      "V rezidenci CASTELBESENO v Callianu je k dispozici byt v prvním patře se dvěma velkými terasami orientovanými na jihozápad. Dům je vybaven výtahem a nabízí i mnoho společných parkovacích míst venku.\n\nByt se skládá ze vstupu do denní části s terasou, kuchyňského prostoru, koupelny se sprchou v plné velikosti, manželské ložnice se vstupem na druhou terasu a druhého pokoje. Nemovitost se prodává včetně vybavení obývací části, kuchyně, koupelny a šatních skříní v ložnicích podle přiložených fotografií.\n\nK bytu náleží sklep v suterénu. Garáž je možné dokoupit zvlášť za 25 000 EUR. Byt je k dispozici ihned.",
  },
  4: {
    title: "Zrekonstruovaný byt u Pinzola se soukromou terasou",
    description:
      "V Mortasu, v obci Spiazzo Rendena, jen přibližně deset minut od lanovek v Pinzolu, se nachází praktický zařízený byt v přízemí. Poloha je slunná a velmi vhodná jak pro rekreaci, tak pro vlastní užívání.\n\nByt prošel v roce 2024 kompletní rekonstrukcí a má nové funkční vybavení. Dispozice tvoří velký otevřený obývací prostor s relaxační částí, pohovkou a kamny na pelety, jídelní kout, kuchyňský kout, koupelna s oknem a sprchou, manželská ložnice a druhý pokoj se dvěma lůžky. Z obývací části i z druhého pokoje je vstup na soukromou venkovní terasu propojenou se společnou zahradou.\n\nK vytápění slouží kamna na pelety s rozvodem tepla do všech místností. Součástí je velký sklep a venkovní parkovací místo.",
  },
  5: {
    title: "Prostorný přízemní byt se zahradou v Borgo Valsugana",
    description:
      "V Borgo Valsugana se prodává prostorný byt v přízemí se soukromou zahradou, verandou, garáží a sklepem. Nabídka je vhodná pro ty, kdo hledají pohodlí, klid a dobrou dostupnost služeb.\n\nInteriér otevírá široká chodba, ze které se vstupuje do tří světlých pokojů vhodných pro rodinu. K dispozici je koupelna se sprchovým koutem a praktická komora nebo prádelna. Denní část nabízí útulné prostředí s obytnou kuchyní a výhledem do zeleně.\n\nSilnou stránkou je uzavřená veranda, která funguje jako světlé rozšíření denní zóny po celý rok. Nemovitost doplňuje garáž pro jedno auto a sklep. V bezprostředním okolí je navíc dostatek veřejného parkování.",
  },
  6: {
    title: "Zrekonstruovaný byt se zahradou v Roveretu",
    description:
      "V klidné a dobře obsloužené ulici Via Stivo v Roveretu se prodává plně zrekonstruovaný byt v přízemí menšího domu. Lokalita je jen pár minut od centra a zároveň v příjemném rezidenčním prostředí.\n\nByt prošel rekonstrukcí asi před čtyřmi lety a nabízí světlou denní část s otevřenou kuchyní a obývacím pokojem. Odtud je přímý vstup do soukromé zahrady o velikosti přibližně 110 m², která je ideální pro posezení venku, domácí mazlíčky nebo běžný každodenní život. Noční část tvoří prostorná manželská ložnice se vstupem do zahrady, druhý pokoj a koupelna.\n\nK nemovitosti patří samostatná garáž a jedno vyhrazené venkovní parkovací místo. Byt je připravený k okamžitému bydlení.",
  },
  7: {
    title: "Víceúrovňový byt s garáží v historickém Besenellu",
    description:
      "V historickém centru Besenella se exkluzivně prodává prostorný byt rozložený do více úrovní s vlastním vstupem a garáží. Vstup vede po venkovním dřevěném schodišti přímo na podlaží s noční částí, což pomáhá prosvětlení horního obytného podlaží.\n\nNa vstupní úrovni je první koupelna s oknem, manželská ložnice a po několika schodech druhá ložnice s balkonem, dnes využívaná jako šatna, a hlavní koupelna. O patro výš je velká obytná kuchyně s vysokými stropy a vstupem na další balkon a obývací pokoj prosvětlený střešními okny. Díky orientaci východ–západ je byt velmi světlý a má pěkný výhled do údolí Adiže.\n\nSoučástí je i velká garáž v přízemí. Byt je v současnosti pronajatý přechodnou smlouvou do května 2026.",
  },
  8: {
    title: "Byt s výhledem na jezero v Baselga di Pinè",
    description:
      "V centrální a zároveň klidné části Baselga di Pinè se prodává byt ve druhém a posledním patře trojdomu. Nemovitost je vhodná jak pro hlavní bydlení, tak jako rekreační byt.\n\nVstup vede přímo do obytné zóny rozdělené na kuchyňský kout s jídelnou a relaxační část. Odtud se otevírá příjemný výhled se záběrem na jezero Baselga di Pinè. Chodba vede do noční části, kde jsou tři ložnice, z nichž jedna má malý balkon a další dvě mají připojenou komoru. K dispozici je také koupelna s oknem a další samostatná komora.\n\nNemovitost doplňuje pozemek nedaleko domu, který lze využívat jako parkování i zahradu. Byt je po průběžných úpravách a je připravený k okamžitému užívání.",
  },
  9: {
    title: "Investiční byt u nádraží v Trentu",
    description:
      "V širším centru Trenta, jen pár kroků od nádraží a hlavních univerzitních fakult, se nabízí zrekonstruovaný byt s nízkými provozními náklady. Díky poloze i dispozici jde především o investiční příležitost.\n\nByt má vstupní část, obytnou zónu dobré velikosti, samostatnou kuchyň, dvě manželské ložnice a koupelnu s oknem a sprchou. K dispozici je také komora, půda a společná zahrada i společná prádelna. Dům má pouze tři bytové jednotky, takže nevyžaduje správce a náklady na provoz jsou velmi nízké.\n\nNemovitost je pronajata zvýhodněnou smlouvou s nájmem 650 EUR měsíčně do srpna 2027, což z ní dělá hotový investiční produkt.",
  },
  10: {
    title: "Nově dokončovaný duplex v centru Fai della Paganella",
    description:
      "V samotném centru Fai della Paganella, v malém domě ve fázi dokončení, se nabízí elegantní byt rozložený do dvou úrovní. Poloha je velmi praktická, v docházkové vzdálenosti od všech služeb.\n\nDispozice zahrnuje v prvním patře jeden pokoj a obývací část s kuchyní, ze které vede schodiště do přízemí. Tam se nachází druhý pokoj, chodba, koupelna s oknem a druhý vstup. Součástí jednotky je sklep v přízemí.\n\nByt je kompletně zrekonstruovaný, dokončení prací je plánováno na rok 2025. V okolí jsou veřejná parkovací místa. Výhodou mohou být i daňové úlevy při koupi.",
  },
  11: {
    title: "Velký podkrovní bilocale v Pergine Valsugana",
    description:
      "V jedné z nejznámějších ulic Pergine Valsugana, blízko historického centra a všech služeb, se prodává velký podkrovní byt ve třetím a posledním patře domu Casa Vipper. Interiér má přiznané trámy a velmi vzdušný charakter.\n\nBezpečnostní dveře vedou přímo do denní části o velikosti přibližně 60 m², kde je obývací zóna a plně vybavená kuchyně. Na stejné úrovni je chodba, velká koupelna se sprchou a samostatná prádelna. Po otevřeném schodišti se vystoupá na galerii s manželskou ložnicí.\n\nDíky velkorysé denní ploše je možné vytvořit i druhou ložnici. Byt má samostatné plynové vytápění a minimální společné náklady, ale nemá výtah ani parkovací místo.",
  },
  12: {
    title: "Světlý čtyřpokojový byt s balkony v Trentu",
    description:
      "V malé a dobře udržované budově v části San Bartolomeo v Trentu se exkluzivně prodává velký byt ve druhém a posledním patře bez výtahu. Příjemnou devizou je otevřený výhled na jih a západ a dvojice balkonů.\n\nByt nabízí vstupní chodbu, samostatnou kuchyň se vstupem na balkon, obývací pokoj s přístupem na jižní balkon, dvojlůžkový pokoj, manželskou ložnici s vlastním balkonem a koupelnu s oknem, vanou i sprchou. Součástí vybavení je také klimatizace.\n\nK nemovitosti náleží sklep, samostatná garáž a v okolí domu jsou další volná parkovací místa. Jde o solidní rodinné bydlení v klidném domě.",
  },
  13: {
    title: "Přízemní byt s lodžií a zahradou v San Lorenzo Dorsino",
    description:
      "V charakteristické a praktické části San Lorenzo in Banale se nabízí byt v přízemí o ploše přibližně 100 m². Lokalita je příjemně blízko centra obce a zároveň má klidný horský charakter.\n\nDispozici tvoří vstupní lodžie, kuchyň, obývací pokoj s panoramatickým balkonem a dobrou orientací, chodba, dvě koupelny a dvě ložnice. V polosuterénu je velký sklep a venkovní průjezd využitelný jako parkovací stání. Součástí celku je také další zahrada nebo menší pozemek vhodný jako užitková část.\n\nByt má samostatné vytápění na LPG, noční část prošla kompletní rekonstrukcí a zároveň byla položena nová střešní krytina. Prodává se částečně zařízený.",
  },
  14: {
    title: "Pronajatý investiční byt u nemocnice v Trentu",
    description:
      "Ve velmi obsloužené části Bolghera v Trentu, hned vedle nemocnice Santa Chiara, se prodává byt vhodný především na investici. Nemovitost je už pronajatá za 815 EUR měsíčně.\n\nDispozice zahrnuje vstupní halu, samostatnou obytnou kuchyň, velmi prostorný a světlý obývací pokoj s balkonem orientovaným na západ a výhledem na potok Fersina, chodbu, koupelnu s oknem a dva pokoje, z nichž jeden je větší manželský a druhý střední se druhým balkonem.\n\nK bytu patří také půda o velikosti přibližně 4 m² přímo vedle jednotky. Nabídka je vhodná pro kupujícího, který hledá hotový výnosový byt v dobré městské poloze.",
  },
  15: {
    title: "Světlý byt s velkou terasou v Trentu",
    description:
      "Tento byt v Trentu zaujme světlem, výbornou orientací a otevřeným výhledem. Interiér je prostorný a dobře rozdělený, takže nabízí pohodlné bydlení pro rodinu i práci z domova.\n\nVstup vede do příjemného obývacího pokoje, vedle kterého je samostatná kuchyň s praktickou spíží. Velká terasa orientovaná na západ je ideální pro odpolední slunce a večerní posezení venku. Noční část tvoří dvě prostorné manželské ložnice, pracovna vhodná jako home office nebo víceúčelový pokoj a dvě koupelny, z nichž jedna má okno.\n\nK bytu náleží vyhrazené parkovací místo a navíc je možné dokoupit pohodlnou garáž o ploše 20 m².",
  },
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function compactTitle(listing, language) {
  const raw = cleanText(language === "cs" ? (CS_COPY[listing.index]?.title || listing.title) : listing.title);
  if (!raw) return `Casa ${listing.index}`;
  const firstPart = raw.split(",")[0].trim();
  return firstPart.length <= 42 ? firstPart : `${firstPart.slice(0, 39).trim()}...`;
}

function cleanupDescription(text) {
  let cleaned = cleanText(text)
    .replace(/Franchising Immobiliare Tempocasa[\s\S]*$/i, "")
    .replace(/Contattateci[\s\S]*$/i, "")
    .replace(/Contattaci[\s\S]*$/i, "")
    .replace(/Per maggiori informazioni[\s\S]*$/i, "")
    .replace(/Chiamaci[\s\S]*$/i, "")
    .replace(/Rif\.\s*[:\-]?\s*[\w/-]+/gi, "")
    .trim();

  if (cleaned.length <= 1500) return cleaned;

  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  const kept = [];
  for (const sentence of sentences) {
    const candidate = [...kept, sentence].join(" ");
    if (candidate.length > 1500) break;
    kept.push(sentence);
  }
  return kept.join(" ").trim() || cleaned.slice(0, 1500).trim();
}

function formatPrice(raw) {
  const digits = String(raw || "").replace(/[^\d]/g, "");
  return digits ? `${Number(digits).toLocaleString("it-IT")} EUR` : "";
}

function formatMetricValue(value) {
  return cleanText(value).replace("mÂ˛", "m2");
}

function buildMapUrl(listing) {
  if (listing.latitude != null && listing.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${listing.latitude},${listing.longitude}`;
  }
  const query = [listing.address, listing.streetNumber, listing.city].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function pickMainImage(listing) {
  const main = listing?.saved?.mainPath;
  if (main && fs.existsSync(main)) return main;
  return listing?.saved?.galleryPaths?.find((file) => file && fs.existsSync(file)) || null;
}

function scoreCaption(caption) {
  if (!caption) return 0;
  if (caption.includes("cucina") || caption.includes("angolo cottura")) return 100;
  if (caption.includes("camera da letto") || caption.includes("camera")) return 95;
  if (caption.includes("bagno")) return 90;
  if (caption.includes("salone") || caption.includes("soggiorno")) return 80;
  if (caption.includes("facciata") || caption.includes("esterno")) return 70;
  if (caption.includes("giardino") || caption.includes("veranda") || caption.includes("balcone") || caption.includes("patio") || caption.includes("portico") || caption.includes("terraz")) return 65;
  if (caption.includes("ingresso") || caption.includes("corridoio") || caption.includes("disimpegno")) return 45;
  return 20;
}

function pickGalleryImages(listing) {
  const hero = pickMainImage(listing);
  const details = (listing.galleryDetails || [])
    .map((item, index) => ({
      ...item,
      path: listing?.saved?.galleryPaths?.[index] || null,
      captionLc: cleanText(item.caption).toLowerCase(),
    }))
    .filter((item) => item.path && fs.existsSync(item.path) && item.path !== hero);

  const chosen = [];
  const used = new Set();
  const categoryRules = [
    ["cucina", "angolo cottura"],
    ["camera da letto", "camera"],
    ["bagno"],
    ["salone", "soggiorno"],
    ["facciata", "esterno", "giardino", "veranda", "balcone", "patio", "portico", "terraz"],
  ];

  function tryPick(ruleKeywords) {
    const match = details.find((item) => !used.has(item.path) && ruleKeywords.some((kw) => item.captionLc.includes(kw)));
    if (match) {
      chosen.push(match.path);
      used.add(match.path);
    }
  }

  categoryRules.forEach(tryPick);

  for (const item of details.filter((item) => !used.has(item.path)).sort((a, b) => scoreCaption(b.captionLc) - scoreCaption(a.captionLc))) {
    if (chosen.length >= 6) break;
    chosen.push(item.path);
    used.add(item.path);
  }

  const fallbackPool = (listing?.saved?.galleryPaths || []).filter((file) => file && fs.existsSync(file) && file !== hero);
  for (const file of fallbackPool) {
    if (chosen.length >= 6) break;
    if (!used.has(file)) {
      chosen.push(file);
      used.add(file);
    }
  }

  return chosen.slice(0, 6);
}

function addImageIfExists(slide, filePath, options) {
  if (filePath && fs.existsSync(filePath)) slide.addImage({ path: filePath, ...options });
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

function addSlideOne(pptx, listing, language) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bg };

  addImageIfExists(slide, pickMainImage(listing), {
    x: 3.37,
    y: 0,
    w: 9.97,
    h: 7.5,
    sizing: { type: "cover", x: 3.37, y: 0, w: 9.97, h: 7.5 },
  });
  addFadeOverlay(slide);
  addImageIfExists(slide, ICON_STRIP, { x: 0.38, y: 1.55, w: 0.8, h: 4.89 });

  slide.addText(`${listing.index}. ${compactTitle(listing, language)}`, {
    x: 0.11,
    y: 0.15,
    w: 3.95,
    h: 0.8,
    fontFace: "Aptos Display",
    fontSize: 21,
    color: COLORS.text,
    margin: 0,
    fit: "shrink",
  });

  const metricX = 1.52;
  const metricStyle = { fontFace: "Aptos", fontSize: 18, color: COLORS.text, margin: 0, valign: "mid", align: "left" };
  slide.addText(formatMetricValue(listing.surface), { x: metricX, y: 1.72, w: 1.35, h: 0.36, ...metricStyle });
  slide.addText(formatMetricValue(listing.rooms), { x: metricX, y: 2.56, w: 1.35, h: 0.36, ...metricStyle });
  slide.addText(formatMetricValue(listing.bedrooms), { x: metricX, y: 3.39, w: 1.35, h: 0.36, ...metricStyle });
  slide.addText(formatMetricValue(listing.bathrooms), { x: metricX, y: 4.24, w: 1.35, h: 0.36, ...metricStyle });
  slide.addText(language === "cs" ? "mapa" : "mappa", {
    x: metricX,
    y: 5.13,
    w: 1.35,
    h: 0.36,
    ...metricStyle,
    hyperlink: { url: buildMapUrl(listing) },
    underline: { color: COLORS.text },
  });
  slide.addText(formatPrice(listing.priceLabel), {
    x: metricX,
    y: 6.17,
    w: 1.8,
    h: 0.4,
    fontFace: "Aptos",
    fontSize: 18,
    color: COLORS.text,
    margin: 0,
    fit: "shrink",
  });
}

function addSlideTwo(pptx, listing, language) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bg };

  const gallery = pickGalleryImages(listing);
  const slots = [
    { x: 0.0, y: 0.0, w: 4.07, h: 2.42 },
    { x: 4.12, y: 0.0, w: 4.07, h: 2.42 },
    { x: 0.0, y: 2.5, w: 4.07, h: 2.42 },
    { x: 4.12, y: 2.5, w: 4.07, h: 2.42 },
    { x: 0.0, y: 5.0, w: 4.07, h: 2.5 },
    { x: 4.12, y: 5.0, w: 4.07, h: 2.5 },
  ];

  gallery.forEach((imagePath, index) => {
    const slot = slots[index];
    addImageIfExists(slide, imagePath, {
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
  slide.addText(cleanupDescription(language === "cs" ? (CS_COPY[listing.index]?.description || listing.description) : listing.description), {
    x: 8.28,
    y: 0.7,
    w: 4.78,
    h: 6.45,
    fontFace: "Aptos",
    fontSize: 14,
    color: COLORS.text,
    margin: 0,
    valign: "top",
    breakLine: false,
    fit: "shrink",
  });
}

async function main() {
  const harDir = process.argv[2] || "c:\\Users\\39327\\Desktop\\temporanei\\documenti\\HAR present";
  const outPath = process.argv[3] || path.resolve("tmp", "trento-selection-apr-2026.pptx");
  const workDir = process.argv[4] || path.resolve("tmp", "trento-selection-data");
  const language = process.argv[5] || "it";

  ensureDir(workDir);
  ensureDir(path.dirname(outPath));

  const listings = ITEMS.map((item) => {
    const listingDir = path.join(workDir, `listing-${item.index}`);
    ensureDir(listingDir);
    const extracted = extractListingData(path.join(harDir, item.har), listingDir);
    return {
      ...item,
      ...extracted,
      title: cleanText(extracted.title),
      city: cleanText(extracted.city),
      address: cleanText(extracted.address),
      streetNumber: cleanText(extracted.streetNumber),
      description: cleanText(extracted.description),
    };
  });

  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "OpenAI Codex";
  pptx.company = "OpenAI";
  pptx.subject = "Trento real estate selection";
  pptx.title = "Trento selection";
  pptx.lang = language === "cs" ? "cs-CZ" : "it-IT";
  pptx.theme = { headFontFace: "Aptos Display", bodyFontFace: "Aptos", lang: language === "cs" ? "cs-CZ" : "it-IT" };

  listings.forEach((listing) => {
    addSlideOne(pptx, listing, language);
    addSlideTwo(pptx, listing, language);
  });

  await pptx.writeFile({ fileName: outPath });
  console.log(outPath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
