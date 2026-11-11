export const CONCIERGE_SESSION_KEY = 'domy:concierge:closed'

export function isConciergeDismissed(getStorage) {
  try {
    return getStorage().getItem(CONCIERGE_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function rememberConciergeDismissal(getStorage, dismissed) {
  try {
    getStorage().setItem(CONCIERGE_SESSION_KEY, dismissed ? '1' : '0')
  } catch {
    // Storage can be unavailable in privacy modes; the contact must still be usable.
  }
}
