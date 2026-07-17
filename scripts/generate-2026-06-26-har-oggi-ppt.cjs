const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const https = require("https");
const pptxgen = require("pptxgenjs");
const { extractListingData } = require("./extract-listing-data.cjs");

const ROOT = path.resolve(__dirname, "..");
const HAR_DIR = "C:\\Users\\39327\\Desktop\\har oggi";
const OUT_DIR = path.join(ROOT, "tmp", "ppt-build", "har-oggi-2026-06-26");
const OUTPUT = path.join(ROOT, "tmp", "selezione-har-oggi-2026-06-26.pptx");
const ICON_STRIP = path.join(ROOT, "tmp", "ppt-build", "extracted", "ppt", "media", "image1.png");

const ITEMS = [
  { index: 1, har: "1har.har", url: "https://www.immobiliare.it/annunci/110748323/" },
  { index: 2, har: "2har.har", url: "https://www.immobiliare.it/annunci/128435640/" },
  { index: 3, har: "3har.har", url: "https://www.immobiliare.it/annunci/126613631/" },
  { index: 4, har: "4har.har", url: "https://www.immobiliare.it/annunci/112085859/" },
  { index: 5, har: "5har.har", url: "https://www.immobiliare.it/annunci/128392414/" },
  { index: 6, har: "6har.har", url: "https://www.immobiliare.it/annunci/116952251/" },
  { index: 7, har: "7har.har", url: "https://www.immobiliare.it/annunci/126961369/" },
  { index: 8, har: "8har.har", url: "https://www.immobiliare.it/annunci/118735809/" },
  { index: 9, har: "9har.har", url: "https://www.immobiliare.it/annunci/126952645/" },
];

const COLORS = {
  bg: "FFFFFF",
  text: "111111",
  muted: "5D6670",
  chip: "F2EEE8",
};

