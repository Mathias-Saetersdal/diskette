import { useEffect, useState, type CSSProperties, type KeyboardEvent, type RefObject } from 'react'
import Disc, { DISC_DIAMETER_MM } from './Disc'
import BurnedDisc from './BurnedDisc'
import type { DiscSource, Livery, Medium } from '../data/lists'
import { CASE_GEOMETRY, MAX_CASE_HEIGHT_MM, type SupportedCaseFormat } from './caseGeometry'
import CaseFrontFace, { BLURAY_LOGO_SRC } from './CaseFrontFace'
import './caseMechanism.css'
import './Case.css'

// The tray-resting disc, the tray ring, and the hub boss are all sized off
// the panel width in mm, so they need to be recomputed per format too —
// see useCaseGeometry below, which does the same division CASE_WIDTH_MM
// used to do as a module constant.
const TRAY_RING_INNER_MM = 100 // the raised glossy ring the disc rests on
const TRAY_RING_OUTER_MM = 118
const HUB_BOSS_MM = 30 // the centre boss the disc clips onto

function useCaseGeometry(caseFormat: SupportedCaseFormat) {
  const { heightMm, widthMm, depthMm } = CASE_GEOMETRY[caseFormat]
  return {
    frontFaceRatio: widthMm / heightMm,
    depthRatio: depthMm / heightMm, // kept thin per Materials, not nudged up for visibility
    discToPanelRatio: DISC_DIAMETER_MM / widthMm, // a 120mm disc in this panel, ~4mm margin on Blu-ray
    trayRingInnerRatio: TRAY_RING_INNER_MM / widthMm,
    trayRingOuterRatio: TRAY_RING_OUTER_MM / widthMm,
    hubBossRatio: HUB_BOSS_MM / widthMm,
    heightScale: heightMm / MAX_CASE_HEIGHT_MM,
  }
}

interface CaseProps {
  title: string
  coverSrc: string
  coverAlt: string
  /** Absent when discSource is 'burned' — BurnedDisc renders instead, no fetched image involved. */
  discSrc?: string
  discAlt?: string
  medium: Medium
  /** 'burned' selects BurnedDisc over a fetched Disc image; anything else, or absent, keeps the fetched disc. */
  discSource?: DiscSource
  caseFormat: SupportedCaseFormat
  livery: Livery
  /**
   * Controlled, not internal: a list of many cases needs exactly one open
   * at a time, which means the state that decides open/closed has to live
   * above whichever Case currently exists — see MediaList. discOut stays
   * internal below, since Case only ever mounts for the one active entry
   * and unmounting already clears it for free.
   */
  open: boolean
  onToggleOpen: () => void
  /**
   * Also controlled, also owned by the sequencing in KeepCaseCard: a case
   * grows to twice its list size before it opens, not at the same time.
   * Kept as its own boolean rather than folded into `open` because the two
   * states are visually independent (scale on .case itself vs. the hinge
   * rotation on .case__toggle) and reach true a beat apart.
   */
  enlarged: boolean
  /** Focused once this Case mounts as the newly-active entry. */
  toggleRef?: RefObject<HTMLButtonElement | null>
}

interface SpineColors {
  background: string
  foreground: string
}

const FALLBACK_SPINE: SpineColors = {
  background: 'linear-gradient(180deg, #2c2c31, #1c1c1f)',
  foreground: '#eee',
}

// Relative luminance (WCAG), used to pick a spine text colour that stays
// legible against whatever the cover happens to sample to.
function luminance([r, g, b]: [number, number, number]): number {
  const [rl, gl, bl] = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl
}

function darken([r, g, b]: [number, number, number], amount = 0.55): string {
  return `rgb(${Math.round(r * amount)}, ${Math.round(g * amount)}, ${Math.round(b * amount)})`
}

