<script setup lang="ts">
import { computed, ref } from 'vue'
import PlayerAvatar from '@/components/PlayerAvatar.vue'
import DeadlineBar from '@/components/online/DeadlineBar.vue'
import type { SusceptibleView } from '@/lib/protocol'
import LevelBadge from '@/components/categories/LevelBadge.vue'
import { useRoomStore } from '@/stores/room'
import { vibrate } from '@/composables/useVibrate'

const props = defineProps<{ game: SusceptibleView }>()
const room = useRoomStore()
const error = ref<string | null>(null)
const sending = ref(false)
/** Pas de changement d'avis : une fois voté (ou pendant l'envoi), les choix sont verrouillés */
const locked = computed(
  () => sending.value || (props.game.phase === 'vote' && props.game.myVote !== null),
)

const players = computed(() => room.view?.players ?? [])
/** On peut voter pour tous les joueurs encore présents, soi compris */
const choices = computed(() => players.value.filter((p) => p.status !== 'away'))
const voters = computed(() => players.value.filter((p) => p.status === 'online'))

/** Résultat : nombre de voix par joueur, du plus désigné au moins désigné */
const tally = computed(() => {
  if (props.game.phase !== 'reveal') return []
  const count: Record<string, number> = {}
  for (const target of Object.values(props.game.votes)) count[target] = (count[target] ?? 0) + 1
  return Object.entries(count)
    .map(([id, n]) => ({ id, n }))
    .sort((a, b) => b.n - a.n)
})

async function vote(target: string) {
  error.value = null
  if (locked.value) return
  sending.value = true
  vibrate(30)
  try {
    await room.vote(target)
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <section class="question card">
    <div class="question__head">
      <p class="label">Qui est le plus susceptible de…</p>
      <LevelBadge :level="game.level" />
    </div>
    <p class="question__text">{{ game.question }}</p>
    <DeadlineBar v-if="game.phase === 'vote'" :deadline="game.deadline" />
  </section>

  <template v-if="game.phase === 'vote'">
    <div class="grid">
      <button
        v-for="p in choices"
        :key="p.id"
        type="button"
        class="choice"
        :class="{ selected: game.myVote === p.id }"
        :disabled="locked"
        @click="vote(p.id)"
      >
        <PlayerAvatar :name="p.pseudo" :src="p.avatarUrl" :size="48" />
        <span>{{ p.id === room.view?.me ? `${p.pseudo} (toi)` : p.pseudo }}</span>
      </button>
    </div>
    <p class="voted">
      {{ game.voted.length }}/{{ voters.length }} ont voté
      <span v-if="game.myVote"> · ton vote est enregistré ✓</span>
      <span v-else> · pas de retour en arrière !</span>
    </p>
  </template>

  <template v-else>
    <section class="loser">
      <p class="loser__emoji" aria-hidden="true">🍺</p>
      <p v-if="game.losers.length" class="loser__names">
        {{ game.losers.map(room.nameOf).join(', ') }}
      </p>
      <p v-else class="loser__names">Personne n'a voté…</p>
      <p v-if="game.losers.length" class="loser__verb">
        {{ game.losers.length > 1 ? 'boivent' : 'boit' }} !
      </p>
    </section>
    <ol class="tally">
      <li v-for="t in tally" :key="t.id" :class="{ worst: game.losers.includes(t.id) }">
        <span>{{ room.nameOf(t.id) }}</span>
        <span>{{ t.n }} voix</span>
      </li>
    </ol>
  </template>

  <p v-if="error" class="error" role="alert">{{ error }}</p>
</template>

<style scoped>
.question {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.question__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.question__text {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 26px;
  line-height: 1.2;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.choice {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-height: 104px;
  padding: 12px 8px;
  border: 2px solid transparent;
  border-radius: 24px;
  background: var(--surface);
  font-family: var(--font-display);
  font-weight: 600;
  overflow-wrap: anywhere;
  cursor: pointer;
  touch-action: manipulation;
}

.choice:disabled {
  cursor: default;
  opacity: 0.45;
}

.choice.selected {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 18%, var(--surface));
  opacity: 1;
}

.voted {
  text-align: center;
  font-size: 14px;
  color: var(--muted);
}

.loser {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.loser__emoji {
  font-size: 56px;
}

.loser__names {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 34px;
  line-height: 1.15;
  overflow-wrap: anywhere;
  color: var(--accent);
}

.loser__verb {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
  text-transform: uppercase;
}

.tally {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tally li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 44px;
  padding: 6px 16px;
  border-radius: 9999px;
  background: var(--surface-2);
  font-family: var(--font-display);
  font-weight: 600;
}

.tally li.worst {
  background: color-mix(in srgb, var(--danger) 18%, var(--surface-2));
}

.error {
  text-align: center;
  font-size: 14px;
  color: var(--danger);
}
</style>