const HERO_OVERRIDES = {};
const CZECH_TITLE_OVERRIDES = {};
const IMAGE_OVERRIDES = {
  1: {
    hero: "gallery-2",
    gallery: ["gallery-9", "gallery-6", "gallery-11", "gallery-12", "gallery-4", "gallery-16"],
  },
  2: {
    hero: "main",
    gallery: ["gallery-30", "gallery-26", "gallery-31", "gallery-37", "gallery-28", "gallery-29"],
  },
  3: {
    hero: "gallery-2",
    gallery: ["gallery-3", "gallery-4", "gallery-6", "gallery-8", "gallery-11", "gallery-12"],
  },
  4: {
    hero: "gallery-3",
    gallery: ["gallery-8", "gallery-10", "gallery-13", "gallery-15", "gallery-16", "gallery-19"],
  },
  5: {
    hero: "main",
    gallery: ["gallery-2", "gallery-3", "gallery-5", "gallery-8", "gallery-11", "gallery-12"],
  },
  6: {
    hero: "main",
    gallery: ["gallery-4", "gallery-11", "gallery-14", "gallery-15", "gallery-21", "gallery-22"],
  },
  7: {
    hero: "gallery-3",
    gallery: ["gallery-9", "gallery-14", "gallery-20", "gallery-30", "gallery-32", "gallery-40"],
  },
  9: {
    hero: "main",
    gallery: ["gallery-4", "gallery-5", "gallery-6", "gallery-8", "gallery-10", "gallery-12"],
  },
};
const DATA_OVERRIDES = {
  3: {
    title: "Villa unifamiliare Contrada Vinelli, Monforte San Giorgio",
    typology: "Villa unifamiliare",
    city: "Monforte San Giorgio",
    address: "Contrada Vinelli",
    surface: "91 m2",
    description:
      "Villa unifamiliare in Contrada Vinelli a Monforte San Giorgio. Il HAR contiene dati parziali: risultano buono stato, posto auto, terrazza e superficie di 91 m2. Prezzo e distribuzione interna non sono indicati nel file disponibile.",
  },
};
const CZECH_DESCRIPTION_OVERRIDES = {
  1:
    "V obci Rometta, v lokalitě Sottocastello, se prodává samostatný dům s velkým dvorem a pozemkem. Dům má dvě podlaží propojená vnitřním schodištěm: v přízemí je přibližně 78 m2 se dvěma místnostmi a koupelnou, v prvním patře přibližně 45 m2 se dvěma pokoji a další koupelnou.\n\nK domu patří příjezdový dvůr o ploše asi 180 m2 a rozsáhlý pozemek přibližně 11 000 m2, částečně rovinatý a částečně svažitý. Interiér je dokončený, jsou přítomny elektrické a vodovodní rozvody i příprava na vytápění radiátory. Poloha je panoramatická, dobře dostupná z hlavní silnice a podle inzerátu je nemovitost ihned využitelná.",
  2:
    "Samostatná vila v Contrada Minocera v obci Ucria, podle dostupných dat z inzerátu o ploše přibližně 208 m2. Z fotografií a uložených podkladů je patrná samostatná stavba v zeleném prostředí s kuchyní, obytnou částí, ložnicemi, koupelnou a venkovním prostorem kolem domu.\n\nHAR soubor je neúplný, proto nebylo možné bezpečně převzít plný text původního popisu. U této nemovitosti je vhodné před dalším krokem ověřit přesné vnitřní členění, technický stav, přístup, hranice pozemku a kompletní dokumentaci přímo u prodávajícího nebo makléře.",
  3:
    "Samostatná vila v Contrada Vinelli v obci Monforte San Giorgio. Dostupná data z HAR souboru jsou omezená: evidována je plocha 91 m2, dobrý stav, parkovací místo a terasa. Fotografie ukazují dům v zeleném a panoramatickém prostředí s venkovní terasou a obytnými prostory.\n\nProtože v souboru chybí kompletní původní popis i cena, je nutné před rozhodnutím ověřit přesnou dispozici, stav konstrukcí, technické instalace, právní dokumentaci a reálnou dostupnost nemovitosti na místě.",
  4:
    "V části Belvedere obce Falcone se prodává panoramatický byt o ploše přibližně 120 m2 se samostatným vstupem v přízemí a horní terasou o podobné ploše. Dispozice zahrnuje vstup, velký obývací pokoj, kuchyni s obytnou částí, chodbu, dvě prostorné ložnice a velkou koupelnu, která byla nedávno zrekonstruována.\n\nZ pokojů i z terasy je výrazný výhled na moře a okolní kopce. Povrchy nejsou moderní, ale jsou udržované; byt vyžaduje modernizaci, přičemž elektroinstalace a koupelna byly podle inzerátu nedávno renovovány. Hlavní místnosti mají klimatizaci teplo/chlad a v kuchyni je plynová kamna na metan. Poloha je blízko sjezdu z dálnice A20 Falcone a nemovitost se hodí pro celoroční i letní bydlení.",
  5:
    "Panoramatický dům se zahradou v Contrada San Sergio v obci Tortorici, v prostředí pohoří Nebrodi. Nemovitost má celkovou plochu přibližně 170 m2 a je rozložena do tří úrovní: v polosuterénu je kuchyně, jídelna a servisní místnosti s možností vstupu také zvenku; v prvním patře je vstup, velká koupelna a obývací pokoj se vstupem na terasovitou zahradu; ve druhém patře je noční část se dvěma ložnicemi.\n\nVenkovní prostor je soukromý a obklopený zelení. Součástí prodeje jsou také dva menší pozemky s lískovým sadem o celkové ploše asi 1 700 m2, umístěné nedaleko domu. Nemovitost potřebuje práce hlavně v přízemí, zatímco horní patra jsou podle inzerátu již obyvatelná. Uvedeny jsou i některé trhliny související se starším pohybem terénu, který je označen jako stabilizovaný; případné zásahy by měly být lokální. Dům je vhodný jako rekreační i hlavní bydlení.",
  6:
    "V historickém centru Santa Lucia del Mela, nedaleko kostela dell'Annunziata, se prodává panoramatická částečně samostatná nemovitost větší výměry. Dům je zasazený do typických úzkých uliček a rozkládá se na čtyřech úrovních; díky rozdílné výšce ulic je přístup možný z přední i zadní strany stavby.\n\nHlavní vstup z Via Teatro vede do přízemí, kde je velký reprezentativní salon s dvojím otevřením na balkon, další místnost s oknem a prostorný komunikační prostor se schodištěm. První patro slouží jako noční část s hlavní ložnicí, menším pokojem, koupelnou s oknem a další využitelnou plochou například pro šatnu. Nižší podlaží mají další vstup a balkon směrem k Vico Caselipari. Stavba byla v minulosti konstrukčně zpevňována; dnes vyžaduje dokončení, úpravy a modernizaci, ale nabízí pevný základ, velké světlé prostory a výhled na moře, záliv Milazzo a Liparské ostrovy.",
  7:
    "Immobiliare Costa Saracena nabízí rodinný dům ve frazione Fiumara v obci Piraino. Nemovitost má dvě terasy: první je prostorná vstupní terasa s přímým přístupem do domu a zároveň s výstupem z hlavní ložnice; druhá, vnitřní terasa, otevírá panoramatický výhled.\n\nPo vstupu se vchází do salonu, dále do hlavní ložnice napojené na vstupní terasu. Dispozice zahrnuje také druhý pokoj v blízkosti proskleného průchodu, který přivádí světlo z vnitřní terasy, koupelnu s předsíní a vanou, další chodbu a obytnou kuchyni. Kuchyně, druhý pokoj a prosklený prostor, využitelný i jako prádelna nebo servisní zóna, mají výhled na hřebeny Nebrodi. Jde o samostatné řešení s dvojí expozicí a dobře využitelnými venkovními prostory.",
  8:
    "Dům je obklopený velkým pozemkem s olivovníky a ovocnými stromy. Vila se skládá ze dvou samostatných třípokojových bytů o ploše přibližně 73 m2 každý, které jsou nyní propojeny dřevěným schodištěm. Přízemní byt má vstup s menším obývacím koutem, obytnou kuchyni, koupelnu, manželskou ložnici s balkonem, menší pokoj a komoru. V prvním patře je kuchyně otevřená do velkého salonu s balkonem a schodištěm na panoramatickou terasu, dále koupelna, manželská ložnice s balkonem a menší pokoj.\n\nV polosuterénu je taverna s pecí na dřevo a kuchyní o ploše asi 55 m2, vhodná pro společenské využití. Na horní úrovni je panoramatická terasa s výhledem na hory Nebrodi a za dobrého počasí i směrem k Etně. K domu vede soukromá cesta k parkovací ploše pro více aut. Nedaleko vily je také dvoupodlažní rustikální stavba o ploše asi 100 m2, vhodná k přeměně na dépendance. Nemovitost má soukromý zdroj vody a autonomní radiátorové vytápění, nyní na naftu, s připraveným napojením na metan.",
  9:
    "V Messině-Furnari, v klidné a dobře obsloužené zóně, se prodává samostatný dům o ploše 75 m2 se dvěma soukromými zahradami. Vstup vede do prostorné otevřené denní části, kde jsou obývací pokoj a kuchyně propojené do světlého a příjemného prostoru s přímým vstupem do přední zahrady, vhodné pro odpočinek nebo posezení s hosty.\n\nNoční část tvoří dvě pohodlné ložnice a koupelna s oknem a sprchovým koutem. Dům je obklopen dvěma soukromými zahradami, přední a zadní, které lze využít pro venkovní stolování, dětskou zónu nebo klidný pobyt v zeleni. Podle inzerátu má nemovitost dobrou sluneční expozici, funkční a snadno přizpůsobitelné prostory a může sloužit jako první bydlení i investice.",
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function normalizeWhitespace(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
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
  return urls.xxl || urls.large || urls.medium || urls.photo || urls.image || urls.m || urls["m-c"] || urls["cover-m-c"] || urls.small || null;
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
    if (char === '"') {
      return JSON.parse(`"${text.slice(stringStart, index)}"`);
    }
  }
  return "";
}

