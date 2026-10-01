<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ losers: string[] }>()
const emit = defineEmits<{ replay: []; players: [] }>()

const verb = computed(() => (props.losers.length > 1 ? 'boivent' : 'boit'))
</script>

<template>
  <section class="loser">
    <p class="loser__emoji" aria-hidden="true">🍺</p>
    <p class="loser__names">{{ losers.join(', ') }}</p>
    <p class="loser__verb">{{ verb }} !</p>

    <!-- Détails propres à chaque jeu (classement, explications…) -->
    <slot />

    <div class="loser__actions">
      <button type="button" class="btn btn--big" @click="emit('replay')">Rejouer</button>
      <button type="button" class="btn btn--ghost" @click="emit('players')">
        Changer les joueurs
      </button>
    </div>
  </section>
</template>

<style scoped>
.loser {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.loser__emoji {
  margin-top: 16px;
  font-size: 64px;
  line-height: 1;
}

.loser__names {
  max-width: 100%;
  overflow-wrap: anywhere;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 40px;
  line-height: 1.1;
  color: var(--accent);
}

.loser__verb {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 22px;
  text-transform: uppercase;
}

.loser__actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
  padding-top: 24px;
}
</style>
