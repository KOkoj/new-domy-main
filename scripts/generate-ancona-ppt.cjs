const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const { extractListingData } = require("./extract-listing-data.cjs");

const ITEMS = [
  { index: 1, har: "Caorle1.har", url: "https://www.immobiliare.it/annunci/121120658/" },
  { index: 2, har: "Caorle2.har", url: "https://www.immobiliare.it/annunci/120348480/" },
  { index: 3, har: "Caorle3.har", url: "https://www.immobiliare.it/annunci/125528073/" },
  { index: 4, har: "Caorle4.har", url: "https://www.immobiliare.it/annunci/124345359/" },
  { index: 5, har: "Caorle5.har", url: "https://www.immobiliare.it/annunci/125746203/" },
  { index: 6, har: "Caorle6.har", url: "https://www.immobiliare.it/annunci/119518101/" },
  { index: 7, har: "Caorle7.har", url: "https://www.immobiliare.it/annunci/125794837/" },
  { index: 8, har: "Caorle8.har", url: "https://www.immobiliare.it/annunci/123613153/" },
];

const CZ_COPY = {
  1: {
    title: "Třípokojový byt pár kroků od pláže Levante",
    description:
      "Jen 200 metrů od pláže Levante a v krátké pěší vzdálenosti od historického centra Caorle se nachází tento příjemný byt ve druhém a posledním patře domu s malým počtem jednotek. Budova prošla nedávnou vnější obnovou, takže působí upraveně a moderně. Byt nabízí velkou denní část, samostatně řešenou kuchyň vytvořenou ve velmi světlé verandě, dvě ložnice a koupelnu s oknem. Prostory jsou dobře rozvržené a nemovitost je ve velmi dobrém stavu, připravená k okamžitému užívání. Nechybí autonomní vytápění ani klimatizace v každé místnosti, takže bydlení zůstává komfortní po celý rok. Jde o řešení vhodné jak pro celoroční bydlení, tak jako prázdninový byt v jedné z nejžádanějších částí Caorle.",
  },
  2: {
    title: "Elegantní bilocale v historickém centru Caorle",
    description:
      "V srdci historického centra Caorle, s výhledem na působivý Rio Terrà, se nachází elegantní dvoupokojový byt v prvním patře menší budovy. Dům byl podle inzerátu rekonstruován uvnitř i zvenčí a zachovává kouzlo místní architektury, zároveň však nabízí moderní komfort. Dispozice zahrnuje vstup, prostorný obývací pokoj s kuchyní, chodbu, manželskou ložnici a koupelnu. Byt se prodává zařízený, má nová hliníková okna a autonomní vytápění s kotlem a radiátory v každém prostoru, takže je vhodný i pro celoroční užívání. Díky jihovýchodní orientaci je interiér dobře prosvětlený. Nemovitost je ve výborném stavu a je připravena k okamžitému bydlení nebo pronájmu. Výhodou je i možnost parkování v zóně pro abonenty nedaleko domu, což je v centru Caorle praktický benefit.",
  },
  3: {
    title: "Přízemní byt v centru blízko pláže Madonnina",
    description:
      "Tento pohodlný přízemní byt se nachází v samém centru Caorle, v blízkosti všech služeb a jen pár kroků od volné pláže u Madonnina dell’Angelo. Dispozice zahrnuje jednu manželskou ložnici, menší pokoj využitelný jako šatna nebo pracovna, prostorný obývací prostor s kuchyní, koupelnu s oknem a soukromý venkovní prostor. Byt je kompletně zařízený, vybavený nezávislým vytápěním a klimatizací a je ihned obyvatelný bez nutnosti dalších prací. Dům je v dobrém stavu a podle inzerátu nejsou plánovány zásadní zásahy. Velkou předností je výhled na park Piazza Veneto, tedy zelený kout přímo v centru města. V okolí se snadno najde parkování a v pěší vzdálenosti jsou obchody i běžné služby pro každodenní život.",
  },
  4: {
    title: "Velký byt v historickém centru 100 m od moře",
    description:
      "V historickém centru Caorle, jen asi 100 metrů od pláže Spiaggia di Levante, se nachází byt o ploše 117 m2 ve druhém patře domu o třech podlažích. Vstup vede do obytné kuchyně s balkonem, dále do velkého dvojitého obývacího pokoje, rovněž s balkonem, který je ideální pro společné chvíle i odpočinek. Noční část tvoří tři ložnice dobrých rozměrů a koupelna s oknem a vanou. Byt byl rekonstruován v roce 1993 a je v dobrém udržovaném stavu, s keramickými podlahami, dřevěnými okny a autonomním plynovým vytápěním. Díky orientaci na více stran je interiér příjemně světlý. K nemovitosti patří i prostorný sklad v přízemí a přidělené venkovní parkovací místo, což je v historickém centru velmi cenná výhoda. Poloha mezi mořem, službami a atmosférou starého města z ní dělá velmi zajímavé řešení pro bydlení i investici.",
  },
  5: {
    title: "Zrekonstruovaný velký byt s terasou v Caorle",
    description:
      "V Corso G. Chiggiato se v prvním patře reprezentativního domu nachází zrekonstruovaný byt o rozloze 140 m2. Vstupní chodba přehledně rozděluje jednotlivé místnosti. Na jedné straně je moderní a světlá kuchyně v open-space řešení, naproti ní první ložnice s vlastní koupelnou s oknem. Noční část pokračuje prostornou manželskou ložnicí, dalšími dvěma pokoji dobrých rozměrů a hlavní koupelnou. Denní prostory doplňuje velký otevřený obývací pokoj vhodný pro odpočinek i přijímání hostů. Byt má také terasu o ploše 17 m2 a přidělené venkovní parkovací místo, velmi žádané právě v této části města. Komfort zajišťuje autonomní plynové vytápění, klimatizace teplo/chlad, videotelefon a bezpečnostní dveře. Poloha je strategická, blízko centra i moře, a proto je nemovitost vhodná jak pro hlavní bydlení, tak pro rekreační využití.",
  },
  6: {
    title: "Útulný bilocale s terasou v klidné části Caorle",
    description:
      "V klidné a dobře obsloužené zóně Caorle se prodává útulný byt postavený v roce 2000, v dobrém stavu a ihned obyvatelný. Je ideální pro pár nebo jako rekreační nemovitost. Denní část nabízí praktický kuchyňský kout, jídelní stůl a rozkládací pohovku pro chvíle odpočinku. K dispozici je pohodlná koupelna s oknem a sprchovým koutem a prostorná ložnice, do níž se vedle manželské postele vejde i palanda, takže byt poskytne až šest lůžek. Příjemným bonusem je terasa orientovaná na severovýchod, která v létě zůstává chladnější a snižuje potřebu klimatizace. Kondominiální náklady jsou nízké, přibližně 35 eur měsíčně. Nemovitost představuje praktickou a univerzální možnost pro pohodlné pobyty u moře.",
  },
  7: {
    title: "Bilocale se soukromou zahradou a bazénem 200 m od pláže",
    description:
      "Ve Via Mantova, přibližně 200 metrů od pláže Levante, se v rezidenční zóně nachází tento bilocale v domě o pouhých osmi jednotkách. Byt je součástí Residence Mercurio, které nabízí bazén, sluneční plochu a společné zázemí. Dispozice zahrnuje vstup, obývací pokoj s kuchyňským koutem, chodbu, koupelnu s oknem a ložnici; velkým plusem je soukromá zahrada, která obepíná byt po obvodu a výrazně zvyšuje uživatelský komfort. Nemovitost se prodává zařízená, je vybavena autonomním vytápěním s novým kotlem, klimatizací, sítěmi proti hmyzu a alarmem. V ceně je zahrnuto také kryté parkovací stání ve výhradním vlastnictví. Jde o velmi atraktivní kombinaci soukromí, venkovního prostoru a blízkosti moře.",
  },
  8: {
    title: "Čtyřmístná jednotka blízko centra s možností bydlení",
    description:
      "V části Levante v Caorle, jen kousek od historického centra, se prodává jednotka vedená jako kancelář, u níž je podle inzerátu možné změnit využití na bydlení. Interiér tvoří čtyři dobře rozvržené místnosti: z hlavního vstupu se vstupuje do prostorné přijímací místnosti, vedle ní je chodba, balkon a koupelna s oknem. Dále následují další dvě světlé místnosti, z nichž jedna díky prosklení nabízí výhled směrem k centru města a na historickou zvonici. Nemovitost je vybavena autonomním vytápěním a klimatizací, takže je funkční po celý rok. Strategická poloha v blízkosti služeb a místních atrakcí z ní činí zajímavou volbu jak pro rezidenční přestavbu, tak pro profesní využití v jedné z nejoblíbenějších lokalit benátského pobřeží.",
  },
};

