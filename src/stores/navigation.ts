import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

interface ActiveGame {
  /** Adresse du jeu, pour y revenir depuis l'appareil photo */
  path: string
  /** Nom du composant gardé en mémoire par <KeepAlive> */
  component: string
}

export const useNavigationStore = defineStore('navigation', () => {
  const activeGame = ref<ActiveGame | null>(null)

  /** Composants à ne pas détruire : seulement le jeu en cours */
  const keepAlive = computed(() => (activeGame.value ? [activeGame.value.component] : []))

  return { activeGame, keepAlive }
})
