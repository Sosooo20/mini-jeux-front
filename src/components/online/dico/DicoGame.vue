<script setup lang="ts">
import type { DicoView } from '@/lib/protocol'
import LevelBadge from '@/components/categories/LevelBadge.vue'
import DicoWord from './DicoWord.vue'
import DicoWriting from './DicoWriting.vue'
import DicoVoting from './DicoVoting.vue'
import DicoReveal from './DicoReveal.vue'
import DicoScores from './DicoScores.vue'

defineProps<{ game: DicoView }>()
</script>

<template>
  <p class="round">
    <span class="label">Manche {{ game.round }}/{{ game.rounds }}</span>
    <LevelBadge :level="game.level" />
  </p>
  <DicoWord v-if="game.phase === 'word'" :game="game" />
  <DicoWriting v-else-if="game.phase === 'writing'" :game="game" />
  <DicoVoting v-else-if="game.phase === 'voting'" :game="game" />
  <DicoReveal v-else-if="game.phase === 'reveal'" :game="game" />
  <DicoScores v-else :game="game" />
</template>

<style scoped>
.round {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>