function getNextData(html) {
  const match = html.match(/<script[^>]+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
  return match ? JSON.parse(match[1]) : null;
}

function extFromUrl(url) {
  const clean = String(url || "").split("?")[0].toLowerCase();
  if (clean.endsWith(".png")) return ".png";
  if (clean.endsWith(".webp")) return ".webp";
  if (clean.endsWith(".jpeg")) return ".jpeg";
  return ".jpg";
}

function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    if (!url) {
      resolve(null);
      return;
    }
    if (fs.existsSync(filePath)) {
      resolve(filePath);
      return;
    }
    ensureDir(path.dirname(filePath));
    const request = https.get(url, { headers: { "user-agent": "Mozilla/5.0" } }, (response) => {
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
    request.setTimeout(30000, () => {
      request.destroy(new Error(`Image download timeout: ${url}`));
    });
  });
}

async function extractListingDataFallback(harPath, outDir, item) {
  const html = extractHtmlFromTruncatedHar(harPath);
  const nextData = getNextData(html);
  const pageProps = nextData?.props?.pageProps || {};
  const realEstate = pageProps?.detailData?.realEstate || {};
  const property = realEstate?.properties?.[0] || {};
  const multimedia = property.multimedia || {};
  const photoItems = Array.isArray(multimedia.photos) ? multimedia.photos : [];
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
  if (outDir) {
    saved.mainPath = mainPhoto ? await downloadImage(mainPhoto, path.join(outDir, `main${extFromUrl(mainPhoto)}`)) : null;
    for (let index = 0; index < galleryDetails.length; index += 1) {
      const url = galleryDetails[index].url;
      saved.galleryPaths.push(await downloadImage(url, path.join(outDir, `gallery-${index + 1}${extFromUrl(url)}`)));
    }
  }
  return {
    url: item.url,
    title: normalizeWhitespace(realEstate.title),
    typology: normalizeWhitespace(extractLabel(realEstate.typology || realEstate.type)),
    contract: realEstate.contract || null,
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
    planPhoto: null,
    gallery: galleryDetails.map((photo) => photo.url),
    galleryDetails,
    saved,
  };
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
  return cleanText(value).replace(/m(?:\u00b2|\u00c2\u00b2|\u00c2\u02db|\u02db)|mq/gi, "m2") || "-";
}

