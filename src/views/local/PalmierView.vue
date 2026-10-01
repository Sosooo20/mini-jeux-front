<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import { GAMES, accentStyle } from '@/lib/games'
import { PALMIER_CARDS } from '@/lib/data/palmier'

const game = GAMES.palmier
</script>

<template>
  <div class="game-page" :style="accentStyle(game)">
    <PageHeader :title="game.name" back />

    <p class="intro">
      Prenez un vrai jeu de cartes et disposez-les en cercle autour d'un verre. À tour de rôle,
      chacun tire une carte et applique sa règle.
    </p>

    <ul class="cards">
      <li v-for="card in PALMIER_CARDS" :key="card.value" class="card rule">
        <div
          class="playing-card"
          :class="{ red: card.suit === '♥' || card.suit === '♦', long: card.value.length > 2 }"
          aria-hidden="true"
        >
          <span class="playing-card__value">{{ card.value }}</span>
          <span class="playing-card__suit">{{ card.suit }}</span>
        </div>
        <div class="rule__text">
          <h2>
            <span class="sr-only">{{ card.value }} : </span>{{ card.title }}
          </h2>
          <p>{{ card.rule }}</p>
          <p v-if="card.example" class="rule__example">{{ card.example }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.intro {
  padding: 0 4px;
  font-size: 14px;
  line-height: 21px;
  color: var(--muted);
}

.cards {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rule {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border-radius: 32px;
}

.playing-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 72px;
  flex-shrink: 0;
  border-radius: 10px;
  background: #f5f3ff;
  color: #0b1326;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
  font-family: var(--font-display);
  font-weight: 700;
}

.playing-card.red {
  color: #d1264b;
}

.playing-card__value {
  font-size: 20px;
  line-height: 1;
  letter-spacing: -1px;
}

.long .playing-card__value {
  font-size: 15px;
  letter-spacing: 0;
}

.playing-card__suit {
  font-size: 22px;
  line-height: 1.1;
}

.rule__text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

h2 {
  font-size: 18px;
  line-height: 24px;
  text-transform: uppercase;
  color: var(--accent);
}

.rule__text p {
  font-size: 13px;
  line-height: 20px;
  color: var(--muted);
}

.rule__example {
  font-style: italic;
  opacity: 0.85;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
