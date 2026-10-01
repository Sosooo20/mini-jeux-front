import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'mini-jeux:pseudo'
export const PSEUDO_MAX_LENGTH = 20

function load(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

/** Pseudo du joueur sur ce téléphone, saisi au premier lancement. */
export const useUserStore = defineStore('user', () => {
  const pseudo = ref(load())

  const hasPseudo = computed(() => pseudo.value.length > 0)
  const initial = computed(() => pseudo.value.charAt(0).toUpperCase())

  function setPseudo(value: string) {
    pseudo.value = value.trim().slice(0, PSEUDO_MAX_LENGTH)
    try {
      localStorage.setItem(STORAGE_KEY, pseudo.value)
    } catch {
      /* stockage indisponible : on garde le pseudo en mémoire */
    }
  }

  return { pseudo, hasPseudo, initial, setPseudo }
})
