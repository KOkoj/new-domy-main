const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const pptxgen = require("pptxgenjs");
const { extractListingData } = require("./extract-listing-data.cjs");

const ROOT = path.resolve(__dirname, "..");
const HAR_DIR = "C:\\Users\\39327\\Desktop\\har oggi";
const OUT_DIR = path.join(ROOT, "tmp", "ppt-build", "har-oggi-2026-06-11");
const OUTPUT = path.join(ROOT, "tmp", "selezione-toscana-har-oggi-2026-06-11.pptx");
const ICON_STRIP = path.join(ROOT, "tmp", "ppt-build", "extracted", "ppt", "media", "image1.png");

const ITEMS = [
  { index: 1, har: "1har.har", url: "https://www.immobiliare.it/annunci/128305114/" },
  { index: 2, har: "2har.har", url: "https://www.immobiliare.it/annunci/129351388/" },
  { index: 3, har: "3har.har", url: "https://www.immobiliare.it/annunci/120395728/" },
  { index: 4, har: "4har.har", url: "https://www.immobiliare.it/annunci/117860631/" },
  { index: 5, har: "5har.har", url: "https://www.immobiliare.it/annunci/129459540/" },
  { index: 6, har: "6har.har", url: "https://www.immobiliare.it/annunci/127002321/" },
  { index: 7, har: "7har.har", url: "https://www.immobiliare.it/annunci/125332981/" },
  { index: 8, har: "8har.har", url: "https://www.immobiliare.it/annunci/106181961/" },
  { index: 9, har: "9har.har", url: "https://www.immobiliare.it/annunci/119199405/" },
  { index: 10, har: "10har.har", url: "https://www.immobiliare.it/annunci/112697759/" },
  { index: 11, har: "11har.har", url: "https://www.immobiliare.it/annunci/88767081/" },
  { index: 12, har: "12har.har", url: "https://www.immobiliare.it/annunci/129649024/" },
];

const COLORS = {
  bg: "FFFFFF",
  text: "111111",
  muted: "5D6670",
  chip: "F2EEE8",
};

const HERO_OVERRIDES = {
  6: "gallery-3",
  11: "gallery-19",
};

