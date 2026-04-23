const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const { extractListingData } = require("./extract-listing-data.cjs");

const ITEMS = [
  { index: 1, har: "1 url puglia.har", url: "https://www.immobiliare.it/annunci/118267951/" },
  { index: 2, har: "2 url puglia.har", url: "https://www.immobiliare.it/annunci/127327727/" },
  { index: 3, har: "3 url puglia.har", url: "https://www.immobiliare.it/annunci/127534812/" },
  { index: 4, har: "4 url puglia.har", url: "https://www.immobiliare.it/annunci/125988223/" },
  { index: 5, har: "5 url puglia.har", url: "https://www.immobiliare.it/annunci/109908967/" },
  { index: 6, har: "6 url puglia.har", url: "https://www.immobiliare.it/annunci/122465198/" },
  { index: 7, har: "7 url puglia.har", url: "https://www.immobiliare.it/annunci/126579387/" },
  { index: 8, har: "8 url puglia.har", url: "https://www.immobiliare.it/annunci/120021298/" },
  { index: 9, har: "9 url puglia.har", url: "https://www.immobiliare.it/annunci/121452730/" },
];

const COLORS = { bg: "FFFFFF", text: "111111" };
const ICON_STRIP = path.resolve("tmp", "ppt-build", "extracted", "ppt", "media", "image1.png");

const CS_COPY = {
  1: {
    title: "Viceurovnovy dum v Latiano za dostupnou cenu",
    description:
      "Prvni nemovitost v Latiano je viceurovnovy terratetto s peti mistnostmi, dvema loznicemi a obytnym zazemim vhodnym pro trvale bydleni i levnejsi investicni vstup do Apulie. Galerie ukazuje salon, kuchyni, loznice i koupelnu, takze druhou slide lze slozit z opravdu vypovidajicich interieru.\n\nJde o praktickou mestskou nemovitost s klasickym pudorysem a jasne ctenou dispozici.",
  },
  2: {
    title: "Villetta u Ostuni s venkovnim zazemim",
    description:
      "Druha nabidka je samostatna vila v oblasti Ostuni, priblizne 5,5 km od centra mesta. Podle popisu ma obyvaci prostor, loznici, koupelnu a dalsi navazujici cast, ktera dava domu flexibilitu pro rekreacni uzivani i mensi rodinne bydleni.\n\nVelkou roli zde hraje okoli domu a terasa, proto prvni slide stavi na exterieru a druha ukazuje hlavni vnitrni mistnosti bez opakovani uvodni fotografie.",
  },
  3: {
    title: "Vila s trullem ve Valle d'Itria",
    description:
      "Treti polozka u Martina Franca je semindependentni vila s trullem a pozemkem ve velmi charakteristicke casti Valle d'Itria. Nemovitost je urcena k rekonstrukci, ale uz samotna kombinace klasicke stavby a trulla dava projektu silny architektonicky potencial.\n\nV prezentaci je dulezite ukazat nejen obytnou cast, ale i autenticitu mista a venkovni kontext.",
  },
  4: {
    title: "Rustikalni dum s verandou u Martina Franca",
    description:
      "Ctvrta nemovitost je mensi rustico na adrese Via Locorotondo v Martina Franca. Nabizi verandu, teren a klidne venkovske zasazeni, ktere je pro tuto oblast typicke.\n\nU tohoto bodu galerie v HARu nebyla bohata na popisky, proto druha slide drzi to nejvypovidajici z dostupnych zaberu a zachovava cisty rytmus cele prezentace.",
  },
  5: {
    title: "Terratetto s vlastni zahradkou v Ceglie Messapica",
    description:
      "Pata nabidka ve Via Sant'Aurelia v Ceglie Messapica je vicepodlazni samostatny dum o plose 166 m2 se soukromou zahradkou. To je na historicke a kompaktni casti mesta velmi zajimava kombinace, ktera muze oslovit jak rodinu, tak klienta hledajiciho vice prostoru v autenticte lokalite.\n\nNemovitost pusobi jako solidni mestska reseni s dobrym venkovnim bonusem.",
  },
  6: {
    title: "Historicky dum se dvema vstupy v Putignano",
    description:
      "Sesta polozka v historickem centru Putignana zaujme dvojim vstupem a moznosti rozdelit dispozici do dvou samostatne fungujicich jednotek. V nabidce jsou tri loznice a dve koupelny, coz z ni dela zajimavou kombinaci pro soukrome bydleni i kratkodobe pronajmy.\n\nDruha slide je slozena predevsim z interierovych fotografii, aby vynikla logika vnitrniho usporadani.",
  },
  7: {
    title: "Kamenny mestsky dum s terasou v Castellana Grotte",
    description:
      "Sedmy listing je charakterovy terratetto v samem srdci historickeho centra Castellana Grotte. Dum je rozlozen do tri urovni a spojuje kamen, svetlo a typicky apulsky charakter s privatni terasou na vrcholu domu.\n\nJe to presne ten typ nemovitosti, kde druhou slide maji tvorit hlavne kuchyn, loznice, koupelna a pracovni nebo relaxacni zona, ne jen nahodne exteriery.",
  },
  8: {
    title: "Panoramaticka venkovska vila u Putignano",
    description:
      "Osma nemovitost je venkovska vila v panoramaticke poloze u Putignano s terasou, salonem s krbem, kuchyni, dvema loznicemi a hospodarskym zazemim v prizemi. Pozemek s olivami a ovocnymi stromy pridava velmi silny rekreacni potencial.\n\nV prezentaci funguje nejlepe klasicka sekvence: exterier na prvni slide, interierove mistnosti na druhe.",
  },
  9: {
    title: "Rustico s pozemkem v kampani u Carovigno",
    description:
      "Posledni polozka je rustico v Contrada Parco Grande u Carovigno s pozemkem kolem 6 500 m2. Dům je k dokonceni a kombinuje jednoduchou obytnou cast s velkym venkovnim potencialem, terasou a hospodarskymi prostory.\n\nJe to silne pozemkova a lifestylova nabidka, ktera muze oslovit klienta hledajiciho klid, soukromi a moznost dotvorit si dum podle sebe.",
  },
};

