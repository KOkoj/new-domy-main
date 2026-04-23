const fs = require("fs");

function decodeHarText(content) {
  if (!content || typeof content.text !== "string") return null;
  if (content.encoding === "base64") {
    return Buffer.from(content.text, "base64").toString("utf8");
  }
  return content.text;
}

function main() {
  const harPath = process.argv[2];
  const har = JSON.parse(fs.readFileSync(harPath, "utf8"));
  const entries = har?.log?.entries || [];
  const htmlEntry = entries.find((entry) => {
    const mime = entry?.response?.content?.mimeType || "";
    return /text\/html/i.test(mime) && /immobiliare\.it\/annunci\//i.test(entry?.request?.url || "");
  });
  const html = decodeHarText(htmlEntry?.response?.content || {});
  const match = html.match(/<script[^>]+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
  const nextData = JSON.parse(match[1]);
  const root = nextData?.props?.pageProps;
  const hits = [];

  function walk(value, path) {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, `${path}[${index}]`));
      return;
    }

    const keys = Object.keys(value);
    const joined = keys.join("|").toLowerCase();
    const score =
      ["price", "prezzo", "surface", "superficie", "rooms", "locali", "bath", "bagni", "image", "photo", "description", "descrizione", "label", "title", "estate", "property", "typology"]
        .reduce((acc, token) => acc + (joined.includes(token) ? 1 : 0), 0);

    if (score >= 4) {
      hits.push({ path, keys: keys.slice(0, 40), preview: JSON.stringify(value).slice(0, 800) });
    }

    for (const [key, child] of Object.entries(value)) {
      walk(child, path ? `${path}.${key}` : key);
    }
  }

  walk(root, "pageProps");
  console.log(JSON.stringify(hits.slice(0, 50), null, 2));
}

main();
