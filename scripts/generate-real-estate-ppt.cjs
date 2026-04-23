const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { extractListingData } = require("./extract-listing-data.cjs");

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizeSpace(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function shortTitle(listing) {
  const raw = normalizeSpace(listing.title);
  if (!raw) {
    return `Casa a ${normalizeSpace(listing.city || listing.address || "Ancona")}`;
  }

  const firstPart = raw.split(",")[0].trim();
  return firstPart.length <= 42 ? firstPart : firstPart.slice(0, 42).trim();
}

function cleanupDescription(text) {
  let cleaned = normalizeSpace(text)
    .replace(/Franchising Immobiliare Tempocasa[\s\S]*$/i, "")
    .replace(/Contattateci[\s\S]*$/i, "")
    .replace(/DA VEDERE ?!+[\s\S]*$/i, "")
    .replace(/Per maggiori informazioni[\s\S]*$/i, "")
    .replace(/Chiamaci[\s\S]*$/i, "")
    .trim();

  if (cleaned.length <= 1650) return cleaned;

  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  const kept = [];
  for (const sentence of sentences) {
    const candidate = [...kept, sentence].join(" ");
    if (candidate.length > 1650) break;
    kept.push(sentence);
  }

  return kept.join(" ").trim() || cleaned.slice(0, 1650).trim();
}

function formatPrice(raw) {
  const digits = String(raw || "").replace(/[^\d]/g, "");
  if (!digits) return "";
  return `${Number(digits).toLocaleString("it-IT")} EUR`;
}

function formatSurface(raw) {
  const match = String(raw || "").match(/\d+(?:[.,]\d+)?/);
  return match ? `${match[0].replace(",", ".")} m2` : "";
}

function buildSpecsParagraphs(listing) {
  return [
    formatSurface(listing.surface),
    "",
    normalizeSpace(listing.rooms),
    "",
    normalizeSpace(listing.bedrooms),
    "",
    normalizeSpace(listing.bathrooms),
    "",
    "mappa",
    "",
    "",
    ` ${formatPrice(listing.priceLabel)}`,
  ];
}

function replaceShapeText(slideXml, shapeName, newText) {
  const nameMarker = `name="${shapeName}"`;
  const markerIndex = slideXml.indexOf(nameMarker);
  if (markerIndex === -1) {
    throw new Error(`Shape "${shapeName}" not found`);
  }

  const shapeStart = slideXml.lastIndexOf("<p:sp", markerIndex);
  const shapeEnd = slideXml.indexOf("</p:sp>", markerIndex);
  if (shapeStart === -1 || shapeEnd === -1) {
    throw new Error(`Shape bounds for "${shapeName}" not found`);
  }

  const shapeBlock = slideXml.slice(shapeStart, shapeEnd + "</p:sp>".length);
  let replaced = false;
  const updatedShape = shapeBlock.replace(/<a:t>[\s\S]*?<\/a:t>/g, () => {
    if (replaced) return "<a:t></a:t>";
    replaced = true;
    return `<a:t>${escapeXml(newText)}</a:t>`;
  });

  return `${slideXml.slice(0, shapeStart)}${updatedShape}${slideXml.slice(shapeEnd + "</p:sp>".length)}`;
}

function replaceShapeParagraphTexts(slideXml, shapeName, paragraphTexts) {
  const nameMarker = `name="${shapeName}"`;
  const markerIndex = slideXml.indexOf(nameMarker);
  if (markerIndex === -1) {
    throw new Error(`Shape "${shapeName}" not found`);
  }

  const shapeStart = slideXml.lastIndexOf("<p:sp", markerIndex);
  const shapeEnd = slideXml.indexOf("</p:sp>", markerIndex);
  if (shapeStart === -1 || shapeEnd === -1) {
    throw new Error(`Shape bounds for "${shapeName}" not found`);
  }

  const shapeBlock = slideXml.slice(shapeStart, shapeEnd + "</p:sp>".length);
  let paragraphIndex = 0;
  const updatedShape = shapeBlock.replace(/<a:p>[\s\S]*?<\/a:p>/g, (paragraphXml) => {
    const nextText = paragraphTexts[paragraphIndex] ?? "";
    paragraphIndex += 1;

    if (!paragraphXml.includes("<a:t>")) {
      return paragraphXml;
    }

    let replaced = false;
    return paragraphXml.replace(/<a:t>[\s\S]*?<\/a:t>/g, () => {
      if (replaced) return "<a:t></a:t>";
      replaced = true;
      return `<a:t>${escapeXml(nextText)}</a:t>`;
    });
  });

  return `${slideXml.slice(0, shapeStart)}${updatedShape}${slideXml.slice(shapeEnd + "</p:sp>".length)}`;
}

function getImageRelIdsInOrder(slideXml) {
  const relIds = [];
  const regex = /<a:blip[^>]*r:embed="([^"]+)"/g;
  let match;
  while ((match = regex.exec(slideXml))) {
    relIds.push(match[1]);
  }
  return relIds;
}

