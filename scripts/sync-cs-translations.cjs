#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

const ROOT = process.cwd();
const TARGET_DIRS = ["app", "components"];
const FILE_EXT_RE = /\.(js|jsx|ts|tsx)$/i;
const POLL_INTERVAL_MS = 1500;
const CACHE_DIR = path.join(ROOT, ".cache");
const CACHE_FILE = path.join(CACHE_DIR, "i18n-cs-sync-cache.json");

function loadEnvFile(fileName) {
  const fullPath = path.join(ROOT, fileName);
  if (!fs.existsSync(fullPath)) return;

  const lines = fs.readFileSync(fullPath, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const normalized = line.startsWith("export ") ? line.slice(7).trim() : line;
    const eqIndex = normalized.indexOf("=");
    if (eqIndex <= 0) continue;

    const key = normalized.slice(0, eqIndex).trim();
    let value = normalized.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const HAS_OPENAI = Boolean(OPENAI_API_KEY);

const STRING_LITERAL = String.raw`(?:'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|` + "`" + String.raw`(?:\\.|[^` + "`" + String.raw`\\])*` + "`" + String.raw`)`;
const TERNARY_RE = new RegExp(
  String.raw`(?<pre>language\s*===\s*['"]cs['"]\s*\?\s*)(?<cs>${STRING_LITERAL})(?<mid1>\s*:\s*\(?\s*language\s*===\s*['"]it['"]\s*\?\s*)(?<it>${STRING_LITERAL})(?<mid2>\s*:\s*)(?<en>${STRING_LITERAL})(?<post>\s*\)?)`,
  "g"
);

function parseArgs(argv) {
  const flags = new Set();
  const files = [];
  for (const arg of argv) {
    if (arg.startsWith("--")) {
      flags.add(arg);
    } else {
      files.push(arg);
    }
  }
  return {
    watch: flags.has("--watch"),
    all: flags.has("--all"),
    noInitial: flags.has("--no-initial"),
    files,
  };
}

function sha1(input) {
  return crypto.createHash("sha1").update(input).digest("hex");
}

function loadCache() {
  try {
    if (!fs.existsSync(CACHE_FILE)) return {};
    return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
  } catch {
    return {};
  }
}

function saveCache(cache) {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), "utf8");
}

function getAllTargetFiles() {
  const files = [];
  const stack = TARGET_DIRS.map((dir) => path.join(ROOT, dir)).filter((p) => fs.existsSync(p));

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
        continue;
      }
      if (entry.isFile() && FILE_EXT_RE.test(entry.name)) {
        files.push(full);
      }
    }
  }

  return files;
}

function getGitChangedFiles() {
  try {
    const output = execSync("git status --porcelain", {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf8",
    });

    return output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const filePart = line.slice(3).trim();
        if (filePart.includes(" -> ")) {
          return filePart.split(" -> ").pop();
        }
        return filePart;
      })
      .map((p) => path.resolve(ROOT, p))
      .filter((abs) => {
        if (!fs.existsSync(abs)) return false;
        if (!FILE_EXT_RE.test(abs)) return false;
        const rel = path.relative(ROOT, abs).replace(/\\/g, "/");
        return rel.startsWith("app/") || rel.startsWith("components/");
      });
  } catch {
    return [];
  }
}

function resolveTargetFiles(options) {
  if (options.files.length > 0) {
    return options.files
      .map((p) => path.resolve(ROOT, p))
      .filter((abs) => fs.existsSync(abs) && FILE_EXT_RE.test(abs));
  }

  if (options.all) {
    return getAllTargetFiles();
  }

  const changed = getGitChangedFiles();
  if (changed.length > 0) return changed;

  return getAllTargetFiles();
}

function literalToString(literal) {
  if (!literal || literal.length < 2) return null;
  if (literal.startsWith("`") && literal.includes("${")) return null;
  try {
    const value = Function(`"use strict"; return (${literal});`)();
    return typeof value === "string" ? value : null;
  } catch {
    return null;
  }
}

