import { isConciergeDismissed } from './conciergeSession'

// One cancellable entrance per mount (desktop only). Desktop timing is measured from DOM readiness,
// so slow hydration does not add another full second after the page has loaded.
export function scheduleConciergeOpening({ window: win, document: doc, onOpen }) {
  let timer
  let cancelled = false
  const storage = () => win.sessionStorage
  const cancel = () => {
    cancelled = true
    win.clearTimeout(timer)
    doc.removeEventListener('DOMContentLoaded', onDomReady)
  }
  const openOnce = () => {
    if (cancelled) return
    const dismissed = isConciergeDismissed(storage)
    cancel()
    if (!dismissed) onOpen()
  }
  const queue = (delay) => {
    win.clearTimeout(timer)
    timer = win.setTimeout(openOnce, delay)
  }
  function onDomReady() {
    const now = () => win.performance?.now?.() ?? 0
    const navigation = win.performance?.getEntriesByType?.('navigation')?.[0]
    const readyAt = navigation?.domInteractive > 0 ? navigation.domInteractive : now()
    queue(Math.max(0, 1000 - (now() - readyAt)))
  }
  if (isConciergeDismissed(storage)) return cancel
  // On phones the card never opens by itself: it covers most of the screen and
  // an automatic pop-up is not a sign of interest. The launcher stays visible.
  if (win.matchMedia('(max-width: 767px)').matches) return cancel
  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', onDomReady, { once: true })
  } else {
    onDomReady()
  }
  return cancel
}
