<script setup lang="ts">
import type { DicoView } from '@/lib/protocol'
import LevelBadge from '@/components/categories/LevelBadge.vue'
import DicoWord from './DicoWord.vue'
import DicoWriting from './DicoWriting.vue'
import DicoDebate from './DicoDebate.vue'
import DicoReveal from './DicoReveal.vue'

defineProps<{ game: DicoView }>()
</script>

<template>
  <p class="round">
    <span class="label">Mot n° {{ game.round }}</span>
    <LevelBadge :level="game.level" />
  </p>
  <DicoWord v-if="game.phase === 'word'" :game="game" />
  <DicoWriting v-else-if="game.phase === 'writing'" :game="game" />
  <DicoDebate v-else-if="game.phase === 'debate'" :game="game" />
  <DicoReveal v-else :game="game" />
</template>

<style scoped>
.round {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>
