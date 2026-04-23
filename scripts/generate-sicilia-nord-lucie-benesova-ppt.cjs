const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const { extractListingData } = require("./extract-listing-data.cjs");

const SOURCES = [
  { index: 1, type: "har", har: "sicilia 1.har", url: "https://www.immobiliare.it/annunci/112298811/" },
  { index: 2, type: "cache", cacheJson: path.resolve("tmp", "sicilia2-selection-data", "listing-3", "listing.json") },
  { index: 3, type: "cache", cacheJson: path.resolve("tmp", "sicilia2-selection-data", "listing-5", "listing.json") },
  { index: 4, type: "cache", cacheJson: path.resolve("tmp", "sicilia2-selection-data", "listing-6", "listing.json") },
  { index: 5, type: "har", har: "sicilia 5.har", url: "https://www.immobiliare.it/annunci/126294473/" },
  { index: 6, type: "cache", cacheJson: path.resolve("tmp", "sicilia2-selection-data", "listing-8", "listing.json") },
  { index: 7, type: "har", har: "sicilia 7.har", url: "https://www.immobiliare.it/annunci/114323467/" },
];

const COLORS = { bg: "FFFFFF", text: "111111", sub: "4A4A4A" };
const ICON_STRIP = path.resolve("tmp", "ppt-build", "extracted", "ppt", "media", "image1.png");

