// Polices embarquées (pas de Google Fonts) pour que la PWA marche hors ligne
import '@fontsource/outfit/600.css'
import '@fontsource/outfit/700.css'
import '@fontsource/plus-jakarta-sans/400.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
