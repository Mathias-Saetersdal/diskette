import { useState, type ComponentType } from 'react'
import type { Entry } from '../data/lists'
import './MediaList.css'

interface MediaCardProps {
  entry: Entry
  active: boolean
  onActivate: () => void
  onDeactivate: () => void
}

interface MediaListProps {
  entries: Entry[]
  CardComponent: ComponentType<MediaCardProps>
  ariaLabel: string
  heading: string
}

/**
 * The list-level exclusivity and detail panel shared by every medium:
 * exactly one entry active at a time, a live-region detail panel below the
 * row showing the active entry's title, year, creator and note. Extracted
 * from FilmsList.tsx once AlbumsList needed the identical row/exclusivity
 * behaviour for jewel cases — none of this logic reads anything
 * film-specific, only the generic Entry fields every medium shares.
 *
 * entries is already rank order (src/data/lists.ts) — that ordering is the
 * only thing that conveys rank here. No badge, no number beyond the rank
 * printed by the card itself: open decision 5 resolved as position only.
 */
export default function MediaList({ entries, CardComponent, ariaLabel, heading }: MediaListProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const activeEntry = entries.find((entry) => entry.id === activeId) ?? null

  return (
    <section className="media-list-section" aria-label={ariaLabel}>
      {/*
       * Heading and row share one wrapper (build plan stage 3) so the
       * floor band (MediaList.css's own .media-list-band::before) can
       * cover both and read as one shelf instead of stopping at the
       * row's own top edge with the heading floating above it,
       * unrelated. The detail panel stays outside it, its own sibling —
       * the band is what the objects and their heading sit on, not the
       * text describing whichever one is open.
       */}
      <div className="media-list-band">
        <h2 className="media-list-heading">{heading}</h2>
        <div className="media-list">
          {entries.map((entry) => (
            <CardComponent
              key={entry.id}
              entry={entry}
              active={entry.id === activeId}
              onActivate={() => setActiveId(entry.id)}
              onDeactivate={() => setActiveId(null)}
            />
          ))}
        </div>
      </div>
      <div className="media-list-detail" aria-live="polite">
        {activeEntry && (
          <>
            <h2 className="media-list-detail__title">
              {activeEntry.title} <span className="media-list-detail__year">{activeEntry.year}</span>
            </h2>
            <p className="media-list-detail__creator">{activeEntry.creator}</p>
            {activeEntry.note && <p className="media-list-detail__note">{activeEntry.note}</p>}
          </>
        )}
      </div>
    </section>
  )
}
