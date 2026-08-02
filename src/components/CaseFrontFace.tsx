import { useState, type CSSProperties } from 'react'
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

// PlayStation headers measured directly against reference/ photos (sampled
// pixel columns, not eyeballed): ps2 ~13%, ps3-late ~8%, ps4 and ps5 both
// ~11% of the cover's own height. ps3-early has no front header at all —
// see hasHeader below.
//
// These figures are not the same numbers as the photos' own measurement,
// though: .case is rendered at a fixed 3D tilt (caseMechanism.css), and
// under that tilt's perspective the header zone — sitting at the near,
// top-left corner of the rotated face — visually magnifies to roughly
// 1.7x its own flat CSS height, confirmed directly by comparing
// getComputedStyle().height against getBoundingClientRect().height on the
// live rendering. A flat reference photo has no such distortion to
// correct for. These values are picked against the tilted, on-screen
// result, not the photos' own flat percentage.
//
// PS2 used to keep its own, shorter figure, tuned back when its mark was
// still styled text — once real vector marks landed for all four, PS2's
// own header read visibly shallower than ps4's and ps5's side by side, so
// it now shares this figure with them too, with PS2's own marks scaled to
// fit it (.case__front-platform-logo--ps2, .case__front-ps-family-logo,
// Case.css).
const PS_LOGO_HEADER_HEIGHT_PCT = 8

// docs/02-asset-sources.md: shared UI marks live under public/assets, same
// as fetched cover/disc assets, not bundled through src/.
export const BLURAY_LOGO_SRC = '/assets/marks/blu-ray-disc-white.png'
// A real vector (four <path> elements with genuine coordinate data, no
// embedded raster, no background rect) — confirmed before use, copied from
// reference/playstation-logo.svg unmodified. playstation-network-logo.png
// is still unusable (no real alpha channel); PS3-late's badge stays
// styled text until a working one is sourced.
export const PS_LOGO_SRC = '/assets/marks/playstation-logo.svg'
// Three more real vectors, checked the same way before use: genuine <path>
// data (not an <image> wrapping a raster), no background rect, and every
// corner pixel of a rasterised check came back alpha:0 — confirmed with
// sharp, not assumed. All three carry a hardcoded dark fill (ps3-logo-new
// none at all, defaulting to SVG's own black; ps4-logo style="fill:#333")
// rather than white, which .case__front-platform-logo's filter corrects —
// see that rule for why a CSS filter rather than editing the SVG.
export const PS3_LATE_LOGO_SRC = '/assets/marks/ps3-logo-new.svg'
export const PS4_LOGO_SRC = '/assets/marks/ps4-logo.svg'
export const PS5_LOGO_SRC = '/assets/marks/ps5-logo.svg'
// ps3-logo-old.svg: the full "PLAYSTATION 3" wordmark, not the shorter "PS3"
// mark above — ps3-early's own reference photo carries this one on the
// spine, not the front (Case.tsx renders it, not this file). Same
// verification: real paths, fill="#231f20" on a <g>, transparent corners.
export const PS3_EARLY_LOGO_SRC = '/assets/marks/ps3-logo-old.svg'
// reference/playstation-2-seeklogo.svg, copied unmodified. Real <path>
// data, no background rect, transparent corners confirmed with sharp.
// Unusual fill situation, checked closely rather than assumed: its <defs>
// declares four gradient-filled classes (.cls-1 through .cls-4), but no
// <path> in the file actually carries any of those classes, and the
// gradients they'd reference aren't even defined anywhere in the file —
// dead, unreachable CSS, probably left over from whatever tool exported
// this. Every path is therefore unfilled and renders at the SVG default,
// solid black — confirmed by rendering and sampling a glyph pixel, not
// assumed from reading the markup alone. Same recolour filter as the
// other black-by-default marks. A second candidate,
// reference/playstation-2-seeklogo.png, is also genuinely usable (real
// alpha channel, transparent corners, clean content) but the vector is
// preferred, same as every other mark here.
export const PS2_LOGO_SRC = '/assets/marks/ps2-logo.svg'
// reference/ps3-grey-logo.png: real alpha channel, transparent corners —
// usable, but only 32x32px, a favicon-sized source. Expect it to read
// soft rather than crisp once scaled up to sit next to a vector wordmark;
// flagged rather than hidden.
export const PS3_GREY_LOGO_SRC = '/assets/marks/ps3-grey-logo.png'

interface CaseFrontFaceProps {
  coverSrc: string
  coverAlt: string
  caseFormat: SupportedCaseFormat
  livery: Livery
}

