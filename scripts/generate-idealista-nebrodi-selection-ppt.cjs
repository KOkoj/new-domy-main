const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const ITEMS = [
  { index: 1, har: "har 1 annuncio.har", url: "https://www.idealista.it/immobile/33796076/" },
  { index: 2, har: "har 2 annuncio.har", url: "https://www.idealista.it/immobile/27810777/" },
  { index: 3, har: "har 3 annuncio.har", url: "https://www.idealista.it/immobile/33288297/" },
  { index: 4, har: "har 4 annuncio.har", url: "https://www.idealista.it/immobile/29837102/" },
  { index: 5, har: "har 5 annuncio.har", url: "https://www.idealista.it/immobile/32414486/" },
  { index: 6, har: "har 6 annuncio.har", url: "https://www.idealista.it/immobile/32951723/" },
  { index: 7, har: "har 7 annuncio.har", url: "https://www.idealista.it/immobile/29349823/" },
  { index: 8, har: "har 8 annuncio.har", url: "https://www.idealista.it/immobile/32881836/" },
];

const COLORS = { bg: "FFFFFF", text: "111111" };
const ICON_STRIP = path.resolve("tmp", "ppt-build", "extracted", "ppt", "media", "image1.png");

const CS_COPY = {
  1: {
    title: "Samostatný dům se třemi úrovněmi v Caronia",
    description:
      "První nabídka v Contrada San Giovanni u Caronia je samostatný dům rozdělený do tří samostatně přístupných částí. Hlavní obytné podlaží nabízí dvě světlé místnosti, koupelnu, kuchyň a velkou panoramatickou terasu, zatímco spodní úrovně rozšiřují využitelnou plochu o další místnosti a skladové zázemí.\n\nNemovitost vyžaduje rekonstrukci, ale právě tím je zajímavá pro kupujícího, který chce dům upravit podle vlastních představ. Poloha v klidné venkovské části Canneto di Caronia působí soukromě, přitom zůstává v dosahu moře i přírodního zázemí severní Sicílie.\n\nDruhá slide pracuje hlavně s interiéry a venkovními záběry terasy, aby byl dobře čitelný reálný potenciál domu po úpravách.",
  },
  2: {
    title: "Venkovská vila s verandou v San Piero Patti",
    description:
      "Druhá nemovitost je vila na dvou podlažích v oblasti San Piero Patti, respektive v krajině u Montalbano Elicona. Dispozice zahrnuje obytnou kuchyň s obývacím prostorem, komoru, dvě ložnice, koupelnu, velkou panoramatickou verandu, balkon a menší zahradní část.\n\nDům je udržovaný v dobrém stavu a podle popisu má výrazný venkovský charakter. Díky termokrbu a rozložení místností může fungovat jako rekreační dům v horách i jako klidné zázemí pro delší pobyty mimo hlavní turistická centra.\n\nV prezentaci proto první slide staví na exteriéru a druhá ukazuje hlavní obytné prostory bez zbytečného opakování úvodního záběru.",
  },
  3: {
    title: "Samostatný dům o 220 m² v Sinagře",
    description:
      "Třetí položka je samostatný dům ve Via Provinciale v obci Sinagra. Z dostupných dat v HAR souboru je potvrzená plocha 220 m², pět místností a cena 80 000 EUR. Nahraný soubor je galerie detailu, takže neobsahuje plný text inzerátu, ale zachovává titulní metadata a kompletní fotodokumentaci.\n\nZ pohledu výběru je to větší dům za relativně dostupnou cenu, vhodný spíše pro klienta, který hledá více prostoru a chce si lokalitu i dispoziční logiku ověřit hlavně podle obrazové části. Galerie ukazuje fasádu a další pohledy na objekt, takže listing nepůsobí jako slepá položka bez obsahu.\n\nDo decku ho zařazuji ve stejném vizuálním režimu jako ostatní nabídky, s důrazem na to, co je z HAR skutečně doložené.",
  },
  4: {
    title: "Vila s výhledem a pozemkem v Tortorici",
    description:
      "Čtvrtá nabídka v Contrada Grazia u Tortorici je samostatná vila na dvou úrovních se dvěma koupelnami a pozemkem o velikosti přibližně 1 500 m². Klíčovým prvkem je krytá veranda, otevřený obytný prostor s kuchyní a výhled na moře, který dává domu silný rekreační charakter.\n\nHorní část domu tvoří ložnice s vlastní koupelnou, zatímco v polosuterénu je další pokoj se zázemím. Nemovitost potřebuje rekonstrukci, ale velkou výhodou je obvodová zahrada a možnost výrazně upravit venkovní část včetně relaxační zóny nebo bazénu.\n\nV prezentaci proto nechávám vyniknout kombinaci domu, verandy a okolního pozemku, protože právě to je hlavní hodnota této nabídky.",
  },
  5: {
    title: "Třípodlažní dům s pozemkem v Tortorici",
    description:
      "Pátý listing v Contrada San Costantino u Tortorici je samostatný dům o ploše zhruba 171 m², rozložený do tří podlaží, se sedmi místnostmi, dvěma koupelnami a pozemkem o velikosti přibližně 2 400 m². Silnou stránkou je dobrý technický stav, díky němuž dům nepůsobí jako čistě rekonstrukční projekt, ale jako použitelný základ pro okamžité využití.\n\nDispozice je dostatečně velká pro rodinné bydlení i vícegenerační nebo polorekreační využití. V inzerátu se navíc objevuje venkovní pec, přístavba a terasovitý pozemek, což celé nemovitosti přidává rustikální a autentický sicilský charakter.\n\nDruhá slide se soustředí na interiér a obytné zázemí, aby byl dobře vidět rozdíl mezi touto použitelnou nemovitostí a domy, které vyžadují větší zásah.",
  },
  6: {
    title: "Panoramatický dům v historické Mistrettě",
    description:
      "Šestá nabídka je samostatný dům ve Via Alighieri v Mistrettě s plochou přibližně 163 m², pěti místnostmi, dvěma koupelnami a výraznou panoramatickou terasou. Dům je rozložený do více úrovní a z horního podlaží nabízí široký výhled na město i okolní krajinu, podle inzerátu až směrem k moři.\n\nSilná je i investiční logika: dům lze relativně snadno rozdělit na tři samostatně fungující části, což může dávat smysl pro krátkodobé pronájmy nebo kombinaci vlastního užívání a výnosu. Přitom zůstává v dobrém stavu a má standardní vytápění na zemní plyn.\n\nDo prezentace ho řadím jako jednu z nejsilnějších městských variant v tomto výběru, protože spojuje prostor, panorama a flexibilní využití.",
  },
  7: {
    title: "Dům s olivovníky u Sant'Angelo di Brolo",
    description:
      "Sedmá nemovitost leží v kopcovité oblasti nad Patti, u Sant'Angelo di Brolo, a nabízí přibližně 180 m² na třech podlažích, dvě koupelny a sedm místností. Podle popisu se jedná o dům složený ze dvou samostatně fungujících bytových částí, které jsou dnes propojené, a doplňuje ho taverna s pecí na dřevo, panoramatická terasa a soukromá příjezdová cesta s parkováním.\n\nDům je obklopený rozsáhlým pozemkem s olivovníky a ovocnými stromy. V textu se navíc objevuje i samostatný rustikální objekt, který může rozšířit budoucí využití na hostinskou část, zázemí nebo další obytný prostor po úpravě.\n\nJe to jedna z nejkomplexnějších venkovských nabídek v celém souboru a deck tomu odpovídá kombinací exteriéru, obytných částí a zázemí.",
  },
  8: {
    title: "Cottage s 4 000 m² pozemku v Mistrettě",
    description:
      "Poslední nabídka v Contrada Milazzo u Mistretty je kompaktní cottage o ploše přibližně 67 m² na jednom podlaží, se dvěma místnostmi, koupelnou a pozemkem kolem 4 000 m². Největší hodnotou není samotná velikost domu, ale krajinný kontext: olivovníky, otevřený výhled a kontakt s přírodou v oblasti Nebrodi.\n\nPodle popisu je dům navržený pro společné trávení času venku, s krytou verandou a venkovní kuchyní, což z něj dělá velmi silnou rekreační variantu pro klienta, který nehledá městský objekt, ale soukromé místo s atmosférou. Stav je veden jako dobrý a dům má autonomní vytápění.\n\nV celé prezentaci funguje jako nejvíce lifestylová nabídka: méně o metrech, více o pozemku, výhledu a celkovém pocitu z místa.",
  },
};

