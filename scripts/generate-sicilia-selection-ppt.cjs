const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const { extractListingData } = require("./extract-listing-data.cjs");

const ITEMS = [
  { index: 1, har: "Sicilia 1 lucie.har", url: "https://www.immobiliare.it/annunci/113158887/" },
  { index: 2, har: "Sicilia 2 lucie.har", url: "https://www.immobiliare.it/annunci/125159409/" },
  { index: 3, har: "Sicilia 3 lucie.har", url: "https://www.immobiliare.it/annunci/116825197/" },
  { index: 4, har: "Sicilia 4 lucie.har", url: "https://www.immobiliare.it/annunci/125914467/" },
  { index: 5, har: "Sicilia 5 lucie.har", url: "https://www.immobiliare.it/annunci/120505258/" },
  { index: 6, har: "Sicilia 6 lucie.har", url: "https://www.immobiliare.it/annunci/124764525/" },
  { index: 7, har: "Sicilia 7 lucie.har", url: "https://www.immobiliare.it/annunci/128102960/" },
];

const COLORS = { bg: "FFFFFF", text: "111111" };
const ICON_STRIP = path.resolve("tmp", "ppt-build", "extracted", "ppt", "media", "image1.png");

const CS_COPY = {
  1: {
    title: "Samostatny dum po rekonstrukci s panoramatickou terasou v Gaggi",
    description:
      "V historicke casti Borgo Cavallaro v Gaggi se prodava samostatny dum rozdeleny do tri podlazi, po rekonstrukci a vhodny i pro rekreacni vyuziti. Lokalita ma charakter uzkych ulicek a autenticke sicilske atmosf ery, zaroven je v dosahu Giardini Naxos i Taorminy.\n\nV prizemi je prostorny vstup, pokoj a komora pod schodistem. Druhe podlazi tvori kuchyne, obyvak a koupelna. V poslednim podkrovnim podlazi je dalsi velky pokoj s drevenym krovem, balkon do ulice a panoramaticka terasa s vyhledem na okolni kopce, kostel i Etnu.\n\nNemovitost je zajimava jak pro vlastni vyuziti, tak jako budouci holiday house v atraktivni casti vychodni Sicilie.",
  },
  2: {
    title: "Dreveny venkovsky dum s pozemkem v Casalvecchio Siculo",
    description:
      "V klidne a soukrome casti Casalvecchio Siculo se nachazi dreveny venkovsky dum z roku 2015 postaveny na dvou podlazich. Nemovitost je obklopena pozemkem o rozloze priblizne 1 720 m2 a ma primy prijezd i vyrazny potencial pro dalsi zvelebeni.\n\nV prizemi je velky obytny prostor s kuchynskym koutem, koupelna a prostor pod schody. V hornim podlazi je nocni cast s balkonem a vyhledem do kopcu. Venku je kryta zona s venkovni kuchyni a peci na drevo, ktera z nemovitosti dela prijemne misto pro pobyt i oddech.\n\nV tomto HARu prevažuje dokumentace exterieru a pozemku, ale jako rustikalni retreat pusobi nabidka velmi presvedcive.",
  },
  3: {
    title: "Velky dum se zahradou a garazi v Mascali Santa Venera",
    description:
      "Ve zvysene a panoramaticke casti Santa Venera u Mascali se nabizi samostatny dum o velke plose, rozdeleny prakticky do dvou podobnych jednotek. Nemovitost je urcena k rekonstrukci, ale ma dobry zaklad pro rodinne bydleni i investicni prestavbu.\n\nPrvni cast ma pristup po venkovnim schodisti do velkeho salonu, navazuje pokoj, koupelna a kuchyne se vstupem na terasu a do zadni zahradky. Druha cast ma samostatny vstup, dalsi salon, pokoj, koupelnu, komoru a prostornou kuchyni. Soucasti je i dalsi panoramaticka terasa.\n\nPod domem je garaz kolem 15 m2 a sklep. Silnou strankou je poloha, vyhledy a moznost vytvorit vicefunkcni sicilske bydleni.",
  },
  4: {
    title: "Dvojity mestsky dum s dvorem a terasou v Linguaglossa",
    description:
      "V centru Linguaglossy se prodava samostatny dum se dvema pristupy z Largo dei Procuratori a Via Malborgo. Fakticky jde o dve oddelene bytove jednotky propojene vnitrnim dvorem, coz dava nabidce zajimavou flexibilitu.\n\nPrvni cast zahrnuje vstup do kuchyne, koupelnu, dalsi mistnost a loznici orientovanou do vnitrniho dvora. Druha cast ma velky vstupni pokoj, loznici s en-suite koupelnou a v hornim podlazi dalsi kuchyni, manzelskou loznici s vyhledem, druhou koupelnu a mensi pokoj.\n\nNad nemovitosti je terasa s otevrenym vyhledem. Dum potrebuje beznou udrzbu, ale poloha v pesim dosahu sluzeb je velmi dobra.",
  },
  5: {
    title: "Velky mestsky dum s terasou v centru Gaggi",
    description:
      "Pata nabidka je velka samostatna casa singola ve Via Umberto I v Gaggi, tedy primo v centralni casti obce jen par kroku od namesti a zakladnich sluzeb. Z trackeru a galerie je patrne, ze jde o viceurovnovy dum v dobrem stavu s venkovnimi prostory a plochou kolem 260 m2.\n\nK dispozici je terasa a balkon, nabidka je vedena jako terratetto unifamiliare a pusobi jako nemovitost vhodna jak pro vlastni bydleni, tak pro budoucnost orientovanou na rekreacni pronajem. Cena je nastavena velmi nizko vzhledem k velikosti domu.\n\nHAR neobsahuje kompletni text stranky, ale galerie a metadata potvrzuji zajimavou centralni polohu i velkorysou plochu.",
  },
  6: {
    title: "Zrekonstruovany dum s vnitrnim dvorem v Piedimonte Etneo",
    description:
      "V casti Presa di Piedimonte Etneo, nedaleko mistniho namesti a v prijemnem letnim klimatu, se prodava samostatny prizemni dum po kompletni rekonstrukci. Lokalita je klidna, kopcovita a zaroven dobre dostupna od more i okolnich obci.\n\nDispozice zahrnuje prostornou loznici s malou komorou vhodnou jako satna, koupelnu, pradelni cast a pohodlnou kuchyn s obyvacim prostorem. Odtud je vstup do vnitrniho dvora a zahrady o plose kolem 120 m2. Soucasti vlastnictvi je i samostatny sklad nebo sklep kolem 15 m2.\n\nVelkou vyhodou je termokrb napojeny na radiatory a velmi dobry technicky stav bez potreby okamzitych zasahu.",
  },
  7: {
    title: "Lesni cottage pod Etnou s rozsahlym pozemkem v Ragalna",
    description:
      "V kontrade Milia v Ragalna, na ubo ci Etny, se nabizi prijemny cottage o velikosti asi 70 m2 zasazeny do lesa a soukromi. Pozemek ma priblizne 4 463 m2 a je osazen ovocnymi stromy, kastany i dalsi zeleni typickou pro tuto cast Sicilie.\n\nSamotny dum je podle inzeratu v dobrem stavu a uvnitr ma utulny obyvak s rozkladaci pohovkou, funkcni kuchyn, prostornou manzelskou loznici a mensi patro s dalsim luzkem. Atmosferu doplnuje funkcni krb na drevo, kamna a prakticke sitky proti hmyzu.\n\nNemovitost ma zasobu vody asi 7 000 litru i solarni panely. Jde o velmi specificky prirodni retreat s autentickou atmosferou.",
  },
};

