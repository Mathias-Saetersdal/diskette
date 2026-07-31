import { useMemo, type CSSProperties } from 'react'
import '@fontsource/permanent-marker/400.css'
import { DiscShell, DISC_DIAMETER_MM } from './Disc'
import type { Medium } from '../data/lists'
import './BurnedDisc.css'

// Concentric moulding rings from docs/03-object-spec.md, "Cases" table and
// "Disc rendering, Burned": rings run from the hub out to 33mm, and the
// stacking ring specifically sits at 26 to 33mm.
const MOULD_RING_OUTER_MM = 33
const STACKING_RING_INNER_MM = 26
const STACKING_RING_OUTER_MM = 33

const mouldRingOuterRatio = MOULD_RING_OUTER_MM / DISC_DIAMETER_MM
const stackingRingInnerRatio = STACKING_RING_INNER_MM / DISC_DIAMETER_MM
const stackingRingOuterRatio = STACKING_RING_OUTER_MM / DISC_DIAMETER_MM

interface BurnedDiscProps {
  title: string
  medium: Medium
}

// Deterministic, not random: the same title always lands on the same
// crooked angle and offset rather than jittering on every re-render.
function hash(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0
  }
  return h
}

export default function BurnedDisc({ title, medium }: BurnedDiscProps) {
  // CD-R for albums, DVD-R for everything else, per the burned disc section
  // of docs/03-object-spec.md.
  const isCD = medium === 'album'
  const capacity = isCD ? '700MB' : '4.7GB'
  const speed = isCD ? '80min' : '120min'

  const { rotationDeg, offsetPx } = useMemo(() => {
    const h = hash(title)
    // "Slight rotation, 2 to 5 degrees, and a slight offset. Never perfectly
    // aligned." (docs/03-object-spec.md, burned disc, step 5)
    const magnitude = 2 + (Math.abs(h) % 301) / 100 // 2.00 to 5.00 degrees
    const sign = h % 2 === 0 ? 1 : -1
    const offset = (Math.abs(h >> 3) % 9) - 4 // -4 to 4px
    return { rotationDeg: magnitude * sign, offsetPx: offset }
  }, [title])

  const titleStyle = {
    transform: `translateY(${offsetPx}px) rotate(${rotationDeg}deg)`,
  } as CSSProperties

  const ringStyle = {
    '--mould-outer': mouldRingOuterRatio,
    '--stack-inner': stackingRingInnerRatio,
    '--stack-outer': stackingRingOuterRatio,
  } as CSSProperties

  return (
    // Blank recordable media is more reflective than a printed disc, not
    // less, so the sweep runs at higher intensity than Disc's defaults. The
    // sweep lives outside the rotating art layer, same as the rainbow below,
    // because light does not travel with the object.
    <DiscShell sweepOpacity={0.75} sweepHighlight={0.65}>
      <div className="burned-disc">
        <div className="burned-disc__base" />
        <div className="burned-disc__rainbow" />
        <div className="burned-disc__rings" style={ringStyle} />
        <div className="burned-disc__band">
          <span className="burned-disc__brand">
            <span className="burned-disc__brand-mark" aria-hidden="true" />
            Polycast
          </span>
          <span className="burned-disc__specs">
            {capacity} {speed}
          </span>
        </div>
        <div className="burned-disc__title-wrap">
          <span
            className={`burned-disc__title burned-disc__title--${isCD ? 'mixed' : 'caps'}`}
            style={titleStyle}
          >
            {title}
          </span>
        </div>
      </div>
    </DiscShell>
  )
}
