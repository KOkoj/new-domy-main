const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')

function loadRegionSlugNormalizer() {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'app', 'properties', 'filterConfig.js'),
    'utf8'
  )
  const aliases = source.match(/const REGION_SLUG_ALIASES = \{[\s\S]*?\n\};/)
  const normalizer = source.match(/export const toRegionSlug = \(value\) => \{[\s\S]*?\n\};/)

  assert.ok(aliases, 'region alias map must exist')
  assert.ok(normalizer, 'region slug normalizer must exist')

  const context = {}
  vm.runInNewContext(
    `${aliases[0]}\n${normalizer[0].replace('export const', 'const')}\nglobalThis.normalize = toRegionSlug`,
    context
  )
  return context.normalize
}

test('Italian, English and Czech region names use canonical filter slugs', () => {
  const normalize = loadRegionSlugNormalizer()
  const variants = {
    'friuli-venezia-giulia': ['Friuli-Venezia Giulia', 'Furlansko-Julské Benátsko'],
    lombardy: ['Lombardy', 'Lombardia', 'Lombardie'],
    marche: ['Marche', 'Marky'],
    piemonte: ['Piemonte', 'Piedmont', 'Piemont'],
    puglia: ['Puglia', 'Apulia', 'Apulie'],
    sardegna: ['Sardegna', 'Sardinia', 'Sardinie'],
    sicilia: ['Sicilia', 'Sicily', 'Sicílie'],
    toscana: ['Toscana', 'Tuscany', 'Toskánsko'],
    'trentino-alto-adige': ['Trentino-Alto Adige', 'Tridentsko-Horní Adiže'],
    umbria: ['Umbria', 'Umbrie'],
    'valle-d-aosta': ["Valle d'Aosta", 'Aosta Valley', 'Údolí Aosty'],
    veneto: ['Veneto', 'Benátsko']
  }

  for (const [canonicalSlug, names] of Object.entries(variants)) {
    for (const name of names) {
      assert.equal(normalize(name), canonicalSlug, `${name} should map to ${canonicalSlug}`)
    }
  }
})
