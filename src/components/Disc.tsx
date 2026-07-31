import type { CSSProperties } from 'react'
import './Disc.css'

interface DiscProps {
  src: string
  alt: string
}

// Geometry from docs/03-object-spec.md, "Cases" table and "Disc rendering" section.
const DISC_DIAMETER_MM = 120
const HUB_HOLE_DIAMETER_MM = 15
const CLEAR_RING_DIAMETER_MM = 46 // where the printed area begins

// Both ratios are diameter-over-diameter, which equals radius-over-radius,
// so they double as fractions of the disc's radius for the mask below.
const hubHoleRatio = HUB_HOLE_DIAMETER_MM / DISC_DIAMETER_MM // 15mm hole / 120mm disc
const clearRingRatio = CLEAR_RING_DIAMETER_MM / DISC_DIAMETER_MM // 46mm ring / 120mm disc

export default function Disc({ src, alt }: DiscProps) {
  const style = {
    '--hub-hole-ratio': hubHoleRatio,
    '--clear-ring-ratio': clearRingRatio,
  } as CSSProperties

  return (
    <div className="disc" style={style}>
      <img className="disc__art" src={src} alt={alt} />
      <div className="disc__sweep" aria-hidden="true" />
    </div>
  )
}
