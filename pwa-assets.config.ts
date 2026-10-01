import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Génère les icônes PWA (favicon, apple-touch-icon, 64/192/512, maskable) depuis public/icon.svg
// Commande : npm run generate-pwa-assets
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#1a1027' } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background: '#1a1027' } },
  },
  images: ['public/icon.svg'],
})
