import Intro from './components/Intro'
import FilmsList from './components/FilmsList'
import SeriesList from './components/SeriesList'
import AlbumsList from './components/AlbumsList'
import GamesList from './components/GamesList'
import { useEffect } from 'react'
import Footer from './components/Footer'
import SectionNav from './components/SectionNav'
import LanguageToggle from './components/LanguageToggle'
import { preloadDiscs } from './preloadDiscs'
import './App.css'

function App() {
  // Once, after mount — preloadDiscs itself waits for window load and an
  // idle beat before touching the network. See that file for why.
  useEffect(() => {
    preloadDiscs()
  }, [])

  return (
    <>
      <SectionNav />
      <LanguageToggle />
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
