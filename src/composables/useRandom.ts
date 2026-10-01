/** Entier aléatoire entre min et max inclus. */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** Nombre aléatoire entre min et max. */
export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/** Élément aléatoire d'un tableau non vide. */
export function pick<T>(items: readonly T[]): T {
  return items[randomInt(0, items.length - 1)] as T
}

/** Copie mélangée d'un tableau (Fisher-Yates). */
export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(0, i)
    ;[copy[i], copy[j]] = [copy[j] as T, copy[i] as T]
  }
  return copy
}
