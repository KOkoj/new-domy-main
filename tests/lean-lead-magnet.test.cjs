const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const root = path.resolve(__dirname, '..')

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

function loadModule(relativePath, names, extraContext = {}) {
  const { stripImports, ...globals } = extraContext
  let source = read(relativePath).replace(/export (const|function|async function) /g, '$1 ')
  if (stripImports) source = source.replace(/^import .*$/gm, '')
  const context = { module: { exports: {} }, process: { env: {} }, console, ...globals }
  vm.runInNewContext(`${source}\nmodule.exports = { ${names.join(', ')} }`, context)
  return context.module.exports
}

function memoryStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  }
}

test('registration: Google + one e-mail field, the server e-mails a generated password', () => {
  const form = read('components/auth/PasswordAuthForm.js')
  assert.doesNotMatch(form, /confirmPassword|fullName|\/api\/auth\/signup|send-code|verify-otp|one-time-code/)
  assert.match(form, /type="email"/)
  assert.match(form, /\/api\/auth\/register/)
  assert.match(form, /\/api\/auth\/forgot-password/)
  assert.match(form, /\/api\/auth\/login/)
  assert.match(form, /RESEND_COOLDOWN_SECONDS/)
  assert.match(form, /website/, 'honeypot field')
  assert.match(form, /<GoogleSignInButton/)
  for (const mode of ['register', 'registerSent', 'login', 'forgot', 'forgotSent']) {
    assert.match(form, new RegExp(`'${mode}'`), mode)
  }

  const google = read('components/auth/GoogleSignInButton.js')
  assert.match(google, /signInWithOAuth\(\{\s*provider: 'google'/)
  assert.match(google, /\/auth\/callback\?/)
  assert.match(google, /getSafeRedirectPath\(nextPath/)

  const modal = read('components/AuthModal.js')
  assert.match(modal, /<PasswordAuthForm/)
  assert.match(modal, /\/registrace\?redirect=/)
  assert.match(modal, /getSafeRedirectPath/)

  const login = read('app/login/page.js')
  assert.doesNotMatch(login, /confirmPassword|fullName|\/api\/auth\/signup|TabsTrigger/)
  assert.match(login, /<PasswordAuthForm/)

  const page = read('app/registrace/page.js')
  assert.match(page, /<PasswordAuthForm/)
  assert.match(page, /initialMode="register"/)
  assert.match(page, /getSafeRedirectPath\(params\.get\('redirect'\)/)

  for (const removed of ['app/api/auth/send-code/route.js', 'app/api/auth/verify-otp/route.js', 'app/api/auth/magic-link/route.js', 'app/api/auth/reset-password/route.js', 'components/auth/EmailCodeSignIn.js']) {
    assert.equal(fs.existsSync(path.join(root, removed)), false, removed)
  }
})

test('register and forgot-password routes: rate limit, same answer, password only in the e-mail', () => {
  const register = read('app/api/auth/register/route.js')
  assert.match(register, /createUser\(\{[\s\S]*email_confirm: true/)
  assert.match(register, /welcome_email_sent: true/)
  assert.match(register, /PASSWORD_EMAIL_LIMITS/)
  assert.match(register, /savePendingPassword/, 'existing account gets a pending password')
  assert.match(register, /deleteUser/, 'account removed when the e-mail fails')
  assert.doesNotMatch(register, /password[^\n]*NextResponse\.json\(\{[^}]*password/)

  const forgot = read('app/api/auth/forgot-password/route.js')
  assert.doesNotMatch(forgot, /resetPasswordForEmail/)
  assert.match(forgot, /PASSWORD_EMAIL_LIMITS/)
  assert.match(forgot, /savePendingPassword/)
  assert.match(forgot, /return NextResponse\.json\(\{ success: true \}\)\s*\} catch/, 'same answer for unknown e-mails')

  const loginRoute = read('app/api/auth/login/route.js')
  assert.match(loginRoute, /signInWithPassword/)
  assert.match(loginRoute, /applyPendingPassword/)
  assert.match(loginRoute, /getSafeRedirectPath\(next\)/)

  const change = read('app/api/auth/change-password/route.js')
  assert.match(change, /isCurrentPassword/)
  assert.match(change, /isValidNewPassword/)
  assert.match(change, /deletePendingPassword/)

  const lib = read('lib/passwordAuth.js')
  assert.match(lib, /max: 5, windowMs: 60 \* 60 \* 1000/)
  assert.match(lib, /max: 10, windowMs: 15 \* 60 \* 1000/)
  assert.match(lib, /PENDING_PASSWORD_TTL_MS = 24 \* 60 \* 60 \* 1000/)
  assert.match(lib, /sensitive: true/)

  const sql = read('db/setup-password-auth.sql')
  assert.match(sql, /create table if not exists public\.pending_passwords/)
  assert.match(sql, /enable row level security/)
  assert.match(sql, /grant execute on function public\.find_auth_user_by_email\(text\) to service_role/)
})

test('no "Magic Link" wording is left in the UI, translations or e-mails', () => {
  for (const file of ['lib/translations.js', 'lib/passwordEmail.js', 'components/AuthModal.js', 'app/login/page.js', 'components/auth/PasswordAuthForm.js', 'app/registrace/page.js', 'docs/supabase-email-templates/README.md']) {
    assert.doesNotMatch(read(file), /magic ?link|magicLink/i, file)
  }
})

test('auth input helpers', () => {
  const input = loadModule('lib/authInput.js', [
    'normalizeEmailAddress', 'isValidEmailAddress', 'normalizePastedPassword', 'isValidNewPassword',
    'GENERATED_PASSWORD_LENGTH', 'RESEND_COOLDOWN_SECONDS', 'MIN_PASSWORD_LENGTH'
  ])
  assert.equal(input.GENERATED_PASSWORD_LENGTH, 8)
  assert.equal(input.RESEND_COOLDOWN_SECONDS, 60)
  assert.equal(input.MIN_PASSWORD_LENGTH, 8)
  assert.equal(input.normalizeEmailAddress('  Jana@Example.CZ '), 'jana@example.cz')
  assert.equal(input.isValidEmailAddress('jana@example.cz'), true)
  assert.equal(input.isValidEmailAddress('jana@example'), false)
  assert.equal(input.isValidEmailAddress('jana example.cz'), false)
  assert.equal(input.normalizePastedPassword(' K7M4P9QX\n'), 'K7M4P9QX')
  assert.equal(input.normalizePastedPassword('k7m4p9qx'), 'k7m4p9qx', 'letter case is kept')
  assert.equal(input.isValidNewPassword('1234567'), false)
  assert.equal(input.isValidNewPassword('12345678'), true)
})

test('generated passwords: 8 chars, upper-case letters + digits, no look-alikes; scrypt hash round-trip', async () => {
  const crypto = require('crypto')
  const util = require('util')
  const input = loadModule('lib/authInput.js', ['GENERATED_PASSWORD_LENGTH', 'GENERATED_PASSWORD_LETTERS', 'GENERATED_PASSWORD_DIGITS', 'RESEND_COOLDOWN_SECONDS'])
  let source = read('lib/passwordAuth.js')
    .replace(/^import[\s\S]*?from '[^']+'$/gm, '')
    .replace(/export (const|function|async function) /g, '$1 ')
  const context = {
    module: { exports: {} }, process: { env: {} }, console, Buffer,
    createHash: crypto.createHash, randomBytes: crypto.randomBytes, randomInt: crypto.randomInt,
    scryptCallback: crypto.scrypt, timingSafeEqual: crypto.timingSafeEqual, promisify: util.promisify,
    ...input
  }
  vm.runInNewContext(`${source}\nmodule.exports = { generatePassword, hashPassword, verifyPasswordHash, isEmailExistsError }`, context)
  const lib = context.module.exports
  for (let i = 0; i < 200; i += 1) {
    const value = lib.generatePassword()
    assert.match(value, /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/)
    assert.match(value, /[A-Z]/)
    assert.match(value, /[0-9]/)
  }
  const hash = await lib.hashPassword('K7M4P9QX')
  assert.match(hash, /^scrypt\$/)
  assert.doesNotMatch(hash, /K7M4P9QX/)
  assert.equal(await lib.verifyPasswordHash('K7M4P9QX', hash), true)
  assert.equal(await lib.verifyPasswordHash('k7m4p9qx', hash), false)
  assert.equal(await lib.verifyPasswordHash('K7M4P9QX', 'garbage'), false)
  assert.equal(lib.isEmailExistsError({ code: 'email_exists' }), true)
  assert.equal(lib.isEmailExistsError({ message: 'A user with this email address has already been registered' }), true)
  assert.equal(lib.isEmailExistsError({ message: 'Database error' }), false)
})

test('password e-mails 5a/5b use the Figma copy and only a plain link to the website', () => {
  const mail = loadModule('lib/passwordEmail.js', ['buildPasswordEmail', 'AUTH_EMAIL_FROM_DEFAULT'])
  assert.equal(mail.AUTH_EMAIL_FROM_DEFAULT, 'Domy v Itálii <info@domyvitalii.cz>')
  const a = mail.buildPasswordEmail({ kind: 'registration', email: 'jana@example.cz', password: 'K7M4P9QX', loginUrl: 'https://domyvitalii.cz/login' })
  assert.equal(a.subject, 'Vaše heslo do Klubu Domy v Itálii')
  for (const text of ['Vítejte v Klubu Domy v Itálii', 'Dobrý den, děkujeme za registraci. Tady je heslo k vašemu účtu:', 'VAŠE HESLO', 'K7M4P9QX', 'Rozlišujte velká a malá písmena.', 'Přihlásit se na domyvitalii.cz', 'Vlastní heslo si můžete nastavit po přihlášení v Nastavení účtu.', 'Creavita s.r.o.']) {
    assert.ok(a.html.includes(text), text)
    assert.ok(a.text.includes(text), text)
  }
  assert.equal((a.html.match(/href=/g) || []).length, 1)
  assert.ok(a.html.includes('href="https://domyvitalii.cz/login"'))

  const b = mail.buildPasswordEmail({ kind: 'newPassword', email: 'jana@example.cz', password: 'R2T8W5NB', loginUrl: 'https://domyvitalii.cz/login' })
  assert.equal(b.subject, 'Nové heslo do Klubu Domy v Itálii')
  assert.ok(b.html.includes('NOVÉ HESLO'))
  assert.ok(b.text.includes('Vaše dosavadní heslo platí dál, dokud se nepřihlásíte tímto novým.'))
  const evil = mail.buildPasswordEmail({ kind: 'registration', email: '<script>@x.cz', password: 'K7M4P9QX', loginUrl: 'https://domyvitalii.cz/login' })
  assert.doesNotMatch(evil.html, /<script>/)
})

test('auth errors map to clear keys (rate limits, unknown errors)', () => {
  const messages = loadModule('lib/authMessages.js', ['mapSupabaseAuthError'])
  assert.equal(messages.mapSupabaseAuthError({ code: 'invalid_credentials' }), 'invalidCredentials')
  assert.equal(messages.mapSupabaseAuthError({ code: 'over_email_send_rate_limit' }), 'emailRateLimited')
  assert.equal(messages.mapSupabaseAuthError({ status: 429, message: 'x' }), 'overRequestRateLimit')
  assert.equal(messages.mapSupabaseAuthError({ code: 'validation_failed' }), 'invalidEmail')
  assert.equal(messages.mapSupabaseAuthError({ message: '???' }, 'passwordEmailFailed'), 'passwordEmailFailed')
})

test('Nastavení účtu: change password only when signed in, current password checked', () => {
  const settings = read('app/dashboard/settings/page.js')
  assert.match(settings, /\/api\/auth\/change-password/)
  assert.match(settings, /googleOnlyInfo/)
  assert.doesNotMatch(settings, /forgot|Zapomenut/i, 'no "forgot password" link in settings')
  assert.match(read('app/dashboard/DashboardLayoutClient.jsx'), /\/dashboard\/settings/)
})

test('first sign-in work is shared by the callback and the login route', () => {
  const callback = read('app/auth/callback/route.js')
  assert.match(callback, /completeEmailSignIn/)
  assert.match(callback, /type !== 'recovery'/)
  assert.match(callback, /token_hash: tokenHash/)
  assert.match(callback, /'email'/)
  const onboarding = read('lib/authOnboarding.js')
  assert.match(onboarding, /email_confirmed_at/)
  assert.match(onboarding, /app_metadata: \{ welcome_email_sent: true \}/)
  assert.match(onboarding, /const \{ error \} = await supabase\.auth\.updateUser/)
  assert.match(read('app/api/auth/signup/route.js'), /welcome_email_sent: true/)

  const { hasWelcomeFlag, isFreshlyConfirmed } = loadModule('lib/authOnboarding.js', [
    'hasWelcomeFlag', 'isFreshlyConfirmed'
  ], { stripImports: true })
  const now = Date.parse('2026-11-18T12:00:00Z')
  assert.equal(isFreshlyConfirmed({ email_confirmed_at: '2026-11-18T11:55:00Z' }, now), true)
  assert.equal(isFreshlyConfirmed({ email_confirmed_at: '2026-11-17T11:55:00Z' }, now), false)
  assert.equal(isFreshlyConfirmed({}, now), false)
  assert.equal(hasWelcomeFlag({ app_metadata: { welcome_email_sent: true } }), true)
  assert.equal(hasWelcomeFlag({ user_metadata: { welcome_email_sent: true } }), true)
  assert.equal(hasWelcomeFlag({}), false)
})

test('welcome e-mail without a name greets neutrally', () => {
  const source = read('lib/welcomeEmail.js')
  assert.doesNotMatch(source, /'u nás'/)
  assert.match(source, /`Dobrý den, vítejte v klubu \$\{brand\}\.`/)
})

test('post-auth redirects reject protocol-relative, control-char and foreign targets', () => {
  const { getSafeRedirectPath } = loadModule('lib/safeRedirect.js', ['getSafeRedirectPath'], { URL })
  assert.equal(getSafeRedirectPath('/properties/x?a=1'), '/properties/x?a=1')
  assert.equal(getSafeRedirectPath('/properties/x#g'), '/properties/x#g')
  for (const evil of [
    '//evil.example',
    '/\\evil.example',
    '/\\/evil.example',
    'https://evil.example',
    '/\t/evil.example',
    '/\n/evil.example',
    '/\r/evil.example',
    '/%09/evil.example',
    '/%0a/evil.example',
    '/%5Cevil.example',
    '/%2F/evil.example',
    decodeURIComponent('/%09/evil.example'),
    'javascript:alert(1)',
    ''
  ]) {
    assert.equal(getSafeRedirectPath(evil), '/dashboard', JSON.stringify(evil))
  }
  assert.equal(getSafeRedirectPath(undefined, '/x'), '/x')

  for (const file of ['components/AuthModal.js', 'app/login/page.js', 'app/auth/callback/route.js', 'app/registrace/page.js']) {
    assert.match(read(file), /getSafeRedirectPath/, file)
  }
})

test('Klub modal is no longer an intermediate step and homepage articles have no fake lock', () => {
  const home = read('app/HomePageClient.jsx')
  assert.doesNotMatch(home, /KlubInfoModal|setIsKlubModalOpen/)
  assert.doesNotMatch(home, /Zaregistrujte se pro čtení|Register to read|Registrati per leggere/)
  assert.equal(fs.existsSync(path.join(root, 'components/KlubInfoModal.js')), false)
})

test('pending favorites only add, never toggle an existing favorite off', async () => {
  const mod = loadModule('lib/pendingFavorites.js', [
    'rememberPendingFavorite',
    'readPendingFavorites',
    'flushPendingFavorites',
    'rememberUnlockedListing',
    'isListingUnlocked'
  ], { JSON })
  const storage = memoryStorage()
  mod.rememberPendingFavorite('a', storage)
  mod.rememberPendingFavorite('b', storage)
  mod.rememberPendingFavorite('a', storage)
  assert.deepEqual([...mod.readPendingFavorites(storage)], ['b', 'a'])

  const calls = []
  const fetchImpl = async (_url, init) => {
    const body = JSON.parse(init.body)
    assert.equal(body.action, 'add')
    calls.push(body.listingId)
    return { ok: true, json: async () => ({ favorited: true }) }
  }
  const result = await mod.flushPendingFavorites(['a'], { fetchImpl, storage })
  assert.deepEqual(calls, ['b'])
  assert.deepEqual([...result].sort(), ['a', 'b'])
  assert.equal(mod.readPendingFavorites(storage).length, 0)

  // Concurrent flushes share one request round; 4xx drops, 5xx keeps.
  mod.rememberPendingFavorite('c', storage)
  mod.rememberPendingFavorite('d', storage)
  mod.rememberPendingFavorite('e', storage)
  const concurrentCalls = []
  const statusById = { c: 200, d: 400, e: 503 }
  const slowFetch = async (_url, init) => {
    const { listingId } = JSON.parse(init.body)
    concurrentCalls.push(listingId)
    await new Promise((resolve) => setTimeout(resolve, 5))
    const status = statusById[listingId]
    return { ok: status === 200, status, json: async () => ({ favorited: true }) }
  }
  const [first, second] = await Promise.all([
    mod.flushPendingFavorites([1], { fetchImpl: slowFetch, storage }),
    mod.flushPendingFavorites([1], { fetchImpl: slowFetch, storage })
  ])
  assert.equal(first, second)
  assert.deepEqual(concurrentCalls, ['c', 'd', 'e'])
  assert.deepEqual([...first].sort(), ['1', 'c'])
  assert.deepEqual([...mod.readPendingFavorites(storage)], ['e'])

  const toggle = read('app/api/favorites/toggle/route.js')
  assert.match(toggle, /existing && addOnly/)

  assert.equal(mod.isListingUnlocked('casa', storage), false)
  mod.rememberUnlockedListing('casa', storage)
  assert.equal(mod.isListingUnlocked('casa', storage), true)
})

test('exclusive gallery lock flag is OFF unless explicitly 1/true', () => {
  const { isExclusiveGalleryLockOn } = loadModule('lib/featureFlags.js', ['isExclusiveGalleryLockOn'])
  for (const value of [undefined, '', '0', 'false', 'off', 'yes']) {
    assert.equal(isExclusiveGalleryLockOn(value), false, String(value))
  }
  assert.equal(isExclusiveGalleryLockOn('1'), true)
  assert.equal(isExclusiveGalleryLockOn('true'), true)
  assert.match(read('env.template'), /NEXT_PUBLIC_EXCLUSIVE_GALLERY_LOCK=0/)
})

test('soft lock keeps title + 2 photos, hides video, and only applies to exclusive logged-out visitors', () => {
  const lock = loadModule('lib/exclusiveLock.js', [
    'shouldLockExclusive',
    'getPublicGallery',
    'approximateLatLng'
  ])
  const exclusive = { exclusive: true }
  assert.equal(lock.shouldLockExclusive({ enabled: false, property: exclusive }), false)
  assert.equal(lock.shouldLockExclusive({ enabled: true, property: exclusive }), true)
  assert.equal(lock.shouldLockExclusive({ enabled: true, property: exclusive, user: { id: 1 } }), false)
  assert.equal(lock.shouldLockExclusive({ enabled: true, property: exclusive, unlocked: true }), false)
  assert.equal(lock.shouldLockExclusive({ enabled: true, property: { sourceUrl: 'x' } }), false)

  const images = ['1', '2', '3', '4', '5']
  const open = lock.getPublicGallery(images, 'v.mp4', false)
  assert.equal(open.images.length, 5)
  assert.equal(open.videoUrl, 'v.mp4')
  const locked = lock.getPublicGallery(images, 'v.mp4', true)
  assert.deepEqual([...locked.images], ['1', '2', '3'])
  assert.equal(locked.videoUrl, '')
  assert.equal(locked.hiddenPhotoCount, 2)
  assert.equal(locked.hiddenVideo, true)

  assert.deepEqual([...lock.approximateLatLng([46.50391, 12.92584])], [46.5, 12.93])
})

test('new lock copy is only rendered behind the flag', () => {
  const detail = read('app/properties/[slug]/PropertyDetailClient.jsx')
  assert.match(detail, /enabled: EXCLUSIVE_GALLERY_LOCK_ENABLED/)
  assert.match(detail, /\{galleryLocked && /)
  assert.match(read('lib/exclusiveLockCopy.js'), /NÁVRH/)
  for (const file of ['app/properties/PropertyCard.jsx', 'components/PropertyPreviewCard.jsx']) {
    assert.doesNotMatch(read(file), /exclusive/i, `${file} must not get a new badge`)
  }
})
