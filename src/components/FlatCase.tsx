import type { CSSProperties, RefObject } from 'react'
import type { Livery } from '../data/lists'
import { CASE_GEOMETRY, MAX_CASE_HEIGHT_MM, type SupportedCaseFormat } from './caseGeometry'
import CaseFrontFace, {
  PS_LOGO_SRC,
  PS2_LOGO_SRC,
  PS3_LATE_LOGO_SRC,
  PS4_WORDMARK_SRC,
  PS5_WORDMARK_SRC,
} from './CaseFrontFace'
import './FlatCase.css'

interface FlatCaseProps {
  title: string
  coverSrc: string
  coverAlt: string
  caseFormat: SupportedCaseFormat
  livery: Livery
  onClick: () => void
  /** Focused when this placeholder remounts after the case it replaced closes. */
  buttonRef?: RefObject<HTMLButtonElement | null>
  /**
   * Games row only (KeepCaseCard passes entry.medium === 'game'). Adds a
   * real spine element beside this same button, plus the resting shelf
   * tilt and contact shadow around both — films and series pass nothing
   * here and render exactly as before, same single <button> root, same
   * style prop on it. See the FlatCase.css comment above .flat-case-wrap
   * for which element carries which transform.
   */
  restTilt?: boolean
  /**
   * The printed insert's dominant tone (a CSS colour). Hand-picked per
   * entry in lists.ts, no canvas sampling. Visible on bluray (standard),
   * ps2, ps4 and ps5 spines — FlatCase.css restricts --spine-insert to
   * those four liveries. ps3-late and ps3-early have no insert at all:
   * their spines are the fixed platform livery regardless of title.
   */
  spineTone?: string
  /**
   * Games row only. True once the active Case has taken over (rendered
   * elsewhere — GameCard portals it out of the scrolling row, see
   * GamesList.tsx). Keeps this element mounted, at its own full size, so
   * the row's layout and this card's own rank number don't shift — only
   * visibility drops, via CSS (FlatCase.css), same technique
   * prefers-reduced-motion elsewhere in this project uses to remove
   * something from view without touching layout.
   */
  hidden?: boolean
}

/**
 * The closed representation for every entry that isn't the active one in a
 * list: the same printed front face Case shows when open, CaseFrontFace,
 * with nothing else around it. Sized off the same CASE_GEOMETRY/
 * MAX_CASE_HEIGHT_MM Case itself uses, so a flat DVD placeholder and a flat
 * Blu-ray placeholder stand at the correct relative heights next to each
 * other and next to whichever entry is open. No canvas, no per-instance
 * measurement, no filter — mounting ten (or forty) of these stays cheap
 * because none of that runs here, restTilt included.
 *
 * restTilt (games row only) adds a real spine face beside this button
 * inside a rotated, preserve-3d wrapper. The spine's colour comes from
 * livery (a CSS modifier class, read the same way CaseFrontFace already
 * reads livery for the front — ps3-early and ps3-late are two distinct
 * livery values already, not one "ps3" resolved some other way, so no new
 * resolution mechanism is needed here either). Logo marks are plain <img>
 * elements positioned and rotated in CSS, not a rendered/composited file —
 * see FlatCase.css for per-livery placement and which liveries get one.
 */
export default function FlatCase({
  title,
  coverSrc,
  coverAlt,
  caseFormat,
  livery,
  onClick,
  buttonRef,
  restTilt = false,
  spineTone,
  hidden = false,
}: FlatCaseProps) {
  const { heightMm, widthMm, depthMm } = CASE_GEOMETRY[caseFormat]
  const style = {
    '--front-face-ratio': widthMm / heightMm,
    '--height-scale': heightMm / MAX_CASE_HEIGHT_MM,
    // The spine's width as a fraction of the front face's own width —
    // depthMm/widthMm straight from caseGeometry.ts's own CASE_GEOMETRY
    // table (docs/03-object-spec.md's Cases table), not a separate
    // hardcoded figure per format: games mix dvd, bluray and ps5
    // geometry (docs/04-lists.md), so this reads whichever caseFormat
    // this entry actually has rather than assuming one.
    '--spine-ratio': depthMm / widthMm,
    ...(spineTone ? { '--spine-insert': spineTone } : {}),
  } as CSSProperties

  const button = (
    <button
      ref={buttonRef}
      type="button"
      className="flat-case"
      style={style}
      aria-label={`Open case: ${title}`}
      onClick={onClick}
    >
      <CaseFrontFace coverSrc={coverSrc} coverAlt={coverAlt} caseFormat={caseFormat} livery={livery} />
    </button>
  )

  if (!restTilt) return button

  // The upright mark, PS_LOGO_SRC for every livery that gets one. ps3-late
  // does not: no separate PS button mark on this livery's spine, only the
  // wordmark below. ps3-early gets neither: its own marks render on the
  // front face (CaseFrontFace.tsx's case__front-ps3-early-strip), not the
  // spine — Case.tsx's real spine renders nothing for it either.
  const markSrc = livery === 'ps2' || livery === 'ps4' || livery === 'ps5' ? PS_LOGO_SRC : null

  // The rotated wordmark, read down the spine. PS4_WORDMARK_SRC/
  // PS5_WORDMARK_SRC are the cropped, text-only assets (CaseFrontFace.tsx's
  // export comment) — the files these used to point at carried the PS
  // mark baked in too, which is what drew it a second time alongside the
  // separate mark above. PS3_LATE_LOGO_SRC never had that problem — a
  // genuine transparent SVG, already wordmark-only. It used to be rendered
  // as the mark slot's own small upright icon instead, which is wrong on
  // two counts: that file's own natural size is 300x64 (a ~4.7:1 wordmark
  // shape, not an icon), and this livery has no separate PS mark on the
  // spine at all — the wordmark is the whole lockup. No asset plays this
  // role for ps3-early (no spine marks at all).
  const wordmarkSrc =
    livery === 'ps5'
      ? PS5_WORDMARK_SRC
      : livery === 'ps4'
        ? PS4_WORDMARK_SRC
        : livery === 'ps3-late'
          ? PS3_LATE_LOGO_SRC
          : livery === 'ps2'
            ? PS2_LOGO_SRC
            : null

  return (
    <div className={`flat-case-stage${hidden ? ' flat-case-stage--hidden' : ''}`} style={style}>
      <div className="flat-case-wrap">
        <div className={`flat-case-spine flat-case-spine--${livery}`} aria-hidden="true">
          {markSrc && <img className="flat-case-spine-mark" src={markSrc} alt="" />}
          {wordmarkSrc && <img className="flat-case-spine-wordmark" src={wordmarkSrc} alt="" />}
        </div>
        {button}
      </div>
      <div className="flat-case-shadow" aria-hidden="true" />
    </div>
  )
}