const OVERRIDES = {
  5: {
    title: "Terratetto unifamiliare via Umberto I, Gaggi",
    city: "Gaggi",
    address: "Via Umberto I",
    streetNumber: "",
    priceLabel: "73000",
    surface: "260 m²",
    rooms: "5+",
    bedrooms: "",
    bathrooms: "2",
    description:
      "Al centro di Gaggi, a due passi dalla piazza centrale e dalle attività di prima necessità, l’agenzia immobiliare Progetto Casa propone in vendita grande casa singola posta direttamente sulla via.",
  },
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
    .replace(/Per informazioni più dettagliate[\s\S]*$/i, "")
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
  const squareMeterVariants = ["m\u00B2", "m\u00C2\u00B2"];
  return squareMeterVariants.reduce(
    (normalized, variant) => normalized.replace(variant, "m2"),
    cleaned
  );
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
      path: listing?.saved?.galleryPaths?.[index] || null,
      captionLc: normalizeCaption(item.caption),
    }))
    .filter((item) => item.path && fs.existsSync(item.path));
}

function pickHeroImage(listing) {
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
  if (caption.includes("corridoio") || caption.includes("scala") || caption.includes("disimpegno") || caption.includes("interno")) return 60;
  if (caption.includes("terrazzo") || caption.includes("balcone") || caption.includes("veranda") || caption.includes("cortile")) return 50;
  if (caption.includes("facciata") || caption.includes("giardino") || caption.includes("terreno") || caption.includes("vista") || caption.includes("zona")) return 35;
  return 20;
}

function pickGalleryImages(listing) {
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
    ["corridoio", "scala", "disimpegno", "interno", "terrazzo", "balcone", "cortile"],
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
  const outPath = process.argv[3] || path.resolve("tmp", "sicilia-selection-cs-apr-2026.pptx");
  const workDir = process.argv[4] || path.resolve("tmp", "sicilia-selection-data");

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
  pptx.title = "Sicilia selection";
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
