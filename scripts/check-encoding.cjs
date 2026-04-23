#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')
const { execSync } = require('node:child_process')

const repoRoot = path.resolve(__dirname, '..')
process.chdir(repoRoot)

const includeExtensions = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.cjs',
  '.mjs',
  '.json',
  '.md',
  '.css',
  '.scss',
  '.html',
  '.sql',
  '.txt',
  '.yml',
  '.yaml',
  '.env'
])

const includeNames = new Set([
  '.gitignore',
  '.gitattributes',
  '.editorconfig',
  'README',
  'README.md'
])

const ignorePrefixes = ['.git/', '.next/', 'node_modules/', 'tmp/']
const badMojibakePattern = /[\u00C3\u00C2\u00E2\u00C4\u00C5\u0139][\u0080-\u00BF]/
const replacementCharPattern = /\uFFFD/
const c1ControlPattern = /[\u0080-\u009F]/

function isTextCandidate(filePath) {
  if (ignorePrefixes.some((prefix) => filePath.startsWith(prefix))) return false

  const base = path.basename(filePath)
  if (includeNames.has(base)) return true

  const ext = path.extname(filePath).toLowerCase()
  if (includeExtensions.has(ext)) return true

  if (base.startsWith('.env')) return true

  return false
}

function getTrackedFiles() {
  try {
    const raw = execSync('git ls-files -z', { encoding: 'buffer', stdio: ['ignore', 'pipe', 'ignore'] })
    return raw
      .toString('utf8')
      .split('\0')
      .filter(Boolean)
      .filter((filePath) => isTextCandidate(filePath))
  } catch {
    return getTextCandidatesFromFs(repoRoot)
  }
}

function getTextCandidatesFromFs(rootDir) {
  const files = []
  const stack = ['']

  while (stack.length > 0) {
    const relativeDir = stack.pop()
    const absoluteDir = path.join(rootDir, relativeDir)
    const entries = fs.readdirSync(absoluteDir, { withFileTypes: true })

    for (const entry of entries) {
      const relativePath = relativeDir
        ? path.posix.join(relativeDir, entry.name)
        : entry.name

      if (entry.isDirectory()) {
        if (ignorePrefixes.some((prefix) => prefix.startsWith(`${relativePath}/`))) {
          continue
        }
        stack.push(relativePath)
        continue
      }

      if (entry.isFile() && isTextCandidate(relativePath)) {
        files.push(relativePath)
      }
    }
  }

  return files
}

function truncate(line) {
  const compact = line.trim().replace(/\s+/g, ' ')
  if (compact.length <= 120) return compact
  return `${compact.slice(0, 117)}...`
}

function collectLineHits(content) {
  const hits = []
  const lines = content.split(/\r?\n/)

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    if (
      badMojibakePattern.test(line) ||
      replacementCharPattern.test(line) ||
      c1ControlPattern.test(line)
    ) {
      hits.push({ line: i + 1, preview: truncate(line) })
      if (hits.length >= 5) break
    }
  }

  return hits
}

function main() {
  const decoder = new TextDecoder('utf-8', { fatal: true })
  const files = getTrackedFiles()
  const failures = []

  for (const filePath of files) {
    if (!fs.existsSync(filePath)) {
      continue
    }

    const bytes = fs.readFileSync(filePath)
    let content

    try {
      content = decoder.decode(bytes)
    } catch (error) {
      failures.push({
        filePath,
        reason: 'Invalid UTF-8 byte sequence',
        hits: []
      })
      continue
    }

    const hits = collectLineHits(content)
    if (hits.length > 0) {
      failures.push({
        filePath,
        reason: 'Suspicious mojibake/replacement/control characters',
        hits
      })
    }
  }

  if (failures.length > 0) {
    console.error(`Encoding check failed in ${failures.length} file(s):`)
    for (const failure of failures) {
      console.error(`- ${failure.filePath}: ${failure.reason}`)
      for (const hit of failure.hits) {
        console.error(`  line ${hit.line}: ${hit.preview}`)
      }
    }
    process.exit(1)
  }

  console.log(`Encoding check passed (${files.length} files checked).`)
}

main()