const URL_FALLBACKS = {
  8: {
    url: "https://www.immobiliare.it/annunci/120021298/",
    title: "Villa unifamiliare Strada Comunale Corcione 18, Putignano",
    city: "Putignano",
    description:
      "Splendida casa di campagna posizione panoramica. La villa e disposta su due livelli per un totale di circa 75 mq, con veranda panoramica, salone con camino, cucina, due camere da letto, garage e magazzino. Il terreno di circa 6000 mq con ulivi e alberi da frutto rafforza il profilo ricreativo e l'uso come casa vacanza o investimento.",
    priceLabel: "EUR 90.000",
    surface: "100 m²",
    rooms: "3",
    bedrooms: "2",
    bathrooms: "1",
    galleryDetails: [],
  },
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(text) {
  return String(text || "")
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function getNextData(html) {
  const match = html.match(/<script[^>]+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
  return match ? JSON.parse(match[1]) : null;
}

function extractLabel(value) {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") {
    return value.label || value.value || value.name || value.formatted || value.text || "";
  }
  return "";
}

function selectImageVariant(urls = {}) {
  return urls.xxl || urls.large || urls.medium || urls.photo || urls.image || urls.m || urls["m-c"] || urls["cover-m-c"] || urls.small || urls.thumb || null;
}

async function fetchBuffer(url) {
  const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

function extFromContentType(type, url) {
  if (/png/i.test(type) || /\.png($|\?)/i.test(url)) return ".png";
  if (/webp/i.test(type) || /\.webp($|\?)/i.test(url)) return ".webp";
  return ".jpg";
}

async function downloadImage(url, outDir, basename) {
  const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const ext = extFromContentType(response.headers.get("content-type") || "", url);
  const filePath = path.join(outDir, `${basename}${ext}`);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

function extractListingFromPageProps(pageProps, fallbackUrl) {
  const realEstate = pageProps?.detailData?.realEstate || {};
  const property = realEstate?.properties?.[0] || {};
  const multimedia = property.multimedia || {};
  const photoItemsRaw = Array.isArray(multimedia.photos) ? multimedia.photos : [];

  const galleryDetails = photoItemsRaw
    .map((item) => ({
      type: item?.type || null,
      caption: normalizeWhitespace(item?.caption || ""),
      url: selectImageVariant(item?.urls || {}),
    }))
    .filter((item) => item.url);

  return {
    url: pageProps?.detailData?.seo?.canonical || fallbackUrl,
    title: normalizeWhitespace(realEstate.title || pageProps?.detailData?.seo?.openGraph?.title || ""),
    city: normalizeWhitespace(property.location?.city || property.location?.label || ""),
    zone: normalizeWhitespace(property.location?.zone || ""),
    address: normalizeWhitespace(property.location?.address || ""),
    streetNumber: normalizeWhitespace(property.location?.streetNumber || ""),
    latitude: property.location?.latitude ?? null,
    longitude: property.location?.longitude ?? null,
    description: normalizeWhitespace(property.description || property.defaultDescription || pageProps?.detailData?.seo?.openGraph?.description || ""),
    priceLabel: normalizeWhitespace(extractLabel(realEstate.price) || extractLabel(property.price)),
    surface: normalizeWhitespace(extractLabel(property.surface) || extractLabel(property.surfaceValue)),
    rooms: normalizeWhitespace(extractLabel(property.rooms) || extractLabel(property.roomsValue)),
    bedrooms: normalizeWhitespace(extractLabel(property.bedRoomsNumber)),
    bathrooms: normalizeWhitespace(extractLabel(property.bathrooms)),
    galleryDetails,
  };
}

function decodeHarEscapes(text) {
  return String(text || "")
    .replace(/\\u003c/g, "<")
    .replace(/\\u003e/g, ">")
    .replace(/\\u0026/g, "&")
    .replace(/\\\//g, "/")
    .replace(/\\"/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");
}

function extractMeta(raw, name) {
  const match = raw.match(new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"));
  return decodeHarEscapes(match?.[1] || "");
}

function extractTitleBits(ogTitle) {
  const clean = decodeHarEscapes(ogTitle);
  const parts = clean.split("|").map((part) => cleanText(part));
  const lead = parts[0] || "";
  const leadBits = lead.split(",").map((part) => cleanText(part)).filter(Boolean);
  return {
    lead,
    title: lead,
    city: leadBits.length ? leadBits[leadBits.length - 1] : "",
    rooms: parts.find((part) => /local/i.test(part)) || "",
    surface: parts.find((part) => /m²|mq/i.test(part)) || "",
  };
}

function extractCountFromText(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return cleanText(match[1]);
  }
  return "";
}

function uniqueImageUrlsFromRaw(raw) {
  const matches = [
    ...(raw.match(/https:\\\/\\\/pwm\.im-cdn\.it\\\/image\\\/[^"'\\\s]+/gi) || []),
    ...(raw.match(/https:\/\/pwm\.im-cdn\.it\/image\/[^"'\\\s]+/gi) || []),
  ];
  const decoded = matches
    .map((url) => decodeHarEscapes(url))
    .filter((url) => /\.(jpg|jpeg|png|webp)(\?|$)/i.test(url));

  const rank = (url) => {
    if (/\/xxl\./i.test(url)) return 5;
    if (/\/large\./i.test(url)) return 4;
    if (/\/cover-m-c\./i.test(url)) return 3;
    if (/\/m-c\./i.test(url)) return 2;
    if (/\/thumb\./i.test(url)) return 1;
    return 0;
  };

  const bestByAsset = new Map();
  for (const url of decoded) {
    const key = url.replace(/\/[^/]+\.(jpg|jpeg|png|webp)(\?.*)?$/i, "");
    const prev = bestByAsset.get(key);
    if (!prev || rank(url) > rank(prev)) bestByAsset.set(key, url);
  }

  return Array.from(bestByAsset.values());
}

async function extractListingDataFromRawHar(harPath, outDir, fallbackUrl) {
  const raw = fs.readFileSync(harPath, "utf8");
  const htmlChunk = decodeHarEscapes(raw);
  const ogTitle = extractMeta(htmlChunk, "og:title");
  const metaDescription = extractMeta(htmlChunk, "description") || extractMeta(htmlChunk, "og:description");
  const titleTag = decodeHarEscapes(htmlChunk.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || "");
  const canonical = decodeHarEscapes(htmlChunk.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] || fallbackUrl);
  const titleBits = extractTitleBits(ogTitle || titleTag);
  const priceLabel = decodeHarEscapes(
    raw.match(/"price":\{"label":"([^"]+)"/)?.[1] ||
    raw.match(/"formattedPrice":"([^"]+)"/)?.[1] ||
    ""
  );
  const bedrooms = extractCountFromText(htmlChunk, [
    /(\d+)\s+camere?\s+da\s+letto/i,
    /(\d+)\s+camera(?:\s+da\s+letto)?/i,
  ]);
  const bathrooms = extractCountFromText(htmlChunk, [
    /(\d+)\s+bagni?/i,
    /(\d+)\s+bathrooms?/i,
  ]);
  const imageUrls = uniqueImageUrlsFromRaw(raw);
  const galleryPaths = [];

  ensureDir(outDir);
  for (let i = 0; i < Math.min(12, imageUrls.length); i += 1) {
    try {
      galleryPaths.push(await downloadImage(imageUrls[i], outDir, `gallery-${i + 1}`));
    } catch {
      galleryPaths.push(null);
    }
  }

  let mainPath = null;
  if (imageUrls[0]) {
    try {
      mainPath = await downloadImage(imageUrls[0], outDir, "main");
    } catch {
      mainPath = null;
    }
  }

  return {
    url: canonical || fallbackUrl,
    title: titleBits.title || cleanText(titleTag) || fallbackUrl,
    city: titleBits.city,
    zone: "",
    address: "",
    streetNumber: "",
    latitude: null,
    longitude: null,
    description: cleanText(metaDescription),
    priceLabel: cleanText(priceLabel),
    surface: cleanText(titleBits.surface),
    rooms: cleanText(titleBits.rooms),
    bedrooms: cleanText(bedrooms),
    bathrooms: cleanText(bathrooms),
    galleryDetails: imageUrls.slice(0, 12).map((url) => ({ type: null, caption: "", url })),
    saved: {
      planPath: null,
      mainPath,
      galleryPaths,
    },
  };
}

async function buildListingFromFallback(item, outDir) {
  const fallback = URL_FALLBACKS[item.index];
  if (!fallback) throw new Error(`Missing fallback for item ${item.index}`);

  ensureDir(outDir);
  const galleryPaths = [];
  for (let i = 0; i < Math.min(12, fallback.galleryDetails.length); i += 1) {
    try {
      galleryPaths.push(await downloadImage(fallback.galleryDetails[i].url, outDir, `gallery-${i + 1}`));
    } catch {
      galleryPaths.push(null);
    }
  }

  let mainPath = null;
  if (fallback.galleryDetails[0]?.url) {
    try {
      mainPath = await downloadImage(fallback.galleryDetails[0].url, outDir, "main");
    } catch {
      mainPath = null;
    }
  }

  return {
    ...fallback,
    saved: {
      planPath: null,
      mainPath,
      galleryPaths,
    },
  };
}

async function fetchListingDataFromUrl(url, outDir) {
  ensureDir(outDir);
  const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  const html = await response.text();
  const nextData = getNextData(html);
  const pageProps = nextData?.props?.pageProps;
  if (!pageProps) throw new Error(`Missing __NEXT_DATA__ for ${url}`);

  const listing = extractListingFromPageProps(pageProps, url);
  const galleryPaths = [];
  for (let i = 0; i < Math.min(12, listing.galleryDetails.length); i += 1) {
    const photo = listing.galleryDetails[i];
    try {
      const filePath = await downloadImage(photo.url, outDir, `gallery-${i + 1}`);
      galleryPaths.push(filePath);
    } catch {
      galleryPaths.push(null);
    }
  }

  let mainPath = null;
  if (listing.galleryDetails[0]?.url) {
    try {
      mainPath = await downloadImage(listing.galleryDetails[0].url, outDir, "main");
    } catch {
      mainPath = null;
    }
  }

  return {
    ...listing,
    saved: {
      planPath: null,
      mainPath,
      galleryPaths,
    },
  };
}

async function resolveListing(item, harDir, workDir) {
  const listingDir = path.join(workDir, `listing-${item.index}`);
  ensureDir(listingDir);

  try {
    const extracted = extractListingData(path.join(harDir, item.har), listingDir);
    if (cleanText(extracted.title) && (extracted.saved?.galleryPaths?.some(Boolean) || extracted.saved?.mainPath)) {
      return {
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
      };
    }
  } catch {}

  try {
    const rawExtracted = await extractListingDataFromRawHar(path.join(harDir, item.har), listingDir, item.url);
    if (cleanText(rawExtracted.title) && (rawExtracted.saved?.galleryPaths?.some(Boolean) || rawExtracted.saved?.mainPath)) {
      return {
        ...item,
        ...rawExtracted,
        title: cleanText(rawExtracted.title),
        city: cleanText(rawExtracted.city),
        address: cleanText(rawExtracted.address),
        streetNumber: cleanText(rawExtracted.streetNumber),
        description: cleanText(rawExtracted.description),
        surface: cleanText(rawExtracted.surface),
        rooms: cleanText(rawExtracted.rooms),
        bedrooms: cleanText(rawExtracted.bedrooms),
        bathrooms: cleanText(rawExtracted.bathrooms),
        priceLabel: cleanText(rawExtracted.priceLabel),
      };
    }
  } catch {}

  if (URL_FALLBACKS[item.index]) {
    const fallback = await buildListingFromFallback(item, listingDir);
    if (cleanText(fallback.title)) {
      return {
        ...item,
        ...fallback,
        title: cleanText(fallback.title),
        city: cleanText(fallback.city),
        address: cleanText(fallback.address),
        streetNumber: cleanText(fallback.streetNumber),
        description: cleanText(fallback.description),
        surface: cleanText(fallback.surface),
        rooms: cleanText(fallback.rooms),
        bedrooms: cleanText(fallback.bedrooms),
        bathrooms: cleanText(fallback.bathrooms),
        priceLabel: cleanText(fallback.priceLabel),
      };
    }
  }

  const fetched = await fetchListingDataFromUrl(item.url, listingDir);
  return {
    ...item,
    ...fetched,
    title: cleanText(fetched.title),
    city: cleanText(fetched.city),
    address: cleanText(fetched.address),
    streetNumber: cleanText(fetched.streetNumber),
    description: cleanText(fetched.description),
    surface: cleanText(fetched.surface),
    rooms: cleanText(fetched.rooms),
    bedrooms: cleanText(fetched.bedrooms),
    bathrooms: cleanText(fetched.bathrooms),
    priceLabel: cleanText(fetched.priceLabel),
  };
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
    .trim();
  if (cleaned.length <= 1400) return cleaned;
  return `${cleaned.slice(0, 1397).trim()}...`;
}

function formatPrice(raw) {
  const digits = String(raw || "").replace(/[^\d]/g, "");
  return digits ? `${Number(digits).toLocaleString("cs-CZ")} EUR` : "";
}

function formatMetricValue(value) {
  const cleaned = cleanText(value);
  if (!cleaned) return "-";
  return cleaned.replace(/m²/gi, "m2");
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
    ["giardino", "cortile", "terreno", "vista", "zona", "ingresso"],
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
  if (caption.includes("salone") || caption.includes("soggiorno") || caption.includes("living")) return 95;
  if (caption.includes("camera da letto") || caption.includes("stanza")) return 90;
  if (caption.includes("bagno")) return 85;
  if (caption.includes("garage") || caption.includes("box auto") || caption.includes("magazzino") || caption.includes("cantina") || caption.includes("ripostiglio")) return 80;
  if (caption.includes("studio") || caption.includes("corridoio") || caption.includes("scala") || caption.includes("interno")) return 65;
  if (caption.includes("balcone") || caption.includes("terrazzo") || caption.includes("veranda")) return 30;
  if (caption.includes("facciata") || caption.includes("giardino") || caption.includes("terreno") || caption.includes("vista") || caption.includes("zona")) return -15;
  return 10;
}

function pickGalleryImages(listing) {
  const hero = pickHeroImage(listing);
  const details = getGalleryEntries(listing).filter((item) => item.path !== hero);
  const chosen = [];
  const used = new Set();
  const categoryRules = [
    ["cucina", "angolo cottura"],
    ["salone", "soggiorno", "living"],
    ["camera da letto", "stanza"],
    ["bagno"],
    ["garage", "box auto", "magazzino", "cantina", "ripostiglio"],
    ["studio", "corridoio", "scala", "interno"],
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

async function main() {
  const harDir = process.argv[2] || "c:\\Users\\39327\\Desktop\\temporanei\\documenti\\HAR present";
  const outPath = process.argv[3] || path.resolve("tmp", "puglia-selection-cs-apr-2026.pptx");
  const workDir = process.argv[4] || path.resolve("tmp", "puglia-selection-data");

  ensureDir(workDir);
  ensureDir(path.dirname(outPath));

  const listings = [];
  for (const item of ITEMS) {
    const listing = await resolveListing(item, harDir, workDir);
    fs.writeFileSync(path.join(workDir, `listing-${item.index}`, "listing.json"), JSON.stringify(listing, null, 2));
    listings.push(listing);
  }

  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "OpenAI Codex";
  pptx.company = "OpenAI";
  pptx.subject = "Puglia real estate selection";
  pptx.title = "Puglia selection";
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
