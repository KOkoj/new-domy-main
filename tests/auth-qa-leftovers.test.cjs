const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const root = path.resolve(__dirname, '..')

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

function stripExports(source) {
  return source
    .replace(/^import .*$/gm, '')
    .replaceAll('export const ', 'const ')
    .replaceAll('export function ', 'function ')
}

function run(source, names) {
  const sandbox = { module: { exports: {} }, exports: {}, console, process }
  vm.runInNewContext(`${source}\nmodule.exports = { ${names.join(', ')} }`, sandbox)
  return sandbox.module.exports
}

const AUTH_KEYS = [
  'resetSessionExpired',
  'emailNotConfirmed',
  'invalidCredentials',
  'userAlreadyRegistered',
  'emailRequired',
  'emailPasswordRequired',
  'nameEmailPasswordRequired',
  'currentPasswordInvalid',
  'emailRateLimited',
  'weakPassword',
  'samePassword',
  'otpExpired',
  'invalidToken',
  'unexpectedError'
]

test('EmailGateModal callers pass the active language', () => {
  assert.match(
    read('app/guides/inspections/free-pdf/page.js'),
    /<EmailGateModal source="pdf_inspections" assetKey="inspections" language=\{language\} \/>/
  )
  assert.match(
    read('app/guides/mistakes/free-pdf/page.js'),
    /<EmailGateModal source="pdf_mistakes" assetKey="mistakes" language=\{language\} \/>/
  )
  assert.equal((read('components/EmailGateModal.jsx').match(/EmailGateModal/g) || []).length, 1)
})

test('auth error keys exist in cs, en and it and Czech reset copy is localized', () => {
  const { t } = run(stripExports(read('lib/translations.js')), ['t'])
  for (const language of ['cs', 'en', 'it']) {
    for (const key of AUTH_KEYS) {
      const full = `auth.${key}`
      const value = t(full, language)
      assert.notEqual(value, full, `${language} ${full}`)
      assert.ok(String(value).length > 8, `${language} ${full}`)
    }
  }
  assert.equal(
    t('auth.resetSessionExpired', 'cs'),
    'Platnost odkazu vypršela. Požádejte o nový odkaz.'
  )
  assert.doesNotMatch(t('auth.resetSessionExpired', 'cs'), /Reset session expired/)
})

test('auth APIs return errorKey instead of English sentences', () => {
  const files = [
    'app/api/auth/reset-password/route.js',
    'app/api/auth/forgot-password/route.js',
    'app/api/auth/magic-link/route.js',
    'app/api/auth/login/route.js',
    'app/api/auth/signup/route.js',
    'app/api/auth/change-password/route.js'
  ]
  for (const relativePath of files) {
    const source = read(relativePath)
    assert.match(source, /authErrorPayload/, relativePath)
    assert.doesNotMatch(source, /Reset session expired\. Request a new link\./, relativePath)
    assert.doesNotMatch(source, /Email and password are required/, relativePath)
    assert.doesNotMatch(source, /NextResponse\.json\(\{\s*error:\s*error\.message/, relativePath)
    assert.doesNotMatch(source, /error: error\.message/, relativePath)
  }
  assert.match(read('app/reset-password/page.js'), /resolveAuthClientMessage/)
  assert.match(read('app/forgot-password/page.js'), /resolveAuthClientMessage/)
  assert.match(read('app/login/page.js'), /resolveAuthClientMessage/)
  assert.match(read('components/AuthModal.js'), /resolveAuthClientMessage/)
})

test('Supabase auth errors map to translation keys', () => {
  const { mapSupabaseAuthError, resolveAuthClientMessage } = run(
    stripExports(read('lib/authMessages.js')),
    ['mapSupabaseAuthError', 'resolveAuthClientMessage']
  )
  assert.equal(
    mapSupabaseAuthError({ message: 'Email not confirmed' }),
    'emailNotConfirmed'
  )
  assert.equal(
    mapSupabaseAuthError({ message: 'Invalid login credentials' }),
    'invalidCredentials'
  )
  assert.equal(
    mapSupabaseAuthError({ code: 'over_email_send_rate_limit' }),
    'emailRateLimited'
  )
  assert.equal(
    mapSupabaseAuthError({ message: 'User already registered' }),
    'userAlreadyRegistered'
  )
  const { t } = run(stripExports(read('lib/translations.js')), ['t'])
  const cs = (key) => t(`auth.${key}`, 'cs')
  assert.equal(
    resolveAuthClientMessage({ errorKey: 'resetSessionExpired' }, cs, 'resetUpdateFailed'),
    'Platnost odkazu vypršela. Požádejte o nový odkaz.'
  )
})

test('dashboard sidebar can scroll at short viewport heights', () => {
  const source = read('app/dashboard/DashboardLayoutClient.jsx')
  assert.match(source, /flex flex-col h-full min-h-0/)
  assert.match(source, /flex-1 min-h-0 overflow-y-auto/)
  assert.match(source, /p-4 border-t flex-shrink-0/)
})

test('welcome email Czech subject uses club wording', () => {
  const { getWelcomeEmailTemplate } = run(
    stripExports(read('lib/siteConfig.js')) + '\n' + stripExports(read('lib/welcomeEmail.js')),
    ['getWelcomeEmailTemplate']
  )
  const copy = getWelcomeEmailTemplate({ userName: 'Ana', language: 'cs' })
  assert.equal(copy.subject, 'Vítejte v klubu Domy v Itálii')
  assert.match(copy.intro, /vítejte v klubu Domy v Itálii/)
  assert.doesNotMatch(copy.subject, /^Vítejte v Domy/)
})

test('regions listing does not call the admin content API', () => {
  const source = read('app/regions/RegionsListingClient.jsx')
  assert.doesNotMatch(source, /\/api\/content\?type=regions/)
  assert.match(source, /const regionsData = initialRegions/)
})

test('property lot size formatting is locale-aware', () => {
  assert.match(
    read('app/properties/[slug]/PropertyDetailClient.jsx'),
    /toLocaleString\(language === 'cs' \? 'cs-CZ' : language === 'it' \? 'it-IT' : 'en-US'\)/
  )
})

test('site-page h1 on photo overlays can stay white', () => {
  const css = read('app/globals.css')
  assert.match(css, /\.site-page h1 \{[\s\S]*color: #111827/)
  assert.match(css, /\.site-page h1\.text-white \{\s*color: #ffffff;/)
  assert.match(read('components/RegionBanner.js'), /<h1 className="font-bold text-white mb-2 tracking-tight">/)
})

test('Supabase auth email templates and SMTP notes are in the repo', () => {
  const readme = read('docs/supabase-email-templates/README.md')
  assert.match(readme, /smtp\.resend\.com/)
  assert.match(readme, /465/)
  assert.match(readme, /Username \| `resend`/)
  assert.match(readme, /info@domyvitalii\.cz/)
  assert.doesNotMatch(readme, /re_[A-Za-z0-9]/)

  for (const file of ['confirm-signup.html', 'magic-link.html', 'reset-password.html']) {
    const html = read(`docs/supabase-email-templates/${file}`)
    assert.match(html, /\{\{ \.ConfirmationURL \}\}/)
    assert.match(html, /Domy v Itálii/)
    assert.match(html, /klubu Domy v Itálii/)
  }
})
