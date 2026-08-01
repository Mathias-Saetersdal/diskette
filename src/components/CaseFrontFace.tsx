import type { CSSProperties } from 'react'
import type { Livery } from '../data/lists'
import type { SupportedCaseFormat } from './caseGeometry'
import './Case.css'

// No physical spec for these — there's no real case to measure a header
// zone or inset margin against in mm. Design proportions, sourced from the
// pixel geometry of reference/blue-ray.png instead. Shared between Case
// (the open front leaf) and FlatCase (the closed placeholder) so the two
// can't drift out of sync with each other.
const FRONT_HEADER_HEIGHT_PCT = 9
const FRONT_INSET_PCT = 3

// docs/02-asset-sources.md: shared UI marks live under public/assets, same
// as fetched cover/disc assets, not bundled through src/.
export const BLURAY_LOGO_SRC = '/assets/marks/blu-ray-disc-white.png'

interface CaseFrontFaceProps {
  coverSrc: string
  coverAlt: string
  caseFormat: SupportedCaseFormat
  livery: Livery
}

/**
 * The printed front face of a case: the poster, and for standard Blu-ray,
 * the full-bleed case-body blue and header marks over it. Self-contained —
 * defines its own --front-w off its own rendered width via a container
 * query unit rather than depending on an ancestor to supply one, since it
 * mounts two different ways: inside Case's 3D leaf (open) where --front-w
 * already exists on .case, and inside FlatCase's flat placeholder (closed)
 * where nothing above it defines one. The actual rules (case__front-art and
 * its children) live in Case.css, shared rather than duplicated.
 */
export default function CaseFrontFace({ coverSrc, coverAlt, caseFormat, livery }: CaseFrontFaceProps) {
  // "standard" livery isn't one look — for films it's whatever the
  // natural, unbranded case for that format is (docs/03-object-spec.md,
  // Livery). ps2/ps3/ps4/ps5 liveries are format-independent and not
  // handled here yet (step 7, games).
  const isStandardBluray = livery === 'standard' && caseFormat === 'bluray'
  const isStandardDvd = livery === 'standard' && caseFormat === 'dvd'
  const showHeader = isStandardBluray
  const modifier = isStandardBluray ? ' case__front-art--bluray' : isStandardDvd ? ' case__front-art--dvd' : ''

  const style = {
    '--front-header-height': showHeader ? `${FRONT_HEADER_HEIGHT_PCT}%` : '0%',
    '--front-inset': showHeader ? `${FRONT_INSET_PCT}%` : '0%',
  } as CSSProperties

  return (
    <div className={`case__front-art${modifier}`} style={style}>
      {/*
       * The blue is the case body's own full-bleed background, not a
       * banner sitting on top of the poster — the poster is the layer
       * that's inset, with a small even margin on three sides and a taller
       * margin at the top for the header marks. --front-header-height and
       * --front-inset are 0 for DVD, so this is inset:0 there and full
       * bleed.
       */}
      <div className="case__front-poster">
        <img src={coverSrc} alt={coverAlt} loading="lazy" />
      </div>
      {showHeader && (
        <div className="case__front-header" aria-hidden="true">
          <span className="case__front-mark">
            <img className="case__front-mark-logo" src={BLURAY_LOGO_SRC} alt="" />
            <span className="case__front-mark-text">
              BLU-RAY<sup>TM</sup> DISC
            </span>
          </span>
          {/*
           * Centred horizontally, not confined inside the header strip:
           * bottom: 0 puts its own bottom edge on the header/poster
           * boundary, then translateY(33%) carries it down so a third of
           * it overlaps the artwork instead of sitting flush above it.
           */}
          <span className="case__front-ellipse">
            <img className="case__front-ellipse-logo" src={BLURAY_LOGO_SRC} alt="" />
          </span>
        </div>
      )}
      <div className="case__front-gloss" aria-hidden="true" />
    </div>
  )
}
