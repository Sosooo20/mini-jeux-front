import { computed, ref, shallowRef } from 'vue'
import { shuffle } from '@/composables/useRandom'

/**
 * Pioche de cartes mélangée, sans répétition : quand elle est vide, on remélange
 * (en évitant de retomber tout de suite sur la dernière carte).
 */
export function useDeck<T>(cards: readonly T[]) {
  const pile = shallowRef<T[]>(shuffle(cards))
  const index = ref(0)

  const current = computed(() => pile.value[index.value] as T)

  function next() {
    if (index.value < pile.value.length - 1) {
      index.value++
      return
    }
    const last = current.value
    let fresh = shuffle(cards)
    if (fresh.length > 1 && fresh[0] === last) fresh = [...fresh.slice(1), last]
    pile.value = fresh
    index.value = 0
  }

  return { current, next }
}
