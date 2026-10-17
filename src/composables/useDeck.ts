import { computed, ref, shallowRef, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { shuffle } from '@/composables/useRandom'

/**
 * Pioche de cartes mélangée, sans répétition : quand elle est vide, on remélange
 * (en évitant de retomber tout de suite sur la dernière carte).
 * Les cartes peuvent changer (autre catégorie) : la pioche repart alors de zéro.
 */
export function useDeck<T>(source: MaybeRefOrGetter<readonly T[]>) {
  const cards = computed(() => toValue(source))
  const pile = shallowRef<T[]>(shuffle(cards.value))
  const index = ref(0)

  watch(cards, (next) => {
    pile.value = shuffle(next)
    index.value = 0
  })

  const current = computed(() => pile.value[index.value] as T)

  function next() {
    if (index.value < pile.value.length - 1) {
      index.value++
      return
    }
    const last = current.value
    let fresh = shuffle(cards.value)
    if (fresh.length > 1 && fresh[0] === last) fresh = [...fresh.slice(1), last]
    pile.value = fresh
    index.value = 0
  }

  return { current, next }
}