const CS_COPY = {
  1: {
    title: "Dum na ctyrech urovnich v Castel di Lucio",
    description:
      "Semindependentni dum lezi v historicke casti Castel di Lucio, v obci zasazene do pohori Nebrodi. Inzerat popisuje dispozici na ctyrech urovnich: v prizemi otevreny obytny prostor, pokoj, sklad a koupelna, v prvnim patre dalsi pokoj a salonek, ve druhem patre kuchyne, koupelna a panoramaticka terasa, v suterenu pak sklep.\n\nNemovitost je podle puvodniho textu v dobrem stavu, velmi svetla a otevrena do krajiny. Je vhodna pro klienta, ktery hleda obyvatelny dum v autentickem sicilskem mestecku s vyhledy a viceurovnovou dispozici.",
  },
  2: {
    title: "Viceurovnovy dum blizko nemocnice v Mistretta",
    description:
      "Tento dum ve Via Santissimo Rosario v Mistretta stoji nedaleko nemocnice San Salvatore a je rozdelen do tri podlazi propojenych tocitym schodistem. V prvnim patre je vstup, loznice, koupelna a balkon. Ve druhem patre navazuje kuchyne, obytny pokoj s jidelnou, mensi koupelna a dva balkony. V polosuterenu je sklep a sklad.\n\nPodle puvodniho inzeratu je interier ve velmi dobrem stavu, jiz zarizeny a ihned obyvatelny. Prave jasna dispozice a hotovy stav delaji z domu zajimavou volbu jak pro vlastni bydleni, tak pro jednoduchy druhy domov na Sicilii.",
  },
  3: {
    title: "Panoramaticky dum ve Via dei Grifoni",
    description:
      "Samostatny dum v Alcara li Fusi se rozklada na ctyrech urovnich a ma uzitnou plochu zhruba 135 m2. V castecne polosuterennim podlazi je kuchyne a koupelna, v dalsi casti prizemi obytny pokoj. V prvnim a druhem patre jsou tri loznice a dve koupelny.\n\nPuvodni text zduraznuje tri volne strany a velmi otevreny vyhled do udoli Parco dei Nebrodi, diky kteremu jsou mistnosti svetle a dobre vetrane. Vyhodou je i poloha zhruba patnact minut jizdy od Sant'Agata di Militello.",
  },
  4: {
    title: "Zrekonstruovany dum s garazi v Castell'Umberto",
    description:
      "Nemovitost v Contrada Contura je dum na dvou podlazich s dalsi terasou, ke kteremu patri garaz i sklad. Puvodni inzerat uvadi nedavnou rekonstrukci, centralni topeni na drevo s radiatory, okna z PVC s tepelnym prerusenim, dva bezpecnostni vstupy a mramorove podlahy.\n\nJde tedy o technicky upraveny dum s uzitecnym zazemim, ktery nestoji jen na poloze, ale i na jiz provedenych investicich do konstrukce a vybaveni. Kontaktni telefon z puvodniho textu jsem z popisu vynechal.",
  },
  5: {
    title: "Kamenny domek pod Monte Santo Pietro",
    description:
      "Stara kamena casetta v Contrada San Leone u Tortorici stoji na upati hory Santo Pietro a je obklopena liskovymi sady a lesnim porostem. Inzerat ji popisuje jako rucne opracovany kamenny dum s velmi atmosferickou polohou v prirode.\n\nSoucasti puvodni nabidky je i poznamka, ze nemovitost lze dale vyuzivat pro sezonni pronajem jako rekreacni dum. Je to tedy spis specificka lifestylova nabidka pro klienta, ktery hleda klid, charakter a prirodni okoli, ne klasicke mestske bydleni.",
  },
  6: {
    title: "Viceurovnovy dum s vyhledem v Mistretta",
    description:
      "Dum ve Via Santa Sofia 58 lezi v centralni casti Mistretty s otevrenym pohledem do udoli a na mesto. Popis uvadi obytnou plochu priblizne 131 m2 rozlozenou do tri urovni, celkem pet mistnosti, dve prostorne loznice a dve koupelny.\n\nNemovitost je vedena jako obyvatelna, i kdyz s drobnejsimi upravami technickych instalaci a servisu. Inzerat zaroven zminuje snadné parkovani v okoli a potencial pro menší prestavbu na B&B, k cemuz nahrava jak poloha, tak vyhledy.",
  },
  7: {
    title: "Centralni dum na peti urovnich v Tortorici",
    description:
      "Novy doplneny listing lezi primo v centru Tortorici a je rozlozen do peti urovni. Puvodni text uvadi tri loznice, koupelnu, kuchyni, obytny pokoj a dalsi ctyri mistnosti, z nichz dve slouzi jako sklepni zazemi. Dum ma dvojity vstup a siroke balkony na obou stranach s otevrenym vyhledem.\n\nPodle inzeratu byl dum nedavno rekonstruovan a ma autonomni topeni, okna z PVC s dvojsklem a pripravu na kominovy pruchod. Je to plnohodnotny mestsky dum s velkou kapacitou mistnosti a dobrym technickym zakladem.",
  },
};

const HERO_OVERRIDES = {
  4: 1,
  5: 10,
  7: 1,
};