function quoteString(text, delimiter) {
  let out = text
    .replace(/\\/g, "\\\\")
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .replace(/\t/g, "\\t");

  if (delimiter === "'") {
    out = out.replace(/'/g, "\\'");
  } else if (delimiter === '"') {
    out = out.replace(/"/g, '\\"');
  } else if (delimiter === "`") {
    out = out.replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
  } else {
    return `'${out.replace(/'/g, "\\'")}'`;
  }

  return `${delimiter}${out}${delimiter}`;
}

async function translateText(text, targetLang, cache) {
  const cacheKey = `${targetLang}:${sha1(text)}`;
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  let translated = "";

  if (HAS_OPENAI) {
    const targetName = targetLang === "it" ? "Italian" : "English";
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.1,
        messages: [
          {
            role: "system",
            content:
              "You are a precise UI translator for a real-estate website. Translate from Czech to the target language. Keep tone concise and natural. Preserve emojis, numbers, punctuation, and formatting. Return only translated text.",
          },
          {
            role: "user",
            content: `Target language: ${targetName}\nText: ${text}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI translation failed (${response.status}): ${errorText}`);
    }

    const json = await response.json();
    translated = json?.choices?.[0]?.message?.content?.trim();
  } else {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=cs&tl=${encodeURIComponent(
      targetLang
    )}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google fallback translation failed (${response.status}): ${errorText}`);
    }
    const json = await response.json();
    translated = Array.isArray(json?.[0]) ? json[0].map((chunk) => chunk?.[0] || "").join("") : "";
  }

  if (!translated) {
    throw new Error("Translator returned an empty translation.");
  }

  cache[cacheKey] = translated;
  return translated;
}

async function replaceAsync(input, regex, asyncReplacer) {
  let result = "";
  let lastIndex = 0;
  regex.lastIndex = 0;
  let match;

  while ((match = regex.exec(input)) !== null) {
    result += input.slice(lastIndex, match.index);
    result += await asyncReplacer(match);
    lastIndex = regex.lastIndex;
  }

  result += input.slice(lastIndex);
  return result;
}

async function processFile(filePath, cache) {
  const original = fs.readFileSync(filePath, "utf8");
  let replacements = 0;

  const updated = await replaceAsync(original, TERNARY_RE, async (match) => {
    const { pre, cs, mid1, it, mid2, en, post } = match.groups;

    const csText = literalToString(cs);
    if (csText === null) return match[0];

    const itDelimiter = it[0];
    const enDelimiter = en[0];

    try {
      const [itText, enText] = await Promise.all([
        translateText(csText, "it", cache),
        translateText(csText, "en", cache),
      ]);

      const newIt = quoteString(itText, itDelimiter);
      const newEn = quoteString(enText, enDelimiter);

      if (newIt === it && newEn === en) return match[0];

      replacements += 1;
      return `${pre}${cs}${mid1}${newIt}${mid2}${newEn}${post}`;
    } catch (error) {
      console.error(`[i18n-sync] ${path.relative(ROOT, filePath)}: ${error.message}`);
      return match[0];
    }
  });

  if (updated !== original) {
    fs.writeFileSync(filePath, updated, "utf8");
    console.log(`[i18n-sync] updated ${path.relative(ROOT, filePath)} (${replacements} block${replacements === 1 ? "" : "s"})`);
    return true;
  }

  return false;
}

async function runOnce(options) {
  const cache = loadCache();
  const files = resolveTargetFiles(options);
  if (files.length === 0) {
    console.log("[i18n-sync] no target files found.");
    return;
  }

  let changed = 0;
  for (const filePath of files) {
    try {
      const didChange = await processFile(filePath, cache);
      if (didChange) changed += 1;
    } catch (error) {
      console.error(`[i18n-sync] failed on ${path.relative(ROOT, filePath)}: ${error.message}`);
    }
  }

  saveCache(cache);
  console.log(`[i18n-sync] done. changed files: ${changed}/${files.length}`);
}

async function runWatch(options) {
  const cache = loadCache();
  const mtimes = new Map();
  let running = false;

  const seed = getAllTargetFiles();
  for (const filePath of seed) {
    try {
      mtimes.set(filePath, fs.statSync(filePath).mtimeMs);
    } catch {}
  }

  if (!options.noInitial) {
    await runOnce({ ...options, all: true, files: [] });
  }

  console.log("[i18n-sync] watch mode active. Waiting for changes in app/ and components/ ...");

  setInterval(async () => {
    if (running) return;
    running = true;

    try {
      const files = getAllTargetFiles();
      const seen = new Set(files);

      for (const filePath of files) {
        let stat;
        try {
          stat = fs.statSync(filePath);
        } catch {
          continue;
        }
        const nextMtime = stat.mtimeMs;
        const prevMtime = mtimes.get(filePath);
        mtimes.set(filePath, nextMtime);

        if (prevMtime === undefined || nextMtime <= prevMtime) continue;
        await processFile(filePath, cache);
      }

      for (const known of Array.from(mtimes.keys())) {
        if (!seen.has(known)) {
          mtimes.delete(known);
        }
      }

      saveCache(cache);
    } finally {
      running = false;
    }
  }, POLL_INTERVAL_MS);
}

async function main() {
  if (!HAS_OPENAI) {
    console.log("[i18n-sync] OPENAI_API_KEY not found. Using Google Translate fallback.");
  }

  const options = parseArgs(process.argv.slice(2));
  if (options.watch) {
    await runWatch(options);
  } else {
    await runOnce(options);
  }
}

main().catch((error) => {
  console.error(`[i18n-sync] fatal error: ${error.message}`);
  process.exit(1);
});
