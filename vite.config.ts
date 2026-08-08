import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Served at diskette.saetersdal.no, at the domain root — no subpath
  // prefix needed. Kept explicit rather than left at Vite's own default so
  // a future move back under a subpath is a one-line change here.
  base: '/',
})
