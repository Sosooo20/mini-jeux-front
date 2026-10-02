<script setup lang="ts">
import { computed, ref } from 'vue'
import PlayerAvatar from '@/components/PlayerAvatar.vue'
import DeadlineBar from '@/components/online/DeadlineBar.vue'
import { CONFESSION_MAX_LENGTH, WRITE_SECONDS, type ConfessionsView } from '@/lib/protocol'
import { useRoomStore } from '@/stores/room'
import { vibrate } from '@/composables/useVibrate'

const props = defineProps<{ game: ConfessionsView }>()
const room = useRoomStore()

const draft = ref('')
const sending = ref(false)
const error = ref<string | null>(null)

const onlineCount = computed(
  () => room.view?.players.filter((p) => p.status === 'online').length ?? 0,
)

/** Le moins d'erreurs en haut */
const ranking = computed(() =>
  Object.entries(props.game.errors)
    .map(([id, n]) => ({ id, n }))
    .sort((a, b) => a.n - b.n),
)

/** Une fois répondu (ou pendant l'envoi), plus de changement possible */
const guessLocked = computed(
  () => sending.value || (props.game.phase === 'guess' && props.game.myGuess !== null),
)

async function send(action: () => Promise<unknown>) {
  if (sending.value) return
  sending.value = true
  error.value = null
  try {
    await action()
    vibrate(30)
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    sending.value = false
  }
}

const submitSecret = () =>
  send(async () => {
    await room.writeConfession(draft.value)
    draft.value = ''
  })
</script>

<template>
  <p class="round label">Manche {{ game.round }}/{{ game.totalRounds }}</p>

  <!-- 1. Chacun écrit son secret -->
  <template v-if="game.phase === 'write'">
    <section class="card step">
      <p class="step__title">Écris un secret ou une anecdote marrante sur toi</p>
      <DeadlineBar :deadline="game.deadline" :total="WRITE_SECONDS" />
      <template v-if="game.mine === null">
        <textarea
          v-model="draft"
          rows="5"
          :maxlength="CONFESSION_MAX_LENGTH"
          placeholder="Personne ne saura que c'est toi… en théorie."
          aria-label="Ton secret"
        />
        <span class="counter">{{ draft.length }}/{{ CONFESSION_MAX_LENGTH }}</span>
        <button
          type="button"
          class="btn btn--big"
          :disabled="!draft.trim() || sending"
          @click="submitSecret"
        >
          Envoyer en secret
        </button>
      </template>
      <template v-else>
        <blockquote class="quote">{{ game.mine }}</blockquote>
        <p class="done">Envoyé ✓ · pas de retour en arrière</p>
      </template>
    </section>
    <p class="progress">{{ game.written.length }}/{{ onlineCount }} ont écrit</p>
  </template>

  <!-- 2. Chacun attribue la phrase qu'il a reçue -->
  <template v-else-if="game.phase === 'guess'">
    <section class="card step">
      <DeadlineBar :deadline="game.deadline" />
      <template v-if="game.text">
        <blockquote class="quote">{{ game.text }}</blockquote>
        <p class="step__title">Qui a écrit ça ?</p>
      </template>
      <p v-else class="done">Pas de phrase pour toi cette manche : attends les autres.</p>
    </section>

    <div v-if="game.text" class="grid">
      <button
        v-for="id in game.choices"
        :key="id"
        type="button"
        class="choice"
        :class="{ selected: game.myGuess === id }"
        :disabled="guessLocked"
        @click="send(() => room.guessAuthor(id))"
      >
        <PlayerAvatar :name="room.nameOf(id)" :src="room.playerById(id)?.avatarUrl" :size="48" />
        <span>{{ room.nameOf(id) }}</span>
      </button>
    </div>
    <p class="progress">
      {{ game.answered.length }}/{{ game.expected.length }} ont répondu
      <span v-if="game.myGuess"> · ta réponse est enregistrée ✓</span>
    </p>
  </template>

  <!-- 3. Révélation -->
  <template v-else-if="game.phase === 'reveal'">
    <p v-if="!game.items.length" class="card done">
      Pas assez de secrets cette manche (il en faut au moins 2).
    </p>
    <section v-for="item in game.items" :key="item.author" class="card reveal">
      <blockquote class="quote">{{ item.text }}</blockquote>
      <p class="reveal__author">
        <PlayerAvatar
          :name="room.nameOf(item.author)"
          :src="room.playerById(item.author)?.avatarUrl"
          :size="32"
        />
        écrit par <strong>{{ room.nameOf(item.author) }}</strong>
      </p>
      <ul class="answers">
        <li
          v-for="(guessed, guesser) in item.guesses"
          :key="guesser"
          :class="{ right: guessed === item.author }"
        >
          <span>{{ room.nameOf(String(guesser)) }}</span>
          <span>
            {{ guessed === item.author ? '✓' : '✗' }}
            {{ guessed ? room.nameOf(guessed) : 'pas répondu' }}
          </span>
        </li>
      </ul>
    </section>
  </template>

  <!-- 4. Fin de partie -->
  <section v-else class="final">
    <p class="final__emoji" aria-hidden="true">🍺</p>
    <p class="final__names">{{ game.losers.map(room.nameOf).join(', ') }}</p>
    <p class="final__verb">{{ game.losers.length > 1 ? 'boivent' : 'boit' }} !</p>
    <p v-if="game.winners.length" class="final__best">
      🕵️ Meilleur détective : <strong>{{ game.winners.map(room.nameOf).join(', ') }}</strong>
    </p>
  </section>

  <section class="card scores">
    <p class="label">Erreurs</p>
    <ol>
      <li v-for="r in ranking" :key="r.id">
        <span>{{ room.nameOf(r.id) }}</span>
        <span>{{ r.n }} erreur{{ r.n > 1 ? 's' : '' }}</span>
      </li>
    </ol>
  </section>

  <p v-if="error" class="error" role="alert">{{ error }}</p>
