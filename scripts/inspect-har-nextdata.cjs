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
  const pageProps = nextData?.props?.pageProps;

  function listKeys(obj, prefix = "", depth = 0, lines = []) {
    if (!obj || typeof obj !== "object" || depth > 3) return lines;
    for (const [key, value] of Object.entries(obj)) {
      const full = prefix ? `${prefix}.${key}` : key;
      const type = Array.isArray(value) ? `array(${value.length})` : typeof value;
      lines.push(`${full}: ${type}`);
      if (value && typeof value === "object" && !Array.isArray(value)) {
        listKeys(value, full, depth + 1, lines);
      }
    }
    return lines;
  }

  console.log(listKeys(pageProps).join("\n"));
}

main();
