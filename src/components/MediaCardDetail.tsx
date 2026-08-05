import type { Entry } from '../data/lists'
import '@fontsource/lora/latin-400.css'
import './MediaCardDetail.css'

interface MediaCardDetailProps {
  entry: Entry
  /** Gates the fade-in (MediaCardDetail.css) — see that file's own comment. */
  open: boolean
}

/**
 * The detail text for whichever card is active — rank, title, year,
 * creator, note — rendered directly below that card (build plan stage
 * 5), not as one shared panel below the whole row. The row scrolls
 * horizontally (MediaList.css), so the active card can be anywhere in it;
 * a single panel below the row read as detached from the object it was
 * describing once that was true, since it always sat centred under the
 * row as a whole regardless of which card was actually open.
 *
 * Rank moved here from MediaCard.css's own resting caption
 * (frontend-design review, films): these are ranked objects on a shelf,
 * not stock on sale, and position in the row already carries the rank at
 * rest — a number sitting under every closed card the whole time
 * restated something the row's own order already said. It still needs
 * saying somewhere once a card is open and the row's own order isn't
 * what's on screen any more, so it joins the title block instead, same
 * plain interface type as year and creator, not the note's own voice.
 *
 * Each card component (KeepCaseCard, AlbumCard, GameCard) renders this
 * itself, from its own entry prop, once showCase is true — no need to
 * track scroll position or compute where the active card is, since it
 * naturally sits under whichever card mounts it.
 */
export default function MediaCardDetail({ entry, open }: MediaCardDetailProps) {
  return (
    <div className="media-card-detail" data-open={open} aria-live="polite">
      <h2 className="media-card-detail__title">
        <span className="media-card-detail__rank">{entry.rank}</span> {entry.title}{' '}
        <span className="media-card-detail__year">{entry.year}</span>
      </h2>
      <p className="media-card-detail__creator">{entry.creator}</p>
      {entry.note && <p className="media-card-detail__note">{entry.note}</p>}
    </div>
  )
}
