const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const { extractListingData } = require("./extract-listing-data.cjs");

const ITEMS = [
  { index: 1, har: "Caorle1 n.har" },
  { index: 2, har: "Caorle2.har" },
  { index: 3, har: "Caorle3.har" },
  { index: 4, har: "Caorle4.har" },
  { index: 5, har: "Caorle5.har" },
  { index: 6, har: "Caorle6.har" },
  { index: 7, har: "Caorle7.har" },
  { index: 8, har: "Caorle8.har" },
  { index: 9, har: "Caorle9.har" },
  { index: 10, har: "Caorle10.har" },
  { index: 11, har: "Caorle11.har" },
];

const COLORS = { bg: "FFFFFF", text: "111111" };
const ICON_STRIP = path.resolve("tmp", "ppt-build", "extracted", "ppt", "media", "image1.png");
const CS_COPY = {
  1: {
    title: "Třípokojový byt Villaggio Ginepri kousek od moře",
    description:
      "Třípokojový apartmán ve Villaggio Ginepri je vhodný pro ty, kdo chtějí klidné zázemí u moře v prostředí zeleně a společných služeb. Dispozice zahrnuje dvě prostorné ložnice, obytnou kuchyni s přímým vstupem na terasu, další soukromou terasu a plnohodnotnou koupelnu.\n\nSoučástí areálu je bazén, solárium, dětské hřiště, upravené společné cesty v zeleni a společná grill zóna pro venkovní stolování. Byt je vybaven bezpečnostními dveřmi, trezorem, klimatizací a tepelným čerpadlem, takže se hodí i mimo hlavní sezonu.\n\nK dispozici je možnost dokoupit venkovní nebo garážové parkovací místo. Jde o praktické rekreační bydlení několik kroků od pláže.",
  },
  2: {
    title: "Řadová vilka Le Betulle 300 m od pláže",
    description:
      "Příjemná řadová vilka ve Villaggio Le Betulle je rozložena do dvou podlaží a nabízí soukromou zahradu i kryté venkovní posezení. Jde o klidné místo vhodné pro odpočinek, přitom jen asi 300 metrů od pláže a blízko golfového hřiště.\n\nV přízemí je světlá denní část s kuchyňským koutem a rozkládací manželskou pohovkou. V patře se nachází prostorná ložnice s přímým vstupem na balkon a koupelna s oknem.\n\nNemovitost má klimatizaci s funkcí tepelného čerpadla a v ceně je i venkovní parkovací místo uvnitř areálu. Je vhodná jako letní bydlení i jako investice k pronájmu.",
  },
  3: {
    title: "Třípokojový byt Duna Blu s bazénem",
    description:
      "Apartmán v moderním komplexu Duna Blu v části Duna Verde se nachází v rezidenčním prostředí s domy se zahradami, velkým společným zeleným prostorem a vyvýšeným bazénem se soláriem. Byt je součástí budovy Santorini a prodává se zařízený.\n\nDispozici tvoří obývací pokoj s kuchyňským koutem a rozkládací pohovkou, manželská ložnice, druhý pokoj se dvěma lůžky, koupelna s oknem a kryté portiko.\n\nSoučástí vybavení je centrální klimatizace a parkovací místo. Jde o pohodlnou rekreační nemovitost v upraveném areálu blízko moře.",
  },
  4: {
    title: "Bilocale Larici se zahradou u Lido Altanea",
    description:
      "Moderní dvoupokojový byt v barevném Residence Larici leží jen asi 500 metrů od pláže Lido Altanea. Nachází se v přízemí a nabízí vlastní zahradu, takže je vhodný pro pohodlné letní pobyty i turistický pronájem.\n\nUvnitř je světlý obývací pokoj s kuchyňským koutem a rozkládací manželskou pohovkou, prostorná ložnice a koupelna s oknem. Na obytnou část navazuje příjemné kryté portiko orientované do zahrady.\n\nByt je vybaven klimatizací s tepelným čerpadlem, trezorem a bezpečnostními dveřmi. V ceně je i vyhrazené parkovací místo v garáži residence.",
  },
  5: {
    title: "Bilocale Larici se zahradou u Lido Altanea",
    description:
      "Moderní dvoupokojový byt v barevném Residence Larici leží jen asi 500 metrů od pláže Lido Altanea. Nachází se v přízemí a nabízí vlastní zahradu, takže je vhodný pro pohodlné letní pobyty i turistický pronájem.\n\nUvnitř je světlý obývací pokoj s kuchyňským koutem a rozkládací manželskou pohovkou, prostorná ložnice a koupelna s oknem. Na obytnou část navazuje příjemné kryté portiko orientované do zahrady.\n\nByt je vybaven klimatizací s tepelným čerpadlem, trezorem a bezpečnostními dveřmi. V ceně je i vyhrazené parkovací místo v garáži residence.",
  },
  6: {
    title: "Bilocale v Darsena dell'Orologio s výhledem",
    description:
      "Dvoupokojový byt v Residence Albatros se nachází uvnitř Darsena dell'Orologio, v klidné části nedaleko historického centra Caorle. Residence nabízí bazén, velké solárium s lehátky a společnou zelenou plochu.\n\nByt ve druhém a posledním patře bez výtahu má světlý obývací prostor s kuchyňským koutem a působivým výhledem na přístavní marinu, dále manželskou ložnici a koupelnu. Nemovitost se prodává zařízená.\n\nVýhodou je autonomní vytápění, klimatizace a kryté parkovací místo v suterénu. Jde o velmi dobré řešení i pro využití mimo letní sezonu.",
  },
  7: {
    title: "Světlý byt Coralba s terasou a parkováním",
    description:
      "V žádané části Villaggio dell'Orologio, nedaleko západní pláže, se prodává prostorný a světlý byt v domě Coralba. Přestože je inzerován jako trilocale, dispozice odpovídá většímu bytu s jednou ložnicí a dobře řešeným denním prostorem.\n\nByt v prvním patře nabízí velký obývací pokoj, oddělený kuchyňský kout, praktickou chodbu využitelnou i jako úložný prostor, koupelnu s oknem a sprchou a prostornou manželskou ložnici. Z ložnice i obývací části je vstup na terasu.\n\nNemovitost se prodává kompletně zařízená, má autonomní plynové vytápění, klimatizaci s tepelným čerpadlem, vlastní komoru v podkroví a parkovací místo k výhradnímu užívání.",
  },
  8: {
    title: "Řadový dům Ottava Presa na třech úrovních",
    description:
      "Řadový dům v lokalitě Ottava Presa se nachází asi pět minut od pobřeží a v novějším rezidenčním prostředí blízko zelené oblasti řeky Livenza. Nabízí soukromý venkovní prostor vpředu i vzadu a funguje jako plnohodnotné rodinné bydlení.\n\nV přízemí je denní část se samostatným obývacím pokojem a kuchyní, technická místnost a prádelna. V prvním patře se nachází noční zóna se dvěma ložnicemi, z nichž hlavní má dvě terasy, dále koupelna, další pokoj využívaný jako ložnice a druhá koupelna.\n\nVe druhém patře je podkrovní prostor. Nemovitost je vhodná pro ty, kdo chtějí více prostoru a klid mimo hlavní turistické jádro Caorle.",
  },
  9: {
    title: "Velký venkovský byt u Caorle po rekonstrukci",
    description:
      "Exkluzivně nabízená nemovitost leží v otevřené krajině u Caorle naproti kanálu, přibližně pět minut od moře a asi padesát minut od Benátek. Byt po kompletní rekonstrukci nabízí zhruba 160 m² obchodní plochy a navíc soukromou venkovní část o velikosti přibližně 95 m².\n\nV přízemí je portiko, vstup, obývací pokoj s jídelnou, otevřená kuchyně, chodba, prádelna s koupelnou pro hosty a vnitřní schodiště. V prvním patře jsou tři ložnice, z toho jedna manželská s vlastní koupelnou, další koupelna, komora a velká terasa s panoramatickým výhledem.\n\nSoučástí je i přístupná podkrovní část a venkovní parkování. Jde o zajímavou volbu pro rodinu i jako druhý domov u moře.",
  },
  10: {
    title: "Řadový dům Ottava Presa v dobrém stavu",
    description:
      "V lokalitě Ottava Presa u Caorle se prodává středový řadový dům ve velmi dobrém stavu. Nemovitost je zamýšlena jako prostorné, funkční a komfortní bydlení jen několik minut od moře.\n\nPodle inzerce jde o moderní a praktické řešení vhodné jak pro vlastní trvalé užívání, tak jako rekreační dům nebo investici v oblasti Caorle. Samotný text inzerátu je stručný, ale charakter nabídky směřuje na kupující, kteří hledají více prostoru mimo nejrušnější pobřežní část.\n\nVýhodou je kombinace klidnější polohy, dobrého technického stavu a dostupnosti moře autem během několika minut.",
  },
  11: {
    title: "Novější dům se zahradou na třech stranách",
    description:
      "V soukromém a novějším rezidenčním kontextu se nabízí moderní dům obklopený velkou soukromou zahradou ze tří stran. Nemovitost cílí na zájemce, kteří chtějí klid, soukromí a kvalitní novější výstavbu.\n\nDům má velkoryse řešenou denní část orientovanou na jihozápad, takže interiér působí světlým a teplým dojmem po celý den. Noční část zahrnuje dvě ložnice s možností vytvoření třetího pokoje a dva elegantně dokončené koupelny.\n\nSoučástí je soukromé parkovací místo a energetická třída A, která přináší vyšší efektivitu i komfort. Jde o silnou variantu pro vlastní bydlení v klidnějším zázemí Caorle.",
  },
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function compactTitle(listing, language) {
  const override = language === "cs" ? CS_COPY[listing.index]?.title : "";
  const raw = cleanText(override || listing.title);
  if (!raw) return `Casa ${listing.index}`;
  const firstPart = raw.split(",")[0].trim();
  return firstPart.length <= 42 ? firstPart : `${firstPart.slice(0, 39).trim()}...`;
}

function cleanupDescription(text) {
  let cleaned = cleanText(text)
    .replace(/Per maggiori informazioni[\s\S]*$/i, "")
    .replace(/Contattaci[\s\S]*$/i, "")
    .replace(/Contattateci[\s\S]*$/i, "")
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

function formatPrice(raw, language) {
  const digits = String(raw || "").replace(/[^\d]/g, "");
  return digits ? `${Number(digits).toLocaleString(language === "cs" ? "cs-CZ" : "it-IT")} EUR` : "";
}

function formatMetricValue(value) {
  return cleanText(value).replace("m²", "m2");
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
  slide.addText(formatPrice(listing.priceLabel, language), {
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
  const outPath = process.argv[3] || path.resolve("tmp", "caorle-selection-apr-2026.pptx");
  const workDir = process.argv[4] || path.resolve("tmp", "caorle-selection-data");
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
  pptx.subject = "Caorle real estate selection";
  pptx.title = "Caorle selection";
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