function getRelationshipTargets(relsXml) {
  const rels = new Map();
  const regex = /<Relationship[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"[^>]*\/>/g;
  let match;
  while ((match = regex.exec(relsXml))) {
    rels.set(match[1], match[2]);
  }
  return rels;
}

function resolveTarget(baseDir, relTarget) {
  return path.resolve(baseDir, relTarget.replace(/\//g, path.sep));
}

async function writeImageToTarget(sourcePath, targetPath) {
  if (!sourcePath || !fs.existsSync(sourcePath)) {
    return false;
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  const targetExt = path.extname(targetPath).toLowerCase();

  if (path.extname(sourcePath).toLowerCase() === targetExt) {
    fs.copyFileSync(sourcePath, targetPath);
    return true;
  }

  await sharp(sourcePath).toFile(targetPath);
  return true;
}

function removeFileIfExists(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

async function main() {
  const extractedDir = process.argv[2];
  const harDir = process.argv[3];
  const workDir = process.argv[4] || path.join(process.cwd(), "tmp", "generated-ppt-data");

  if (!extractedDir || !harDir) {
    console.error("Usage: node scripts/generate-real-estate-ppt.cjs <extracted-ppt-dir> <har-dir> [work-dir]");
    process.exit(1);
  }

  const harFiles = fs
    .readdirSync(harDir)
    .filter((name) => /^Ancona\d+\.har$/i.test(name))
    .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));

  const listings = [];
  fs.mkdirSync(workDir, { recursive: true });

  for (let index = 0; index < harFiles.length; index += 1) {
    const harName = harFiles[index];
    const listingDir = path.join(workDir, `listing-${index + 1}`);
    const listing = extractListingData(path.join(harDir, harName), listingDir);
    listings.push(listing);
    fs.writeFileSync(path.join(listingDir, "listing.json"), JSON.stringify(listing, null, 2));
  }

  const slidesDir = path.join(extractedDir, "ppt", "slides");
  const slideRelsDir = path.join(slidesDir, "_rels");
  const mediaBaseDir = path.join(extractedDir, "ppt");

  for (let index = 0; index < listings.length; index += 1) {
    const listing = listings[index];
    const number = index + 1;
    const oddSlide = number * 2 - 1;
    const evenSlide = number * 2;

    const oddSlidePath = path.join(slidesDir, `slide${oddSlide}.xml`);
    const oddRelsPath = path.join(slideRelsDir, `slide${oddSlide}.xml.rels`);
    const evenSlidePath = path.join(slidesDir, `slide${evenSlide}.xml`);
    const evenRelsPath = path.join(slideRelsDir, `slide${evenSlide}.xml.rels`);

    let oddSlideXml = fs.readFileSync(oddSlidePath, "utf8");
    let evenSlideXml = fs.readFileSync(evenSlidePath, "utf8");
    const oddRelsXml = fs.readFileSync(oddRelsPath, "utf8");
    const evenRelsXml = fs.readFileSync(evenRelsPath, "utf8");

    oddSlideXml = replaceShapeText(oddSlideXml, "Titolo 1", `${number}. ${shortTitle(listing)}`);
    oddSlideXml = replaceShapeParagraphTexts(oddSlideXml, "Segnaposto contenuto 2", buildSpecsParagraphs(listing));
    evenSlideXml = replaceShapeText(evenSlideXml, "Rettangolo 3", `${number}. ${cleanupDescription(listing.description)}`);

    fs.writeFileSync(oddSlidePath, oddSlideXml, "utf8");
    fs.writeFileSync(evenSlidePath, evenSlideXml, "utf8");

    const oddRelMap = getRelationshipTargets(oddRelsXml);
    const oddImageRelIds = getImageRelIdsInOrder(oddSlideXml);
    const evenRelMap = getRelationshipTargets(evenRelsXml);
    const evenImageRelIds = getImageRelIdsInOrder(evenSlideXml);

    const leftImageSource =
      listing.saved.planPath ||
      listing.saved.galleryPaths[0] ||
      listing.saved.mainPath;

    const oddTargets = oddImageRelIds.map((relId) => resolveTarget(mediaBaseDir, oddRelMap.get(relId)));
    if (oddTargets[0]) await writeImageToTarget(leftImageSource, oddTargets[0]);
    if (oddTargets[1]) await writeImageToTarget(listing.saved.mainPath || leftImageSource, oddTargets[1]);

    const evenTargets = evenImageRelIds.map((relId) => resolveTarget(mediaBaseDir, evenRelMap.get(relId)));
    for (let i = 0; i < evenTargets.length; i += 1) {
      const source =
        listing.saved.galleryPaths[i] ||
        listing.saved.galleryPaths[listing.saved.galleryPaths.length - 1] ||
        listing.saved.mainPath;
      if (evenTargets[i]) {
        await writeImageToTarget(source, evenTargets[i]);
      }
    }
  }

  const presentationRelsPath = path.join(extractedDir, "ppt", "_rels", "presentation.xml.rels");
  const presentationPath = path.join(extractedDir, "ppt", "presentation.xml");
  const contentTypesPath = path.join(extractedDir, "[Content_Types].xml");
  const appPropsPath = path.join(extractedDir, "docProps", "app.xml");

  let presentationRelsXml = fs.readFileSync(presentationRelsPath, "utf8");
  const removeRelIds = [];
  for (let slideNumber = listings.length * 2 + 1; slideNumber <= 34; slideNumber += 1) {
    const relMatch = presentationRelsXml.match(new RegExp(`<Relationship[^>]*Id="([^"]+)"[^>]*Target="slides/slide${slideNumber}\\.xml"[^>]*/>`));
    if (relMatch) {
      removeRelIds.push(relMatch[1]);
      presentationRelsXml = presentationRelsXml.replace(relMatch[0], "");
    }
  }
  fs.writeFileSync(presentationRelsPath, presentationRelsXml, "utf8");

  let presentationXml = fs.readFileSync(presentationPath, "utf8");
  for (const relId of removeRelIds) {
    presentationXml = presentationXml.replace(new RegExp(`<p:sldId[^>]*r:id="${relId}"[^>]*/>`, "g"), "");
  }
  fs.writeFileSync(presentationPath, presentationXml, "utf8");

  let contentTypesXml = fs.readFileSync(contentTypesPath, "utf8");
  for (let slideNumber = listings.length * 2 + 1; slideNumber <= 34; slideNumber += 1) {
    contentTypesXml = contentTypesXml.replace(
      new RegExp(`<Override PartName="/ppt/slides/slide${slideNumber}\\.xml" ContentType="application/vnd\\.openxmlformats-officedocument\\.presentationml\\.slide\\+xml"\\s*/>`, "g"),
      ""
    );
  }
  fs.writeFileSync(contentTypesPath, contentTypesXml, "utf8");

  if (fs.existsSync(appPropsPath)) {
    let appPropsXml = fs.readFileSync(appPropsPath, "utf8");
    appPropsXml = appPropsXml.replace(/<Slides>\d+<\/Slides>/, `<Slides>${listings.length * 2}</Slides>`);
    fs.writeFileSync(appPropsPath, appPropsXml, "utf8");
  }

  for (let slideNumber = listings.length * 2 + 1; slideNumber <= 34; slideNumber += 1) {
    removeFileIfExists(path.join(slidesDir, `slide${slideNumber}.xml`));
    removeFileIfExists(path.join(slideRelsDir, `slide${slideNumber}.xml.rels`));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
