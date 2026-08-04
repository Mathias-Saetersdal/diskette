import type { CSSProperties, RefObject } from 'react'
import { JEWEL_GEOMETRY } from './caseGeometry'
import './FlatJewelCase.css'

const { heightMm, widthMm, depthMm } = JEWEL_GEOMETRY

interface FlatJewelCaseProps {
  title: string
  coverSrc: string
  coverAlt: string
  onClick: () => void
  buttonRef?: RefObject<HTMLButtonElement | null>
  /**
   * The printed insert's dominant tone, visible through the spine's own
   * clear plastic (a CSS colour, hand-picked per entry in lists.ts — no
   * canvas sampling, same mechanism FlatCase.tsx's spineTone already
   * uses for keep cases). Absent falls back to a neutral grey, same as
   * an unset keep-case spineTone.
   */
  spineTone?: string
}

/**
 * The closed jewel case: a flat placeholder for a list's inactive album
 * entries, mirroring FlatCase.tsx's role and structure for keep cases —
 * a stage/wrap/spine assembly at the row's own rest tilt, not the front
 * face alone. Build plan stage 4: the previous version was a bare button
 * with no spine at all, which read as a poster with a thin border rather
 * than a case. The front content (jewel-case__front-shell/poster/
 * refraction/gloss, JewelCase.css) is self-contained and already used
 * unchanged by the open JewelCase, so it mounts inside this new wrap
 * rather than needing a second copy.
 *
 * No livery branching, unlike FlatCase: every jewel case gets the
 * identical clear-plastic-over-insert spine (FlatJewelCase.css). Geometry
 * comes from caseGeometry.ts's JEWEL_GEOMETRY rather than a per-format
 * table, since every album is the same 142 x 125 x 10mm case — no
 * per-instance height-scale factor either, for the same reason.
 */
export default function FlatJewelCase({ title, coverSrc, coverAlt, onClick, buttonRef, spineTone }: FlatJewelCaseProps) {
  const style = {
    '--front-face-ratio': widthMm / heightMm,
    // Same depthMm/widthMm-off-caseGeometry.ts pattern as FlatCase.tsx's
    // own --spine-ratio, not a separate hardcoded figure.
    '--spine-ratio': depthMm / widthMm,
    ...(spineTone ? { '--spine-insert': spineTone } : {}),
  } as CSSProperties

  return (
    <div className="flat-jewel-case-stage" style={style}>
      <div className="flat-jewel-case-wrap">
        <div className="flat-jewel-case-spine" aria-hidden="true" />
        <button
          ref={buttonRef}
          type="button"
          className="flat-jewel-case"
          aria-label={`Open case: ${title}`}
          onClick={onClick}
        >
          <div className="jewel-case__front-shell">
            <div className="jewel-case__front-poster">
              <img src={coverSrc} alt={coverAlt} loading="lazy" />
              <div className="jewel-case__front-refraction" aria-hidden="true" />
            </div>
            <div className="jewel-case__front-gloss" aria-hidden="true" />
          </div>
        </button>
      </div>
      <div className="flat-jewel-case-shadow" aria-hidden="true" />
    </div>
  )
}
