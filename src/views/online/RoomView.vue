<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import ConnectionBanner from '@/components/online/ConnectionBanner.vue'
import LobbyPanel from '@/components/online/LobbyPanel.vue'
import SusceptibleGame from '@/components/online/SusceptibleGame.vue'
import QuizGame from '@/components/online/QuizGame.vue'
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

const GAME_TITLES = { susceptible: 'Qui est le plus susceptible ?', quiz: 'Quiz de potes' } as const

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
  <div class="game-page">
    <PageHeader :title="game ? GAME_TITLES[game.id] : `Salon ${code}`" back />
    <ConnectionBanner />

    <p v-if="!inThisRoom" class="waiting">Connexion au salon…</p>

    <template v-else-if="!game">
      <LobbyPanel @leave="leave" />
    </template>

    <template v-else>
      <SusceptibleGame v-if="game.id === 'susceptible'" :game="game" />
      <QuizGame v-else :game="game" />

      <div class="host-bar">
        <template v-if="room.isHost">
          <button
            v-if="game.phase === 'reveal'"
            type="button"
            class="btn btn--big"
            @click="run(() => room.nextStep())"
          >
            {{ game.id === 'quiz' ? 'Manche suivante' : 'Question suivante' }}
          </button>
          <button type="button" class="btn btn--ghost" @click="run(() => room.stopGame())">
            {{ game.phase === 'final' ? 'Retour au salon' : 'Arrêter le jeu' }}
          </button>
        </template>
        <p v-else-if="game.phase !== 'vote' && game.phase !== 'answer'" class="waiting">
          En attente de l'hôte 👑
        </p>
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
