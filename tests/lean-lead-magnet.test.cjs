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
  const source = read(relativePath).replace(/export (const|function|async function) /g, '$1 ')
  const context = { module: { exports: {} }, process: { env: {} }, ...extraContext }
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

test('new registration is a single e-mail field and the magic link may create the account', () => {
  const modal = read('components/AuthModal.js')
  assert.doesNotMatch(modal, /confirmPassword|fullName|\/api\/auth\/signup/)
  assert.match(modal, /type="email"/)
  assert.match(modal, /usePassword/, 'password login stays available for existing accounts')

  const login = read('app/login/page.js')
  assert.doesNotMatch(login, /confirmPassword|fullName|\/api\/auth\/signup|TabsTrigger/)
  assert.match(login, /usePassword/)

  const magicLink = read('app/api/auth/magic-link/route.js')
  assert.match(magicLink, /shouldCreateUser: true/)
  assert.match(magicLink, /getSafeRedirectPath\(next\)/)
})

test('first sign-in onboarding runs only after e-mail confirmation and only once', () => {
  const callback = read('app/auth/callback/route.js')
  assert.match(callback, /completeFirstSignIn/)
  assert.match(callback, /welcome_email_sent/)
  assert.match(callback, /type !== 'recovery'/)
  assert.match(read('app/api/auth/signup/route.js'), /welcome_email_sent: true/)
})

test('post-auth redirects reject protocol-relative and foreign targets', () => {
  const { getSafeRedirectPath } = loadModule('lib/safeRedirect.js', ['getSafeRedirectPath'])
  assert.equal(getSafeRedirectPath('/properties/x?a=1'), '/properties/x?a=1')
  assert.equal(getSafeRedirectPath('//evil.example'), '/dashboard')
  assert.equal(getSafeRedirectPath('/\\evil.example'), '/dashboard')
  assert.equal(getSafeRedirectPath('https://evil.example'), '/dashboard')
  assert.equal(getSafeRedirectPath(undefined, '/x'), '/x')
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
    calls.push(JSON.parse(init.body).listingId)
    return { ok: true, json: async () => ({ favorited: true }) }
  }
  const result = await mod.flushPendingFavorites(['a'], { fetchImpl, storage })
  assert.deepEqual(calls, ['b'])
  assert.deepEqual([...result].sort(), ['a', 'b'])
  assert.equal(mod.readPendingFavorites(storage).length, 0)

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
