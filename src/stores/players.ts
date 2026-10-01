import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useUserStore, PSEUDO_MAX_LENGTH } from '@/stores/user'
import { MAX_PLAYERS } from '@/lib/games'

// sessionStorage : la liste survit à un rechargement, repart de zéro à la fermeture de l'appli
const STORAGE_KEY = 'mini-jeux:guests'

function load(): string[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

const normalize = (name: string) => name.trim().toLocaleLowerCase('fr')

/**
 * Joueurs des parties locales (un seul téléphone qui tourne).
 * Le joueur 1 est toujours le pseudo du téléphone ; les autres sont des invités.
 */
export const usePlayersStore = defineStore('players', () => {
  const user = useUserStore()
  const guests = ref<string[]>(load())

  const names = computed(() => [user.pseudo, ...guests.value])
  const count = computed(() => names.value.length)
  const isFull = computed(() => count.value >= MAX_PLAYERS)

  function persist() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(guests.value))
    } catch {
      /* stockage indisponible : on garde la liste en mémoire */
    }
  }

  /** Ajoute un invité ; renvoie un message d'erreur si c'est impossible. */
  function add(name: string): string | null {
    const trimmed = name.trim().slice(0, PSEUDO_MAX_LENGTH)
    if (!trimmed) return 'Entre un pseudo.'
    if (isFull.value) return `${MAX_PLAYERS} joueurs maximum.`
    if (names.value.some((n) => normalize(n) === normalize(trimmed))) {
      return 'Ce pseudo est déjà pris.'
    }
    guests.value.push(trimmed)
    persist()
    return null
  }

  function remove(name: string) {
    guests.value = guests.value.filter((n) => n !== name)
    persist()
  }

  return { names, guests, count, isFull, add, remove }
})
