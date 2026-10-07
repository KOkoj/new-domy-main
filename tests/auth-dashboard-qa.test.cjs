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

test('forms.emailGate.consent exists in cs, en and it', () => {
  const { t } = run(stripExports(read('lib/translations.js')), ['t', 'translations'])
  for (const language of ['cs', 'en', 'it']) {
    const value = t('forms.emailGate.consent', language)
    assert.notEqual(value, 'forms.emailGate.consent', language)
    assert.ok(String(value).length > 20, language)
  }
  assert.match(t('forms.emailGate.consent', 'cs'), /Souhlasím/)
})

test('translation helper never returns raw forms.emailGate keys', () => {
  const { t } = run(stripExports(read('lib/translations.js')), ['t'])
  const keys = [
    'checkingAuth',
    'authenticated',
    'downloadPdf',
    'checkEmailTitle',
    'checkEmailDescription',
    'title',
    'email',
    'emailPlaceholder',
    'submitError',
    'submitting',
    'submit',
    'consent'
  ]
  for (const language of ['cs', 'en', 'it']) {
    for (const key of keys) {
      const full = `forms.emailGate.${key}`
      assert.notEqual(t(full, language), full, `${language} ${full}`)
    }
  }
})

test('language helpers default to Czech without reading client storage on first render', () => {
  const prefs = read('lib/userPreferences.js')
  assert.match(prefs, /export const DEFAULT_LANGUAGE = 'cs'/)
  assert.match(prefs, /export function getInitialLanguage\(\) \{\s*return DEFAULT_LANGUAGE\s*\}/)
  assert.doesNotMatch(read('app/dashboard/DashboardLayoutClient.jsx'), /useState\(['"]en['"]\)/)
  assert.doesNotMatch(read('app/dashboard/recommendations/page.js'), /useState\(['"]en['"]\)/)
  assert.match(read('app/layout.js'), /readLanguageFromCookies/)
})

test('password reset and magic link routes exist', () => {
  assert.match(read('app/api/auth/forgot-password/route.js'), /resetPasswordForEmail/)
  assert.match(read('app/api/auth/magic-link/route.js'), /signInWithOtp/)
  assert.match(read('app/api/auth/reset-password/route.js'), /updateUser\(\{ password/)
  assert.match(read('app/api/auth/change-password/route.js'), /signInWithPassword/)
  assert.match(read('app/forgot-password/page.js'), /forgotPasswordTitle/)
  assert.match(read('app/reset-password/page.js'), /saveNewPassword/)
  assert.match(read('components/AuthModal.js'), /forgot-password/)
  assert.match(read('app/login/page.js'), /forgot-password/)
  assert.match(read('components/AuthModal.js'), /\/api\/auth\/magic-link/)
})

test('auth modal title follows the active tab', () => {
  const source = read('components/AuthModal.js')
  assert.match(source, /activeTab === 'signup' \? tr\('signup'\) : tr\('login'\)/)
  assert.doesNotMatch(source, /const displayTitle = title \|\|/)
})

test('signup stores the submitted name on the profile and in metadata', () => {
  const signup = read('app/api/auth/signup/route.js')
  assert.match(signup, /full_name: trimmedName/)
  assert.match(signup, /first_name: firstName \|\| trimmedName/)
  assert.match(signup, /from\('profiles'\)/)
  assert.match(read('app/api/profile/route.js'), /reconcileProfileName/)
})

test('welcome email uses a fixed Domy v Itálii template and canonical URLs', () => {
  const emailService = read('lib/emailService.js')
  assert.match(emailService, /getWelcomeEmailTemplate/)
  assert.doesNotMatch(emailService, /generateAIContent\('welcome'/)
  assert.doesNotMatch(emailService, /TEST Jarvis/)
  const { getWelcomeEmailTemplate } = run(
    stripExports(read('lib/siteConfig.js')) + '\n' + stripExports(read('lib/welcomeEmail.js')),
    ['getWelcomeEmailTemplate']
  )
  const copy = getWelcomeEmailTemplate({
    userName: 'TEST jarvis',
    language: 'cs',
    dashboardUrl: 'https://www.domyvitalii.cz/dashboard'
  })
  assert.equal(copy.subject, 'Vítejte v Domy v Itálii')
  assert.match(copy.intro, /TEST jarvis/)
  assert.doesNotMatch(copy.subject, /TEST jarvis/)
  assert.equal(copy.dashboardUrl, 'https://www.domyvitalii.cz/dashboard')
})

test('public site URL ignores stale vercel.app env values', () => {
  const { getPublicSiteUrl, getPublicAbsoluteUrl } = run(
    stripExports(read('lib/siteConfig.js')) + '\n' + stripExports(read('lib/siteUrl.js')),
    ['getPublicSiteUrl', 'getPublicAbsoluteUrl']
  )
  const previous = process.env.NEXT_PUBLIC_BASE_URL
  process.env.NEXT_PUBLIC_BASE_URL = 'https://new-domy-main-z3ex.vercel.app'
  try {
    assert.equal(getPublicSiteUrl(), 'https://www.domyvitalii.cz')
    assert.equal(getPublicAbsoluteUrl('/dashboard'), 'https://www.domyvitalii.cz/dashboard')
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_BASE_URL
    else process.env.NEXT_PUBLIC_BASE_URL = previous
  }
})

test('dashboard listings come from real inventory helpers, not Lake Como placeholders', () => {
  for (const relativePath of [
    'app/dashboard/recommendations/page.js',
    'app/dashboard/inquiries/page.js',
    'app/dashboard/concierge/page.js'
  ]) {
    const source = read(relativePath)
    assert.doesNotMatch(source, /luxury-villa-lake-como/)
    assert.doesNotMatch(source, /concierge@domy\.com/)
    assert.doesNotMatch(source, /\+39 02 1234 5678/)
  }
  assert.match(read('app/dashboard/recommendations/page.js'), /selectDashboardRecommendations/)
  assert.match(read('app/dashboard/inquiries/page.js'), /mapApiPropertyForDashboard/)
  assert.match(read('app/dashboard/concierge/page.js'), /CONTACT_PHONE_DISPLAY/)
  assert.match(read('components/Navigation.js'), /mobile-logout-link/)
  assert.match(read('app/dashboard/intake-form/page.js'), /maybeSingle\(\)/)
})
