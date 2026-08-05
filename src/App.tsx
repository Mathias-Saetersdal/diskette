import Intro from './components/Intro'
import FilmsList from './components/FilmsList'
import SeriesList from './components/SeriesList'
import AlbumsList from './components/AlbumsList'
import GamesList from './components/GamesList'
import Footer from './components/Footer'
import SectionNav from './components/SectionNav'
import './App.css'

function App() {
  return (
    <>
      <SectionNav />
      <main className="stage">
        <Intro />
        <FilmsList />
        <SeriesList />
        <AlbumsList />
        <GamesList />
        <Footer />
      </main>
    </>
  )
}

export default App
