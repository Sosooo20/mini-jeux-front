<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import ConnectionBanner from '@/components/online/ConnectionBanner.vue'
import LobbyPanel from '@/components/online/LobbyPanel.vue'
import SusceptibleGame from '@/components/online/SusceptibleGame.vue'
import QuizGame from '@/components/online/QuizGame.vue'
import ConfessionsGame from '@/components/online/ConfessionsGame.vue'
import { GAMES, accentStyle } from '@/lib/games'
import { useRoomStore } from '@/stores/room'
import { useWakeLock } from '@/composables/useWakeLock'

const props = defineProps<{ code: string }>()
const router = useRouter()
const room = useRoomStore()
const error = ref<string | null>(null)
const leaving = ref(false)

const code = computed(() => props.code.toUpperCase())
const inThisRoom = computed(() => room.view?.code === code.value)
const game = computed(() => (inThisRoom.value ? room.view!.game : null))

const GAME_TITLES = {
  susceptible: 'Qui est le plus susceptible ?',
  quiz: 'Quiz de potes',
  confessions: 'Confessions anonymes',
} as const

/** Ce que fait le bouton principal de l'hôte (null = rien à faire, on attend les joueurs) */
const nextLabel = computed(() => {
  const g = game.value
  if (!g) return null
  if (g.phase === 'reveal') {
    if (g.id === 'susceptible') return 'Question suivante'
    if (g.id === 'confessions' && g.round >= g.totalRounds) return 'Voir les résultats'
    return 'Manche suivante'
  }
  // Confessions : l'hôte peut ne pas attendre les retardataires
  if (g.id === 'confessions' && (g.phase === 'write' || g.phase === 'guess')) {
    return 'Passer à la suite'
  }
  return null
})
const waitingForHost = computed(
  () => game.value?.phase === 'reveal' || game.value?.phase === 'final',
)

useWakeLock(computed(() => inThisRoom.value))

onMounted(() => room.connect())

// Le serveur dit qu'on n'est pas (ou plus) dans ce salon : on passe par l'écran profil pour y entrer
watch(
  () => [room.sessionReady, inThisRoom.value] as const,
  ([ready, inside]) => {
    if (ready && !inside && !leaving.value)
      router.replace({ name: 'room-profile', query: { code: code.value } })
  },
  { immediate: true },
)

async function run(action: () => Promise<unknown>) {
  error.value = null
  try {
    await action()
  } catch (e) {
    error.value = (e as Error).message
  }
}

async function leave() {
  leaving.value = true
  await run(() => room.leave())
  if (room.view) leaving.value = false
  else router.replace({ name: 'home' })
}
</script>

<template>
  <div
    class="game-page"
    :style="game?.id === 'confessions' ? accentStyle(GAMES.confessions) : undefined"
  >
    <PageHeader :title="game ? GAME_TITLES[game.id] : `Salon ${code}`" back />
    <ConnectionBanner />

    <p v-if="!inThisRoom" class="waiting">Connexion au salon…</p>

    <template v-else-if="!game">
      <LobbyPanel @leave="leave" />
    </template>

    <template v-else>
      <SusceptibleGame v-if="game.id === 'susceptible'" :game="game" />
      <QuizGame v-else-if="game.id === 'quiz'" :game="game" />
      <ConfessionsGame v-else :game="game" />

      <div class="host-bar">
        <template v-if="room.isHost">
          <button
            v-if="nextLabel"
            type="button"
            class="btn"
            :class="game.phase === 'reveal' ? 'btn--big' : 'btn--ghost'"
            @click="run(() => room.nextStep())"
          >
            {{ nextLabel }}
          </button>
          <button type="button" class="btn btn--ghost" @click="run(() => room.stopGame())">
            {{ game.phase === 'final' ? 'Retour au salon' : 'Arrêter le jeu' }}
          </button>
        </template>
        <p v-else-if="waitingForHost" class="waiting">En attente de l'hôte 👑</p>
      </div>
    </template>

    <p v-if="error" class="error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.waiting {
  text-align: center;
  font-size: 14px;
  color: var(--muted);
}

.host-bar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
  padding-top: 8px;
}

.error {
  text-align: center;
  font-size: 14px;
  color: var(--danger);
}
</style>