const OVERRIDES = {
  2: {
    title: "Bilocale Calle Delle Scuole 1, Centro, Caorle",
    city: "Caorle",
    address: "Calle Delle Scuole",
    streetNumber: "1",
    priceLabel: "268000",
    surface: "54 m²",
    rooms: "2",
    bedrooms: "1",
    bathrooms: "1",
  },
};

const COLORS = { bg: "FFFFFF", text: "111111" };
const ICON_STRIP = path.resolve("tmp", "ppt-build", "extracted", "ppt", "media", "image1.png");

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function formatPrice(raw) {
  const digits = String(raw || "").replace(/[^\d]/g, "");
  return digits ? `${Number(digits).toLocaleString("cs-CZ")} EUR` : "";
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
  if (caption.includes("camera da letto") || caption.includes("stanza arredata")) return 95;
  if (caption.includes("bagno")) return 90;
  if (caption.includes("salone") || caption.includes("soggiorno")) return 80;
  if (caption.includes("facciata")) return 70;
  if (caption.includes("giardino") || caption.includes("veranda") || caption.includes("balcone") || caption.includes("patio") || caption.includes("portico") || caption.includes("piscina")) return 65;
  if (caption.includes("ingresso") || caption.includes("corridoio") || caption.includes("disimpegno")) return 45;
  return 20;
}

