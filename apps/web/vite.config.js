import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// GitHub Pages serves this project at /gatewayDemo/, so every asset URL needs
// that prefix. Railway and local dev serve from the domain root and must not
// have it. One build config, switched at build time: `npm run deploy` sets
// BASE_PATH, everything else gets '/'.
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [react()],
  // react-map-gl is hoisted to the workspace root, where React resolves to 18
  // (GeoQuest's), while this app runs React 19 from its own node_modules. Two
  // copies in one tree means every hook call from the map throws
  // "Invalid hook call". Dedupe pins both to a single resolution.
  resolve: { dedupe: ['react', 'react-dom'] },
  // Pinned so geoquest (5174) and this app never race for the same port.
  server: { port: 5173, strictPort: true },
})
