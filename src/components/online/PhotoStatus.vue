<script setup lang="ts">
import { computed, ref } from 'vue'
import PlayerAvatar from '@/components/PlayerAvatar.vue'
import { useRoomStore } from '@/stores/room'

/** Jeu photo dans le salon : état, classement et commandes de l'hôte */
const room = useRoomStore()

const photo = computed(() => room.view?.photo ?? null)
const candidates = computed(() => room.view?.players.filter((p) => p.status !== 'away') ?? [])
const target = ref('')
const error = ref<string | null>(null)

const ranking = computed(() =>
  Object.entries(photo.value?.counts ?? {})
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count),
)

async function run(action: () => Promise<unknown>) {
  error.value = null
  try {
    await action()
  } catch (e) {
    error.value = (e as Error).message
  }
}
</script>

<template>
  <section class="card photo">
    <h2>📸 Jeu photo</h2>

    <!-- Pas encore lancé, ou terminé : l'hôte choisit la cible -->
    <template v-if="!photo || photo.result">
      <div v-if="photo?.result" class="result">
        <p v-if="photo.result.winners.length">
          🏆 <strong>{{ photo.result.winners.map(room.nameOf).join(', ') }}</strong> gagne
        </p>
        <p>
          🍺 <strong>{{ photo.result.losers.map(room.nameOf).join(', ') }}</strong> boit
        </p>
        <RouterLink :to="{ name: 'camera' }" class="link">Voir la galerie</RouterLink>
      </div>
      <p v-else class="help">
        Prenez une personne en photo en scred, toute la soirée. Le plus de photos gagne, le moins
        boit.
      </p>
      <form
        v-if="room.isHost"
        class="start"
        @submit.prevent="run(() => room.startPhotoGame(target))"
      >
        <select v-model="target" aria-label="Personne à prendre en photo">
          <option value="" disabled>Qui prendre en photo ?</option>
          <option v-for="p in candidates" :key="p.id" :value="p.id">{{ p.pseudo }}</option>
        </select>
        <button type="submit" class="btn" :disabled="!target">
          {{ photo ? 'Relancer' : 'Lancer' }}
        </button>
      </form>
    </template>

    <!-- En cours -->
    <template v-else>
      <p class="target">
        Cible :
        <PlayerAvatar
          :name="room.nameOf(photo.targetId)"
          :src="room.playerById(photo.targetId)?.avatarUrl"
          :size="28"
        />
        <strong>{{ room.nameOf(photo.targetId) }}</strong>
      </p>
      <ol class="ranking">
        <li v-for="r in ranking" :key="r.id">
          <span>{{ room.nameOf(r.id) }}</span>
          <span>{{ r.count }} 📸</span>
        </li>
      </ol>
      <RouterLink :to="{ name: 'camera' }" class="btn btn--ghost"
        >Ouvrir l'appareil photo</RouterLink
      >
      <button
        v-if="room.isHost"
        type="button"
        class="btn"
        @click="run(() => room.finishPhotoGame())"
      >
        Terminer le jeu photo
      </button>
    </template>

    <p v-if="error" class="error" role="alert">{{ error }}</p>
  </section>
</template>

<style scoped>
.photo {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

h2 {
  padding: 0 4px;
  font-size: 22px;
}

.help {
  padding: 0 4px;
  font-size: 13px;
  color: var(--muted);
}

.result p {
  padding: 0 4px;
}

.result strong,
.target strong {
  color: var(--accent);
}

.link {
  display: inline-block;
  padding: 8px 4px;
  font-size: 14px;
  color: var(--accent);
  text-decoration: underline;
}

.start {
  display: flex;
  gap: 8px;
}

.start select {
  flex: 1;
  min-width: 0;
  min-height: var(--tap);
  padding: 0 16px;
  border: none;
  border-radius: 9999px;
  background: var(--surface-2);
  color: var(--text);
  font-size: 16px;
}

.start .btn {
  width: auto;
}

.target {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 4px;
}

.ranking {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ranking li {
  display: flex;
  justify-content: space-between;
  min-height: 40px;
  align-items: center;
  padding: 6px 16px;
  border-radius: 9999px;
  background: var(--surface-2);
  font-family: var(--font-display);
  font-weight: 600;
}

.error {
  padding: 0 4px;
  font-size: 14px;
  color: var(--danger);
}
</style>
