import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * Bouton « Installer l'appli ».
 * - Android / Chrome : `beforeinstallprompt` permet d'ouvrir la fenêtre d'installation.
 * - iOS / Safari : pas d'API, il faut afficher la consigne « Partager → Sur l'écran d'accueil ».
 */
export function usePwaInstall() {
  const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
  const isInstalled = ref(
    window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true,
  )

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const canPrompt = computed(() => deferredPrompt.value !== null)
  const showIosHint = computed(() => isIos && !isInstalled.value)

  function onBeforeInstallPrompt(e: Event) {
    e.preventDefault()
    deferredPrompt.value = e as BeforeInstallPromptEvent
  }

  function onInstalled() {
    isInstalled.value = true
    deferredPrompt.value = null
  }

  async function install() {
    if (!deferredPrompt.value) return
    await deferredPrompt.value.prompt()
    await deferredPrompt.value.userChoice
    deferredPrompt.value = null
  }

  onMounted(() => {
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.removeEventListener('appinstalled', onInstalled)
  })

  return { isInstalled, canPrompt, showIosHint, install }
}
