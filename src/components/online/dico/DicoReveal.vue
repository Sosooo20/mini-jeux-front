<script setup lang="ts">
import { computed } from 'vue'
import PlayerAvatar from '@/components/PlayerAvatar.vue'
import type { DicoView } from '@/lib/protocol'
import { useRoomStore } from '@/stores/room'

const props = defineProps<{ game: Extract<DicoView, { phase: 'reveal' }> }>()
const room = useRoomStore()

/** Suspense : les fausses d'abord (de la moins à la plus votée), la vraie à la fin */
const ordered = computed(() => {
  const fakes = props.game.definitions
    .filter((d) => d.authorId !== null)
    .sort((a, b) => a.voters.length - b.voters.length)
  const truth = props.game.definitions.filter((d) => d.authorId === null)
  return [...fakes, ...truth]
})

const names = (ids: string[]) => ids.map(room.nameOf).join(', ')
</script>

<template>
  <p class="word">{{ game.word }}</p>

  <ul class="definitions">
    <li
      v-for="(d, i) in ordered"
      :key="d.id"
      class="card definition"
      :class="{ 'definition--true': d.authorId === null }"
      :style="{ animationDelay: `${i * 0.7}s` }"
    >
      <p class="definition__tag">
        <template v-if="d.authorId === null">✅ La vraie définition</template>
        <template v-else>
          <PlayerAvatar
            :name="room.nameOf(d.authorId)"
            :src="room.playerById(d.authorId)?.avatarUrl ?? null"
            :size="24"
          />
          Inventée par {{ room.nameOf(d.authorId) }}
        </template>
      </p>
      <p class="definition__text">{{ d.text }}</p>

      <p v-if="d.authorId === null" class="definition__votes">
        <template v-if="d.voters.length">Trouvée par {{ names(d.voters) }} (+2)</template>
        <template v-else>Personne ne l'a trouvée 🙈</template>
      </p>
      <p v-else-if="d.voters.length" class="definition__votes definition__votes--trap">
        😈 {{ names(d.voters) }}
        {{ d.voters.length > 1 ? 'se sont fait avoir' : "s'est fait avoir" }} par
        {{ room.nameOf(d.authorId) }} (+{{ d.voters.length }})
      </p>
      <p v-else class="definition__votes">Personne n'y a cru</p>
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

.definitions {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Les définitions apparaissent une par une */
.definition {
  display: flex;
  flex-direction: column;
  gap: 8px;
  opacity: 0;
  animation: appear 0.45s ease-out forwards;
}

.definition--true {
  border: 2px solid var(--primary);
  background: color-mix(in srgb, var(--primary) 14%, var(--surface));
}

.definition__tag {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 13px;
  color: var(--muted);
}

.definition--true .definition__tag {
  color: var(--primary);
}

.definition__text {
  overflow-wrap: anywhere;
  font-size: 17px;
  line-height: 1.4;
}

.definition__votes {
  font-size: 14px;
  color: var(--muted);
}

.definition__votes--trap {
  color: var(--accent);
}

@keyframes appear {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .definition {
    opacity: 1;
    animation: none;
  }
}
</style>
