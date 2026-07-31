import type { CSSProperties, ReactNode } from 'react'
import './Disc.css'

// Geometry from docs/03-object-spec.md, "Cases" table and "Disc rendering" section.
export const DISC_DIAMETER_MM = 120
export const HUB_HOLE_DIAMETER_MM = 15
export const CLEAR_RING_DIAMETER_MM = 46 // where the printed area begins

// Both ratios are diameter-over-diameter, which equals radius-over-radius,
// so they double as fractions of the disc's radius for the masks in Disc.css.
export const hubHoleRatio = HUB_HOLE_DIAMETER_MM / DISC_DIAMETER_MM // 15mm hole / 120mm disc
export const clearRingRatio = CLEAR_RING_DIAMETER_MM / DISC_DIAMETER_MM // 46mm ring / 120mm disc

interface DiscShellProps {
  children: ReactNode
  /**
   * Specular sweep strength. Printed retail discs default to a low,
   * even reflection. Pass higher values for surfaces that read as more
   * reflective, per docs/03-object-spec.md's burned disc section.
   */
  sweepOpacity?: number
  sweepHighlight?: number
}

/**
 * Shared disc geometry: sizing, the hub hole mask and the specular sweep.
 * Disc and BurnedDisc each mount their own face inside .disc__art and share
 * everything else, so the geometry and sweep are defined once.
 */
export function DiscShell({
  children,
  sweepOpacity = 0.5,
  sweepHighlight = 0.4,
}: DiscShellProps) {
  const style = {
    '--hub-hole-ratio': hubHoleRatio,
    '--clear-ring-ratio': clearRingRatio,
    '--sweep-opacity': sweepOpacity,
    '--sweep-highlight': sweepHighlight,
  } as CSSProperties

  return (
    <div className="disc" style={style}>
      <div className="disc__art">{children}</div>
      <div className="disc__sweep" aria-hidden="true" />
    </div>
  )
}

interface DiscProps {
  src: string
  alt: string
}

export default function Disc({ src, alt }: DiscProps) {
  return (
    <DiscShell>
      <img src={src} alt={alt} />
    </DiscShell>
  )
}
