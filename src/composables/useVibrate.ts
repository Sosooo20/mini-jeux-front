/** Vibration du téléphone (n'existe pas sur iPhone : ignorée). */
export function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* non supporté */
  }
}
