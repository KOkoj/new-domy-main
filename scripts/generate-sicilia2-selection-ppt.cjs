const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const { extractListingData } = require("./extract-listing-data.cjs");

const ITEMS = [
  { index: 1, har: "1 url sicilia2.har", url: "https://www.immobiliare.it/annunci/127562224/" },
  { index: 2, har: "2 url sicilia2.har", url: "https://www.immobiliare.it/annunci/112298811/" },
  { index: 3, har: "3 url sicilia2.har", url: "https://www.immobiliare.it/annunci/118736049/" },
  { index: 4, har: "4 url sicilia2.har", url: "https://www.immobiliare.it/annunci/125426387/" },
  { index: 5, har: "5 url sicilia2.har", url: "https://www.immobiliare.it/annunci/123797105/" },
  { index: 6, har: "6 url sicilia2.har", url: "https://www.immobiliare.it/annunci/114323467/" },
  { index: 7, har: "7 url sicilia2.har", url: "https://www.immobiliare.it/annunci/126294473/" },
  { index: 8, har: "8 url sicilia2.har", url: "https://www.immobiliare.it/annunci/122683402/" },
];

const COLORS = { bg: "FFFFFF", text: "111111" };
const ICON_STRIP = path.resolve("tmp", "ppt-build", "extracted", "ppt", "media", "image1.png");

const CS_COPY = {
  1: {
    title: "Samostatna vila s pozemkem a garazi v Pettineo",
    description:
      "Samostatny dum v oblasti Contrada Innari u Pettinea nabizi klidne bydleni mimo hustou zastavbu a zajimavy pomer ceny k venkovnimu prostoru. Soucasti je pozemek, parkovani i garaz, takze jde o praktickou variantu pro trvale bydleni i vikendove uzivani.\n\nDispozicne se v galerii objevuje obytny pokoj, kuchyne, dve loznice a koupelna. Venkovni cast ukazuje okoli domu i teren navazujici na stavbu, coz je dulezite pro soukromi a dalsi vyuziti.\n\nPrezentace na druhe slide je slozena z interierovych zaberu po mistnostech, aby bylo co nejlepe videt realne fungovani domu.",
  },
  2: {
    title: "Mezonetovy dum v historickem centru Castel di Lucio",
    description:
      "Druha nabidka je semindependentni dum ve Via Vincenzo Gioberti v historickem jadru Castel di Lucio. Podle dostupnych dat jde o dum rozlozeny do vice podlazi s terasou a plochou kolem 130 m2.\n\nHAR neprinesl standardni metadata z detailu stranky, ale galerie je kvalitni a ukazuje loznice, obytnou cast, kuchyn i koupelnu. Proto jsem druhou slide slozil rucne z nejvice vypovidajicich interieru a vynechal opakovani uvodni exterierove fotografie.\n\nJe to spis klasicka vesnicka nemovitost s kamenou fasadou, vhodna pro klienta, ktery chce autentickou sicilskou atmosferu.",
  },
  3: {
    title: "Mestsky dum s terasou v Mistretta",
    description:
      "Terratetto ve Via Santissimo Rosario v Mistretta pusobi jako kompaktni mestske bydleni s vice urovnemi a dobrym rozdelenim denni a nocni casti. Na trhu je za dostupnou cenu a v galerii je dobre citelny vnitrni charakter domu.\n\nK dispozici jsou dve koupelny, loznice, kuchyne, obytny prostor i schodiste propojujici podlazi. To je presne typ domu, kde je dulezite ukazat v prezentaci logiku pohybu mezi mistnostmi, ne jen nahodne obrazky.\n\nDruha slide proto kombinuje schodiste, loznice, koupelny, kuchyn a salon bez opakovani uvodni fotografie fasady.",
  },
  4: {
    title: "Rodinny dum s dvorem a terasou v Alcara li Fusi",
    description:
      "Tato nemovitost ve Via dei Grifoni v Alcara li Fusi je klasicky sicilsky terratetto se ctyrmi mistnostmi, tremi loznicemi a dvema koupelnami. Silnou strankou je kombinace exterieru, dvora a vnitrnich obytnych mistnosti.\n\nGalerie obsahuje fasadu, vnitrni dvur, terasu, vstup, salon i kuchyn. Pro prezentaci je to vyhodne, protoze lze oddelit uvodni exterierovy dojem od druhe slide, ktera je vice orientovana na konkretni vnitrni prostory.\n\nU teto polozky jsem zachoval presne oddeleni prvni a druhe slide, aby se exterier neopakoval a zbylo maximum prostoru pro interiery.",
  },
  5: {
    title: "Rodinny dum v Sicilii",
    description:
      "Paty HAR soubor neodpovida zadane URL a obsahuje stejny listing jako predchozi polozka. Pro samotny deck jsem proto mohl pracovat jen s tim, co je skutecne uvnitr HARu, nikoli s pozadovanou strankou 123797105.\n\nVysledna dvojslide zachovava vizualni konzistenci cele prezentace, ale tento bod je potreba brat s rezervou: obrazova i textova data jsou z nahraneho HARu, ne z pozadovaneho odkazu.\n\nPokud dodas spravny HAR k patici, tenhle bod se da rychle nahradit bez zasahu do zbytku prezentace.",
  },
  6: {
    title: "Dum s velkou terasou v Castell'Umberto",
    description:
      "Samostatny dum v Contrada Contura u Castell'Umberto ma vyraznou venkovskou polohu a velkou terasu s otevrenym vyhledem. Fotodokumentace je mene popisana, ale po vizualni kontrole je zrejma kombinace exterieru, terasy, obytnych prostor a kuchyne.\n\nPrvni slide proto stavim na exterieru domu. Druha slide je sestavena rucne z interieru a zaberu, ktere nejlepe vysvetluji uzivani domu bez zbytecneho opakovani venkovni fasady.\n\nU teto polozky je prezentace postavena spis na realnem vizualnim dojmu nez na detailnich textovych metadatech, ktera v HARu chybi.",
  },
  7: {
    title: "Kamenny cottage s pozemkem v Tortorici",
    description:
      "Casa colonica v Contrada San Leone u Tortorici je nejvice atmosfericka polozka celeho vyberu. Jde o kamennou stavbu v prirodnim prostredi s vlastnim pozemkem a charakterem retreatu mimo bezny mestske kontext.\n\nGalerie kombinuje exterier domu, okoli, loznice a jednoduchou kuchyn. Zbytecne screenshoty nebo ciste informacni obrazky jsem z druhe slide vynechal, aby zustala cista a pusobila profesionalneji.\n\nVysledek je zamereny na autenticitu mista: prvni slide uvadi stavbu a druha ukazuje interierove pouziti a atmosferu domu.",
  },
  8: {
    title: "Mestsky dum se zahradou v Mistretta",
    description:
      "Posledni nabidka ve Via Santa Sofia v Mistretta ma pet mistnosti, dve loznice a dve koupelny. Podle galerie jde o dum, kde je dulezite spojeni mestskeho charakteru s venkovnim zazemim a mensi zahradou.\n\nV obrazove casti se objevuji loznice, koupelny, kuchyne, technicke zazemi a exterierove pohledy. Pro deck jsem jako uvodni fotografii nechal zaber, ktery nejvic nese lokaci a venkovni kontext, a interierove fotografie jsem presunul do druhe slide.\n\nDiky tomu ma posledni dvojslide stejny rytmus jako zbytek prezentace a nepusobi nahodne.",
  },
};

