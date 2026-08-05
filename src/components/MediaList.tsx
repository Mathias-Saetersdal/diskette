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
  // Scroll target for SectionNav.tsx's jump links and the section it
  // marks current via IntersectionObserver. Optional so nothing else
  // calling MediaList needs updating.
  id?: string
}

/**
 * The list-level exclusivity shared by every medium: exactly one entry
 * active at a time. Extracted from FilmsList.tsx once AlbumsList needed
 * the identical row/exclusivity behaviour for jewel cases — none of this
 * logic reads anything film-specific, only the generic Entry fields
 * every medium shares.
 *
 * The detail text for whichever entry is active used to render here too,
 * as one shared panel below the whole row — moved into each card
 * component instead (MediaCardDetail.tsx, build plan stage 5): the row
 * scrolls horizontally, so the active card can be anywhere in it, and a
 * single panel always centred under the row read as detached from
 * whichever card it was actually describing. This component only owns
 * which entry is active now, not what gets shown about it.
 *
 * entries is already rank order (src/data/lists.ts) — that ordering is the
 * only thing that conveys rank here. No badge, no number beyond the rank
 * printed by the card itself: open decision 5 resolved as position only.
 */
export default function MediaList({ entries, CardComponent, ariaLabel, heading, id }: MediaListProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  return (
    <section id={id} className="media-list-section" aria-label={ariaLabel}>
      {/*
       * Heading and row share one wrapper (build plan stage 3) so the
       * floor band (MediaList.css's own .media-list-band::before) can
       * cover both and read as one shelf instead of stopping at the
       * row's own top edge with the heading floating above it,
       * unrelated.
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
    </section>
  )
}
