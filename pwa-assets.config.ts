import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Génère les icônes PWA (favicon, apple-touch-icon, 64/192/512, maskable) dans public/
// depuis brand/logo-carre.png : le logo « La décadence » en carré plein (coins remplis
// en bleu nuit), car c'est le téléphone qui arrondit l'icône à sa façon.
// Commande : npm run generate-pwa-assets
const NAVY = '#0f172a'

export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    transparent: { ...minimal2023Preset.transparent, padding: 0 },
    // Android découpe l'icône en cercle : marge pour que les éclaboussures restent visibles
    maskable: { ...minimal2023Preset.maskable, padding: 0.2, resizeOptions: { background: NAVY } },
    apple: { ...minimal2023Preset.apple, padding: 0, resizeOptions: { background: NAVY } },
  },
  images: ['brand/logo-carre.png'],
})
