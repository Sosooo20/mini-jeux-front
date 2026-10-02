import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { playerKey, readItem, writeItem } from '@/lib/storage'

const PSEUDO_KEY = playerKey('mini-jeux:pseudo')
const AVATAR_KEY = playerKey('mini-jeux:avatar')
export const PSEUDO_MAX_LENGTH = 20

/** Pseudo (saisi au premier lancement) et photo de profil du joueur sur ce téléphone. */
export const useUserStore = defineStore('user', () => {
  const pseudo = ref(readItem(PSEUDO_KEY) ?? '')
  /** Photo de profil carrée en JPEG (data URL), réutilisée d'un salon à l'autre */
  const avatar = ref<string | null>(readItem(AVATAR_KEY))

  const hasPseudo = computed(() => pseudo.value.length > 0)
  const initial = computed(() => pseudo.value.charAt(0).toUpperCase())

  function setPseudo(value: string) {
    pseudo.value = value.trim().slice(0, PSEUDO_MAX_LENGTH)
    writeItem(PSEUDO_KEY, pseudo.value)
  }

  function setAvatar(dataUrl: string | null) {
    avatar.value = dataUrl
    writeItem(AVATAR_KEY, dataUrl)
  }

  return { pseudo, avatar, hasPseudo, initial, setPseudo, setAvatar }
})