/**
 * The printed front face of a case: the poster, and for standard Blu-ray
 * or a PlayStation livery, the header bar and marks over it. Self-contained
 * — defines its own --front-w off its own rendered width via a container
 * query unit rather than depending on an ancestor to supply one, since it
 * mounts two different ways: inside Case's 3D leaf (open) where --front-w
 * already exists on .case, and inside FlatCase's flat placeholder (closed)
 * where nothing above it defines one. The actual rules (case__front-art and
 * its children) live in Case.css, shared rather than duplicated.
 */
export default function CaseFrontFace({ coverSrc, coverAlt, caseFormat, livery }: CaseFrontFaceProps) {
  // Games are the first list built with no assets fetched yet (every
  // cover 404s until they're sourced by hand — docs/05-build-plan.md).
  // Nothing else in the codebase handles a broken image src, so a missing
  // cover would otherwise show the browser's own broken-image icon inside
  // the poster box. Hiding the <img> on error instead lets the livery's
  // own front-art background colour (already there for every livery, not
  // new) show through the poster's own space — no placeholder art
  // invented, matching the data rule against substituting one.
  const [coverFailed, setCoverFailed] = useState(false)
  // "standard" livery isn't one look — for films it's whatever the
  // natural, unbranded case for that format is (docs/03-object-spec.md,
  // Livery). The five PlayStation liveries are format-independent (case
  // geometry varies, the livery itself doesn't), which is why this checks
  // livery alone for them rather than pairing it with caseFormat the way
  // the two standard checks do.
  const isStandardBluray = livery === 'standard' && caseFormat === 'bluray'
  const isStandardDvd = livery === 'standard' && caseFormat === 'dvd'
  const isPsLivery = livery !== 'standard'
  const isPs3Early = livery === 'ps3-early'
  // ps3-early has no front header at all — reference/lego-star-wars-ps3-old
  // -design.webp's top edge (the thin Blu-ray-blue strip this used to
  // stand in for) turned out not worth simplifying onto the front this
  // way; removed rather than kept as a compromise. Its own marks (the grey
  // badge and the "PLAYSTATION 3" wordmark) render below instead, as a
  // vertical strip down the poster's own left edge rather than in this
  // shared header — a flat overlay on the front face, not the case's real
  // 3D spine, after that read as detached from the case when tried.
  // Every other PlayStation livery and standard Blu-ray still get a real
  // header, sized differently per group.
  const hasHeader = isStandardBluray || (isPsLivery && !isPs3Early)
  const headerHeightPct = isStandardBluray
    ? FRONT_HEADER_HEIGHT_PCT
    : isPs3Early
      ? 0
      : isPsLivery
        ? PS_LOGO_HEADER_HEIGHT_PCT
        : 0
  const modifier = isStandardBluray
    ? ' case__front-art--bluray'
    : isStandardDvd
      ? ' case__front-art--dvd'
      : isPsLivery
        ? ` case__front-art--${livery}`
        : ''

  const style = {
    '--front-header-height': `${headerHeightPct}%`,
    // Full bleed below the header for every PlayStation livery and DVD
    // standard — every reference photo runs the box art to the case's own
    // left, right and bottom edges with no margin. Only standard Blu-ray
    // insets the poster, its own established look.
    '--front-inset': isStandardBluray ? `${FRONT_INSET_PCT}%` : '0%',
  } as CSSProperties

  return (
    <div className={`case__front-art${modifier}`} style={style}>
      {/*
       * The blue is the case body's own full-bleed background, not a
       * banner sitting on top of the poster — the poster is the layer
       * that's inset, with a small even margin on three sides and a taller
       * margin at the top for the header marks. --front-header-height and
       * --front-inset are 0 for DVD, so this is inset:0 there and full
       * bleed; every PlayStation livery is inset:0 on three sides too,
       * only the top differs, per --front-header-height.
       */}
      <div className="case__front-poster">
        {!coverFailed && (
          <img src={coverSrc} alt={coverAlt} loading="lazy" onError={() => setCoverFailed(true)} />
        )}
      </div>
      {hasHeader && (
        <div className="case__front-header" aria-hidden="true">
          {/*
           * reference/black-ops-2-ps3.jpg: the small grey PlayStation
           * family mark sits in the header's top-left corner, with "PS3"
           * immediately to its right — both marks pushed as far left as
           * the header's own padding allows, ahead of the PSN placeholder
           * below (which used to sit first and block this corner). Low-
           * resolution source (32x32, PS3_GREY_LOGO_SRC's own comment) —
           * expect it to look soft next to the crisp vector wordmark
           * beside it.
           */}
          {livery === 'ps3-late' && <img className="case__front-ps3-grey-mark" src={PS3_GREY_LOGO_SRC} alt="" />}
          {isStandardBluray ? (
            <span className="case__front-mark">
              <img className="case__front-mark-logo" src={BLURAY_LOGO_SRC} alt="" />
              <span className="case__front-mark-text">
                BLU-RAY<sup>TM</sup> DISC
              </span>
            </span>
          ) : (
            <img
              className={`case__front-platform-logo case__front-platform-logo--${livery}`}
              src={
                livery === 'ps2'
                  ? PS2_LOGO_SRC
                  : livery === 'ps3-late'
                    ? PS3_LATE_LOGO_SRC
                    : livery === 'ps4'
                      ? PS4_LOGO_SRC
                      : PS5_LOGO_SRC
              }
              alt=""
            />
          )}
          {/*
           * Centred horizontally, not confined inside the header strip:
           * bottom: 0 puts its own bottom edge on the header/poster
           * boundary, then translateY(33%) carries it down so a third of
           * it overlaps the artwork instead of sitting flush above it.
           * Standard Blu-ray only — none of the PlayStation liveries have
           * a second, centred mark in their own reference photos.
           */}
          {isStandardBluray && (
            <span className="case__front-ellipse">
              <img className="case__front-ellipse-logo" src={BLURAY_LOGO_SRC} alt="" />
            </span>
          )}
          {/* PS2's own reference photo: the four-colour PlayStation family
              mark at the header's right end. Real vector, checked before
              use — see PS_LOGO_SRC above. */}
          {livery === 'ps2' && <img className="case__front-ps-family-logo" src={PS_LOGO_SRC} alt="" />}
          {/*
           * PS3-late's own reference photo carries a PlayStation Network
           * mark at the header's right end. No usable file exists for it
           * yet (playstation-network-logo.png has no real alpha channel;
           * none of the five files checked in an earlier round were a PSN
           * mark either), so this reserves its footprint rather than
           * rendering anything — an empty, aria-hidden spacer, not a
           * design choice to leave that end of the banner bare. Swap in a
           * real <img> here once one's sourced.
           */}
          {livery === 'ps3-late' && <span className="case__front-psn-placeholder" aria-hidden="true" />}
        </div>
      )}
      {/*
       * reference/lego-star-wars-ps3-old-design.webp shows both marks
       * running down the case's real spine, but rendering them there (a
       * true 3D face, only visible at an angle) needed a Z-push to win a
       * depth comparison against this very poster, and even once that
       * worked it read as detached from the case rather than part of it.
       * A flat strip down the poster's own left edge instead — the badge
       * at the top, the wordmark rotated to run the rest of its length —
       * gets the same layout without any of that: a normal, stacked front
       * -face overlay, positioned directly against case__front-art like
       * the header above, not a separate 3D element competing for depth.
       */}
      {isPs3Early && (
        <span className="case__front-ps3-early-strip" aria-hidden="true">
          <span className="case__front-ps3-early-badge">
            <img className="case__front-ps3-early-badge-logo" src={PS_LOGO_SRC} alt="" />
          </span>
          {/*
           * case__front-ps3-early-wordmark-area is the remaining strip
           * length below the badge (flex: 1 in the strip's own column),
           * centring the wordmark within *that* space rather than the
           * strip's full length — otherwise the badge's own footprint at
           * the top biases the "centre" upward, since the strip's own
           * flex centring has no notion of "excluding the badge".
           *
           * transform: rotate(-90deg) doesn't participate in flex layout —
           * an element's flex slot is sized off its own *pre-rotation* box,
           * so a rotated wordmark renders far larger than the slot flex
           * reserved for it unless that slot is sized to the rotated
           * result up front. case__front-ps3-early-wordmark-slot exists
           * solely to give flex a box sized to the wordmark's real,
           * rotated footprint, with the wordmark itself centred and
           * rotated inside it — confirmed necessary the first time this
           * ran on the spine, where skipping it let the wordmark spill
           * back up into the badge above it.
           */}
          <span className="case__front-ps3-early-wordmark-area">
            <span className="case__front-ps3-early-wordmark-slot">
              <img className="case__front-ps3-early-wordmark" src={PS3_EARLY_LOGO_SRC} alt="" />
            </span>
          </span>
        </span>
      )}
      <div className="case__front-gloss" aria-hidden="true" />
    </div>
  )
}
