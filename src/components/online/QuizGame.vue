<script setup lang="ts">
import { computed, ref } from 'vue'
import PlayerAvatar from '@/components/PlayerAvatar.vue'
import LevelBadge from '@/components/categories/LevelBadge.vue'
import DeadlineBar from '@/components/online/DeadlineBar.vue'
import type { QuizView } from '@/lib/protocol'
import { useRoomStore } from '@/stores/room'
import { vibrate } from '@/composables/useVibrate'

const props = defineProps<{ game: QuizView }>()
const room = useRoomStore()
const error = ref<string | null>(null)

const me = computed(() => room.view?.me ?? '')
const target = computed(() =>
  props.game.phase === 'final' ? null : room.playerById(props.game.targetId),
)
const iAmTarget = computed(() => props.game.phase !== 'final' && props.game.targetId === me.value)

const ranking = computed(() =>
  Object.entries(props.game.scores)
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score),
)

/** Révélation : qui a trouvé la réponse de la cible */
const finders = computed(() => {
  const g = props.game
  if (g.phase !== 'reveal' || g.correct === null) return []
  return Object.entries(g.answers)
    .filter(([id, choice]) => id !== g.targetId && choice === g.correct)
    .map(([id]) => id)
})

async function answer(choice: number) {
  error.value = null
  vibrate(30)
  try {
    await room.answer(choice)
  } catch (e) {
    error.value = (e as Error).message
  }
}
</script>

<template>
  <!-- Fin de partie -->
  <template v-if="game.phase === 'final'">
    <section class="final">
      <p v-if="game.winners.length" class="final__line">
        🏆 <strong>{{ game.winners.map(room.nameOf).join(', ') }}</strong>
      </p>
      <p class="final__line">
        🍺 <strong>{{ game.losers.map(room.nameOf).join(', ') }}</strong>
        {{ game.losers.length > 1 ? 'boivent' : 'boit' }} !
      </p>
    </section>
  </template>

  <template v-else>
    <section class="card question">
      <div class="question__head">
        <span class="label">Manche {{ game.round }}/{{ game.totalRounds }}</span>
        <LevelBadge :level="game.level" />
        <span v-if="target" class="question__target">
          <PlayerAvatar :name="target.pseudo" :src="target.avatarUrl" :size="28" />
          {{ target.pseudo }}
        </span>
      </div>
      <p class="question__text">{{ game.question }}</p>
      <p v-if="game.phase === 'answer'" class="help">
        {{
          iAmTarget
            ? 'Réponds pour toi, en secret.'
            : `Devine ce que ${target?.pseudo ?? '?'} a répondu.`
        }}
      </p>
      <DeadlineBar v-if="game.phase === 'answer'" :deadline="game.deadline" />
    </section>

    <div class="choices">
      <button
        v-for="(choice, i) in game.choices"
        :key="choice"
        type="button"
        class="choice"
        :class="{
          selected: game.phase === 'answer' ? game.myAnswer === i : game.answers[me] === i,
          correct: game.phase === 'reveal' && game.correct === i,
        }"
        :disabled="game.phase !== 'answer'"
        @click="answer(i)"
      >
        {{ choice }}
      </button>
    </div>

    <p v-if="game.phase === 'answer'" class="help center">
      {{ game.answered.length }} réponse{{ game.answered.length > 1 ? 's' : '' }}
    </p>
    <p v-else class="reveal">
      <template v-if="game.correct === null">
        {{ target?.pseudo }} n'a pas répondu à temps : pas de point.
      </template>
      <template v-else-if="finders.length">
        ✅ Trouvé par <strong>{{ finders.map(room.nameOf).join(', ') }}</strong> (+1)
      </template>
      <template v-else>Personne n'a trouvé 😬</template>
    </p>
  </template>

  <section class="card scores">
    <p class="label">Scores</p>
    <ol>
      <li v-for="r in ranking" :key="r.id">
        <span>{{ room.nameOf(r.id) }}</span>
        <span>{{ r.score }} pt{{ r.score > 1 ? 's' : '' }}</span>
      </li>
    </ol>
  </section>

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
}

.question__target {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-weight: 600;
}

.question__text {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 24px;
  line-height: 1.2;
}

.help {
  font-size: 14px;
  color: var(--muted);
}

.center {
  text-align: center;
}

.choices {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.choice {
  min-height: 72px;
  padding: 12px;
  border: 2px solid transparent;
  border-radius: 24px;
  background: var(--surface);
  color: var(--text);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  touch-action: manipulation;
}

.choice:disabled {
  cursor: default;
  opacity: 0.6;
}

.choice.selected {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 18%, var(--surface));
  opacity: 1;
}

.choice.correct {
  border-color: var(--primary);
  background: color-mix(in srgb, var(--primary) 30%, var(--surface));
  opacity: 1;
}

.reveal {
  text-align: center;
  font-family: var(--font-display);
  font-weight: 600;
}

.reveal strong,
.final strong {
  color: var(--accent);
}

.final {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 0;
  text-align: center;
}

.final__line {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 26px;
  overflow-wrap: anywhere;
}

.scores {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.scores ol {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.scores li {
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
  text-align: center;
  font-size: 14px;
  color: var(--danger);
}
</style>
