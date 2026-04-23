const fs = require("fs");
const path = require("path");

function decodeHarText(content) {
  if (!content) return null;
  if (typeof content.text !== "string") return null;
  if (content.encoding === "base64") {
    return Buffer.from(content.text, "base64").toString("utf8");
  }
  return content.text;
}

function collectImageEntries(entries) {
  return entries
    .filter((entry) => {
      const mime = entry?.response?.content?.mimeType || "";
      return /^image\//i.test(mime);
    })
    .map((entry) => {
      const content = entry.response?.content || {};
      return {
        url: entry.request?.url,
        mimeType: content.mimeType || null,
        hasText: typeof content.text === "string",
        encoding: content.encoding || null,
        size: content.size ?? null,
      };
    });
}

function extractNextData(html) {
  const match = html.match(
    /<script[^>]+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i
  );
  if (!match) return null;
  return JSON.parse(match[1]);
}

function findStrings(value, pattern, results = []) {
  if (!value) return results;
  if (typeof value === "string") {
    if (pattern.test(value)) results.push(value);
    return results;
  }
  if (Array.isArray(value)) {
    for (const item of value) findStrings(item, pattern, results);
    return results;
  }
  if (typeof value === "object") {
    for (const item of Object.values(value)) findStrings(item, pattern, results);
  }
  return results;
}

function main() {
  const harPath = process.argv[2];
  if (!harPath) {
    console.error("Usage: node scripts/extract-har-listing.cjs <har-path>");
    process.exit(1);
  }

  const har = JSON.parse(fs.readFileSync(harPath, "utf8"));
  const entries = har?.log?.entries || [];
  const htmlEntry = entries.find((entry) => {
    const mime = entry?.response?.content?.mimeType || "";
    return /text\/html/i.test(mime) && /immobiliare\.it\/annunci\//i.test(entry?.request?.url || "");
  });

  const html = decodeHarText(htmlEntry?.response?.content || {});
  const nextData = html ? extractNextData(html) : null;

  const imageEntries = collectImageEntries(entries);
  const candidateImageUrls = nextData
    ? Array.from(
        new Set(findStrings(nextData, /https:\/\/[^"' ]+\.(?:jpe?g|png|webp)(?:\?[^"' ]*)?$/i))
      )
    : [];

  const summary = {
    harPath,
    pageUrl: htmlEntry?.request?.url || null,
    htmlFound: Boolean(html),
    nextDataFound: Boolean(nextData),
    candidateImageCount: candidateImageUrls.length,
    firstCandidateImages: candidateImageUrls.slice(0, 20),
    imageRequestCount: imageEntries.length,
    firstImageRequests: imageEntries.slice(0, 20),
    topKeys: nextData ? Object.keys(nextData.props || {}) : [],
  };

  console.log(JSON.stringify(summary, null, 2));
}

main();
