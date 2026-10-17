<script setup lang="ts">
import { computed, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { GAMES, accentStyle } from '@/lib/games'
import { JAMAIS_CARDS, WHO_DRINKS } from '@/lib/data/jamais'
import { inCategory, type Category } from '@/lib/categories'
import CategoryPicker from '@/components/categories/CategoryPicker.vue'
import LevelBadge from '@/components/categories/LevelBadge.vue'
import { useDeck } from '@/composables/useDeck'
import { useWakeLock } from '@/composables/useWakeLock'

const game = GAMES.jamais
// Couleur des cartes « J'ai déjà » : différente pour voir tout de suite que la règle s'inverse
const DEJA_COLOR = '#9fd8ff'

const category = ref<Category>('soft')
const { current, next } = useDeck(() => inCategory(JAMAIS_CARDS, category.value))

/** Page d'accueil du jeu (règles + catégorie), puis les phrases les unes après les autres */
const started = ref(false)

useWakeLock(started)

const cardColor = computed(() => (current.value.kind === 'deja' ? DEJA_COLOR : game.accent))
</script>

<template>
  <div class="game-page" :style="accentStyle(game)">
    <PageHeader :title="game.name" back />

    <section v-if="!started" class="card intro">
      <p class="intro__emoji" aria-hidden="true">🙊</p>
      <p>Une phrase s'affiche, chacun boit de lui-même selon ce qu'il a vécu.</p>
      <p class="intro__rule">« Je n'ai jamais… »</p>
      <p class="intro__small">{{ WHO_DRINKS.jamais }}</p>
      <p class="intro__rule intro__rule--deja">« J'ai déjà… »</p>
      <p class="intro__small">{{ WHO_DRINKS.deja }}</p>
      <CategoryPicker v-model="category" label="Ambiance" class="intro__picker" />
    </section>

    <Transition v-else name="flip" mode="out-in">
      <article
        :key="current.text"
        class="card prompt"
        :style="{ '--card': cardColor }"
        aria-live="polite"
      >
        <div class="prompt__head">
          <span class="prompt__kind">
            {{ current.kind === 'jamais' ? "Je n'ai jamais" : "J'ai déjà" }}
          </span>
          <LevelBadge :level="current.level" />
        </div>
        <p class="prompt__text">{{ current.text }}</p>
        <p class="prompt__rule">🍺 {{ WHO_DRINKS[current.kind] }}</p>
      </article>
    </Transition>

    <button v-if="!started" type="button" class="btn btn--big next" @click="started = true">
      Première phrase
    </button>
    <button v-else type="button" class="btn btn--big next" @click="next">Suivante</button>
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

.prompt__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.prompt__kind {
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

.intro {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  padding: 32px 24px;
  text-align: center;
  font-size: 17px;
  border: 2px solid color-mix(in srgb, var(--accent) 35%, transparent);
}

.intro__emoji {
  font-size: 64px;
  line-height: 1;
}

.intro__rule {
  margin-top: 8px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 22px;
  color: var(--accent);
}

.intro__rule--deja {
  color: v-bind(DEJA_COLOR);
}

.intro__small {
  font-size: 14px;
  color: var(--muted);
}

.intro__picker {
  margin-top: 12px;
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
