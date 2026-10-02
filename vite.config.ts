import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

const THEME_COLOR = '#0b1326'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      // Le service worker se met à jour tout seul à la prochaine ouverture
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'La décadence',
        short_name: 'La décadence',
        description: 'Des mini-jeux à boire à faire entre potes, sur un ou plusieurs téléphones.',
        lang: 'fr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: THEME_COLOR,
        background_color: THEME_COLOR,
        categories: ['games', 'entertainment'],
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Jeux locaux jouables hors ligne : tout le front est mis en cache
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,webp,svg,woff2,mp3,ogg,wav}'],
        // Le temps réel et l'API ne doivent jamais passer par le cache
        navigateFallbackDenylist: [/^\/socket\.io/, /^\/health/],
      },
      devOptions: {
        // Passer à true pour tester le service worker avec `npm run dev`
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Accessible depuis les téléphones du réseau local
    host: true,
    proxy: {
      '/socket.io': { target: 'http://localhost:3000', ws: true },
      '/health': 'http://localhost:3000',
    },
  },
})
