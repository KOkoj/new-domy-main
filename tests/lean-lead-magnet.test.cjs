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

test('registration is one e-mail field followed by a 6-digit code', () => {
  const form = read('components/auth/EmailCodeSignIn.js')
  assert.doesNotMatch(form, /confirmPassword|fullName|\/api\/auth\/signup/)
  assert.match(form, /type="email"/)
  assert.match(form, /\/api\/auth\/send-code/)
  assert.match(form, /\/api\/auth\/verify-otp/)
  assert.match(form, /autoComplete="one-time-code"/)
  assert.match(form, /inputMode="numeric"/)
  assert.match(form, /RESEND_COOLDOWN_SECONDS/)
  assert.match(form, /name="website"/, 'honeypot field')
  assert.match(form, /usePassword/, 'password login stays available for existing accounts')

  const modal = read('components/AuthModal.js')
  assert.match(modal, /<EmailCodeSignIn/)
  assert.match(modal, /\/registrace\?redirect=/)
  assert.match(modal, /getSafeRedirectPath/)

  const login = read('app/login/page.js')
  assert.doesNotMatch(login, /confirmPassword|fullName|\/api\/auth\/signup|TabsTrigger/)
  assert.match(login, /<EmailCodeSignIn/)
  assert.match(login, /allowPassword/)

  const page = read('app/registrace/page.js')
  assert.match(page, /<EmailCodeSignIn/)
  assert.match(page, /getSafeRedirectPath\(params\.get\('redirect'\)/)

  const send = read('app/api/auth/send-code/route.js')
  assert.match(send, /shouldCreateUser: true/)
  assert.match(send, /emailRedirectTo/)
  assert.match(send, /getSafeRedirectPath\(next\)/)
  assert.match(send, /checkRateLimit/)
  assert.match(send, /website/)

  const verify = read('app/api/auth/verify-otp/route.js')
  assert.match(verify, /verifyOtp\(\{\s*email: normalizedEmail,\s*token: code,\s*type: 'email'/)
  assert.match(verify, /completeEmailSignIn/)
  assert.match(verify, /getSafeRedirectPath\(next\)/)

  assert.equal(fs.existsSync(path.join(root, 'app/api/auth/magic-link/route.js')), false)
})

test('no "Magic Link" wording is left in the UI translations', () => {
  const translations = read('lib/translations.js')
  assert.doesNotMatch(translations, /magic ?link/i)
  for (const file of ['components/AuthModal.js', 'app/login/page.js', 'components/auth/EmailCodeSignIn.js', 'app/registrace/page.js']) {
    assert.doesNotMatch(read(file), /sendMagicLink|magicLink/, file)
  }
})

test('e-mail code helpers accept pasted codes with spaces and 6-8 digits', () => {
  const code = loadModule('lib/emailCode.js', [
    'normalizeOtpInput', 'isCompleteOtp', 'isValidEmailAddress', 'OTP_LENGTH', 'RESEND_COOLDOWN_SECONDS'
  ])
  assert.equal(code.OTP_LENGTH, 6)
  assert.equal(code.RESEND_COOLDOWN_SECONDS, 60)
  assert.equal(code.normalizeOtpInput('123 456'), '123456')
  assert.equal(code.normalizeOtpInput(' 12-34 56 '), '123456')
  assert.equal(code.normalizeOtpInput('Kód: 12345678 9'), '12345678')
  assert.equal(code.isCompleteOtp('12345'), false)
  assert.equal(code.isCompleteOtp('123456'), true)
  assert.equal(code.isCompleteOtp('12345678'), true)
  assert.equal(code.isCompleteOtp('123456789'), false)
  assert.equal(code.isValidEmailAddress('jana@example.cz'), true)
  assert.equal(code.isValidEmailAddress('jana@example'), false)
  assert.equal(code.isValidEmailAddress('jana example.cz'), false)
})

test('code errors map to clear keys (wrong/expired code, rate limits)', () => {
  const messages = loadModule('lib/authMessages.js', ['mapSupabaseAuthError', 'mapVerifyCodeError'])
  assert.equal(messages.mapVerifyCodeError({ code: 'otp_expired', message: 'Token has expired or is invalid' }), 'codeInvalid')
  assert.equal(messages.mapVerifyCodeError({ message: 'Token has expired or is invalid' }), 'codeInvalid')
  assert.equal(messages.mapSupabaseAuthError({ code: 'over_email_send_rate_limit' }), 'emailRateLimited')
  assert.equal(messages.mapSupabaseAuthError({ status: 429, message: 'x' }), 'overRequestRateLimit')
  assert.equal(messages.mapSupabaseAuthError({ code: 'validation_failed' }), 'invalidEmail')
  assert.equal(messages.mapSupabaseAuthError({ message: '???' }, 'codeSendFailed'), 'codeSendFailed')
})

test('first sign-in work is shared by the callback and the code route', () => {
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