const CZECH_TITLE_OVERRIDES = {
  1: "Dvoupokojový byt v Casciana Terme Lari",
  2: "Rodinný dům u Luccy",
  3: "Třípokojový byt v Ponsaccu",
  4: "Dvoupokojový byt v Montescudaiu",
  5: "Dvoupokojový byt v centru Terriccioly",
  6: "Dům v Camaiore",
  7: "Dvoupokojový byt v Altopasciu",
  8: "Dům v Bagni di Lucca",
  9: "Dům v Luglianu, Bagni di Lucca",
  10: "Třípokojový byt v Peccioli",
  11: "Dům v Massa e Cozzile",
  12: "Třípokojový byt v centru Pescii",
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanText(value) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactTitle(listing) {
  const raw = cleanText(listing.titleCs || listing.title).split("|")[0].trim();
  if (!raw) return `Immobile ${listing.index}`;
  return raw.length <= 48 ? raw : `${raw.slice(0, 45).trim()}...`;
}

function formatMetric(value) {
  return cleanText(value).replace(/m(?:\u00b2|\u00c2\u00b2)|mq/gi, "m2") || "-";
}

function formatPrice(raw) {
  const digits = String(raw || "").replace(/[^\d]/g, "");
  return digits ? `${Number(digits).toLocaleString("cs-CZ")} EUR` : "-";
}

function buildMapUrl(listing) {
  if (listing.latitude != null && listing.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${listing.latitude},${listing.longitude}`;
  }
  const query = [listing.address, listing.streetNumber, listing.city].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || listing.url)}`;
}

function numberValue(value) {
  const cleaned = String(value || "").replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
}

function czechRooms(value) {
  const n = numberValue(value);
  if (!n) return "uvedený počet místností";
  if (n === 1) return "1 místnost";
  if (n >= 2 && n <= 4) return `${n} místnosti`;
  return `${n} místností`;
}

function czechBedrooms(value) {
  const n = numberValue(value);
  if (!n) return "uvedený počet ložnic";
  if (n === 1) return "1 ložnici";
  if (n >= 2 && n <= 4) return `${n} ložnice`;
  return `${n} ložnic`;
}

function czechBathrooms(value) {
  const n = numberValue(value);
  if (!n) return "uvedený počet koupelen";
  if (n === 1) return "1 koupelnu";
  if (n >= 2 && n <= 4) return `${n} koupelny`;
  return `${n} koupelen`;
}

function czechHighlight(listing) {
  const text = `${listing.description || ""} ${(listing.galleryDetails || []).map((item) => item.caption).join(" ")}`.toLowerCase();
  const highlights = [];
  if (hasAny(text, ["giardino", "terreno", "corte", "resede"])) highlights.push("venkovní prostor nebo zahrada");
  if (hasAny(text, ["terrazzo", "balcone"])) highlights.push("terasa nebo balkon");
  if (hasAny(text, ["vista", "panorama"])) highlights.push("výhled nebo panoramatická poloha");
  if (hasAny(text, ["ristrutturat", "ottimo stato", "buono stato"])) highlights.push("dobrý stav podle inzerátu");
  if (hasAny(text, ["centro"])) highlights.push("poloha v centru nebo v dostupné části obce");
  if (!highlights.length) highlights.push("základní parametry vhodné k dalšímu prověření");
  return highlights.slice(0, 2).join(" a ");
}

function czechDescription(listing) {
  const surface = formatMetric(listing.surface);
  const price = formatPrice(listing.priceLabel);
  const place = [listing.city, listing.address, listing.streetNumber].filter(Boolean).join(", ");
  const title = compactTitle(listing);
  return `${title} se nachází v lokalitě ${place || listing.city || "Toskánsko"}. Nemovitost má podle inzerátu ${surface}, ${czechRooms(listing.rooms)}, ${czechBedrooms(listing.bedrooms)} a ${czechBathrooms(listing.bathrooms)}. Požadovaná cena je ${price}. Hlavním bodem k posouzení je ${czechHighlight(listing)}. Před dalším krokem je vhodné ověřit technický stav, dokumentaci, reálné náklady a přesnou situaci na místě při osobní prohlídce.`;
}

function shortDescription(listing) {
  const text = cleanText(listing.descriptionCs || listing.description)
    .replace(/Contattaci[\s\S]*$/i, "")
    .replace(/Per informazioni[\s\S]*$/i, "")
    .replace(/Chiama[\s\S]*$/i, "")
    .trim();
  if (text.length <= 1160) return text;

  const sentences = text.split(/(?<=[.!?])\s+/);
  const kept = [];
  for (const sentence of sentences) {
    const next = [...kept, sentence].join(" ");
    if (next.length > 1160) break;
    kept.push(sentence);
  }
  return kept.join(" ").trim() || `${text.slice(0, 1157).trim()}...`;
}

function imageEntries(listing) {
  const entries = [];
  const add = (filePath, caption, role) => {
    if (!filePath || !fs.existsSync(filePath)) return;
    if (entries.some((item) => item.path === filePath)) return;
    const hash = crypto.createHash("sha1").update(fs.readFileSync(filePath)).digest("hex");
    entries.push({
      path: filePath,
      caption: cleanText(caption).toLowerCase(),
      role,
      hash,
    });
  };

  add(listing.saved?.mainPath, listing.galleryDetails?.[0]?.caption, "main");
  (listing.saved?.galleryPaths || []).forEach((file, index) => {
    add(file, listing.galleryDetails?.[index]?.caption, "gallery");
  });
  add(listing.saved?.planPath, "planimetria", "plan");
  return entries.filter((item) => item.role !== "plan");
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

function hasAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function heroScore(item) {
  const caption = item.caption;
  let score = item.role === "main" ? 30 : 0;
  if (hasAny(caption, ["facciata", "esterno", "vista", "panorama", "giardino", "terrazzo", "balcone", "corte", "resede"])) score += 100;
  if (hasAny(caption, ["soggiorno", "salone", "living"])) score += 32;
  if (hasAny(caption, ["cucina"])) score += 20;
  if (hasAny(caption, ["camera", "bagno", "corridoio", "scala"])) score -= 18;
  return score;
}

function pickHeroImage(listing) {
  const entries = dedupeImageEntries(imageEntries(listing));
  const override = HERO_OVERRIDES[listing.index];
  if (override) {
    const match = entries.find((item) => path.basename(item.path, path.extname(item.path)) === override);
    if (match) return match.path;
  }
  return entries.slice().sort((a, b) => heroScore(b) - heroScore(a))[0]?.path || null;
}

function galleryScore(caption) {
  if (hasAny(caption, ["cucina", "angolo cottura"])) return 100;
  if (hasAny(caption, ["soggiorno", "salone", "living", "zona giorno"])) return 96;
  if (hasAny(caption, ["camera", "stanza"])) return 92;
  if (hasAny(caption, ["bagno"])) return 88;
  if (hasAny(caption, ["terrazzo", "balcone", "giardino", "corte", "resede", "vista"])) return 78;
  if (hasAny(caption, ["facciata", "esterno"])) return 62;
  if (hasAny(caption, ["ingresso", "scala", "corridoio", "disimpegno"])) return 45;
  return 55;
}

function pickGalleryImages(listing) {
  const hero = pickHeroImage(listing);
  const heroHash = imageEntries(listing).find((item) => item.path === hero)?.hash;
  const entries = dedupeImageEntries(imageEntries(listing)).filter((item) => item.path !== hero && item.hash !== heroHash);
  const chosen = [];
  const used = new Set();
  const rules = [
    ["cucina", "angolo cottura"],
    ["soggiorno", "salone", "living", "zona giorno"],
    ["camera", "stanza"],
    ["bagno"],
    ["studio", "lavanderia", "cantina", "mansarda"],
    ["ingresso", "scala", "corridoio", "disimpegno", "interno appartamento"],
    ["terrazzo", "balcone", "giardino", "corte", "resede"],
  ];

  for (const rule of rules) {
    const match = entries.find((item) => !used.has(item.path) && hasAny(item.caption, rule));
    if (!match) continue;
    chosen.push(match.path);
    used.add(match.path);
    if (chosen.length >= 6) break;
  }

  for (const item of entries.slice().sort((a, b) => galleryScore(b.caption) - galleryScore(a.caption))) {
    if (chosen.length >= 6) break;
    if (used.has(item.path)) continue;
    chosen.push(item.path);
    used.add(item.path);
  }

  const fallback = entries
    .filter((item) => !hasAny(item.caption, ["facciata", "esterno", "vista", "panorama"]))
    .concat(entries.filter((item) => hasAny(item.caption, ["facciata", "esterno", "vista", "panorama"])));
  for (const item of fallback) {
    if (chosen.length >= 6) break;
    const file = item.path;
    if (!used.has(file)) {
      chosen.push(file);
      used.add(file);
    }
  }

  return chosen.slice(0, 6);
}

function addImageIfExists(slide, filePath, options) {
  if (filePath && fs.existsSync(filePath)) {
    slide.addImage({ path: filePath, ...options });
    return;
  }
  slide.addShape("rect", {
    x: options.x,
    y: options.y,
    w: options.w,
    h: options.h,
    fill: { color: "F0F0F0" },
    line: { color: "F0F0F0" },
  });
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
  const metricStyle = {
    fontFace: "Aptos",
    fontSize: 18,
    color: COLORS.text,
    margin: 0,
    valign: "mid",
    align: "left",
  };
  slide.addText(formatMetric(listing.surface), { x: metricX, y: 1.72, w: 1.45, h: 0.36, ...metricStyle });
  slide.addText(formatMetric(listing.rooms), { x: metricX, y: 2.56, w: 1.45, h: 0.36, ...metricStyle });
  slide.addText(formatMetric(listing.bedrooms), { x: metricX, y: 3.39, w: 1.45, h: 0.36, ...metricStyle });
  slide.addText(formatMetric(listing.bathrooms), { x: metricX, y: 4.24, w: 1.45, h: 0.36, ...metricStyle });
  slide.addText("mappa", {
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
    y: 1.25,
    w: 4.78,
    h: 5.48,
    fontFace: "Aptos",
    fontSize: 12.2,
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
      titleCs: CZECH_TITLE_OVERRIDES[item.index],
      city: cleanText(data.city),
      address: cleanText(data.address),
      streetNumber: cleanText(data.streetNumber),
      description: cleanText(data.description),
      descriptionCs: "",
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
  listings.forEach((listing) => {
    listing.descriptionCs = czechDescription(listing);
  });

  pptx.subject = "Výběr nemovitostí z HAR Immobiliare.it";
  pptx.title = "Výběr Toskánsko - červen 2026";
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