function pickGalleryImages(listing) {
  const hero = pickMainImage(listing);
  const details = (listing.galleryDetails || []).map((item, index) => ({
    ...item,
    path: listing?.saved?.galleryPaths?.[index] || null,
    captionLc: cleanText(item.caption).toLowerCase(),
  })).filter((item) => item.path && fs.existsSync(item.path) && item.path !== hero);

  const chosen = [];
  const used = new Set();
  const categoryRules = [
    ["cucina", "angolo cottura"],
    ["camera da letto", "stanza arredata"],
    ["bagno"],
    ["salone", "soggiorno"],
    ["facciata", "giardino", "veranda", "balcone", "patio", "portico", "piscina"],
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
      x: band.x, y: 0, w: band.w, h: 7.5,
      line: { color: "FFFFFF", transparency: 100 },
      fill: { color: "FFFFFF", transparency: band.transparency },
    });
  }
}

function addSlideOne(pptx, listing) {
  const copy = CZ_COPY[listing.index];
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bg };

  addImageIfExists(slide, pickMainImage(listing), {
    x: 3.37, y: 0, w: 9.97, h: 7.5,
    sizing: { type: "cover", x: 3.37, y: 0, w: 9.97, h: 7.5 },
  });
  addFadeOverlay(slide);
  addImageIfExists(slide, ICON_STRIP, { x: 0.38, y: 1.55, w: 0.8, h: 4.89 });

  slide.addText(`${listing.index}. ${copy.title}`, {
    x: 0.11, y: 0.15, w: 3.95, h: 0.8,
    fontFace: "Aptos Display", fontSize: 21, color: COLORS.text, margin: 0, fit: "shrink",
  });

  const metricX = 1.52;
  const metricStyle = { fontFace: "Aptos", fontSize: 18, color: COLORS.text, margin: 0, valign: "mid", align: "left" };
  slide.addText(formatMetricValue(listing.surface), { x: metricX, y: 1.72, w: 1.35, h: 0.36, ...metricStyle });
  slide.addText(formatMetricValue(listing.rooms), { x: metricX, y: 2.56, w: 1.35, h: 0.36, ...metricStyle });
  slide.addText(formatMetricValue(listing.bedrooms), { x: metricX, y: 3.39, w: 1.35, h: 0.36, ...metricStyle });
  slide.addText(formatMetricValue(listing.bathrooms), { x: metricX, y: 4.24, w: 1.35, h: 0.36, ...metricStyle });
  slide.addText("mapa", {
    x: metricX, y: 5.13, w: 1.35, h: 0.36, ...metricStyle,
    hyperlink: { url: buildMapUrl(listing) }, underline: { color: COLORS.text },
  });
  slide.addText(formatPrice(listing.priceLabel), {
    x: metricX, y: 6.17, w: 1.8, h: 0.4,
    fontFace: "Aptos", fontSize: 18, color: COLORS.text, margin: 0, fit: "shrink",
  });
}

