// Le générateur d'icônes écrit à côté de l'image source (brand/) : on déplace le résultat dans public/
import { readdirSync, renameSync } from 'node:fs'

const generated = /^(pwa-\d+x\d+\.png|maskable-icon-\d+x\d+\.png|apple-touch-icon-\d+x\d+\.png|favicon\.ico)$/

for (const file of readdirSync('brand')) {
  if (generated.test(file)) {
    renameSync(`brand/${file}`, `public/${file}`)
    console.log(`public/${file}`)
  }
}
