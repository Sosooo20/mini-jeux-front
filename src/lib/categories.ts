import { CATEGORIES, type Category, type Level } from '@/lib/protocol'

// Catégories des jeux à questions, en local comme en ligne :
// soft, spicy (gênant, sexy) ou mélange des deux.
export { CATEGORIES, type Category, type Level }

export const CATEGORY_LABEL: Record<Category, string> = {
  soft: '😇 Soft',
  spicy: '🌶️ Spicy',
  mix: '🔀 Mélange',
}

/** Les questions de la catégorie (mix = toutes) */
export function inCategory<T extends { level: Level }>(
  items: readonly T[],
  category: Category,
): T[] {
  return items.filter((item) => category === 'mix' || item.level === category)
}
