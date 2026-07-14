import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // We hand-write the service worker (src/sw.js) and register it ourselves
    // in main.jsx — this plugin only injects the current build's real
    // precache manifest into it (injectManifest), so the cache list never
    // goes stale against Vite's content-hashed filenames.
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html}'],
      },
      manifest: false,
      injectRegister: false,
      devOptions: { enabled: false },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
