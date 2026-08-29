import type { CSSProperties, RefObject } from 'react'
import { JEWEL_GEOMETRY } from './caseGeometry'
import './FlatJewelCase.css'
import { ui } from '../i18n/ui'
import { useLanguage } from '../i18n/useLanguage'

const { heightMm, widthMm, depthMm } = JEWEL_GEOMETRY

interface FlatJewelCaseProps {
  title: string
  coverSrc: string
  coverAlt: string
  /**
   * Original pixel dimensions of the cover, from the derived-asset record
   * (src/assetSources.ts) — intrinsic-ratio hints for the img, never its
   * on-screen size (.jewel-case__front-poster img's own 100%/100% CSS box
   * still wins). Omitted when the record's production fallback reports 0
   * (unknown). Always lazy, no fetch priority: albums sit third on the
   * page, never among the first four covers in document order.
   */
  coverWidth?: number
  coverHeight?: number
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
  /**
   * Plays the one-time settle animation (build plan stage 9): the wrap
   * cracks a few degrees off its own rest tilt and eases back, once,
   * demonstrating that this is a real hinged object rather than a flat
   * image. Same mechanism and CSS shape as FlatCase.tsx's own
   * settleOnMount — see FlatJewelCase.css.
   */
  settleOnMount?: boolean
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
export default function FlatJewelCase({
  title,
  coverSrc,
  coverAlt,
  coverWidth,
  coverHeight,
  onClick,
  buttonRef,
  spineTone,
  settleOnMount = false,
}: FlatJewelCaseProps) {
  const { language } = useLanguage()
  const style = {
    '--front-face-ratio': widthMm / heightMm,
    // Same depthMm/widthMm-off-caseGeometry.ts pattern as FlatCase.tsx's
    // own --spine-ratio, not a separate hardcoded figure.
    '--spine-ratio': depthMm / widthMm,
    ...(spineTone ? { '--spine-insert': spineTone } : {}),
  } as CSSProperties

  return (
    <div className="flat-jewel-case-stage" style={style}>
      <div className={`flat-jewel-case-wrap${settleOnMount ? ' flat-jewel-case-wrap--settle' : ''}`}>
        <div className="flat-jewel-case-spine" aria-hidden="true" />
        <button
          ref={buttonRef}
          type="button"
          className="flat-jewel-case"
          aria-label={ui[language].openCase(title)}
          onClick={onClick}
        >
          <div className="jewel-case__front-shell">
            <div className="jewel-case__front-poster">
              <img
                src={coverSrc}
                alt={coverAlt}
                {...(coverWidth && coverHeight ? { width: coverWidth, height: coverHeight } : {})}
                loading="lazy"
                // Albums sit third on the page, never the first row —
                // demoted for the same reason as every non-films cover
                // (FlatCase.tsx's fetchPriority comment).
                fetchPriority="low"
                decoding="async"
              />
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
