import type { CSSProperties } from 'react'
import Case from './Case'
import { assetUrl } from '../assetUrl'
import type { SupportedCaseFormat } from './caseGeometry'
import type { Livery, Medium } from '../data/lists'
import './TiltCompare.css'

/**
 * Temporary route for comparing the closed-case shelf tilt at a few
 * angles side by side. Not linked from the films list and not part of
 * phase one's deliverable pages — reachable only by URL, and safe to
 * delete once a tilt is chosen. Renders the real Case component (not
 * FlatCase) since the tilt only exists on Case's closed presentation;
 * FlatCase is a flat image with no 3D transform to compare.
 */

interface CompareEntry {
  id: string
  title: string
  cover: string
  disc: string
  medium: Medium
  caseFormat: SupportedCaseFormat
  livery: Livery
}

// The Dark Knight and Fight Club, Spirited Away directly from
// src/data/lists.ts, so both case formats appear: bluray and dvd.
const ENTRIES: CompareEntry[] = [
  {
    id: 'the-dark-knight',
    title: 'The Dark Knight',
    cover: '/assets/film/the-dark-knight/cover.png',
    disc: '/assets/film/the-dark-knight/disc.png',
    medium: 'film',
    caseFormat: 'bluray',
    livery: 'standard',
  },
  {
    id: 'fight-club',
    title: 'Fight Club',
    cover: '/assets/film/fight-club/cover.png',
    disc: '/assets/film/fight-club/disc.png',
    medium: 'film',
    caseFormat: 'dvd',
    livery: 'standard',
  },
  {
    id: 'spirited-away',
    title: 'Spirited Away',
    cover: '/assets/film/spirited-away/cover.png',
    disc: '/assets/film/spirited-away/disc.png',
    medium: 'film',
    caseFormat: 'dvd',
    livery: 'standard',
  },
]

interface TiltRow {
  key: string
  label: string
  tiltX: number
  tiltY: number
}

// Same three magnitudes as Case.css's own closed .case__toggle default
// (6/24, then two steeper), tilt-y mirrored on all three: the spine sits
// on the case's left edge, and a negative tilt-y turns that edge away
// from the viewer instead of toward it. Case.css itself is untouched —
// this page mirrors the sign here only, to compare the corrected
// direction before deciding whether to change the real default.
const TILT_ROWS: TiltRow[] = [
  { key: 'default', label: 'Default magnitude, mirrored', tiltX: 6, tiltY: 24 },
  { key: 'steeper', label: 'Steeper', tiltX: 9, tiltY: 32 },
  { key: 'steepest', label: 'Steepest', tiltX: 12, tiltY: 40 },
]

export default function TiltCompare() {
  return (
    <main className="tilt-compare">
      <h1 className="tilt-compare__heading">Closed tilt comparison</h1>
      <p className="tilt-compare__intro">
        Temporary page, not part of the films list. Nine closed cases at list rest size, three tilt angles, three
        rows.
      </p>
      <a className="tilt-compare__back" href="/">
        Back to the films list
      </a>
      {TILT_ROWS.map((row) => (
        <section key={row.key} className="tilt-compare__row">
          <h2 className="tilt-compare__row-label">
            {row.label}: tilt-x {row.tiltX}deg, tilt-y {row.tiltY}deg
          </h2>
          <div
            className="tilt-compare__cases"
            style={{ '--row-tilt-x': `${row.tiltX}deg`, '--row-tilt-y': `${row.tiltY}deg` } as CSSProperties}
          >
            {ENTRIES.map((entry) => (
              <Case
                key={entry.id}
                title={entry.title}
                coverSrc={assetUrl(entry.cover)}
                coverAlt={`${entry.title} cover`}
                discSrc={assetUrl(entry.disc)}
                discAlt={`${entry.title} disc`}
                medium={entry.medium}
                caseFormat={entry.caseFormat}
                livery={entry.livery}
                open={false}
                enlarged={false}
                // Static display only, per this page's own purpose — the
                // real toggle behaviour lives on the list, untouched.
                onToggleOpen={() => {}}
              />
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
