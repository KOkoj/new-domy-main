// Browser-only memory of what a visitor wanted before confirming the e-mail
// sign-in (code or link): properties they tried to save (pending favorites) and exclusive
// listings they unlocked with their e-mail. Nothing is stored server-side
// until the visitor is signed in.

const PENDING_FAVORITES_KEY = 'domy:pendingFavorites'
const UNLOCKED_LISTINGS_KEY = 'domy:unlockedListings'
const MAX_ITEMS = 50

function getStorage(storage) {
  if (storage) return storage
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function readList(key, storage) {
  const store = getStorage(storage)
  if (!store) return []
  try {
    const parsed = JSON.parse(store.getItem(key) || '[]')
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string' && item) : []
  } catch {
    return []
  }
}

function writeList(key, list, storage) {
  const store = getStorage(storage)
  if (!store) return
  try {
    if (list.length === 0) store.removeItem(key)
    else store.setItem(key, JSON.stringify(list.slice(-MAX_ITEMS)))
  } catch {
    // Storage blocked (private mode, quota) - pending state is best effort.
  }
}

function addToList(key, value, storage) {
  const id = value == null ? '' : String(value)
  if (!id) return
  const list = readList(key, storage).filter((item) => item !== id)
  list.push(id)
  writeList(key, list, storage)
}

export function rememberPendingFavorite(listingId, storage) {
  addToList(PENDING_FAVORITES_KEY, listingId, storage)
}

export function readPendingFavorites(storage) {
  return readList(PENDING_FAVORITES_KEY, storage)
}

export function clearPendingFavorites(storage) {
  writeList(PENDING_FAVORITES_KEY, [], storage)
}

let inFlightFlush = null

/**
 * Saves pending favorites to the signed-in account. Only ever adds: the
 * request uses `action: 'add'`, which never removes an existing favorite, and
 * ids already known as favorites are skipped. Concurrent calls (getUser +
 * onAuthStateChange, StrictMode) share one in-flight flush.
 * Returns the ids (as strings) that are favorites after the flush.
 */
export function flushPendingFavorites(existingIds, options = {}) {
  if (inFlightFlush) return inFlightFlush
  inFlightFlush = runFlush(existingIds, options).finally(() => {
    inFlightFlush = null
  })
  return inFlightFlush
}

async function runFlush(existingIds, { fetchImpl, storage } = {}) {
  const pending = readPendingFavorites(storage)
  const result = new Set((existingIds || []).map(String))
  if (pending.length === 0) return result

  const doFetch = fetchImpl || (typeof fetch === 'function' ? fetch : null)
  if (!doFetch) return result

  const remaining = []
  for (const listingId of pending) {
    if (result.has(listingId)) continue
    try {
      const response = await doFetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, action: 'add' })
      })
      if (!response.ok) {
        // 4xx will not succeed later either (bad id, signed out): drop it.
        if (response.status >= 500) remaining.push(listingId)
        continue
      }
      const payload = await response.json().catch(() => ({}))
      if (payload?.favorited !== false) result.add(listingId)
    } catch {
      remaining.push(listingId)
    }
  }

  writeList(PENDING_FAVORITES_KEY, remaining, storage)
  return result
}

export function rememberUnlockedListing(slug, storage) {
  addToList(UNLOCKED_LISTINGS_KEY, slug, storage)
}

export function isListingUnlocked(slug, storage) {
  if (!slug) return false
  return readList(UNLOCKED_LISTINGS_KEY, storage).includes(String(slug))
}
