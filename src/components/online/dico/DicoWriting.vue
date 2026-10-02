<script setup lang="ts">
import { computed, ref } from 'vue'
import DeadlineBar from '@/components/online/DeadlineBar.vue'
import { DICO_MAX_LENGTH, DICO_WRITE_SECONDS, type DicoView } from '@/lib/protocol'
import { useRoomStore } from '@/stores/room'
import { vibrate } from '@/composables/useVibrate'

defineProps<{ game: Extract<DicoView, { phase: 'writing' }> }>()
const room = useRoomStore()

const draft = ref('')
const sending = ref(false)
const error = ref<string | null>(null)
const onlineCount = computed(
  () => room.view?.players.filter((p) => p.status === 'online').length ?? 0,
)

async function submit() {
  if (sending.value || !draft.value.trim()) return
  sending.value = true
  error.value = null
  try {
    await room.submitDefinition(draft.value)
    draft.value = ''
    vibrate(30)
  } catch (e) {
    // « Trop proche, reformule ! » : le texte reste là pour être modifié
    error.value = (e as Error).message
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <section class="card step">
    <p class="step__word">{{ game.word }}</p>
    <DeadlineBar :deadline="game.deadline" :total="DICO_WRITE_SECONDS" />
    <template v-if="game.mine === null">
      <textarea
        v-model="draft"
        rows="4"
        :maxlength="DICO_MAX_LENGTH"
        placeholder="Une définition qui sonne vrai…"
        aria-label="Ta fausse définition"
      />
      <span class="counter">{{ draft.length }}/{{ DICO_MAX_LENGTH }}</span>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <button
        type="button"
        class="btn btn--big"
        :disabled="!draft.trim() || sending"
        @click="submit"
      >
        Envoyer
      </button>
    </template>
    <template v-else>
      <blockquote class="quote">{{ game.mine }}</blockquote>
      <p class="done">Envoyé ✓ · pas de retour en arrière</p>
    </template>
  </section>
  <p class="progress">{{ game.submitted.length }}/{{ onlineCount }} ont répondu</p>
</template>

<style scoped>
.step {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step__word {
  overflow-wrap: anywhere;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 32px;
  line-height: 1.15;
  text-align: center;
  color: var(--accent);
}

.counter {
  align-self: flex-end;
  padding: 0 8px;
  font-size: 12px;
  color: var(--muted);
}

.quote {
  overflow-wrap: anywhere;
  padding: 16px 20px;
  border-radius: 24px;
  background: var(--surface-2);
  font-style: italic;
}

.done,
.progress {
  text-align: center;
  font-size: 14px;
  color: var(--muted);
}

.error {
  font-size: 14px;
  color: var(--danger);
}
</style>