function formatPrice(raw) {
  const digits = String(raw || "").replace(/[^\d]/g, "");
  return digits ? `${Number(digits).toLocaleString("cs-CZ")} EUR` : "neuvedeno";
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
  if (!n) return "počet místností neuveden";
  if (n === 1) return "1 místnost";
  if (n >= 2 && n <= 4) return `${n} místnosti`;
  return `${n} místností`;
}

function czechBedrooms(value) {
  const n = numberValue(value);
  if (!n) return "počet ložnic neuveden";
  if (n === 1) return "1 ložnici";
  if (n >= 2 && n <= 4) return `${n} ložnice`;
  return `${n} ložnic`;
}

function czechBathrooms(value) {
  const n = numberValue(value);
  if (!n) return "počet koupelen neuveden";
  if (n === 1) return "1 koupelnu";
  if (n >= 2 && n <= 4) return `${n} koupelny`;
  return `${n} koupelen`;
}

function czechTypology(listing) {
  const text = `${listing.typology || ""} ${listing.title || ""}`.toLowerCase();
  if (hasAny(text, ["villa", "villetta"])) return "Vila";
  if (hasAny(text, ["casa indipendente", "casa singola", "rustico", "casale", "terratetto"])) return "Dům";
  if (hasAny(text, ["appartamento", "bilocale", "trilocale", "quadrilocale", "attico"])) return "Byt";
  if (hasAny(text, ["palazzo", "stabile"])) return "Dům";
  return "Nemovitost";
}

function czechTitle(listing) {
  const city = cleanText(listing.city || listing.zone || "");
  const typology = czechTypology(listing);
  return city ? `${typology} v lokalitě ${city}` : typology;
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
  if (CZECH_DESCRIPTION_OVERRIDES[listing.index]) {
    return CZECH_DESCRIPTION_OVERRIDES[listing.index];
  }
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
  const imageOverride = IMAGE_OVERRIDES[listing.index]?.hero;
  if (imageOverride) {
    const match = entries.find((item) => path.basename(item.path, path.extname(item.path)) === imageOverride);
    if (match) return match.path;
  }
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
  const manualGallery = IMAGE_OVERRIDES[listing.index]?.gallery || [];
  for (const name of manualGallery) {
    const match = entries.find((item) => path.basename(item.path, path.extname(item.path)) === name);
    if (!match || used.has(match.path)) continue;
    chosen.push(match.path);
    used.add(match.path);
    if (chosen.length >= 6) break;
  }

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
      console.warn(`HAR ${item.har} non è parsabile come JSON completo, uso fallback parziale: ${error.message}`);
      data = await extractListingDataFallback(harPath, listingDir, item);
    }
    const override = DATA_OVERRIDES[item.index] || {};
    const listing = {
      ...data,
      ...override,
      ...item,
      title: cleanText(override.title || data.title),
      titleCs: CZECH_TITLE_OVERRIDES[item.index],
      city: cleanText(override.city || data.city),
      address: cleanText(override.address || data.address),
      streetNumber: cleanText(override.streetNumber || data.streetNumber),
      description: cleanText(override.description || data.description),
      priceLabel: cleanText(override.priceLabel || data.priceLabel),
      surface: cleanText(override.surface || data.surface),
      rooms: cleanText(override.rooms || data.rooms),
      bedrooms: cleanText(override.bedrooms || data.bedrooms),
      bathrooms: cleanText(override.bathrooms || data.bathrooms),
      descriptionCs: "",
      url: item.url,
    };
    listing.titleCs = listing.titleCs || czechTitle(listing);
    listings.push(listing);
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
