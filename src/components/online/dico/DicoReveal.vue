<script setup lang="ts">
import PlayerAvatar from '@/components/PlayerAvatar.vue'
import type { DicoView } from '@/lib/protocol'
import { useRoomStore } from '@/stores/room'

defineProps<{ game: Extract<DicoView, { phase: 'reveal' }> }>()
const room = useRoomStore()
</script>

<template>
  <p class="word">{{ game.word }}</p>

  <section class="card truth">
    <p class="truth__tag">✅ La vraie définition</p>
    <p class="truth__text">{{ game.truth }}</p>
  </section>

  <p class="verdict">Alors, qui était le plus proche ? À vous de juger… et de faire boire !</p>

  <ul class="definitions">
    <li
      v-for="(d, i) in game.definitions"
      :key="d.id"
      class="card definition"
      :style="{ animationDelay: `${0.4 + i * 0.25}s` }"
    >
      <p class="definition__author">
        <PlayerAvatar
          :name="room.nameOf(d.authorId)"
          :src="room.playerById(d.authorId)?.avatarUrl ?? null"
          :size="24"
        />
        {{ room.nameOf(d.authorId) }}
      </p>
      <p class="definition__text">{{ d.text }}</p>
    </li>
  </ul>
</template>

<style scoped>
.word {
  overflow-wrap: anywhere;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 32px;
  line-height: 1.15;
  text-align: center;
  color: var(--accent);
}

.truth {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 2px solid var(--primary);
  background: color-mix(in srgb, var(--primary) 14%, var(--surface));
  animation: appear 0.45s ease-out both;
}

.truth__tag {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 13px;
  color: var(--primary);
}

.truth__text {
  overflow-wrap: anywhere;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
  line-height: 1.35;
}

.verdict {
  text-align: center;
  font-size: 14px;
  color: var(--muted);
}

.definitions {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Les auteurs apparaissent un par un, après la vraie définition */
.definition {
  display: flex;
  flex-direction: column;
  gap: 6px;
  animation: appear 0.4s ease-out both;
}

.definition__author {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 13px;
  color: var(--muted);
}

.definition__text {
  overflow-wrap: anywhere;
  font-size: 16px;
  line-height: 1.4;
}

@keyframes appear {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .truth,
  .definition {
    animation: none;
  }
}
</style>
