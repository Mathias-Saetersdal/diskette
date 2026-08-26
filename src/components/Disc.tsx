import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'
import './Disc.css'

// Geometry from docs/03-object-spec.md, "Cases" table and "Disc rendering" section.
export const DISC_DIAMETER_MM = 120
export const HUB_HOLE_DIAMETER_MM = 15
// Retail scans carry real transparency out to about here (docs/03-object-spec.md,
// Cases table) — used only to keep .disc__sweep's own highlight off that
// genuinely clear band, not to mask any printed artwork. Generated and
// burned discs are printed (or drawn) all the way out from the hub, so
// nothing else in this file keys off this ratio.
export const CLEAR_RING_DIAMETER_MM = 46

// All diameter-over-diameter, which equals radius-over-radius, so they
// double as fractions of the disc's radius for the masks in Disc.css.
export const hubHoleRatio = HUB_HOLE_DIAMETER_MM / DISC_DIAMETER_MM // 15mm hole / 120mm disc
export const clearRingRatio = CLEAR_RING_DIAMETER_MM / DISC_DIAMETER_MM // 46mm ring / 120mm disc

// Matches the ambient disc-spin keyframes below: 360deg over 6000ms. This is
// also the velocity a drag decays back toward, so a release never just
// stops — it relaxes into the same ambient turn a resting lifted disc
// already has.
const AMBIENT_DEG_PER_MS = 360 / 6000
const DRAG_SENSITIVITY = 0.6 // degrees rotated per horizontal pixel dragged
const RELAX_MS = 900 // time constant for released velocity settling to ambient
const MAX_VELOCITY = 3 // deg/ms, clamps a noisy pointermove sample
const CLICK_MOVE_THRESHOLD = 6 // px; below this a drag still counts as a tap

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  return reduced
}

/**
 * Drives .disc__art's rotation from JS instead of the ambient CSS
 * animation, so a drag can push it and a release can carry momentum.
 * Pointer events only, one path for mouse and touch. Inactive discs (not
 * lifted, or reduced motion) fall straight back to the plain CSS spin.
 */
function useDragSpin(active: boolean) {
  const artRef = useRef<HTMLDivElement>(null)
  const angleRef = useRef(0)
  const velocityRef = useRef(AMBIENT_DEG_PER_MS)
  const draggingRef = useRef(false)
  const movedRef = useRef(0)
  const lastXRef = useRef(0)
  const lastTRef = useRef(0)
  const reducedMotion = usePrefersReducedMotion()
  const isActive = active && !reducedMotion

  useEffect(() => {
    if (!isActive) return

    let frame: number
    let last = performance.now()

    const tick = (now: number) => {
      const dt = now - last
      last = now
      if (!draggingRef.current) {
        // Relax toward the ambient rate rather than toward a stop, so a
        // flick decays back into the same turn an untouched disc has.
        const relax = 1 - Math.exp(-dt / RELAX_MS)
        velocityRef.current += (AMBIENT_DEG_PER_MS - velocityRef.current) * relax
        angleRef.current += velocityRef.current * dt
      }
      if (artRef.current) {
        artRef.current.style.transform = `rotate(${angleRef.current}deg)`
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [isActive])

  useEffect(() => {
    if (isActive) return
    // Hand rotation back to CSS: clear the inline override and reset so
    // the next activation starts clean, matching a freshly-lifted disc.
    if (artRef.current) artRef.current.style.transform = ''
    angleRef.current = 0
    velocityRef.current = AMBIENT_DEG_PER_MS
  }, [isActive])

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!isActive) return
    draggingRef.current = true
    movedRef.current = 0
    lastXRef.current = event.clientX
    lastTRef.current = performance.now()
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isActive || !draggingRef.current) return
    const now = performance.now()
    const dx = event.clientX - lastXRef.current
    const dt = Math.max(now - lastTRef.current, 1)
    movedRef.current += Math.abs(dx)
    const deltaAngle = dx * DRAG_SENSITIVITY
    angleRef.current += deltaAngle
    velocityRef.current = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, deltaAngle / dt))
    lastXRef.current = event.clientX
    lastTRef.current = now
    // Keeps the page from scrolling under a drag; touch-action: none on
    // the element is the primary guard, this is the JS-side backstop.
    event.preventDefault()
  }

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    // A real drag shouldn't also register as a tap on whatever's
    // listening further up (Case's lift/return toggle).
    if (movedRef.current > CLICK_MOVE_THRESHOLD) {
      event.stopPropagation()
    }
    movedRef.current = 0
  }

  return { artRef, isActive, onPointerDown, onPointerMove, onPointerUp: endDrag, onPointerCancel: endDrag, onClick }
}

interface DiscShellProps {
  children: ReactNode
  /**
   * Specular sweep strength. Printed retail discs default to a low,
   * even reflection. Pass higher values for surfaces that read as more
   * reflective, per docs/03-object-spec.md's burned disc section.
   */
  sweepOpacity?: number
  sweepHighlight?: number
  /** Lifted-out state: enables drag-to-spin. Off, it's the plain ambient CSS spin. */
  interactive?: boolean
}

/**
 * Shared disc geometry: sizing, the hub hole mask and the specular sweep.
 * Disc and BurnedDisc each mount their own face inside .disc__art and share
 * everything else, so the geometry and sweep are defined once. No source
 * distinction here — a generated face (a cover crop) fills the disc out to
 * its edge exactly like a retail scan does, punched only at the true 15mm
 * hub; the specular sweep is what sells the plastic read either way, per
 * docs/03-object-spec.md, Disc rendering, Generated.
 */
export function DiscShell({
  children,
  sweepOpacity = 0.5,
  sweepHighlight = 0.4,
  interactive = false,
}: DiscShellProps) {
  const style = {
    '--hub-hole-ratio': hubHoleRatio,
    '--clear-ring-ratio': clearRingRatio,
    '--sweep-opacity': sweepOpacity,
    '--sweep-highlight': sweepHighlight,
  } as CSSProperties

  // artRef pulled out on its own, not read as drag.artRef below: react-hooks/refs
  // flags every property access off an object once any one of its fields is a
  // ref, so a bare local keeps the other, genuinely plain fields (isActive, the
  // handlers) from tripping it too. Don't re-bundle this back into drag.*.
  const { artRef, ...drag } = useDragSpin(interactive)

  return (
    <div
      className={`disc${drag.isActive ? ' disc--interactive' : ''}`}
      style={style}
      onPointerDown={drag.onPointerDown}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
      onPointerCancel={drag.onPointerCancel}
      onClick={drag.onClick}
    >
      <div className={`disc__art${drag.isActive ? ' disc__art--interactive' : ''}`} ref={artRef}>
        {children}
      </div>
      <div className="disc__sweep" aria-hidden="true" />
    </div>
  )
}

interface DiscProps {
  src: string
  alt: string
  interactive?: boolean
}

export default function Disc({ src, alt, interactive }: DiscProps) {
  return (
    <DiscShell interactive={interactive}>
      {/*
       * decoding="async": disc scans run 2-3MB at 1000x1000, and a
       * synchronous decode of that on mount lands exactly on the frame
       * the case starts enlarging — a visible hitch at click time.
       * fetchpriority="high": by mount time this image is the one thing
       * the user is waiting to see; the idle preloader (preloadDiscs.ts)
       * has usually cached it already, and this covers the cold path.
       */}
      <img src={src} alt={alt} decoding="async" fetchPriority="high" />
    </DiscShell>
  )
}
