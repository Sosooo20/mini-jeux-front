import { computed, ref } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// État partagé, écouté dès le chargement du module : `beforeinstallprompt` peut
// arriver avant que le composant qui affiche le bouton soit monté.
const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
const isInstalled = ref(
  window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true,
)

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt.value = e as BeforeInstallPromptEvent
})

window.addEventListener('appinstalled', () => {
  isInstalled.value = true
  deferredPrompt.value = null
})

const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)

/**
 * Bouton « Installer l'appli ».
 * - Android / Chrome : `beforeinstallprompt` permet d'ouvrir la fenêtre d'installation.
 * - iOS / Safari : pas d'API, il faut afficher la consigne « Partager → Sur l'écran d'accueil ».
 */
export function usePwaInstall() {
  const canPrompt = computed(() => deferredPrompt.value !== null)
  const showIosHint = computed(() => isIos && !isInstalled.value)

  async function install() {
    if (!deferredPrompt.value) return
    await deferredPrompt.value.prompt()
    await deferredPrompt.value.userChoice
    deferredPrompt.value = null
  }

  return { isInstalled, canPrompt, showIosHint, install }
}
