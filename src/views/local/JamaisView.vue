<script setup lang="ts">
import { computed } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { GAMES, accentStyle } from '@/lib/games'
import { JAMAIS_CARDS, WHO_DRINKS } from '@/lib/data/jamais'
import { useDeck } from '@/composables/useDeck'
import { useWakeLock } from '@/composables/useWakeLock'

const game = GAMES.jamais
// Couleur des cartes « J'ai déjà » : différente pour voir tout de suite que la règle s'inverse
const DEJA_COLOR = '#9fd8ff'

const { current, next } = useDeck(JAMAIS_CARDS)

useWakeLock(computed(() => true))

const cardColor = computed(() => (current.value.kind === 'deja' ? DEJA_COLOR : game.accent))
</script>

<template>
  <div class="game-page" :style="accentStyle(game)">
    <PageHeader :title="game.name" back />

    <Transition name="flip" mode="out-in">
      <article
        :key="current.text"
        class="card prompt"
        :style="{ '--card': cardColor }"
        aria-live="polite"
      >
        <span class="prompt__kind">
          {{ current.kind === 'jamais' ? "Je n'ai jamais" : "J'ai déjà" }}
        </span>
        <p class="prompt__text">{{ current.text }}</p>
        <p class="prompt__rule">🍺 {{ WHO_DRINKS[current.kind] }}</p>
      </article>
    </Transition>

    <button type="button" class="btn btn--big next" @click="next">Suivante</button>
  </div>
</template>

<style scoped>
.prompt {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
  padding: 32px 24px;
  border: 2px solid color-mix(in srgb, var(--card) 45%, transparent);
  background: radial-gradient(
    circle at 80% 0%,
    color-mix(in srgb, var(--card) 22%, var(--surface)) 0%,
    var(--surface) 60%
  );
}

.prompt__kind {
  align-self: flex-start;
  padding: 4px 12px;
  border-radius: 9999px;
  background: var(--card);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.88px;
  text-transform: uppercase;
  color: var(--bg-deep);
}

.prompt__text {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 30px;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.prompt__rule {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 16px;
  color: var(--card);
}

.next {
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
