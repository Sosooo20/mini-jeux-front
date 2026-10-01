import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'mini-jeux:local-players'

function load(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

/** Joueurs des parties locales (un seul téléphone qui tourne). */
export const usePlayersStore = defineStore('players', () => {
  const names = ref<string[]>(load())

  const count = computed(() => names.value.length)

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(names.value))
    } catch {
      /* stockage indisponible : on garde l'état en mémoire */
    }
  }

  function add(name: string) {
    const trimmed = name.trim()
    if (!trimmed || names.value.includes(trimmed)) return
    names.value.push(trimmed)
    persist()
  }

  function remove(name: string) {
    names.value = names.value.filter((n) => n !== name)
    persist()
  }

  return { names, count, add, remove }
})
