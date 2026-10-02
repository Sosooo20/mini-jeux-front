<script setup lang="ts">
import { computed, ref } from 'vue'
import DeadlineBar from '@/components/online/DeadlineBar.vue'
import { DICO_VOTE_SECONDS, type DicoView } from '@/lib/protocol'
import { useRoomStore } from '@/stores/room'
import { vibrate } from '@/composables/useVibrate'

const props = defineProps<{ game: Extract<DicoView, { phase: 'voting' }> }>()
const room = useRoomStore()

const selected = ref<string | null>(null)
const sending = ref(false)
const error = ref<string | null>(null)
/** Vote verrouillé une fois validé */
const locked = computed(() => sending.value || props.game.myVote !== null)
const chosen = computed(() => props.game.myVote ?? selected.value)
const onlineCount = computed(
  () => room.view?.players.filter((p) => p.status === 'online').length ?? 0,
)

async function validate() {
  if (locked.value || !selected.value) return
  sending.value = true
  error.value = null
  try {
    await room.voteDefinition(selected.value)
    vibrate(30)
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <section class="head">
    <p class="head__word">{{ game.word }}</p>
    <p class="label">Quelle est la vraie définition ?</p>
    <DeadlineBar :deadline="game.deadline" :total="DICO_VOTE_SECONDS" />
  </section>

  <ul class="definitions">
    <li v-for="d in game.definitions" :key="d.id">
      <button
        type="button"
        class="definition"
        :class="{ selected: chosen === d.id, mine: d.mine }"
        :disabled="locked || d.mine"
        :aria-pressed="chosen === d.id"
        @click="selected = d.id"
      >
        <span>{{ d.text }}</span>
        <small v-if="d.mine">Ta définition</small>
      </button>
    </li>
  </ul>

  <button
    v-if="game.myVote === null"
    type="button"
    class="btn btn--big"
    :disabled="!selected || sending"
    @click="validate"
  >
    Valider mon vote
  </button>
  <p class="progress">
    {{ game.voted.length }}/{{ onlineCount }} ont voté
    <span v-if="game.myVote"> · ton vote est enregistré ✓</span>
  </p>
  <p v-if="error" class="error" role="alert">{{ error }}</p>
</template>

<style scoped>
.head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.head :deep(.deadline) {
  align-self: stretch;
}

.head__word {
  overflow-wrap: anywhere;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 32px;
  line-height: 1.15;
  color: var(--accent);
}

.definitions {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.definition {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 18px;
  border: 2px solid transparent;
  border-radius: 24px;
  background: var(--surface);
  color: var(--text);
  font: inherit;
  text-align: left;
  overflow-wrap: anywhere;
  cursor: pointer;
  touch-action: manipulation;
}

.definition:disabled {
  cursor: default;
}

.definition.selected {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 18%, var(--surface));
}

.definition.mine {
  opacity: 0.5;
}

.definition small {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.88px;
  text-transform: uppercase;
  color: var(--muted);
}

.progress {
  text-align: center;
  font-size: 14px;
  color: var(--muted);
}

.error {
  text-align: center;
  font-size: 14px;
  color: var(--danger);
}
</style>
