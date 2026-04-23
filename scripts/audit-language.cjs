#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')

const root = process.cwd()

const targets = [
  'app',
  'components',
  'lib',
  'data/local-properties.json',
  'data/local-regions.json',
  'data/import/properties'
]

const textExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.json'])

const patterns = [
  {
    id: 'mojibake',
    re: new RegExp(['\\u0102', '\\u00C4', '\\u0139', '\\u00C5', '\\u00C2', '\\u00C3', '\\u00E2', '\\uFFFD'].join('|'))
  },
  {
    id: 'italian-missing-accents-or-apostrophes',
    re: /\b(?:proprieta|possibilita|qualita|citta|attivita|localita|continuita|luminosita|vivibilita|tranquillita|autenticita|responsabilita|disponibbile|perche|piu|gia|L appartamento|L abitazione|L immobile|L ingresso|L edificio|All esterno|All interno|All ultimo|all esterno|all interno|all ultimo|all aperto|all inglese|dell immobile|dell abitazione|dell uscita|d inverno|d epoca|Nell agro)\b/i
  },
  {
    id: 'italian-verb-e-without-accent',
    re: /\b(?:ed e\s+(?:attualmente|composto|posta|posto)|e dotata|e presente|e separata|e collegata|e composta|e ideale|e elevato|e servito|e completamente|e garantito|e disponibile|e comoda|e circondata)\b/i
  },
  {
    id: 'czech-property-residuals',
    re: /\b(?:Ctyr|ctyr|Samostatny|samostatny|Zrekonstruovany|Tripokojovy|radovy|garaz|parkovani|vytah|rezidencni|soukromym|vhodny|vhodne|reseni|vyuziti|dvere|mesto|mesta|meste|priblizne|vytapeni|bezpecnostni|pripojeni|podkrovnim|mistem|velke|pet|rezidencnim|dvojgaraz|klicove|kvalitni|alpsky|horske|potencialem)\b/
  },
  {
    id: 'czech-region-residuals',
    re: /\b(?:Zrekonstruovany|Univerzitni|smiseny|rezidencni|potencialem|blizkost|nejsirsich|realitnich|Kupujici|rekonstrukcni|Poptavka|lokalni|pronajmovym|klicove|vyzaduji|odlisny|Prijemne|vyuziti|Pobrezni|zony|kvalitni|stabilnim|pohranicni|jadranske|alpske|znamnejsim|severnim|zajimave|Majitele|preferujici|prakticke|kvalitnejsich|horskych|levnejsim|jiznim|peclive|proverit|zavazkem|profilovany|lyzarskych|drzi|kompaktni|vyjednavaci|zamerene|lyzarske|druheho|bydleni)\b/
  }
]

const allowLinePatterns = [
  /slug/i,
  /canonical/i,
  /url:/i,
  /href=/i,
  /current":/i,
  /keywords/i,
  /propertyTypes/i,
  /^\s*(?:en|link|href|url|canonical|temperature|CZK|text|title|note|includes|bridgeTitle|paragraphs|closing|description):/i,
  /data-testid/i,
  /searchPlaceholder/i,
  /more properties/i,
  /learn more/i,
  /more information/i,
  /more details/i,
  /more than/i,
  /much more/i,
  /and more/i,
  /no longer/i,
  /more complex/i,
  /more complete/i,
  /more processors/i,
  /spend more time/i,
  /more space/i,
  /Load 9 more/i,
  /annuncio non/i,
  /Italy's/i,
  /green heart/i,
  /more accessible/i
]

function collectFiles(target) {
  const full = path.join(root, target)
  if (!fs.existsSync(full)) return []
  const stat = fs.statSync(full)
  if (stat.isFile()) return textExtensions.has(path.extname(full)) ? [full] : []

  const files = []
  const stack = [full]
  while (stack.length) {
    const dir = stack.pop()
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const item = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.next') continue
        stack.push(item)
      } else if (entry.isFile() && textExtensions.has(path.extname(item))) {
        files.push(item)
      }
    }
  }
  return files
}

function lineAllowed(line) {
  return allowLinePatterns.some((pattern) => pattern.test(line))
}

const files = targets.flatMap(collectFiles)
const hits = []

for (const file of files) {
  const rel = path.relative(root, file).replace(/\\/g, '/')
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    if (lineAllowed(line)) continue
    for (const pattern of patterns) {
      if (pattern.re.test(line)) {
        hits.push({
          file: rel,
          line: index + 1,
          id: pattern.id,
          text: line.trim().slice(0, 180)
        })
        break
      }
    }
  }
}

if (hits.length > 0) {
  console.error(`Language audit failed with ${hits.length} suspicious line(s):`)
  for (const hit of hits.slice(0, 200)) {
    console.error(`- ${hit.file}:${hit.line} [${hit.id}] ${hit.text}`)
  }
  if (hits.length > 200) console.error(`...and ${hits.length - 200} more`)
  process.exit(1)
}

console.log(`Language audit passed (${files.length} files checked).`)