const LISTING_FALLBACKS = {
  3: {
    title: "Casa indipendente in vendita in Via Provinciale s.n.c",
    city: "Sinagra",
    priceLabel: "80.000",
  },
};

const MANUAL_GALLERY_PATHS = {
  3: [8, 9, 10, 11, 12],
  4: [10, 11, 12, 13, 14, 15],
  5: [10, 11, 12, 13, 15, 17],
  8: [12, 13, 14, 15, 16, 18],
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(text) {
  const named = {
    amp: "&",
    quot: '"',
    apos: "'",
    nbsp: " ",
    rsquo: "’",
    lsquo: "‘",
    rdquo: "”",
    ldquo: "“",
    ndash: "–",
    mdash: "—",
    bull: "•",
    deg: "°",
    egrave: "è",
    agrave: "à",
    ograve: "ò",
    ugrave: "ù",
    igrave: "ì",
    Egrave: "È",
    Agrave: "À",
    Ograve: "Ò",
    Ugrave: "Ù",
    Igrave: "Ì",
    eacute: "é",
    Eacute: "É",
    aacute: "á",
    Aacute: "Á",
    oacute: "ó",
    Oacute: "Ó",
    uacute: "ú",
    Uacute: "Ú",
  };

  return String(text || "")
    .replace(/\\u003c/g, "<")
    .replace(/\\u003e/g, ">")
    .replace(/\\u0026/g, "&")
    .replace(/\\\//g, "/")
    .replace(/\\"/g, '"')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      try {
        return String.fromCodePoint(parseInt(hex, 16));
      } catch {
        return _;
      }
    })
    .replace(/&#(\d+);/g, (_, num) => {
      try {
        return String.fromCodePoint(parseInt(num, 10));
      } catch {
        return _;
      }
    })
    .replace(/&([a-zA-Z]+);/g, (match, name) => named[name] || match);
}

