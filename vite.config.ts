import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Served at mathias-saetersdal.github.io/diskette/, not the domain root —
  // every built asset URL needs this prefix or it resolves against the root
  // instead. Local dev is unaffected: the dev server still runs at /.
  base: '/diskette/',
})
