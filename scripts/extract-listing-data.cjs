const fs = require("fs");
const path = require("path");

function decodeHarText(content) {
  if (!content || typeof content.text !== "string") return null;
  if (content.encoding === "base64") {
    return Buffer.from(content.text, "base64").toString("utf8");
  }
  return content.text;
}

function getHtmlFromHar(har) {
  const entries = har?.log?.entries || [];
  const htmlEntry = entries.find((entry) => {
    const mime = entry?.response?.content?.mimeType || "";
    return /text\/html/i.test(mime) && /immobiliare\.it\/annunci\//i.test(entry?.request?.url || "");
  });
  return {
    htmlEntry,
    html: decodeHarText(htmlEntry?.response?.content || {}),
  };
}

function getNextData(html) {
  const match = html.match(/<script[^>]+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
  return match ? JSON.parse(match[1]) : null;
}

function normalizeWhitespace(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function selectImageVariant(urls = {}) {
  return (
    urls.xxl ||
    urls.large ||
    urls.medium ||
    urls.photo ||
    urls.image ||
    urls.m ||
    urls["m-c"] ||
    urls["cover-m-c"] ||
    urls.small ||
    null
  );
}

function pickRequestedUrl(entries, urls = {}) {
  const candidates = [
    urls.xxl,
    urls.large,
    urls.medium,
    urls.photo,
    urls.image,
    urls.m,
    urls["m-c"],
    urls["cover-m-c"],
    urls.small,
    urls.thumb,
  ].filter(Boolean);

  for (const url of candidates) {
    if (entries.some((item) => item?.request?.url === url && /^image\//i.test(item?.response?.content?.mimeType || ""))) {
      return url;
    }
  }

  return candidates[0] || null;
}

function extractLabel(value) {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") {
    return (
      value.label ||
      value.value ||
      value.name ||
      value.formatted ||
      value.text ||
      ""
    );
  }
  return "";
}

function uniqueFallbackImageUrls(entries) {
  const matches = entries
    .filter((item) => /^image\//i.test(item?.response?.content?.mimeType || ""))
    .map((item) => item?.request?.url || "")
    .filter((url) => /pwm\.im-cdn\.it\/image\//i.test(url));

  const rank = (url) => {
    if (/\/xxl\./i.test(url)) return 5;
    if (/\/large\./i.test(url)) return 4;
    if (/\/cover-m-c\./i.test(url)) return 3;
    if (/\/m-c\./i.test(url)) return 2;
    if (/\/thumb\./i.test(url)) return 1;
    return 0;
  };

  const bestByAsset = new Map();
  for (const url of matches) {
    const key = url.replace(/\/[^/]+\.(jpg|jpeg|png|webp)$/i, "");
    const prev = bestByAsset.get(key);
    if (!prev || rank(url) > rank(prev)) {
      bestByAsset.set(key, url);
    }
  }

  return Array.from(bestByAsset.values());
}

function findImageContent(entries, url) {
  const entry = entries.find((item) => item?.request?.url === url && /^image\//i.test(item?.response?.content?.mimeType || ""));
  if (!entry) return null;
  const content = entry.response.content || {};
  if (typeof content.text !== "string") return null;
  const encoding = content.encoding === "base64" ? "base64" : "utf8";
  return {
    buffer: Buffer.from(content.text, encoding),
    mimeType: content.mimeType || "application/octet-stream",
  };
}

function extFromMime(mimeType) {
  if (/png/i.test(mimeType)) return ".png";
  if (/webp/i.test(mimeType)) return ".webp";
  if (/svg/i.test(mimeType)) return ".svg";
  return ".jpg";
}

function saveImage(outDir, basename, imageData) {
  if (!imageData) return null;
  fs.mkdirSync(outDir, { recursive: true });
  const filePath = path.join(outDir, `${basename}${extFromMime(imageData.mimeType)}`);
  fs.writeFileSync(filePath, imageData.buffer);
  return filePath;
}

function extractListingData(harPath, outDir) {
  const parsed = JSON.parse(fs.readFileSync(harPath, "utf8"));
  const isDirectPageProps = Boolean(parsed?.pageProps);
  const har = isDirectPageProps ? null : parsed;
  const entries = har?.log?.entries || [];
  const { htmlEntry, html } = har ? getHtmlFromHar(har) : { htmlEntry: null, html: "" };
  const nextData = isDirectPageProps ? { props: parsed } : getNextData(html || "");
  const pageProps = nextData?.props?.pageProps || {};
  const realEstate = pageProps?.detailData?.realEstate || {};
  const property = realEstate?.properties?.[0] || {};
  const advertiser = realEstate?.advertiser?.agency || {};
  const safeHtml = html || "";
  const ogTitle = safeHtml.match(/<meta property="og:title" content="([^"]+)"/i)?.[1] || pageProps?.detailData?.seo?.openGraph?.title || "";
  const ogDescription = safeHtml.match(/<meta property="og:description" content="([^"]+)"/i)?.[1] || pageProps?.detailData?.seo?.openGraph?.description || "";

  const multimedia = property.multimedia || {};
  const photoItemsRaw = Array.isArray(multimedia.photos) ? multimedia.photos : [];
  const fallbackPhotoItemsRaw = photoItemsRaw.length
    ? []
    : uniqueFallbackImageUrls(entries).map((url) => ({
        urls: { xxl: url },
        caption: "",
        type: null,
      }));
  const floorplanItemsRaw = [
    ...(Array.isArray(multimedia.floorplans) ? multimedia.floorplans : []),
    ...(multimedia.photoPlan ? [multimedia.photoPlan] : []),
  ];

  const gallery = [...photoItemsRaw, ...fallbackPhotoItemsRaw]
    .map((item, index) => {
      const urls = item?.urls || {};
      const selectedUrl = pickRequestedUrl(entries, urls);
      return {
        index,
        type: item?.type || null,
        caption: item?.caption || null,
        selectedUrl,
        urls,
      };
    })
    .filter((item) => item.selectedUrl);

  const planItems = floorplanItemsRaw
    .map((item, index) => {
      const urls = item?.urls || {};
      return {
        index,
        type: item?.type || "plan",
        caption: item?.caption || null,
        selectedUrl: pickRequestedUrl(entries, urls),
        urls,
      };
    })
    .filter((item) => item.selectedUrl);

  const photoItems = gallery.filter((item) => item.selectedUrl);
  const mainPhoto = pickRequestedUrl(entries, property.photo?.urls || {}) || photoItems[0]?.selectedUrl || null;

  let saved = {};
  if (outDir) {
    const preexisting = (name) => {
      const matches = fs.existsSync(outDir)
        ? fs.readdirSync(outDir).filter((file) => file === `${name}.jpg` || file === `${name}.jpeg` || file === `${name}.png` || file === `${name}.webp`)
        : [];
      return matches[0] ? path.join(outDir, matches[0]) : null;
    };

    const planPath = planItems[0]
      ? (saveImage(outDir, "plan", findImageContent(entries, planItems[0].selectedUrl)) || preexisting("plan"))
      : preexisting("plan");
    const mainPath = mainPhoto
      ? (saveImage(outDir, "main", findImageContent(entries, mainPhoto)) || preexisting("main"))
      : preexisting("main");
    const galleryPaths = photoItems.slice(0, 12).map((item, index) => (
      saveImage(outDir, `gallery-${index + 1}`, findImageContent(entries, item.selectedUrl)) || preexisting(`gallery-${index + 1}`)
    ));
    saved = { planPath, mainPath, galleryPaths };
  }

  const result = {
    url: htmlEntry?.request?.url || pageProps?.detailData?.seo?.canonical || null,
    title: normalizeWhitespace(realEstate.title || ogTitle),
    typology: normalizeWhitespace(extractLabel(realEstate.typology || realEstate.type)),
    contract: realEstate.contract || null,
    city: normalizeWhitespace(property.location?.city || property.location?.label || ""),
    zone: normalizeWhitespace(property.location?.zone || ""),
    address: normalizeWhitespace(property.location?.address || ""),
    streetNumber: normalizeWhitespace(property.location?.streetNumber || ""),
    latitude: property.location?.latitude ?? null,
    longitude: property.location?.longitude ?? null,
    description: normalizeWhitespace(property.description || property.defaultDescription || ogDescription),
    priceLabel: normalizeWhitespace(extractLabel(realEstate.price) || extractLabel(property.price)),
    surface: normalizeWhitespace(extractLabel(property.surface) || extractLabel(property.surfaceValue)),
    rooms: normalizeWhitespace(extractLabel(property.rooms) || extractLabel(property.roomsValue)),
    bedrooms: normalizeWhitespace(extractLabel(property.bedRoomsNumber)),
    bathrooms: normalizeWhitespace(extractLabel(property.bathrooms)),
    advertiserLogo: advertiser?.imageUrls?.large || advertiser?.imageUrls?.small || null,
    mainPhoto,
    planPhoto: planItems[0]?.selectedUrl || null,
    gallery: photoItems.slice(0, 12).map((item) => item.selectedUrl),
    galleryDetails: photoItems.slice(0, 12).map((item) => ({
      type: item.type,
      caption: normalizeWhitespace(item.caption || ""),
      url: item.selectedUrl,
    })),
    saved,
  };

  return result;
}

function main() {
  const harPath = process.argv[2];
  const outDir = process.argv[3];
  if (!harPath) {
    console.error("Usage: node scripts/extract-listing-data.cjs <har-path> [out-dir]");
    process.exit(1);
  }

  const result = extractListingData(harPath, outDir);
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = {
  extractListingData,
};
