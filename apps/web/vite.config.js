import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Pinned so geoquest (5174) and this app never race for the same port.
  server: { port: 5173, strictPort: true },
})
