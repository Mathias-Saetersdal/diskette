import { useState, type ComponentType } from 'react'
import type { Entry } from '../data/lists'
import MediaCardDetail from './MediaCardDetail'
import './MediaList.css'

interface SequenceState {
  showCase: boolean
  open: boolean
}

interface MediaCardProps {
  entry: Entry
  active: boolean
  /** Some other entry in this list is active — see useCaseSequence's own displaced comment. */
  displaced?: boolean
  onActivate: () => void
  onDeactivate: () => void
  onSequenceChange?: (state: SequenceState) => void
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
 * The detail text for whichever entry is active renders twice, not once:
 * each card component still renders its own mobile copy directly under
 * itself (MediaCardDetail's variant='card', build plan stage 5's original
 * reasoning — the row scrolls horizontally there, so one shared panel
 * always centred under the row read as detached from whichever card was
 * actually open). This component additionally renders one more copy of
 * its own (variant='row', visual pass, direct instruction) as a sibling
 * of the row rather than nested inside any one card, so it can centre
 * against .media-list-band — the row's own fixed width at desktop, which
 * doesn't scroll the way mobile's does — instead of whichever card
 * happens to be open. MediaCardDetail.css's own media queries keep only
 * one of the two visible at a given width; both mount here regardless,
 * fed by detail below.
 *
 * detail is populated by onSequenceChange, called by whichever card is
 * currently showing its own full case (useCaseSequence's showCase/open,
 * relayed up rather than duplicated — this component has no sequencing
 * logic of its own, only exactly one entry can be showing at a time, the
 * same exclusivity activeId already enforces).
 *
 * One state object, not two: every card's own onSequenceChange callback
 * is a fresh closure each render (it captures that card's own entry), so
 * every card's effect re-fires on every render of this component, not
 * only the active card's — confirmed directly, an earlier version with
 * separate detailEntry/detailOpen state left detailOpen stuck at false,
 * because the inactive cards' own showCase: false updates ran after the
 * active card's showCase: true one in the same batch and won the race.
 * Folding both fields into one updater sidesteps that: an inactive card's
 * own update only ever touches state by checking the CURRENT entry id
 * inside the updater itself, so it can only ever clear its own former
 * turn, never a different card's active one, regardless of call order.
 *
 * entries is already rank order (src/data/lists.ts) — that ordering is the
 * only thing that conveys rank here. No badge, no number beyond the rank
 * printed by the card itself: open decision 5 resolved as position only.
 */
export default function MediaList({ entries, CardComponent, ariaLabel, heading, id }: MediaListProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [detail, setDetail] = useState<{ entry: Entry; open: boolean } | null>(null)

  const handleSequenceChange = (entry: Entry, state: SequenceState) => {
    setDetail((prev) => {
      if (state.showCase) {
        // Bail out with the same reference when nothing has actually
        // changed, not just a value that looks the same: every card's own
        // onSequenceChange prop is a fresh closure each render of this
        // component (it captures that card's own entry), so its own
        // useEffect re-fires on every render here, active card included —
        // returning a new {entry, open} object unconditionally on every
        // one of those calls, even when open hadn't actually flipped,
        // kept triggering a further render, which recreated the closures,
        // which fired the effects again. Confirmed directly: the render
        // loop this caused ran continuously in the background and was
        // enough to stop the card-level fade transition elsewhere on the
        // page from ever settling on 200ms Chrome CPU couldn't otherwise
        // account for. Returning prev unchanged here is what actually
        // stops that loop once state has genuinely settled.
        if (prev && prev.entry.id === entry.id && prev.open === state.open) return prev
        return { entry, open: state.open }
      }
      return prev?.entry.id === entry.id ? null : prev
    })
  }

  return (
    <section id={id} className="media-list-section" aria-label={ariaLabel}>
      {/*
       * Heading and row share one wrapper (build plan stage 3) so the
       * floor band (MediaList.css's own .media-list-band::before) can
       * cover both and read as one shelf instead of stopping at the
       * row's own top edge with the heading floating above it,
       * unrelated. The row-level caption below joins this same wrapper,
       * not .media-list-section: it has to share .media-list-band's own
       * position: relative to centre against the row's width, and
       * .media-list-band's own padding-bottom (MediaList.css) is what
       * reserves room for it beneath that shared floor.
       */}
      <div className="media-list-band">
        <h2 className="media-list-heading">{heading}</h2>
        <div className="media-list">
          {entries.map((entry) => (
            <CardComponent
              key={entry.id}
              entry={entry}
              active={entry.id === activeId}
              displaced={activeId !== null && activeId !== entry.id}
              onActivate={() => setActiveId(entry.id)}
              onDeactivate={() => setActiveId(null)}
              onSequenceChange={(state) => handleSequenceChange(entry, state)}
            />
          ))}
        </div>
        {detail && <MediaCardDetail entry={detail.entry} open={detail.open} variant="row" />}
      </div>
    </section>
  )
}