</template>

<style scoped>
.round {
  text-align: center;
}

.step {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 22px;
  line-height: 1.25;
}

.counter {
  align-self: flex-end;
  padding: 0 8px;
  font-size: 12px;
  color: var(--muted);
}

.quote {
  overflow-wrap: anywhere;
  padding: 20px;
  border: 2px solid color-mix(in srgb, var(--accent) 40%, transparent);
  border-radius: 28px;
  font-size: 18px;
  line-height: 27px;
  font-style: italic;
}

.quote::before {
  content: '« ';
  color: var(--accent);
}

.quote::after {
  content: ' »';
  color: var(--accent);
}

.done,
.progress {
  text-align: center;
  font-size: 14px;
  color: var(--muted);
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.choice {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-height: 104px;
  padding: 12px 8px;
  border: 2px solid transparent;
  border-radius: 24px;
  background: var(--surface);
  font-family: var(--font-display);
  font-weight: 600;
  overflow-wrap: anywhere;
  cursor: pointer;
  touch-action: manipulation;
}

.choice:disabled {
  cursor: default;
  opacity: 0.45;
}

.choice.selected {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 18%, var(--surface));
  opacity: 1;
}

.reveal {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reveal__author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reveal__author strong {
  color: var(--accent);
}

.answers,
.scores ol {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.answers li,
.scores li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  min-height: 40px;
  padding: 6px 16px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--danger) 15%, var(--surface-2));
  font-family: var(--font-display);
  font-weight: 600;
}

.answers li.right {
  background: color-mix(in srgb, var(--primary) 18%, var(--surface-2));
}

.scores {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.scores li {
  background: var(--surface-2);
}

.final {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
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

.final__best {
  margin-top: 8px;
}

.final__best strong {
  color: var(--accent);
}

.error {
  text-align: center;
  font-size: 14px;
  color: var(--danger);
}
</style>
