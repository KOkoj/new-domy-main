import { useMemo, useRef } from 'react'

const MIN_DISTANCE = 36
const CLICK_GUARD_MS = 450

// Horizontal touch swipe without a carousel library. Spread `handlers` on the
// element and apply `style` (touch-action: pan-y) so the browser keeps
// vertical page scrolling and leaves horizontal movement to us.
export const SWIPE_STYLE = { touchAction: 'pan-y' }

export function useSwipe({ onPrevious, onNext, enabled = true, ignore } = {}) {
  const callbacks = useRef({})
  callbacks.current = { onPrevious, onNext, enabled, ignore }
  const gesture = useRef(null)
  const swipedAt = useRef(0)

  return useMemo(() => ({
    onTouchStart: (event) => {
      const { enabled: on, ignore: skip } = callbacks.current
      if (!on || event.touches.length !== 1 || (skip && skip(event.target))) {
        gesture.current = null
        return
      }
      const touch = event.touches[0]
      gesture.current = { x: touch.clientX, y: touch.clientY }
    },
    onTouchEnd: (event) => {
      const start = gesture.current
      gesture.current = null
      if (!start || !callbacks.current.enabled) return
      const touch = event.changedTouches[0]
      if (!touch) return
      const dx = touch.clientX - start.x
      const dy = touch.clientY - start.y
      if (Math.abs(dx) < MIN_DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.5) return
      swipedAt.current = Date.now()
      if (dx < 0) callbacks.current.onNext?.()
      else callbacks.current.onPrevious?.()
    },
    onTouchCancel: () => {
      gesture.current = null
    },
    // A finished swipe must not also count as a tap on the link / zoom target.
    onClickCapture: (event) => {
      if (Date.now() - swipedAt.current < CLICK_GUARD_MS) {
        event.preventDefault()
        event.stopPropagation()
      }
    },
  }), [])
}
