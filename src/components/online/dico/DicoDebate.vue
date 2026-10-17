<script setup lang="ts">
import type { DicoView } from '@/lib/protocol'

defineProps<{ game: Extract<DicoView, { phase: 'debate' }> }>()
</script>

<template>
  <section class="head">
    <p class="head__word">{{ game.word }}</p>
    <p class="head__title">🗣️ Débattez !</p>
    <p class="head__hint">
      Quelle définition est la plus proche de la vraie ? Mettez-vous d'accord à voix haute.
    </p>
  </section>

  <ul v-if="game.definitions.length" class="definitions">
    <li v-for="d in game.definitions" :key="d.id" class="card definition" :class="{ mine: d.mine }">
      <span>{{ d.text }}</span>
      <small v-if="d.mine">Ta définition</small>
    </li>
  </ul>
  <p v-else class="card empty">Personne n'a rien écrit… place à la vraie définition !</p>
</template>

<style scoped>
.head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}

.head__word {
  overflow-wrap: anywhere;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 32px;
  line-height: 1.15;
  color: var(--accent);
}

.head__title {
  margin-top: 4px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 22px;
}

.head__hint {
  font-size: 14px;
  color: var(--muted);
  text-align: center;
}

.definitions {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.definition {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 18px;
  font-size: 17px;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.definition.mine {
  border: 2px solid color-mix(in srgb, var(--accent) 40%, transparent);
}

.definition small {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.88px;
  text-transform: uppercase;
  color: var(--muted);
}

.empty {
  text-align: center;
  color: var(--muted);
}
</style>
