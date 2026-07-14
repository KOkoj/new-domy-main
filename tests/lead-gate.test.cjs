const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

test('gated and premium PDFs are absent from the public directory', () => {
  const pdfDirectory = path.join(root, 'public', 'pdfs')
  for (const filename of [
    'visite nuovo sito.pdf',
    'errori-comuni.pdf',
    'PDF Premium Domy 1.pdf (1).pdf',
    'Premium NOTÁŘ.pdf'
  ]) {
    assert.equal(fs.existsSync(path.join(pdfDirectory, filename)), false)
  }
  assert.doesNotMatch(read('next.config.js'), /source\s*:\s*['"]\/pdfs\//)
})

test('premium upload sources remain available outside public', () => {
  assert.equal(fs.existsSync(path.join(root, 'private', 'pdfs', 'premium-domy.pdf')), true)
  assert.equal(fs.existsSync(path.join(root, 'private', 'pdfs', 'premium-notary.pdf')), true)

  const uploadScript = read('scripts/upload-premium-pdfs.cjs')
  assert.match(uploadScript, /path\.join\(root, 'private', 'pdfs', 'premium-domy\.pdf'\)/)
  assert.match(uploadScript, /path\.join\(root, 'private', 'pdfs', 'premium-notary\.pdf'\)/)
})

test('target guide flows do not reference public PDF URLs', () => {
  assert.doesNotMatch(read('app/guides/inspections/free-pdf/page.js'), /\/pdfs\//)
  assert.doesNotMatch(read('app/guides/mistakes/page.js'), /\/pdfs\//)
  assert.doesNotMatch(read('app/guides/mistakes/free-pdf/page.js'), /\/pdfs\//)
})

test('lead migration keeps browser roles out of the table', () => {
  const migration = read('db/setup-leads.sql')
  assert.match(migration, /ALTER TABLE public\.leads ENABLE ROW LEVEL SECURITY/)
  assert.match(migration, /REVOKE ALL ON TABLE public\.leads FROM anon, authenticated/)
  assert.match(migration, /email CITEXT NOT NULL UNIQUE/)
  assert.match(migration, /confirm_token UUID NOT NULL.*UNIQUE/)
})

test('both free PDF landing pages are exempt from the Klub paywall', () => {
  const gate = read('components/ArticlePaywallGate.jsx')
  assert.match(gate, /pathname === '\/guides\/inspections\/free-pdf'/)
  assert.match(gate, /pathname === '\/guides\/mistakes\/free-pdf'/)
})
