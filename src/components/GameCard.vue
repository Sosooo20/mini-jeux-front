<script setup lang="ts">
import type { GameInfo } from '@/types/game'

defineProps<{ game: GameInfo; disabled?: boolean }>()
</script>

<template>
  <RouterLink
    :to="disabled ? '' : { name: game.routeName }"
    class="game-card card"
    :class="{ disabled }"
    :aria-disabled="disabled"
  >
    <span class="emoji">{{ game.emoji }}</span>
    <span>
      <strong>{{ game.name }}</strong>
      <small>{{ game.description }}</small>
      <small v-if="disabled" class="warn">Min. {{ game.minPlayers }} joueurs</small>
    </span>
  </RouterLink>
</template>

<style scoped>
.game-card {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 80px;
}
.game-card:active {
  transform: scale(0.98);
}
.disabled {
  opacity: 0.5;
  pointer-events: none;
}
.emoji {
  font-size: 2.2rem;
}
small {
  display: block;
  color: var(--muted);
}
.warn {
  color: var(--accent);
}
</style>
