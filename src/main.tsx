import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import TiltCompare from './components/TiltCompare.tsx'
import LanguageProvider from './i18n/LanguageProvider.tsx'

// No router: one temporary dev-only route (/tilt-compare, see that
// component) alongside the real app, picked by a plain pathname check
// rather than a dependency for something this narrow and short-lived.
// The dev route renders no translated strings, so it stays outside the
// language provider.
const page =
  window.location.pathname === '/tilt-compare' ? (
    <TiltCompare />
  ) : (
    <LanguageProvider>
      <App />
    </LanguageProvider>
  )

createRoot(document.getElementById('root')!).render(<StrictMode>{page}</StrictMode>)
