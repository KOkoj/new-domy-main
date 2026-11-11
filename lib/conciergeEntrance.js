import { isConciergeDismissed } from './conciergeSession'

// One cancellable entrance per mount. Desktop timing is measured from DOM readiness,
// so slow hydration does not add another full second after the page has loaded.
export function scheduleConciergeOpening({ window: win, document: doc, onOpen }) {
  let timer
  let cancelled = false
  const storage = () => win.sessionStorage
  const cancel = () => {
    cancelled = true
    win.clearTimeout(timer)
    win.removeEventListener('scroll', onScroll)
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
  function onScroll() {
    win.clearTimeout(timer)
    const hero = doc.querySelector('[data-testid="hero-section"]')
    if (!hero || hero.getBoundingClientRect().bottom > 80) return
    // Never interrupt an active mobile scroll or cover the initial hero CTAs.
    queue(850)
  }
  function onDomReady() {
    const now = () => win.performance?.now?.() ?? 0
    const navigation = win.performance?.getEntriesByType?.('navigation')?.[0]
    const readyAt = navigation?.domInteractive > 0 ? navigation.domInteractive : now()
    queue(Math.max(0, 1000 - (now() - readyAt)))
  }
  if (isConciergeDismissed(storage)) return cancel
  if (win.matchMedia('(max-width: 767px)').matches) {
    win.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
  } else if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', onDomReady, { once: true })
  } else {
    onDomReady()
  }
  return cancel
}
