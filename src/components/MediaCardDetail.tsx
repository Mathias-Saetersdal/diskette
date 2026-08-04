import type { Entry } from '../data/lists'
import './MediaCardDetail.css'

interface MediaCardDetailProps {
  entry: Entry
}

/**
 * The detail text for whichever card is active — title, year, creator,
 * note — rendered directly below that card (build plan stage 5), not as
 * one shared panel below the whole row. The row scrolls horizontally
 * (MediaList.css), so the active card can be anywhere in it; a single
 * panel below the row read as detached from the object it was
 * describing once that was true, since it always sat centred under the
 * row as a whole regardless of which card was actually open.
 *
 * Each card component (KeepCaseCard, AlbumCard, GameCard) renders this
 * itself, from its own entry prop, once showCase is true — no need to
 * track scroll position or compute where the active card is, since it
 * naturally sits under whichever card mounts it.
 */
export default function MediaCardDetail({ entry }: MediaCardDetailProps) {
  return (
    <div className="media-card-detail" aria-live="polite">
      <h2 className="media-card-detail__title">
        {entry.title} <span className="media-card-detail__year">{entry.year}</span>
      </h2>
      <p className="media-card-detail__creator">{entry.creator}</p>
      {entry.note && <p className="media-card-detail__note">{entry.note}</p>}
    </div>
  )
}
