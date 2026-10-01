<script setup lang="ts">
import { computed, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import PlayersSetup from '@/components/PlayersSetup.vue'
import PassPhoneScreen from '@/components/PassPhoneScreen.vue'
import LoserScreen from '@/components/LoserScreen.vue'
import { usePlayersStore } from '@/stores/players'
import { GAMES, accentStyle } from '@/lib/games'
import { shuffle } from '@/composables/useRandom'
import { useWakeLock } from '@/composables/useWakeLock'

const game = GAMES.confessions
const MAX_LENGTH = 280

interface Confession {
  author: string
  text: string
}

type Phase = 'setup' | 'write-pass' | 'write' | 'guess-pass' | 'guess' | 'reveal' | 'result'

const players = usePlayersStore()

const phase = ref<Phase>('setup')
const names = ref<string[]>([])
const confessions = ref<Confession[]>([])
const draft = ref('')
/** Joueur en train d'écrire ou de deviner */
const turn = ref(0)
/** guesses[joueur][index de la confession] = auteur deviné */
const guesses = ref<Record<string, Record<number, string>>>({})
/** Position dans la liste des confessions à deviner (ou à révéler) */
const step = ref(0)
const revealed = ref(false)

useWakeLock(computed(() => phase.value !== 'setup'))

const currentName = computed(() => names.value[turn.value] ?? '')

/** Confessions que le joueur courant doit deviner (pas la sienne) */
const toGuess = computed(() =>
  confessions.value
    .map((c, i) => ({ ...c, index: i }))
    .filter((c) => c.author !== currentName.value),
)
const currentGuess = computed(() => toGuess.value[step.value])
const suspects = computed(() => names.value.filter((n) => n !== currentName.value))

const revealedConfession = computed(() => confessions.value[step.value])
const revealedGuesses = computed(() => {
  const confession = revealedConfession.value
  if (!confession) return []
  return names.value
    .filter((n) => n !== confession.author)
    .map((name) => {
      const guess = guesses.value[name]?.[step.value] ?? ''
      return { name, guess, right: guess === confession.author }
    })
})

const errors = computed(() =>
  names.value
    .map((name) => {
      const own = guesses.value[name] ?? {}
      const wrong = Object.entries(own).filter(
        ([index, guess]) => confessions.value[Number(index)]?.author !== guess,
      ).length
      return { name, wrong }
    })
    .sort((a, b) => b.wrong - a.wrong),
)

const losers = computed(() => {
  const worst = errors.value[0]?.wrong ?? 0
  return errors.value.filter((e) => e.wrong === worst).map((e) => e.name)
})

function start() {
  names.value = [...players.names]
  confessions.value = []
  guesses.value = {}
  turn.value = 0
  draft.value = ''
  phase.value = 'write-pass'
}

function submitConfession() {
  const text = draft.value.trim()
  if (!text) return
  confessions.value.push({ author: currentName.value, text })
  // Le texte disparaît tout de suite : le joueur suivant ne doit rien voir
  draft.value = ''
  turn.value++
  if (turn.value < names.value.length) {
    phase.value = 'write-pass'
  } else {
    confessions.value = shuffle(confessions.value)
    turn.value = 0
    step.value = 0
    phase.value = 'guess-pass'
  }
}

function startGuessing() {
  step.value = 0
  guesses.value[currentName.value] = {}
  phase.value = 'guess'
}

function chooseAuthor(author: string) {
  const confession = currentGuess.value
  if (!confession) return
  guesses.value[currentName.value]![confession.index] = author
  step.value++
  if (step.value < toGuess.value.length) return

  turn.value++
  if (turn.value < names.value.length) {
    phase.value = 'guess-pass'
  } else {
    step.value = 0
    revealed.value = false
    phase.value = 'reveal'
  }
}

function nextReveal() {
  if (step.value < confessions.value.length - 1) {
    step.value++
    revealed.value = false
  } else {
    phase.value = 'result'
  }
}
</script>

<template>
  <div class="game-page" :style="accentStyle(game)">
    <PageHeader :title="game.name" back />

    <PlayersSetup v-if="phase === 'setup'" :min-players="game.minPlayers" @play="start" />

    <PassPhoneScreen
      v-else-if="phase === 'write-pass'"
      :name="currentName"
      :hint="`Écris ton secret (${turn + 1}/${names.length}) — personne ne regarde !`"
      @ready="phase = 'write'"
    />

    <form v-else-if="phase === 'write'" class="write" @submit.prevent="submitConfession">
      <section class="card write__card">
        <label for="confession" class="write__label">{{ currentName }}, ta confession</label>
        <textarea
          id="confession"
          v-model="draft"
          rows="6"
          :maxlength="MAX_LENGTH"
          placeholder="Un secret ou une anecdote sur toi…"
        />
        <span class="write__count">{{ draft.length }}/{{ MAX_LENGTH }}</span>
      </section>
      <button type="submit" class="btn btn--big" :disabled="!draft.trim()">Valider</button>
    </form>

    <PassPhoneScreen
      v-else-if="phase === 'guess-pass'"
      :name="currentName"
      :hint="`À toi de deviner qui a écrit quoi, en secret (${turn + 1}/${names.length})`"
      @ready="startGuessing"
    />

    <section v-else-if="phase === 'guess' && currentGuess" class="guess">
      <p class="label">{{ currentName }} · confession {{ step + 1 }}/{{ toGuess.length }}</p>
      <blockquote class="card quote">{{ currentGuess.text }}</blockquote>
      <p class="label">Qui l'a écrite ?</p>
      <div class="suspects">
        <button
          v-for="name in suspects"
          :key="name"
          type="button"
          class="btn btn--ghost"
          @click="chooseAuthor(name)"
        >
          {{ name }}
        </button>
      </div>
    </section>

    <section v-else-if="phase === 'reveal' && revealedConfession" class="reveal">
      <p class="label">Révélation {{ step + 1 }}/{{ confessions.length }}</p>
      <blockquote class="card quote">{{ revealedConfession.text }}</blockquote>

      <template v-if="revealed">
        <p class="reveal__author">
          <span class="label">Écrite par</span>
          <strong>{{ revealedConfession.author }}</strong>
        </p>
        <ul class="answers">
          <li v-for="a in revealedGuesses" :key="a.name" :class="{ right: a.right }">
            <span>{{ a.name }}</span>
            <span class="answers__guess">{{ a.right ? '✓' : '✗' }} {{ a.guess }}</span>
          </li>
        </ul>
        <button type="button" class="btn btn--big" @click="nextReveal">
          {{ step < confessions.length - 1 ? 'Suivante' : 'Résultats' }}
        </button>
      </template>
      <button v-else type="button" class="btn btn--big" @click="revealed = true">
        Révéler l'auteur
      </button>
    </section>

    <LoserScreen v-else :losers="losers" @replay="start" @players="phase = 'setup'">
      <ol class="scores">
        <li v-for="e in errors" :key="e.name" :class="{ worst: losers.includes(e.name) }">
          <span>{{ e.name }}</span>
          <span>{{ e.wrong }} erreur{{ e.wrong > 1 ? 's' : '' }}</span>
        </li>
      </ol>
    </LoserScreen>
  </div>
</template>

<style scoped>
.write {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.write__card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.write__label {
  padding: 0 4px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
  line-height: 26px;
}

.write__count {
  align-self: flex-end;
  padding: 0 8px;
  font-size: 12px;
  color: var(--muted);
}

.write .btn {
  margin-top: auto;
}

.guess,
.reveal {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quote {
  overflow-wrap: anywhere;
  padding: 24px 20px;
  border-radius: 32px;
  font-size: 18px;
  line-height: 27px;
  font-style: italic;
  border: 2px solid color-mix(in srgb, var(--accent) 40%, transparent);
}

.quote::before {
  content: '« ';
  color: var(--accent);
}

.quote::after {
  content: ' »';
  color: var(--accent);
}

.suspects {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.suspects .btn {
  text-transform: none;
  font-size: 16px;
}

.reveal__author {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.reveal__author strong {
  font-family: var(--font-display);
  font-size: 36px;
  line-height: 1.2;
  color: var(--accent);
}

.answers,
.scores {
  width: 100%;
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.answers li,
.scores li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 44px;
  padding: 8px 16px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--danger) 15%, var(--surface-2));
  font-family: var(--font-display);
  font-weight: 600;
}

.answers li.right {
  background: color-mix(in srgb, var(--primary) 18%, var(--surface-2));
}

.answers__guess {
  color: var(--muted);
}

.scores {
  margin-top: 8px;
}

.scores li {
  background: var(--surface-2);
}

.scores li.worst {
  background: color-mix(in srgb, var(--danger) 18%, var(--surface-2));
}

.reveal .btn,
.guess .suspects {
  margin-top: auto;
}
</style>