// Samples the cover for its two dominant colours so the spine reads as
// "the same case, seen from the side" rather than a generic grey strip.
// Runs once per cover on an offscreen canvas; same-origin asset, no CORS.
function useSpineColors(src: string): SpineColors {
  const [colors, setColors] = useState<SpineColors>(FALLBACK_SPINE)

  useEffect(() => {
    let cancelled = false
    const img = new Image()
    img.src = src
    img.onload = () => {
      if (cancelled) return
      const canvas = document.createElement('canvas')
      const w = 32
      const h = 32
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0, w, h)

      const { data } = ctx.getImageData(0, 0, w, h)
      const buckets = new Map<string, { count: number; rgb: [number, number, number] }>()
      const step = 32 // coarse quantisation, 8 buckets per channel

      for (let i = 0; i < data.length; i += 4) {
        const r = Math.round(data[i] / step) * step
        const g = Math.round(data[i + 1] / step) * step
        const b = Math.round(data[i + 2] / step) * step
        const key = `${r},${g},${b}`
        const existing = buckets.get(key)
        if (existing) {
          existing.count += 1
        } else {
          buckets.set(key, { count: 1, rgb: [r, g, b] })
        }
      }

      const sorted = [...buckets.values()].sort((a, b) => b.count - a.count)
      if (sorted.length === 0) return

      const primary = sorted[0].rgb
      const distance = (a: [number, number, number], b: [number, number, number]) =>
        Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
      const secondary =
        sorted.find((bucket) => distance(bucket.rgb, primary) > 60)?.rgb ?? primary

      const darkA = darken(primary)
      const darkB = darken(secondary)
      const textColor = luminance(primary) > 0.35 ? '#161616' : '#eee'

      if (!cancelled) {
        setColors({
          background: `linear-gradient(180deg, ${darkA}, ${darkB})`,
          foreground: textColor,
        })
      }
    }

    return () => {
      cancelled = true
    }
  }, [src])

  return colors
}