const MANUAL_GALLERY = {
  4: [9, 10, 12, 8, 4, 6],
  5: [1, 3, 4, 6, 8, 11],
  7: [2, 4, 5, 6, 9, 10],
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeStoredPath(filePath) {
  if (!filePath) return null;
  return path.isAbsolute(filePath) ? filePath : path.resolve(filePath);
}

function normalizeListing(raw) {
  const listing = { ...raw };
  listing.title = cleanText(listing.title);
  listing.city = cleanText(listing.city);
  listing.address = cleanText(listing.address);
  listing.streetNumber = cleanText(listing.streetNumber);
  listing.description = cleanText(listing.description);
  listing.surface = cleanText(listing.surface).replace(/mÂ˛/gi, "m²");
  listing.rooms = cleanText(listing.rooms);
  listing.bedrooms = cleanText(listing.bedrooms);
  listing.bathrooms = cleanText(listing.bathrooms);
  listing.priceLabel = cleanText(listing.priceLabel);
  listing.saved = {
    planPath: normalizeStoredPath(listing?.saved?.planPath),
    mainPath: normalizeStoredPath(listing?.saved?.mainPath),
    galleryPaths: (listing?.saved?.galleryPaths || []).map(normalizeStoredPath),
  };
  return listing;
}

function loadCachedListing(cacheJson) {
  return normalizeListing(JSON.parse(fs.readFileSync(cacheJson, "utf8")));
}

function loadHarListing(harDir, workDir, source) {
  const listingDir = path.join(workDir, `listing-${source.index}`);
  ensureDir(listingDir);
  const extracted = extractListingData(path.join(harDir, source.har), listingDir);
  return normalizeListing({
    index: source.index,
    har: source.har,
    url: source.url,
    ...extracted,
  });
}

function compactTitle(listing) {
  const raw = cleanText(CS_COPY[listing.index]?.title || listing.title);
  if (!raw) return `Casa ${listing.index}`;
  return raw.length <= 44 ? raw : `${raw.slice(0, 41).trim()}...`;
}

function cleanupDescription(text) {
  return cleanText(text)
    .replace(/\b\d(?:[\s-]?\d){5,}\b/g, "")
    .replace(/agenzia immobiliare/gi, "")
    .replace(/progetto casa/gi, "")
    .replace(/house immobiliare/gi, "")
    .replace(/consoli immobiliare/gi, "")
    .trim();
}

function formatPrice(raw) {
  const digits = String(raw || "").replace(/[^\d]/g, "");
  return digits ? `${Number(digits).toLocaleString("cs-CZ")} EUR` : "";
}

function formatMetricValue(value) {
  const cleaned = cleanText(value);
  return cleaned || "-";
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
    return manual.map((oneBasedIndex) => pathByGalleryIndex(listing, oneBasedIndex)).filter(Boolean).slice(0, 6);
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

function addCoverSlide(pptx) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bg };
  slide.addText("Area di ricerca", {
    x: 0.8,
    y: 1.1,
    w: 5.8,
    h: 0.9,
    fontFace: "Aptos Display",
    fontSize: 28,
    bold: true,
    color: COLORS.text,
    margin: 0,
  });
  slide.addText("Sicilia Nord", {
    x: 0.8,
    y: 2.05,
    w: 4.2,
    h: 0.55,
    fontFace: "Aptos",
    fontSize: 18,
    color: COLORS.sub,
    margin: 0,
  });
  slide.addText("Deck aggiornato con descrizioni riscritte dai testi originali dei listing, senza recapiti telefonici o nomi di agenzie.", {
    x: 0.8,
    y: 3.15,
    w: 6.0,
    h: 1.2,
    fontFace: "Aptos",
    fontSize: 16,
    color: COLORS.text,
    margin: 0,
    fit: "shrink",
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

async function main() {
  const harDir = process.argv[2] || "c:\\Users\\39327\\Desktop\\temporanei\\documenti\\HAR present";
  const outPath = process.argv[3] || path.resolve("tmp", "sicilia-nord-lucie-benesova-corrected.pptx");
  const workDir = process.argv[4] || path.resolve("tmp", "sicilia-nord-lucie-benesova-data");

  ensureDir(workDir);
  ensureDir(path.dirname(outPath));

  const listings = SOURCES.map((source) => {
    let listing;
    if (source.type === "cache") {
      listing = loadCachedListing(source.cacheJson);
      listing.index = source.index;
    } else {
      listing = loadHarListing(harDir, workDir, source);
    }
    const listingDir = path.join(workDir, `listing-${source.index}`);
    ensureDir(listingDir);
    fs.writeFileSync(path.join(listingDir, "listing.json"), JSON.stringify(listing, null, 2));
    return listing;
  });

  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "OpenAI Codex";
  pptx.company = "OpenAI";
  pptx.subject = "Sicilia Nord real estate selection";
  pptx.title = "Sicilia Nord - Lucie Benesova";
  pptx.lang = "cs-CZ";
  pptx.theme = { headFontFace: "Aptos Display", bodyFontFace: "Aptos", lang: "cs-CZ" };

  addCoverSlide(pptx);
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