function addSlideTwo(pptx, listing) {
  const copy = CZ_COPY[listing.index];
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
      x: slot.x, y: slot.y, w: slot.w, h: slot.h,
      sizing: { type: "cover", x: slot.x, y: slot.y, w: slot.w, h: slot.h },
    });
  });

  slide.addText(String(listing.index), {
    x: 8.28, y: 0.22, w: 0.6, h: 0.32,
    fontFace: "Aptos", fontSize: 20, bold: true, color: COLORS.text, margin: 0,
  });
  slide.addText(copy.description, {
    x: 8.28, y: 0.7, w: 4.78, h: 6.45,
    fontFace: "Aptos", fontSize: 14, color: COLORS.text,
    margin: 0, valign: "top", breakLine: false, fit: "shrink",
  });
}

async function main() {
  const harDir = process.argv[2] || "c:\\Users\\39327\\Desktop\\temporanei\\documenti\\HAR present";
  const outPath = process.argv[3] || "c:\\Users\\39327\\Desktop\\Caorle buono.pptx";
  const workDir = process.argv[4] || path.resolve("tmp", "caorle-template-data");
  ensureDir(workDir);
  ensureDir(path.dirname(outPath));

  const listings = ITEMS.map((item) => {
    const listingDir = path.join(workDir, `listing-${item.index}`);
    ensureDir(listingDir);
    const extracted = extractListingData(path.join(harDir, item.har), listingDir);
    const override = OVERRIDES[item.index] || {};
    return {
      ...item,
      ...extracted,
      ...override,
      url: item.url,
      title: cleanText(override.title || extracted.title),
      city: cleanText(override.city || extracted.city),
      address: cleanText(override.address || extracted.address),
      streetNumber: cleanText(override.streetNumber || extracted.streetNumber),
      description: cleanText(extracted.description),
    };
  });

  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "OpenAI Codex";
  pptx.company = "OpenAI";
  pptx.subject = "Caorle real estate selection";
  pptx.title = "Caorle selection";
  pptx.lang = "cs-CZ";
  pptx.theme = { headFontFace: "Aptos Display", bodyFontFace: "Aptos", lang: "cs-CZ" };

  listings.forEach((listing) => {
    addSlideOne(pptx, listing);
    addSlideTwo(pptx, listing);
  });

  await pptx.writeFile({ fileName: outPath });
  console.log(outPath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
