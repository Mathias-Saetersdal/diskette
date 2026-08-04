import { useEffect, useRef, useState } from 'react'

/**
 * True, permanently, once the given element has scrolled into view for
 * the first time this session — an IntersectionObserver that disconnects
 * the moment it fires, not a live "is this visible right now" flag.
 * staggerMs delays the actual flip after intersection is first detected,
 * not before observing starts, so a row that's the first to scroll into
 * view still fires promptly, and rows that happen to intersect
 * simultaneously (every row already visible on a tall viewport, say)
 * still land at different moments instead of firing together. Skips
 * entirely under prefers-reduced-motion — settle never becomes true, so
 * nothing reading it downstream ever applies the animation.
 *
 * Shared by every list wrapper (build plan stage 9) rather than
 * duplicated per list — the mechanism (observe once, fire once, stagger)
 * is identical across all four rows; only the stagger figure and which
 * element gets the ref differ per caller.
 */
export function useSettleOnFirstView<T extends HTMLElement>(staggerMs = 0) {
  const ref = useRef<T | null>(null)
  const [settle, setSettle] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let timeoutId: ReturnType<typeof setTimeout> | undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        timeoutId = setTimeout(() => setSettle(true), staggerMs)
      },
      { threshold: 0.3 },
    )
    observer.observe(node)

    return () => {
      observer.disconnect()
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [staggerMs])

  return [ref, settle] as const
}
