<script setup lang="ts">
import { computed, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import CountdownOverlay from '@/components/CountdownOverlay.vue'
import { GAMES, accentStyle } from '@/lib/games'
import { POURRAIT_QUESTIONS } from '@/lib/data/pourrait'
import { useDeck } from '@/composables/useDeck'
import { useWakeLock } from '@/composables/useWakeLock'

const game = GAMES.pourrait

const { current, next } = useDeck(POURRAIT_QUESTIONS)

/** question → compte à rebours → tout le monde a pointé (rappel de la règle) */
const step = ref<'question' | 'countdown' | 'pointed'>('question')

useWakeLock(computed(() => true))

function nextQuestion() {
  next()
  step.value = 'question'
}
</script>

<template>
  <div class="game-page" :style="accentStyle(game)">
    <PageHeader :title="game.name" back />

    <Transition name="flip" mode="out-in">
      <article :key="current" class="card prompt" aria-live="polite">
        <span class="prompt__emoji" aria-hidden="true">👉</span>
        <p class="prompt__text">{{ current }}</p>
      </article>
    </Transition>

    <p v-if="step === 'pointed'" class="rule">
      🍺 Le plus désigné boit<br />
      <small>Égalité : tous les ex æquo boivent — et on débat !</small>
    </p>
    <p v-else class="hint">Au signal, tout le monde pointe quelqu'un du doigt en même temps.</p>

    <div class="actions">
      <button
        v-if="step !== 'pointed'"
        type="button"
        class="btn btn--big"
        :disabled="step === 'countdown'"
        @click="step = 'countdown'"
      >
        3, 2, 1… pointez !
      </button>
      <button v-else type="button" class="btn btn--big" @click="nextQuestion">Suivante</button>
    </div>

    <CountdownOverlay v-if="step === 'countdown'" go="Pointez !" @done="step = 'pointed'" />
  </div>
</template>

<style scoped>
.prompt {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  padding: 32px 24px;
  border: 2px solid color-mix(in srgb, var(--accent) 40%, transparent);
  background: radial-gradient(
    circle at 80% 0%,
    color-mix(in srgb, var(--accent) 22%, var(--surface)) 0%,
    var(--surface) 60%
  );
}

.prompt__emoji {
  font-size: 48px;
  line-height: 1;
}

.prompt__text {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 32px;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.rule {
  text-align: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
  color: var(--accent);
}

.rule small {
  font-weight: 600;
  font-size: 14px;
  color: var(--muted);
}

.hint {
  text-align: center;
  font-size: 14px;
  color: var(--muted);
}

.actions {
  margin-top: auto;
}

.flip-enter-active,
.flip-leave-active {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.flip-enter-from {
  transform: translateX(40px) rotate(3deg);
  opacity: 0;
}

.flip-leave-to {
  transform: translateX(-40px) rotate(-3deg);
  opacity: 0;
}
</style>
