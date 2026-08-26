import type { CSSProperties, RefObject } from 'react'
import type { Livery } from '../data/lists'
import { CASE_GEOMETRY, MAX_CASE_HEIGHT_MM, type SupportedCaseFormat } from './caseGeometry'
import CaseFrontFace, {
  PS_LOGO_SRC,
  PS_LOGO_WHITE_SRC,
  PS_LOGO_BLACK_SRC,
  PS2_LOGO_WHITE_SRC,
  PS3_LATE_LOGO_WHITE_SRC,
  PS4_WORDMARK_WHITE_SRC,
  PS5_WORDMARK_DARK_SRC,
} from './CaseFrontFace'
import './FlatCase.css'
import { ui } from '../i18n/ui'
import { useLanguage } from '../i18n/useLanguage'

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
   * Games (every entry) and DVD-format films (KeepCaseCard: entry.medium
   * === 'game' || (entry.medium === 'film' && entry.case === 'dvd')) get
   * a real spine element beside this same button, plus the resting shelf
   * tilt and contact shadow around both — every other entry passes
   * nothing here and renders exactly as before, same single <button>
   * root, same style prop on it. See the FlatCase.css comment above
   * .flat-case-wrap for which element carries which transform.
   */
  restTilt?: boolean
  /**
   * The printed insert's dominant tone (a CSS colour). Hand-picked per
   * entry in lists.ts, no canvas sampling. Visible on bluray (standard),
   * dvd (standard), ps2, ps4 and ps5 spines — FlatCase.css restricts
   * --spine-insert to those liveries. ps3-late and ps3-early have no
   * insert at all: their spines are the fixed platform livery regardless
   * of title.
   */
  spineTone?: string
  /**
   * Overrides caseFormat's own depthMm for the spine-ratio calculation
   * only — front face size and height stay the real format's geometry.
   * Series only (KeepCaseCard): a multi-disc box set's spine is wider
   * than a single dvd case's, not a new case shape or a change to
   * caseGeometry.ts's own table, which every other dvd entry (PS2 games,
   * DVD-format films) still reads unmodified.
   */
  spineWidthMm?: number
  /**
   * Plays the one-time settle animation (build plan stage 9): the wrap
   * cracks a few degrees off its own rest tilt and eases back, once,
   * demonstrating that this is a real hinged object rather than a flat
   * image — the affordance nothing at rest otherwise gives touch users
   * (hover covers desktop, nothing covers touch). Only meaningful on the
   * restTilt path below: the bare-button path has no rotated wrap to
   * crack, so this is ignored there rather than animating something
   * else in its place. Each row's own list wrapper decides which single
   * entry gets true (useSettleOnFirstView.ts, SettleContext.ts) — never
   * passed true for more than one card per row at a time.
   */
  settleOnMount?: boolean
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
 * restTilt adds a real spine face beside this button inside a rotated,
 * preserve-3d wrapper. The spine's colour comes from livery (a CSS
 * modifier class, read the same way CaseFrontFace already reads livery
 * for the front — ps3-early and ps3-late are two distinct livery values
 * already, not one "ps3" resolved some other way, so no new resolution
 * mechanism is needed here either), except "standard," which pairs with
 * caseFormat first (spineLivery below) since a DVD spine and a Blu-ray
 * spine are different materials under that one livery name — same split
 * CaseFrontFace.tsx already makes for the front face. Logo marks are
 * plain <img> elements positioned and rotated in CSS, not a rendered/
 * composited file — see FlatCase.css for per-livery placement and which
 * liveries get one.
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
  spineWidthMm,
  settleOnMount = false,
}: FlatCaseProps) {
  const { language } = useLanguage()
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
    '--spine-ratio': (spineWidthMm ?? depthMm) / widthMm,
    ...(spineTone ? { '--spine-insert': spineTone } : {}),
  } as CSSProperties

  const button = (
    <button
      ref={buttonRef}
      type="button"
      className="flat-case"
      style={style}
      aria-label={ui[language].openCase(title)}
      onClick={onClick}
    >
      <CaseFrontFace coverSrc={coverSrc} coverAlt={coverAlt} caseFormat={caseFormat} livery={livery} />
    </button>
  )

  if (!restTilt) return button

  // "standard" livery isn't one look — CaseFrontFace.tsx's own
  // isStandardDvd/isStandardBluray split (same comment there) pairs it
  // with caseFormat for the same reason: a DVD spine (dvd) and a Blu-ray
  // spine (.flat-case-spine--standard's own hardcoded blue) are different
  // materials, not one rule covering both. Every PlayStation livery is
  // format-independent, same as the front face, so this only branches
  // when livery is genuinely "standard."
  const spineLivery = livery === 'standard' && caseFormat === 'dvd' ? 'dvd' : livery

  // The upright mark. ps2 keeps the four-colour original on its white
  // block; ps4 and ps5 use the pre-recoloured single-tone copies
  // (CaseFrontFace.tsx's export comments — the CSS filters these replace
  // broke backface culling in Safari and cost compositing time). ps3-late
  // gets none: no separate PS button mark on this livery's spine, only
  // the wordmark below. ps3-early gets neither: its own marks render on
  // the front face (CaseFrontFace.tsx's case__front-ps3-early-strip), not
  // the spine — Case.tsx's real spine renders nothing for it either.
  const markSrc =
    livery === 'ps2'
      ? PS_LOGO_SRC
      : livery === 'ps4'
        ? PS_LOGO_WHITE_SRC
        : livery === 'ps5'
          ? PS_LOGO_BLACK_SRC
          : null

  // The rotated wordmark, read down the spine — every one the
  // pre-recoloured asset for its own header colour: dark text for ps5's
  // white header, white for the rest. The cropped, text-only PS4/PS5
  // files exist because the originals carried the PS mark baked in too,
  // which drew it a second time alongside the separate mark above
  // (CaseFrontFace.tsx's export comment). No asset plays this role for
  // ps3-early (no spine marks at all).
  const wordmarkSrc =
    livery === 'ps5'
      ? PS5_WORDMARK_DARK_SRC
      : livery === 'ps4'
        ? PS4_WORDMARK_WHITE_SRC
        : livery === 'ps3-late'
          ? PS3_LATE_LOGO_WHITE_SRC
          : livery === 'ps2'
            ? PS2_LOGO_WHITE_SRC
            : null

  return (
    <div className="flat-case-stage" style={style}>
      <div className={`flat-case-wrap${settleOnMount ? ' flat-case-wrap--settle' : ''}`}>
        <div className={`flat-case-spine flat-case-spine--${spineLivery}`} aria-hidden="true">
          {markSrc && <img className="flat-case-spine-mark" src={markSrc} alt="" />}
          {wordmarkSrc && <img className="flat-case-spine-wordmark" src={wordmarkSrc} alt="" />}
        </div>
        {button}
      </div>
      <div className="flat-case-shadow" aria-hidden="true" />
    </div>
  )
}
