<script setup lang="ts">
import { computed, ref } from 'vue'
import PlayerAvatar from '@/components/PlayerAvatar.vue'
import PhotoStatus from '@/components/online/PhotoStatus.vue'
import {
  CONFESSION_MIN_PLAYERS,
  CONFESSION_ROUNDS,
  DICO_MIN_PLAYERS,
  MAX_PLAYERS,
  type GameId,
  type Category,
} from '@/lib/protocol'
import CategoryPicker from '@/components/categories/CategoryPicker.vue'
import { useRoomStore } from '@/stores/room'

const room = useRoomStore()
const emit = defineEmits<{ leave: [] }>()

const view = computed(() => room.view!)
const onlineCount = computed(() => view.value.players.filter((p) => p.status === 'online').length)
const rounds = ref(1)
const category = ref<Category>('soft')
const shareInfo = ref<string | null>(null)
const error = ref<string | null>(null)

const STATUS_LABEL = { online: '', paused: 'en pause ⏸', away: 'absent' } as const

const link = computed(() => `${location.origin}/salon/${view.value.code}`)

async function share() {
  shareInfo.value = null
  try {
    if (navigator.share) {
      await navigator.share({
        title: 'Rejoins mon salon',
        text: `Code : ${view.value.code}`,
        url: link.value,
      })
      return
    }
    await navigator.clipboard.writeText(link.value)
    shareInfo.value = 'Lien copié !'
  } catch {
    // Partage annulé ou presse-papiers indisponible (http) : on affiche le lien
    shareInfo.value = link.value
  }
}

async function start(game: GameId) {
  error.value = null
  try {
    // L'ambiance choisie vaut pour tous les jeux à questions
    if (game === 'quiz')
      await room.startGame(game, { rounds: rounds.value, category: category.value })
    else if (game === 'dico') await room.startGame(game, { category: category.value })
    else if (game === 'susceptible') await room.startGame(game, { category: category.value })
    else await room.startGame(game)
  } catch (e) {
    error.value = (e as Error).message
  }
}
</script>

<template>
  <section class="card code-card">
    <p class="label">Code du salon</p>
    <p class="code">{{ view.code }}</p>
    <button type="button" class="btn btn--ghost" @click="share">Inviter des amis</button>
    <p v-if="shareInfo" class="share-info">{{ shareInfo }}</p>
  </section>

  <section class="card players">
    <div class="players__head">
      <h2>Joueurs</h2>
      <span class="count">{{ view.players.length }}/{{ MAX_PLAYERS }}</span>
    </div>
    <ul>
      <li v-for="p in view.players" :key="p.id" class="player">
        <PlayerAvatar :name="p.pseudo" :src="p.avatarUrl" :dimmed="p.status !== 'online'" />
        <span class="player__name">{{ p.pseudo }}</span>
        <span v-if="p.status !== 'online'" class="player__status">{{
          STATUS_LABEL[p.status]
        }}</span>
        <span v-if="p.isHost" class="tag" title="Hôte">👑</span>
        <span v-if="p.id === view.me" class="tag tag--me">Toi</span>
      </li>
    </ul>
    <RouterLink :to="{ name: 'room-profile', query: { edit: '1' } }" class="edit">
      Modifier mon profil
    </RouterLink>
  </section>

  <section class="card games">
    <h2>Jeux</h2>
    <template v-if="room.isHost">
      <p v-if="onlineCount < 2" class="help">
        Il faut au moins 2 joueurs connectés pour lancer un jeu.
      </p>
      <CategoryPicker
        v-model="category"
        class="ambiance"
        label="Ambiance des questions (Qui de nous, Quiz, Dico)"
      />
      <div class="game-row">
        <div>
          <strong>Qui est le plus susceptible de… ?</strong>
          <small>Tout le monde vote, le plus désigné boit.</small>
        </div>
        <button type="button" class="btn" :disabled="onlineCount < 2" @click="start('susceptible')">
          Lancer
        </button>
      </div>
      <div class="game-row">
        <div>
          <strong>Quiz de potes</strong>
          <small>Qui connaît le mieux les autres ?</small>
          <label class="rounds">
            Tours de table
            <select v-model.number="rounds">
              <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
            </select>
          </label>
        </div>
        <button type="button" class="btn" :disabled="onlineCount < 2" @click="start('quiz')">
          Lancer
        </button>
      </div>
      <div class="game-row">
        <div>
          <strong>Le plus rapide ⚡</strong>
          <small>Un bouton apparaît au hasard : le plus lent à appuyer boit.</small>
        </div>
        <button type="button" class="btn" :disabled="onlineCount < 2" @click="start('fastest')">
          Lancer
        </button>
      </div>
      <div class="game-row">
        <div>
          <strong>Le dico des potes 📖</strong>
          <small>
            Un mot rare : chacun écrit ce qu'il croit, vous débattez, puis la vraie définition
            tombe.
          </small>
        </div>
        <button
          type="button"
          class="btn"
          :disabled="onlineCount < DICO_MIN_PLAYERS"
          @click="start('dico')"
        >
          Lancer
        </button>
      </div>
      <div class="game-row">
        <div>
          <strong>Confessions anonymes</strong>
          <small>
            {{ CONFESSION_ROUNDS }} manches : écris un secret, devine qui a écrit celui qu'on te
            donne. {{ CONFESSION_MIN_PLAYERS }} joueurs minimum.
          </small>
        </div>
        <button
          type="button"
          class="btn"
          :disabled="onlineCount < CONFESSION_MIN_PLAYERS"
          @click="start('confessions')"
        >
          Lancer
        </button>
      </div>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
    </template>
    <p v-else class="help">L'hôte 👑 choisit le prochain jeu.</p>
  </section>

  <PhotoStatus />

  <button type="button" class="leave" @click="emit('leave')">Quitter le salon</button>
</template>

<style scoped>
.code-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.code {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 56px;
  line-height: 1;
  letter-spacing: 10px;
  color: var(--accent);
}

.share-info {
  max-width: 100%;
  overflow-wrap: anywhere;
  font-size: 13px;
  color: var(--muted);
  user-select: all;
}

.players,
.games {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.players__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

h2 {
  padding: 0 4px;
  font-size: 22px;
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

ul {
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
  padding: 6px 12px 6px 6px;
  border-radius: 9999px;
  background: var(--surface-2);
}

.player__name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-display);
  font-weight: 600;
}

.player__status {
  font-size: 12px;
  color: var(--muted);
}

.tag {
  font-size: 16px;
}

.tag--me {
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

.edit {
  align-self: center;
  padding: 8px;
  font-size: 14px;
  color: var(--accent);
  text-decoration: underline;
}

.game-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 24px;
  background: var(--surface-2);
}

.game-row > div {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.game-row strong {
  font-family: var(--font-display);
}

.game-row small {
  font-size: 12px;
  color: var(--muted);
}

.game-row .btn {
  width: auto;
}

.ambiance {
  padding: 4px 4px 8px;
  text-align: center;
}

.rounds {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  font-size: 13px;
  color: var(--muted);
}

.rounds select {
  min-height: 36px;
  padding: 0 10px;
  border: none;
  border-radius: 12px;
  background: var(--surface-3);
  color: var(--text);
  font-size: 16px;
}

.help {
  padding: 0 4px;
  font-size: 13px;
  color: var(--muted);
}

.error {
  padding: 0 4px;
  font-size: 14px;
  color: var(--danger);
}

.leave {
  align-self: center;
  min-height: 44px;
  padding: 8px 16px;
  border: none;
  background: none;
  font-size: 14px;
  color: var(--danger);
  cursor: pointer;
}
</style>
