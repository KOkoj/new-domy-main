const fs = require("fs");
const path = require("path");

const root = "C:/Users/39327/Desktop/har toscana";

function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function extractLabel(value) {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") return value.label || value.value || value.name || value.formatted || value.text || "";
  return "";
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

function extractOne(i) {
  const file = path.join(root, `${i}har.har`);
  const html = extractHtmlFromTruncatedHar(file);
  const pageProps = getNextData(html)?.props?.pageProps || {};
  const realEstate = pageProps?.detailData?.realEstate || {};
  const property = realEstate?.properties?.[0] || {};
  return {
    i,
    title: normalizeWhitespace(realEstate.title),
    typology: normalizeWhitespace(extractLabel(realEstate.typology || realEstate.type)),
    city: normalizeWhitespace(property.location?.city || property.location?.label || ""),
    zone: normalizeWhitespace(property.location?.zone || ""),
    address: normalizeWhitespace(property.location?.address || ""),
    price: normalizeWhitespace(extractLabel(realEstate.price) || extractLabel(property.price)),
    surface: normalizeWhitespace(extractLabel(property.surface) || extractLabel(property.surfaceValue)),
    rooms: normalizeWhitespace(extractLabel(property.rooms) || extractLabel(property.roomsValue)),
    bedrooms: normalizeWhitespace(extractLabel(property.bedRoomsNumber)),
    bathrooms: normalizeWhitespace(extractLabel(property.bathrooms)),
    desc: normalizeWhitespace(property.description || property.defaultDescription).slice(0, 1000),
  };
}

const out = [];
for (let i = 1; i <= 15; i += 1) out.push(extractOne(i));
console.log(JSON.stringify(out, null, 2));
