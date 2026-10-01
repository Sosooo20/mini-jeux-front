<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { usePlayersStore } from '@/stores/players'
import { PSEUDO_MAX_LENGTH } from '@/stores/user'
import { MAX_PLAYERS } from '@/lib/games'

const props = defineProps<{ minPlayers: number }>()
const emit = defineEmits<{ play: [] }>()

const players = usePlayersStore()

const adding = ref(false)
const newName = ref('')
const error = ref<string | null>(null)
const input = ref<HTMLInputElement | null>(null)

const missing = computed(() => Math.max(0, props.minPlayers - players.count))

async function openForm() {
  adding.value = true
  error.value = null
  await nextTick()
  input.value?.focus()
}

function closeForm() {
  adding.value = false
  newName.value = ''
  error.value = null
}

function submit() {
  error.value = players.add(newName.value)
  if (!error.value) closeForm()
}
</script>

<template>
  <section class="card setup">
    <div class="setup__head">
      <h2>Joueurs</h2>
      <span class="count">{{ players.count }}/{{ MAX_PLAYERS }}</span>
    </div>

    <ul class="list">
      <li v-for="(name, i) in players.names" :key="name" class="player">
        <span class="avatar">{{ name.charAt(0).toUpperCase() }}</span>
        <span class="player__name">{{ name }}</span>
        <span v-if="i === 0" class="you">Toi</span>
        <button
          v-else
          type="button"
          class="remove"
          :aria-label="`Retirer ${name}`"
          @click="players.remove(name)"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path
              d="M2 2l10 10M12 2L2 12"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </li>
    </ul>

    <form v-if="adding" class="add-form" @submit.prevent="submit">
      <input
        ref="input"
        v-model="newName"
        :maxlength="PSEUDO_MAX_LENGTH"
        aria-label="Pseudo du joueur"
        autocomplete="off"
        autocapitalize="words"
        enterkeyhint="done"
      />
      <p v-if="error" class="error">{{ error }}</p>
      <div class="add-form__actions">
        <button type="button" class="btn btn--ghost" @click="closeForm">Annuler</button>
        <button type="submit" class="btn" :disabled="!newName.trim()">Valider</button>
      </div>
    </form>

    <button v-else-if="!players.isFull" type="button" class="add-btn" @click="openForm">
      <span aria-hidden="true">+</span> Ajouter un joueur
    </button>
  </section>

  <div class="play">
    <p v-if="missing > 0" class="hint">
      Encore {{ missing }} joueur{{ missing > 1 ? 's' : '' }} minimum pour jouer
    </p>
    <button type="button" class="btn btn--big" :disabled="missing > 0" @click="emit('play')">
      Jouer
    </button>
  </div>
</template>

<style scoped>
.setup {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.setup__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

h2 {
  font-size: 22px;
  line-height: 28px;
}

.count {
  padding: 4px 10px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--accent) 15%, transparent);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 13px;
  color: var(--accent);
}

.list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.player {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 52px;
  padding: 6px 6px 6px 8px;
  border-radius: 9999px;
  background: var(--surface-2);
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--accent) 20%, var(--surface-3));
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--accent);
}

.player__name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 17px;
}

.you {
  margin-right: 8px;
  padding: 2px 10px;
  border-radius: 9999px;
  background: var(--accent);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.88px;
  text-transform: uppercase;
  color: var(--on-accent);
}

.remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border: none;
  border-radius: 9999px;
  background: none;
  color: var(--muted);
  cursor: pointer;
  touch-action: manipulation;
}

.add-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.add-form__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.error {
  padding: 0 16px;
  font-size: 13px;
  color: var(--danger);
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: var(--tap);
  border: 2px dashed color-mix(in srgb, var(--accent) 50%, transparent);
  border-radius: 9999px;
  background: none;
  color: var(--accent);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  cursor: pointer;
  touch-action: manipulation;
}

.add-btn span {
  font-size: 22px;
  line-height: 1;
}

.play {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
}

.hint {
  text-align: center;
  font-size: 13px;
  color: var(--muted);
}
</style>
