import FilmsList from './components/FilmsList'
import SeriesList from './components/SeriesList'
import AlbumsList from './components/AlbumsList'
import BurnedDisc from './components/BurnedDisc'
import Case from './components/Case'
import { albums, games } from './data/lists'
import type { CaseFormat, Livery } from './data/lists'
import './App.css'

const burnedEntries = [...albums, ...games].filter(
  (entry) => entry.discSource === 'burned',
)

// Temporary: one closed case per PlayStation livery, before the games list
// itself is built. Closed shows front face and spine together in one
// state, which is all five liveries need to be checked. No game covers
// are fetched yet (docs/02-asset-sources.md — IGDB needs a Twitch
// developer account), so this reuses The Dark Knight's already-fetched
// cover as stand-in art across all five, purely for proportions; the
// title on each spine is still the real game's own.
const LIVERY_PREVIEW: { title: string; caseFormat: CaseFormat; livery: Livery }[] = [
  { title: 'Sly 3: Honor Among Thieves', caseFormat: 'dvd', livery: 'ps2' },
  { title: 'Lego Star Wars: The Complete Saga', caseFormat: 'bluray', livery: 'ps3-early' },
  { title: 'Call of Duty: Black Ops II', caseFormat: 'bluray', livery: 'ps3-late' },
  { title: 'Dark Souls III', caseFormat: 'bluray', livery: 'ps4' },
  { title: 'Elden Ring', caseFormat: 'ps5', livery: 'ps5' },
]

function App() {
  return (
    <main className="stage">
      <FilmsList />
      <SeriesList />
      <AlbumsList />
      <div className="burned-row">
        {burnedEntries.map((entry) => (
          <BurnedDisc key={entry.id} title={entry.title} medium={entry.medium} />
        ))}
      </div>
      <div className="livery-preview">
        {LIVERY_PREVIEW.map((entry) => (
          <Case
            key={entry.livery}
            title={entry.title}
            coverSrc="/assets/film/the-dark-knight/cover.png"
            coverAlt=""
            medium="game"
            caseFormat={entry.caseFormat as 'dvd' | 'bluray' | 'ps5'}
            livery={entry.livery}
            open={false}
            enlarged={false}
            onToggleOpen={() => {}}
          />
        ))}
      </div>
    </main>
  )
}

export default App
