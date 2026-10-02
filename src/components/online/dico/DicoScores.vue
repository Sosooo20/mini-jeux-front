<script setup lang="ts">
import { computed } from 'vue'
import PlayerAvatar from '@/components/PlayerAvatar.vue'
import type { DicoView } from '@/lib/protocol'
import { useRoomStore } from '@/stores/room'

const props = defineProps<{ game: Extract<DicoView, { phase: 'scores' | 'final' }> }>()
const room = useRoomStore()

const ranking = computed(() =>
  Object.entries(props.game.scores)
    .map(([id, score]) => ({
      id,
      score,
      gained: props.game.phase === 'scores' ? (props.game.gained[id] ?? 0) : 0,
    }))
    .sort((a, b) => b.score - a.score),
)
const losers = computed(() => (props.game.phase === 'final' ? props.game.losers : []))
</script>

<template>
  <section v-if="game.phase === 'final'" class="final">
    <p class="final__emoji" aria-hidden="true">🍺</p>
    <p class="final__names">{{ losers.map(room.nameOf).join(', ') }}</p>
    <p class="final__verb">{{ losers.length > 1 ? 'boivent' : 'boit' }} !</p>
    <p class="final__hint">Dernier{{ losers.length > 1 ? 's' : '' }} au classement</p>
  </section>

  <section class="card scores">
    <p class="label">Classement</p>
    <ol>
      <li
        v-for="(r, i) in ranking"
        :key="r.id"
        :class="{ worst: losers.includes(r.id) }"
        :style="{ animationDelay: `${i * 0.08}s` }"
      >
        <span class="rank">{{ i + 1 }}</span>
        <PlayerAvatar
          :name="room.nameOf(r.id)"
          :src="room.playerById(r.id)?.avatarUrl ?? null"
          :size="32"
        />
        <span class="name">{{ room.nameOf(r.id) }}</span>
        <span v-if="r.gained" class="gained">+{{ r.gained }}</span>
        <strong>{{ r.score }} pt{{ r.score > 1 ? 's' : '' }}</strong>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.final {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.final__emoji {
  font-size: 56px;
}

.final__names {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 34px;
  line-height: 1.15;
  overflow-wrap: anywhere;
  color: var(--accent);
}

.final__verb {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
  text-transform: uppercase;
}

.final__hint {
  font-size: 14px;
  color: var(--muted);
}

.scores {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

ol {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

li {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 6px 16px 6px 8px;
  border-radius: 9999px;
  background: var(--surface-2);
  font-family: var(--font-display);
  font-weight: 600;
  animation: slide 0.4s ease-out both;
}

li.worst {
  background: color-mix(in srgb, var(--danger) 22%, var(--surface-2));
}

.rank {
  width: 20px;
  text-align: center;
  color: var(--muted);
}

.name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gained {
  font-size: 13px;
  color: var(--primary);
}

@keyframes slide {
  from {
    opacity: 0;
    transform: translateX(-16px);
  }
}

@media (prefers-reduced-motion: reduce) {
  li {
    animation: none;
  }
}
</style>
