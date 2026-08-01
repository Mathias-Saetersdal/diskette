import { useState } from 'react'
import FilmCard from './FilmCard'
import { films } from '../data/lists'
import './FilmsList.css'

/**
 * films is already rank order (src/data/lists.ts) — that ordering is the
 * only thing that conveys rank here. No badge, no number: open decision 5
 * resolved as position only.
 */
export default function FilmsList() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const activeEntry = films.find((entry) => entry.id === activeId) ?? null

  return (
    <section className="films-list-section" aria-label="Films, all time">
      <div className="films-list">
        {films.map((entry) => (
          <FilmCard
            key={entry.id}
            entry={entry}
            active={entry.id === activeId}
            onActivate={() => setActiveId(entry.id)}
            onDeactivate={() => setActiveId(null)}
          />
        ))}
      </div>
      {/*
       * One detail area below the whole row rather than inline per card:
       * the row is ten thumbnails wide, not a place notes can actually be
       * read, and an inline block would make the row's height jump around
       * depending on which card happens to be open.
       */}
      <div className="films-list-detail" aria-live="polite">
        {activeEntry && (
          <>
            <h2 className="films-list-detail__title">
              {activeEntry.title} <span className="films-list-detail__year">{activeEntry.year}</span>
            </h2>
            <p className="films-list-detail__creator">{activeEntry.creator}</p>
            {activeEntry.note && <p className="films-list-detail__note">{activeEntry.note}</p>}
          </>
        )}
      </div>
    </section>
  )
}
