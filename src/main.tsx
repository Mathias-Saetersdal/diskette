import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import TiltCompare from './components/TiltCompare.tsx'

// No router: one temporary dev-only route (/tilt-compare, see that
// component) alongside the real app, picked by a plain pathname check
// rather than a dependency for something this narrow and short-lived.
const page = window.location.pathname === '/tilt-compare' ? <TiltCompare /> : <App />

createRoot(document.getElementById('root')!).render(<StrictMode>{page}</StrictMode>)