const OVERRIDES = {
  2: {
    title: "Terratetto unifamiliare via Vincenzo Gioberti, Castel di Lucio",
    city: "Castel di Lucio",
    address: "Via Vincenzo Gioberti",
    streetNumber: "",
    priceLabel: "55000",
    surface: "130 m2",
    rooms: "",
    bedrooms: "",
    bathrooms: "",
    description:
      "Proponiamo in vendita soluzione semindipendente su quattro livelli nel cuore del paese di Castel di Lucio, borgo incastonato nei Monti Nebrodi.",
  },
};

const HERO_OVERRIDES = {
  2: 1,
  6: 1,
  7: 10,
};

const MANUAL_GALLERY = {
  2: [2, 3, 4, 5, 10, 11],
  6: [9, 10, 12, 8, 4, 6],
  7: [1, 3, 4, 6, 8, 11],
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function compactTitle(listing) {
  const raw = cleanText(CS_COPY[listing.index]?.title || listing.title);
  if (!raw) return `Casa ${listing.index}`;
  return raw.length <= 44 ? raw : `${raw.slice(0, 41).trim()}...`;
}

function cleanupDescription(text) {
  let cleaned = cleanText(text)
    .replace(/Contattaci[\s\S]*$/i, "")
    .replace(/Per avere ulteriori informazioni[\s\S]*$/i, "")
    .replace(/Per visionare l'immobile[\s\S]*$/i, "")
    .replace(/House Immobiliare[\s\S]*$/i, "")
    .replace(/Consoli Immobiliare[\s\S]*$/i, "")
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
  return digits ? `${Number(digits).toLocaleString("cs-CZ")} EUR` : "";
}

function formatMetricValue(value) {
  const cleaned = cleanText(value);
  if (!cleaned) return "-";
  return cleaned.replace(/m²/gi, "m2").replace(/m2/gi, "m2");
}

function buildMapUrl(listing) {
  if (listing.latitude != null && listing.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${listing.latitude},${listing.longitude}`;
  }
  const query = [listing.address, listing.streetNumber, listing.city].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function normalizeCaption(caption) {
  return cleanText(caption).toLowerCase();
}

function getGalleryEntries(listing) {
  return (listing.galleryDetails || [])
    .map((item, index) => ({
      ...item,
      oneBasedIndex: index + 1,
      path: listing?.saved?.galleryPaths?.[index] || null,
      captionLc: normalizeCaption(item.caption),
    }))
    .filter((item) => item.path && fs.existsSync(item.path));
}

function pathByGalleryIndex(listing, oneBasedIndex) {
  const filePath = listing?.saved?.galleryPaths?.[oneBasedIndex - 1] || null;
  return filePath && fs.existsSync(filePath) ? filePath : null;
}

function pickHeroImage(listing) {
  const manualIndex = HERO_OVERRIDES[listing.index];
  if (manualIndex) {
    const manualPath = pathByGalleryIndex(listing, manualIndex);
    if (manualPath) return manualPath;
  }

  const details = getGalleryEntries(listing);
  const priorityGroups = [
    ["facciata", "esterno"],
    ["giardino", "terreno", "cortile", "vista", "zona"],
    ["terrazzo", "balcone", "veranda", "patio", "portico"],
  ];

  for (const group of priorityGroups) {
    const match = details.find((item) => group.some((kw) => item.captionLc.includes(kw)));
    if (match) return match.path;
  }

  const main = listing?.saved?.mainPath;
  if (main && fs.existsSync(main)) return main;
  return listing?.saved?.galleryPaths?.find((file) => file && fs.existsSync(file)) || null;
}

function scoreCaption(caption) {
  if (!caption) return 0;
  if (caption.includes("cucina") || caption.includes("angolo cottura")) return 100;
  if (caption.includes("salone") || caption.includes("soggiorno")) return 95;
  if (caption.includes("camera da letto") || caption.includes("stanza") || caption.includes("camera")) return 90;
  if (caption.includes("bagno")) return 85;
  if (caption.includes("garage") || caption.includes("box auto") || caption.includes("magazzino") || caption.includes("cantina")) return 80;
  if (caption.includes("studio") || caption.includes("ingresso") || caption.includes("corridoio") || caption.includes("scala") || caption.includes("disimpegno") || caption.includes("lavanderia")) return 70;
  if (caption.includes("interno")) return 60;
  if (caption.includes("terrazzo") || caption.includes("balcone") || caption.includes("veranda") || caption.includes("cortile")) return 35;
  if (caption.includes("facciata") || caption.includes("giardino") || caption.includes("terreno") || caption.includes("vista") || caption.includes("zona")) return -20;
  return 10;
}

function pickGalleryImages(listing) {
  const manual = MANUAL_GALLERY[listing.index];
  if (manual) {
    return manual
      .map((oneBasedIndex) => pathByGalleryIndex(listing, oneBasedIndex))
      .filter(Boolean)
      .slice(0, 6);
  }

  const hero = pickHeroImage(listing);
  const details = getGalleryEntries(listing).filter((item) => item.path !== hero);
  const chosen = [];
  const used = new Set();
  const categoryRules = [
    ["cucina", "angolo cottura"],
    ["salone", "soggiorno"],
    ["camera da letto", "stanza", "camera"],
    ["bagno"],
    ["garage", "box auto", "magazzino", "cantina"],
    ["studio", "ingresso", "corridoio", "scala", "disimpegno", "lavanderia"],
  ];

  function tryPick(ruleKeywords) {
    const match = details.find((item) => !used.has(item.path) && ruleKeywords.some((kw) => item.captionLc.includes(kw)));
    if (match) {
      chosen.push(match.path);
      used.add(match.path);
    }
  }

  categoryRules.forEach(tryPick);

  for (const item of details
    .filter((item) => !used.has(item.path))
    .sort((a, b) => scoreCaption(b.captionLc) - scoreCaption(a.captionLc))) {
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
  slide.addText("mapa", {
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

function addSlideTwo(pptx, listing) {
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
  slide.addText(cleanupDescription(CS_COPY[listing.index]?.description || listing.description), {
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

function applyOverrides(listing) {
  const override = OVERRIDES[listing.index];
  if (!override) return listing;
  return {
    ...listing,
    ...override,
  };
}

async function main() {
  const harDir = process.argv[2] || "c:\\Users\\39327\\Desktop\\temporanei\\documenti\\HAR present";
  const outPath = process.argv[3] || path.resolve("tmp", "sicilia2-selection-cs-apr-2026.pptx");
  const workDir = process.argv[4] || path.resolve("tmp", "sicilia2-selection-data");

  ensureDir(workDir);
  ensureDir(path.dirname(outPath));

  const listings = ITEMS.map((item) => {
    const listingDir = path.join(workDir, `listing-${item.index}`);
    ensureDir(listingDir);
    const extracted = extractListingData(path.join(harDir, item.har), listingDir);
    const merged = applyOverrides({
      ...item,
      ...extracted,
      title: cleanText(extracted.title),
      city: cleanText(extracted.city),
      address: cleanText(extracted.address),
      streetNumber: cleanText(extracted.streetNumber),
      description: cleanText(extracted.description),
      surface: cleanText(extracted.surface),
      rooms: cleanText(extracted.rooms),
      bedrooms: cleanText(extracted.bedrooms),
      bathrooms: cleanText(extracted.bathrooms),
      priceLabel: cleanText(extracted.priceLabel),
    });
    fs.writeFileSync(path.join(listingDir, "listing.json"), JSON.stringify(merged, null, 2));
    return merged;
  });

  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "OpenAI Codex";
  pptx.company = "OpenAI";
  pptx.subject = "Sicilia real estate selection";
  pptx.title = "Sicilia selection 2";
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
