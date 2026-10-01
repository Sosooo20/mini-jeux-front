import { onActivated, onBeforeUnmount, onDeactivated, watch, type Ref } from 'vue'

/**
 * Empêche l'écran de se mettre en veille tant que `active` vaut true
 * (navigateurs sans Wake Lock : ignoré sans erreur).
 */
export function useWakeLock(active: Ref<boolean>) {
  let sentinel: WakeLockSentinel | null = null
  let visible = true

  async function request() {
    if (sentinel || !('wakeLock' in navigator) || document.visibilityState !== 'visible') return
    try {
      sentinel = await navigator.wakeLock.request('screen')
      sentinel.addEventListener('release', () => (sentinel = null))
    } catch {
      /* refusé (batterie faible, etc.) : tant pis */
    }
  }

  function release() {
    void sentinel?.release()
    sentinel = null
  }

  function sync() {
    if (active.value && visible) void request()
    else release()
  }

  // Le verrou saute quand l'appli passe en arrière-plan : on le reprend au retour
  function onVisibility() {
    if (document.visibilityState === 'visible') sync()
  }

  watch(active, sync, { immediate: true })
  document.addEventListener('visibilitychange', onVisibility)

  // Jeu gardé en mémoire pendant un détour par l'appareil photo
  onActivated(() => {
    visible = true
    sync()
  })
  onDeactivated(() => {
    visible = false
    release()
  })

  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', onVisibility)
    release()
  })
}
