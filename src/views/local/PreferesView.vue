<script setup lang="ts">
import { computed, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import CountdownOverlay from '@/components/CountdownOverlay.vue'
import { GAMES, accentStyle } from '@/lib/games'
import { DILEMMAS } from '@/lib/data/preferes'
import { useDeck } from '@/composables/useDeck'
import { useWakeLock } from '@/composables/useWakeLock'

const game = GAMES.preferes

const { current, next } = useDeck(DILEMMAS)

/** question → compte à rebours → vote fait (rappel de la règle) */
const step = ref<'question' | 'countdown' | 'voted'>('question')

useWakeLock(computed(() => true))

function nextDilemma() {
  next()
  step.value = 'question'
}
</script>

<template>
  <div class="game-page" :style="accentStyle(game)">
    <PageHeader :title="game.name" back />

    <Transition name="flip" mode="out-in">
      <section :key="current.a" class="dilemma" aria-live="polite">
        <div class="card choice choice--a">
          <span class="choice__side" aria-hidden="true">👈</span>
          <p>{{ current.a }}</p>
        </div>
        <span class="or">ou</span>
        <div class="card choice choice--b">
          <p>{{ current.b }}</p>
          <span class="choice__side" aria-hidden="true">👉</span>
        </div>
      </section>
    </Transition>

    <p v-if="step === 'voted'" class="rule">
      🍺 La minorité boit<br />
      <small>Égalité : tout le monde débat !</small>
    </p>

    <div class="actions">
      <button
        v-if="step !== 'voted'"
        type="button"
        class="btn btn--big"
        :disabled="step === 'countdown'"
        @click="step = 'countdown'"
      >
        3, 2, 1… votez !
      </button>
      <button v-else type="button" class="btn btn--big" @click="nextDilemma">Suivant</button>
    </div>

    <CountdownOverlay v-if="step === 'countdown'" go="Votez !" @done="step = 'voted'" />
  </div>
</template>

<style scoped>
.dilemma {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

.choice {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 140px;
  padding: 24px 20px;
  border: 2px solid color-mix(in srgb, var(--accent) 35%, transparent);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 24px;
  line-height: 1.25;
}

.choice p {
  flex: 1;
}

.choice--a {
  background: radial-gradient(
    circle at 0% 0%,
    color-mix(in srgb, var(--accent) 22%, var(--surface)) 0%,
    var(--surface) 65%
  );
}

.choice--b {
  text-align: right;
  background: radial-gradient(
    circle at 100% 100%,
    color-mix(in srgb, var(--accent) 22%, var(--surface)) 0%,
    var(--surface) 65%
  );
}

.choice__side {
  font-size: 28px;
}

.or {
  align-self: center;
  padding: 4px 16px;
  border-radius: 9999px;
  background: var(--accent);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--on-accent);
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
  transform: translateX(40px);
  opacity: 0;
}

.flip-leave-to {
  transform: translateX(-40px);
  opacity: 0;
}
</style>
