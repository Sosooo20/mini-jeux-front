<script setup lang="ts">
import DeadlineBar from '@/components/online/DeadlineBar.vue'
import { DICO_WORD_SECONDS, type DicoView } from '@/lib/protocol'

defineProps<{ game: Extract<DicoView, { phase: 'word' }> }>()
</script>

<template>
  <section class="card word">
    <p class="label">Le mot</p>
    <p class="word__text">{{ game.word }}</p>
    <p class="word__hint">Ça veut dire quoi, d'après toi ? Prépare ta définition…</p>
    <DeadlineBar :deadline="game.deadline" :total="DICO_WORD_SECONDS" />
  </section>
</template>

<style scoped>
.word {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 20px;
  text-align: center;
  animation: pop 0.5s ease-out;
}

.word__text {
  max-width: 100%;
  overflow-wrap: anywhere;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 40px;
  line-height: 1.1;
  color: var(--accent);
}

.word__hint {
  color: var(--muted);
}

.word :deep(.deadline) {
  align-self: stretch;
}

@keyframes pop {
  from {
    transform: scale(0.85);
    opacity: 0;
  }
}
</style>