export default function Case({
  title,
  coverSrc,
  coverAlt,
  discSrc,
  discAlt,
  medium,
  discSource,
  caseFormat,
  livery,
  open,
  enlarged,
  onToggleOpen,
  toggleRef,
}: CaseProps) {
  const [discOut, setDiscOut] = useState(false)
  // A closed case can't have a floating disc. open is now the caller's
  // state, not ours, so enforcing that invariant has to watch the prop
  // rather than branch inside a toggle handler — done as a direct
  // render-time check (React state synchronizing with React state, not
  // with anything external), not an effect.
  if (!open && discOut) setDiscOut(false)

  const spine = useSpineColors(coverSrc)
  const geometry = useCaseGeometry(caseFormat)

  // "standard" livery isn't one look — for films it's whatever the
  // natural, unbranded case for that format is (docs/03-object-spec.md,
  // Livery). ps2/ps3/ps4/ps5 liveries are format-independent and not
  // handled here yet (step 7, games). Only the spine mark and the
  // .case--bluray-livery class need this here now — the front face's own
  // copy of this check lives in CaseFrontFace, which also renders closed
  // inside FlatCase.
  const isStandardBluray = livery === 'standard' && caseFormat === 'bluray'

  const toggleDiscOut = () => setDiscOut((was) => !was)

  const handleDiscKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!open) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.stopPropagation()
      toggleDiscOut()
    }
  }

  const style = {
    '--front-face-ratio': geometry.frontFaceRatio,
    '--depth-ratio': geometry.depthRatio,
    '--height-scale': geometry.heightScale,
    '--spine-bg': spine.background,
    '--spine-fg': spine.foreground,
    '--disc-ratio': geometry.discToPanelRatio,
    '--tray-ring-inner': geometry.trayRingInnerRatio,
    '--tray-ring-outer': geometry.trayRingOuterRatio,
    '--hub-boss-ratio': geometry.hubBossRatio,
  } as CSSProperties

  return (
    <div
      className={`case${isStandardBluray ? ' case--bluray-livery' : ''}`}
      data-open={open}
      data-enlarged={enlarged}
      style={style}
    >
      <button
        ref={toggleRef}
        type="button"
        className="case__toggle"
        aria-expanded={open}
        aria-label={`${open ? 'Close' : 'Open'} case: ${title}`}
        onClick={onToggleOpen}
      >
        <div className="case__spine">
          {isStandardBluray && (
            <img className="case__spine-mark" src={BLURAY_LOGO_SRC} alt="" aria-hidden="true" />
          )}
          <span className="case__spine-title">{title}</span>
        </div>

        <div className="case__tray-unit">
          <div className="case__tray">
            <div className="case__panel-frame" aria-hidden="true" />
            <div className="case__panel-sheen" aria-hidden="true" />
            {/*
             * Bottom to top: the flat panel plastic (.case__tray's own
             * background), the raised wall the disc rests inside with
             * overhanging tabs, and the centre boss the disc clips onto.
             * Kept as their own layer under the disc slot so they stay
             * visible once the disc lifts out.
             */}
            <div className="case__tray-ring" aria-hidden="true" />
            <div className="case__tray-tabs" aria-hidden="true" />
            <div className="case__hub-boss" aria-hidden="true">
              <span className="case__hub-cutout case__hub-cutout--left" />
              <span className="case__hub-cutout case__hub-cutout--right" />
              <span className="case__hub-push">PUSH</span>
            </div>
          </div>

          {/*
           * Always mounted, never conditionally unmounted on `open`: the
           * disc must stay visible while the case is closing and the lid
           * physically swings over it (a real occlusion, via 3D depth),
           * not vanish the instant `open` flips. Only keyboard/AT reach is
           * gated on `open`, which doesn't touch rendering.
           */}
          <div
            className={`case__disc-slot${discOut ? ' is-out' : ''}`}
            // Independently focusable control nested in the case button:
            // a real <button> can't contain another interactive element,
            // so this is a role="button" div instead, with its own
            // keyboard handling and stopPropagation so activating it
            // doesn't also toggle the case closed.
            role="button"
            tabIndex={open ? 0 : -1}
            aria-hidden={!open}
            aria-pressed={discOut}
            aria-label={discOut ? 'Return disc to tray' : `Lift ${title} disc`}
            onClick={(event) => {
              if (!open) return
              event.stopPropagation()
              toggleDiscOut()
            }}
            onKeyDown={handleDiscKeyDown}
          >
            {discSource === 'burned' ? (
              <BurnedDisc title={title} medium={medium} interactive={discOut} />
            ) : (
              <Disc src={discSrc ?? ''} alt={discAlt ?? ''} interactive={discOut} />
            )}
          </div>
        </div>

        <div className="case__front">
          {/*
           * Two faces of the same leaf, not a leaf plus a separate static
           * panel: the interior is what you see when the cover has swung
           * past 90deg and you're looking at its back. Each face hides
           * itself when facing away; .case__front-interior is pre-rotated
           * 180deg so it faces the viewer exactly when the leaf has swung
           * open, and mirrors that of the leaf so it isn't itself flipped.
           */}
          <CaseFrontFace coverSrc={coverSrc} coverAlt={coverAlt} caseFormat={caseFormat} livery={livery} />
          <div className="case__front-interior">
            <div className="case__panel-frame" aria-hidden="true" />
            <div className="case__panel-sheen" aria-hidden="true" />
            {/*
             * Real geometry, not a soft highlight: a raised tab with a
             * rectangular slot cut through it, protruding slightly past
             * the panel's own edge into the frame. Two clips on the outer
             * edge (away from the fold), per the reference photos.
             */}
            <div className="case__booklet-clip case__booklet-clip--top" aria-hidden="true">
              <div className="case__booklet-clip-slot" />
            </div>
            <div className="case__booklet-clip case__booklet-clip--bottom" aria-hidden="true">
              <div className="case__booklet-clip-slot" />
            </div>
          </div>
        </div>
      </button>

      <div className="case__shadow" aria-hidden="true" />
    </div>
  )
}
