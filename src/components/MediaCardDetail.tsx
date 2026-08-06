import type { Entry } from '../data/lists'
import '@fontsource/lora/latin-400.css'
import './MediaCardDetail.css'

interface MediaCardDetailProps {
  entry: Entry
  /** Gates the fade-in (MediaCardDetail.css) — see that file's own comment. */
  open: boolean
  /**
   * 'card' (the default) is the mobile shape, rendered by each card
   * component itself, positioned against its own card. 'row' is the
   * desktop shape, rendered once by MediaList.tsx as a sibling of the
   * row, positioned against .media-list-band instead — see
   * MediaCardDetail.css's own comment for why that has to be a real
   * sibling rather than a CSS-only repositioning of this same element.
   */
  variant?: 'card' | 'row'
}

/**
 * The detail text for whichever card is active — rank, title, year,
 * creator, note. Two call sites render this, not one: KeepCaseCard,
 * AlbumCard and GameCard each still render their own copy directly below
 * their own card (variant='card', build plan stage 5's original reasoning
 * — the row scrolls horizontally, so pinning one shared panel under the
 * row read as detached from whichever card was actually open) for mobile,
 * where that's still true. MediaList.tsx additionally renders one more
 * copy itself (variant='row', visual pass, direct instruction) for
 * desktop, where centring under the card instead put the panel over the
 * fixed side nav for an early card or off the row's own right edge for a
 * late one — the row doesn't scroll at desktop widths this project
 * targets, so a panel that stays centred under the row's own fixed
 * position doesn't have the "detached from a moving row" problem the
 * mobile version was built to avoid. MediaCardDetail.css's own media
 * queries are what keep only one of the two ever visible at a given
 * width; both mount regardless, since neither this component nor
 * MediaList.tsx reads viewport width.
 *
 * Rank moved here from MediaCard.css's own resting caption
 * (frontend-design review, films): these are ranked objects on a shelf,
 * not stock on sale, and position in the row already carries the rank at
 * rest — a number sitting under every closed card the whole time
 * restated something the row's own order already said. It still needs
 * saying somewhere once a card is open and the row's own order isn't
 * what's on screen any more, so it joins the title block instead, same
 * plain interface type as year and creator, not the note's own voice.
 */
export default function MediaCardDetail({ entry, open, variant = 'card' }: MediaCardDetailProps) {
  const className = variant === 'row' ? 'media-card-detail media-card-detail--row' : 'media-card-detail'
  return (
    <div className={className} data-open={open} aria-live="polite">
      <h2 className="media-card-detail__title">
        <span className="media-card-detail__rank">{entry.rank}</span> {entry.title}{' '}
        <span className="media-card-detail__year">{entry.year}</span>
      </h2>
      <p className="media-card-detail__creator">{entry.creator}</p>
      {entry.note && <p className="media-card-detail__note">{entry.note}</p>}
    </div>
  )
}