function htmlToText(value) {
  return decodeHtmlEntities(String(value || ""))
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeMetric(value) {
  return cleanText(value).replace(/m²|mq/gi, "m2");
}

function extractMeta(html, name) {
  const match = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"));
  return htmlToText(match?.[1] || "");
}

function extractImageUrls(raw) {
  const matches = [
    ...(raw.match(/https:\\\/\\\/img4\.idealista\.it\\\/[^"'\\\s]+/gi) || []),
    ...(raw.match(/https:\/\/img4\.idealista\.it\/[^"'\\\s]+/gi) || []),
  ];

  const rank = (url) => {
    let score = 0;
    if (/\.jpg($|\?)/i.test(url) || /\.jpeg($|\?)/i.test(url)) score += 3;
    if (/\.png($|\?)/i.test(url)) score += 2;
    if (/WEB_DETAIL_TOP-L-L/i.test(url)) score += 6;
    if (/WEB_DETAIL/i.test(url)) score += 5;
    if (/XL/i.test(url)) score += 4;
    if (/L-L/i.test(url)) score += 3;
    if (/M/i.test(url)) score += 2;
    return score;
  };

  const bestByAsset = new Map();
  for (const rawUrl of matches) {
    const url = decodeHtmlEntities(rawUrl);
    if (url.includes("<#")) continue;
    if (!/\.(jpg|jpeg|png|webp)(\?|$)/i.test(url)) continue;
    const key = url.replace(/\.(jpg|jpeg|png|webp)(\?.*)?$/i, "");
    const prev = bestByAsset.get(key);
    if (!prev || rank(url) > rank(prev)) bestByAsset.set(key, url);
  }

  return Array.from(bestByAsset.values());
}

function extractJsonGalleryCaptions(raw) {
  const matches = [...raw.matchAll(/"src":"(https:\\\/\\\/img4\.idealista\.it[^"]+)".*?"description":"([^"]*)"/g)];
  return matches.map((match) => ({
    url: decodeHtmlEntities(match[1]),
    caption: htmlToText(match[2]),
  }));
}

function extractAssetId(url) {
  return String(url || "").match(/\/(\d+)\.(?:jpg|jpeg|png|webp)(?:\?|$)/i)?.[1] || null;
}

function rankImageVariant(url) {
  const value = String(url || "");
  let score = 0;
  if (/WEB_DETAIL_TOP-L-L/i.test(value)) score += 90;
  else if (/WEB_DETAIL_TOP-L/i.test(value)) score += 82;
  else if (/WEB_DETAIL-L-L/i.test(value)) score += 78;
  else if (/WEB_DETAIL-L/i.test(value)) score += 72;
  else if (/WEB_DETAIL/i.test(value)) score += 66;
  else if (/WEB_DETAIL-M-L/i.test(value)) score += 58;
  else if (/M-L/i.test(value)) score += 48;
  else if (/XL/i.test(value)) score += 40;
  if (/\.jpg($|\?)/i.test(value) || /\.jpeg($|\?)/i.test(value)) score += 5;
  if (/\.png($|\?)/i.test(value)) score += 4;
  if (/\.webp($|\?)/i.test(value)) score += 3;
  return score;
}

function normalizePhotoCaption(value) {
  return cleanText(
    decodeHtmlEntities(String(value || ""))
      .replace(/^Immagine\s+/i, "")
      .replace(/\s+di\s+casa .*$/i, "")
  );
}

function classifyPhotoCaption(value) {
  const caption = normalizePhotoCaption(value).toLowerCase();
  if (!caption) return "other";
  if (/piscin/.test(caption)) return "pool";
  if (/garage|box auto|autorimessa/.test(caption)) return "garage";
  if (/cucin/.test(caption)) return "kitchen";
  if (/salone|soggiorno|living|zona giorno|pranzo/.test(caption)) return "living";
  if (/camera|letto/.test(caption)) return "bedroom";
  if (/bagn|doccia/.test(caption)) return "bathroom";
  if (/terraz|verand|balcon/.test(caption)) return "terrace";
  if (/giardin|cortile/.test(caption)) return "garden";
  if (/facciata|esterno/.test(caption)) return "exterior";
  if (/vista|panoram/.test(caption)) return "view";
  if (/dettagli?/.test(caption)) return "detail";
  return "other";
}

function collectPhotoCatalog(raw, html) {
  const orderedKeys = [];
  const byKey = new Map();

  const ensurePhoto = (url, caption = "") => {
    const decodedUrl = decodeHtmlEntities(url);
    if (!/\.(jpg|jpeg|png|webp)(\?|$)/i.test(decodedUrl)) return;
    const assetId = extractAssetId(decodedUrl);
    const key = assetId || decodedUrl;
    if (!byKey.has(key)) {
      byKey.set(key, { assetId, urls: [], captions: [] });
      orderedKeys.push(key);
    }
    const item = byKey.get(key);
    if (!item.urls.includes(decodedUrl)) item.urls.push(decodedUrl);
    const cleanedCaption = normalizePhotoCaption(caption);
    if (cleanedCaption && !item.captions.includes(cleanedCaption)) item.captions.push(cleanedCaption);
  };

  for (const match of html.matchAll(/<img[^>]+(?:title|alt)="([^"]+)"[^>]+src="(https:\/\/img4\.idealista\.it\/[^"]+)"/gi)) {
    ensurePhoto(match[2], match[1]);
  }

  for (const match of raw.matchAll(/"id":(\d+),"src":"(https:\\\/\\\/img4\.idealista\.it[^"]+)".{0,400}?"description":"([^"]*)"/g)) {
    ensurePhoto(match[2], match[3]);
  }

  for (const url of extractImageUrls(raw)) {
    ensurePhoto(url, "");
  }

  return orderedKeys.map((key) => {
    const item = byKey.get(key);
    return {
      assetId: item.assetId,
      caption: item.captions[0] || "",
      category: classifyPhotoCaption(item.captions[0] || ""),
      urls: item.urls.sort((a, b) => rankImageVariant(b) - rankImageVariant(a)),
    };
  });
}

function decodeHarContent(content) {
  if (!content || typeof content.text !== "string") return null;
  return Buffer.from(content.text, content.encoding === "base64" ? "base64" : "utf8");
}

function extensionFromMimeOrUrl(mimeType, url) {
  if (/png/i.test(mimeType || "")) return ".png";
  if (/webp/i.test(mimeType || "")) return ".webp";
  if (/jpe?g/i.test(mimeType || "") || /\.jpe?g($|\?)/i.test(url || "")) return ".jpg";
  return /\.png($|\?)/i.test(url || "") ? ".png" : /\.webp($|\?)/i.test(url || "") ? ".webp" : ".jpg";
}

function findBestHarImageEntry(entries, photo) {
  const imageEntries = (entries || []).filter((entry) => {
    const mime = entry?.response?.content?.mimeType || "";
    const url = entry?.request?.url || "";
    return /^image\//i.test(mime) && /img4\.idealista\.it/i.test(url);
  });

  const exactMap = new Map(imageEntries.map((entry) => [entry.request.url, entry]));
  for (const url of photo.urls) {
    const exact = exactMap.get(url);
    if (exact && decodeHarContent(exact.response?.content)) return exact;
  }

  if (photo.assetId) {
    return imageEntries
      .filter((entry) => (entry?.request?.url || "").includes(`/${photo.assetId}.`) && decodeHarContent(entry.response?.content))
      .sort((a, b) => rankImageVariant(b.request.url) - rankImageVariant(a.request.url))[0] || null;
  }

  return null;
}

function saveHarImageEntry(entry, outDir, basename) {
  if (!entry) return null;
  const buffer = decodeHarContent(entry.response?.content);
  if (!buffer) return null;
  const filePath = path.join(outDir, `${basename}${extensionFromMimeOrUrl(entry.response?.content?.mimeType, entry.request?.url)}`);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

const NUMBER_WORDS = {
  un: "1",
  uno: "1",
  una: "1",
  due: "2",
  tre: "3",
  quattro: "4",
  cinque: "5",
  sei: "6",
  sette: "7",
  otto: "8",
  nove: "9",
  dieci: "10",
};

function normalizeCountToken(value) {
  const token = cleanText(String(value || "")).toLowerCase();
  if (/^\d+$/.test(token)) return token;
  return NUMBER_WORDS[token] || "";
}

function extractCountFromText(text, singularRegex, pluralRegex) {
  const cleaned = cleanText(text).toLowerCase();
  if (!cleaned) return "";
  const numberPattern = Object.keys(NUMBER_WORDS).join("|");
  const pluralMatch = cleaned.match(new RegExp(`\\b(\\d+|${numberPattern})\\b(?:\\s+[a-zàèéìòù']+){0,3}\\s+${pluralRegex.source}`, "i"));
  if (pluralMatch) return normalizeCountToken(pluralMatch[1]);
  if (singularRegex.test(cleaned)) return "1";
  return "";
}

function extractPrice(raw, html) {
  const candidates = [
    html.match(/<span class="info-data-price">([\s\S]*?)<\/span>/i)?.[1],
    html.match(/<strong class="price">([\s\S]*?)<\/strong>/i)?.[1],
    raw.match(/"ad_price":"([\d.]+)"/)?.[1],
    raw.match(/"cust_ad_price":"([\d.]+)"/)?.[1],
  ];

  for (const candidate of candidates) {
    const cleaned = cleanText(htmlToText(candidate || ""));
    const digits = cleaned.replace(/[^\d]/g, "");
    if (!digits) continue;
    return digits.includes("000") || digits.length > 3 ? `${Number(digits).toLocaleString("it-IT")}` : cleaned;
  }

  return "";
}

function extractRawMeta(raw, key) {
  return htmlToText(raw.match(new RegExp(`"${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}":"([^"]+)"`))?.[1] || "");
}

function extractFeaturesFromPhotoJson(raw) {
  const area =
    raw.match(/"type":"CONSTRUCTED_AREA","text":"([^"]+)"/)?.[1] ||
    raw.match(/\\"type\\":\\"CONSTRUCTED_AREA\\",\\"text\\":\\"([^"]+)\\"/)?.[1] ||
    "";
  const rooms =
    raw.match(/"type":"ROOM_NUMBER","text":"([^"]+)"/)?.[1] ||
    raw.match(/\\"type\\":\\"ROOM_NUMBER\\",\\"text\\":\\"([^"]+)\\"/)?.[1] ||
    "";
  return {
    surface: normalizeMetric(htmlToText(area)),
    rooms: cleanText(htmlToText(rooms)),
  };
}

async function downloadImage(url, outDir, basename) {
  const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const ext = /\.png($|\?)/i.test(url) ? ".png" : /\.webp($|\?)/i.test(url) ? ".webp" : ".jpg";
  const filePath = path.join(outDir, `${basename}${ext}`);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

async function extractListingDataFromRawHar(harPath, outDir, itemUrl) {
  const raw = fs.readFileSync(harPath, "utf8");
  const html = decodeHtmlEntities(raw);
  const fallbackMeta = extractFeaturesFromPhotoJson(raw);
  const jsonCaptions = extractJsonGalleryCaptions(raw);
  const imageUrls = extractImageUrls(raw);

  ensureDir(outDir);

  const galleryPaths = [];
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

  const title =
    htmlToText(html.match(/<span class="main-info__title-main">([\s\S]*?)<\/span>/i)?.[1]) ||
    extractMeta(html, "og:title").split("—")[0].trim() ||
    itemUrl;
  const city =
    htmlToText(html.match(/<span class="main-info__title-minor">([\s\S]*?)<\/span>/i)?.[1]) ||
    cleanText(extractMeta(html, "og:description").split(",").slice(-1)[0]);
  const description = htmlToText(html.match(/<div class="comment">[\s\S]*?<p>([\s\S]*?)<\/p>/i)?.[1] || "");
  const details = [...html.matchAll(/<li>([\s\S]*?)<\/li>/gi)]
    .map((match) => htmlToText(match[1]))
    .filter(Boolean);
  const rawOgTitle = extractRawMeta(raw, "meta.og:title");
  const rawOgDescription = extractRawMeta(raw, "meta.og:description") || extractRawMeta(raw, "meta.description");
  const rawOgUrl = extractRawMeta(raw, "meta.og:url");

  const galleryDetails = imageUrls.slice(0, 12).map((url, index) => ({
    type: null,
    caption: jsonCaptions.find((item) => item.url === url)?.caption || "",
    url,
  }));

  return {
    url: html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)?.[1] || rawOgUrl || itemUrl,
    title: cleanText(title || rawOgTitle.split("—")[0].trim()),
    city: cleanText(city || cleanText(rawOgDescription.split(",").slice(-1)[0])),
    address: "",
    streetNumber: "",
    latitude: null,
    longitude: null,
    description: cleanText(description || rawOgDescription),
    priceLabel: extractPrice(raw, html),
    surface:
      normalizeMetric(htmlToText(html.match(/<div class="info-features">([\s\S]*?)<\/div>/i)?.[1]).match(/(\d+(?:[.,]\d+)?)\s*m(?:²|2|q)/i)?.[0]) ||
      fallbackMeta.surface ||
      normalizeMetric(details.find((item) => /m²|m2|mq/i.test(item)) || ""),
    rooms:
      cleanText(htmlToText(html.match(/<div class="info-features">([\s\S]*?)<\/div>/i)?.[1]).match(/(\d+)\s+locali?/i)?.[0]) ||
      fallbackMeta.rooms ||
      cleanText(details.find((item) => /\blocali?\b/i.test(item)) || ""),
    bedrooms: cleanText(details.find((item) => /\bcamere?\b/i.test(item)) || "").match(/\d+/)?.[0] || "",
    bathrooms:
      cleanText(html.match(/<div class="info-features">([\s\S]*?)<\/div>/i)?.[1] || "").match(/(\d+)\s+bagni?/i)?.[1] ||
      cleanText(details.find((item) => /\bbagni?\b/i.test(item)) || "").match(/\d+/)?.[0] ||
      "",
    galleryDetails,
    saved: {
      planPath: null,
      mainPath,
      galleryPaths,
    },
  };
}

async function extractListingDataFromRawHarV2(harPath, outDir, itemUrl) {
  const raw = fs.readFileSync(harPath, "utf8");
  const html = decodeHtmlEntities(raw);
  let parsedHar = null;
  try {
    parsedHar = JSON.parse(raw);
  } catch {
    parsedHar = null;
  }
  const harEntries = parsedHar?.log?.entries || [];
  const fallbackMeta = extractFeaturesFromPhotoJson(raw);
  const photoCatalog = collectPhotoCatalog(raw, html);

  ensureDir(outDir);

  const galleryAssets = [];
  for (let i = 0; i < Math.min(24, photoCatalog.length); i += 1) {
    const photo = photoCatalog[i];
    let filePath = saveHarImageEntry(findBestHarImageEntry(harEntries, photo), outDir, `gallery-${galleryAssets.length + 1}`);
    if (!filePath && photo.urls[0]) {
      try {
        filePath = await downloadImage(photo.urls[0], outDir, `gallery-${galleryAssets.length + 1}`);
      } catch {
        filePath = null;
      }
    }
    if (!filePath) continue;
    galleryAssets.push({
      path: filePath,
      caption: photo.caption,
      category: photo.category,
    });
  }

  const title =
    htmlToText(html.match(/<span class="main-info__title-main">([\s\S]*?)<\/span>/i)?.[1]) ||
    extractMeta(html, "og:title").split("â€”")[0].trim() ||
    itemUrl;
  const city =
    htmlToText(html.match(/<span class="main-info__title-minor">([\s\S]*?)<\/span>/i)?.[1]) ||
    cleanText(extractMeta(html, "og:description").split(",").slice(-1)[0]);
  const description = htmlToText(html.match(/<div class="comment">[\s\S]*?<p>([\s\S]*?)<\/p>/i)?.[1] || "");
  const details = [...html.matchAll(/<li>([\s\S]*?)<\/li>/gi)]
    .map((match) => htmlToText(match[1]))
    .filter(Boolean);
  const rawOgTitle = extractRawMeta(raw, "meta.og:title");
  const rawOgDescription = extractRawMeta(raw, "meta.og:description") || extractRawMeta(raw, "meta.description");
  const rawOgUrl = extractRawMeta(raw, "meta.og:url");
  const descriptionText = cleanText(description || rawOgDescription);

  const galleryDetails = galleryAssets.slice(0, 12).map((item) => ({
    type: item.category,
    caption: item.caption,
    url: item.path,
  }));

  const bedroomGuess = extractCountFromText(descriptionText, /\bcamera da letto\b|\bcamera matrimoniale\b|\bcamera\b/i, /\bcamere?(?: da letto)?\b/i);
  const bathroomGuess = extractCountFromText(descriptionText, /\bbagno\b/i, /\bbagni\b/i);

  return {
    url: html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)?.[1] || rawOgUrl || itemUrl,
    title: cleanText(title || rawOgTitle.split("â€”")[0].trim()),
    city: cleanText(city || cleanText(rawOgDescription.split(",").slice(-1)[0])),
    address: "",
    streetNumber: "",
    latitude: null,
    longitude: null,
    description: descriptionText,
    priceLabel: extractPrice(raw, html),
    surface:
      normalizeMetric(htmlToText(html.match(/<div class="info-features">([\s\S]*?)<\/div>/i)?.[1]).match(/(\d+(?:[.,]\d+)?)\s*m(?:Â˛|2|q)/i)?.[0]) ||
      fallbackMeta.surface ||
      normalizeMetric(details.find((item) => /mÂ˛|m2|mq/i.test(item)) || ""),
    rooms:
      cleanText(htmlToText(html.match(/<div class="info-features">([\s\S]*?)<\/div>/i)?.[1]).match(/(\d+)\s+locali?/i)?.[0]) ||
      fallbackMeta.rooms ||
      cleanText(details.find((item) => /\blocali?\b/i.test(item)) || ""),
    bedrooms:
      cleanText(details.find((item) => /\bcamere?\b/i.test(item)) || "").match(/\d+/)?.[0] ||
      bedroomGuess ||
      "",
    bathrooms:
      cleanText(html.match(/<div class="info-features">([\s\S]*?)<\/div>/i)?.[1] || "").match(/(\d+)\s+bagni?/i)?.[1] ||
      cleanText(details.find((item) => /\bbagni?\b/i.test(item)) || "").match(/\d+/)?.[0] ||
      bathroomGuess ||
      "",
    galleryDetails,
    saved: {
      planPath: null,
      mainPath: galleryAssets[0]?.path || null,
      galleryAssets,
      galleryPaths: galleryAssets.map((item) => item.path),
    },
  };
}

function compactTitle(listing) {
  const raw = cleanText(CS_COPY[listing.index]?.title || listing.title);
  if (!raw) return `Dům ${listing.index}`;
  return raw.length <= 44 ? raw : `${raw.slice(0, 41).trim()}...`;
}

function chooseMeaningfulText(primary, fallback) {
  const cleaned = cleanText(primary);
  if (!cleaned || /^https?:\/\//i.test(cleaned)) return cleanText(fallback);
  return cleaned;
}

function cleanupDescription(text) {
  const cleaned = cleanText(text);
  if (cleaned.length <= 1450) return cleaned;
  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  const kept = [];
  for (const sentence of sentences) {
    const candidate = [...kept, sentence].join(" ");
    if (candidate.length > 1450) break;
    kept.push(sentence);
  }
  return kept.join(" ").trim() || cleaned.slice(0, 1450).trim();
}

function formatPrice(raw) {
  const digits = String(raw || "").replace(/[^\d]/g, "");
  return digits ? `${Number(digits).toLocaleString("cs-CZ")} EUR` : "";
}

function formatMetricValue(value) {
  const cleaned = cleanText(value);
  if (!cleaned) return "-";
  return cleaned.replace(/m²|mq/gi, "m2");
}

function buildMapUrl(listing) {
  const query = [listing.title, listing.city].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function pickHeroImage(listing) {
  const assets = (listing?.saved?.galleryAssets || []).filter((item) => item?.path && fs.existsSync(item.path));
  const preferred = assets.find((item) => ["exterior", "garden", "terrace", "pool", "view"].includes(item.category));
  if (preferred) return preferred.path;
  const main = listing?.saved?.mainPath;
  if (main && fs.existsSync(main)) return main;
  return assets[0]?.path || listing?.saved?.galleryPaths?.find((file) => file && fs.existsSync(file)) || null;
}

function pickGalleryImages(listing) {
  const manual = MANUAL_GALLERY_PATHS[listing?.index];
  if (manual) {
    const listingDir = path.dirname(listing?.saved?.mainPath || listing?.saved?.galleryPaths?.[0] || "");
    const selected = manual
      .map((number) => {
        const prefix = path.join(listingDir, `gallery-${number}`);
        return [".jpg", ".jpeg", ".png", ".webp"].map((ext) => `${prefix}${ext}`).find((file) => fs.existsSync(file));
      })
      .filter(Boolean);
    if (selected.length) return selected.slice(0, 6);
  }

  const hero = pickHeroImage(listing);
  const assets = (listing?.saved?.galleryAssets || [])
    .filter((item) => item?.path && fs.existsSync(item.path) && item.path !== hero);
  const selected = [];
  const selectedPaths = new Set();

  const pickFirstByCategory = (categories) => {
    const asset = assets.find((item) => categories.includes(item.category) && !selectedPaths.has(item.path));
    if (!asset) return;
    selected.push(asset.path);
    selectedPaths.add(asset.path);
  };

  pickFirstByCategory(["kitchen"]);
  pickFirstByCategory(["living"]);
  pickFirstByCategory(["bedroom"]);
  pickFirstByCategory(["bathroom"]);
  pickFirstByCategory(["terrace", "garden", "pool", "garage", "exterior", "view"]);
  pickFirstByCategory(["garage", "pool", "garden", "terrace", "exterior", "view", "detail", "other"]);

  for (const asset of assets) {
    if (selected.length >= 6) break;
    if (selectedPaths.has(asset.path)) continue;
    selected.push(asset.path);
    selectedPaths.add(asset.path);
  }

  return selected.slice(0, 6);
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
  const outPath = process.argv[3] || path.resolve("tmp", "idealista-nebrodi-selection-cs-apr-2026.pptx");
  const workDir = process.argv[4] || path.resolve("tmp", "idealista-nebrodi-selection-data");

  ensureDir(workDir);
  ensureDir(path.dirname(outPath));

  const listings = [];
  for (const item of ITEMS) {
    const listingDir = path.join(workDir, `listing-${item.index}`);
    ensureDir(listingDir);
    const cachePath = path.join(listingDir, "listing.json");
    const listing =
      process.env.NEBRODI_USE_CACHE === "1" && fs.existsSync(cachePath)
        ? JSON.parse(fs.readFileSync(cachePath, "utf8"))
        : await extractListingDataFromRawHarV2(path.join(harDir, item.har), listingDir, item.url);
    const fallback = LISTING_FALLBACKS[item.index] || {};
    const merged = {
      ...item,
      ...listing,
      title: chooseMeaningfulText(listing.title, fallback.title),
      city: chooseMeaningfulText(listing.city, fallback.city),
      description: cleanText(listing.description),
      surface: cleanText(listing.surface),
      rooms: cleanText(listing.rooms),
      bedrooms: cleanText(listing.bedrooms),
      bathrooms: cleanText(listing.bathrooms),
      priceLabel: cleanText(listing.priceLabel || fallback.priceLabel),
    };
    fs.writeFileSync(path.join(listingDir, "listing.json"), JSON.stringify(merged, null, 2));
    listings.push(merged);
  }

  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "OpenAI Codex";
  pptx.company = "OpenAI";
  pptx.subject = "Nebrodi real estate selection";
  pptx.title = "Nebrodi selection";
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
