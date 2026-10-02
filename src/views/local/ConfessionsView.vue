<script setup lang="ts">
import { computed, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import PlayersSetup from '@/components/PlayersSetup.vue'
import PassPhoneScreen from '@/components/PassPhoneScreen.vue'
import LoserScreen from '@/components/LoserScreen.vue'
import { usePlayersStore } from '@/stores/players'
import { GAMES, accentStyle } from '@/lib/games'
import { shuffle } from '@/composables/useRandom'
import { vibrate } from '@/composables/useVibrate'
import { useWakeLock } from '@/composables/useWakeLock'

const game = GAMES.confessions
const MAX_LENGTH = 280

interface Secret {
  author: string
  text: string
  /** Pseudo désigné par le groupe (null = secret pas encore joué) */
  accused: string | null
}

type Phase = 'setup' | 'write-pass' | 'write' | 'ready' | 'board' | 'accuse' | 'verdict' | 'result'

const players = usePlayersStore()

const phase = ref<Phase>('setup')
const names = ref<string[]>([])
const secrets = ref<Secret[]>([])
const draft = ref('')
/** Joueur en train d'écrire */
const turn = ref(0)
/** Secret affiché seul (accusation puis verdict) */
const current = ref(0)
/** Pseudo sélectionné, pas encore validé */
const selected = ref<string | null>(null)

useWakeLock(computed(() => phase.value !== 'setup'))

const currentName = computed(() => names.value[turn.value] ?? '')
const currentSecret = computed(() => secrets.value[current.value])
const played = computed(() => secrets.value.filter((s) => s.accused !== null).length)
const allPlayed = computed(() => played.value === secrets.value.length)

/** Démasqués : ils boivent */
const unmasked = computed(() =>
  secrets.value.filter((s) => s.accused === s.author).map((s) => s.author),
)
/** Jamais trouvés : meilleurs menteurs */
const liars = computed(() =>
  secrets.value.filter((s) => s.accused && s.accused !== s.author).map((s) => s.author),
)

function start() {
  names.value = [...players.names]
  secrets.value = []
  turn.value = 0
  draft.value = ''
  phase.value = 'write-pass'
}

function submitSecret() {
  const text = draft.value.trim()
  if (!text) return
  secrets.value.push({ author: currentName.value, text, accused: null })
  // Le texte disparaît tout de suite : le joueur suivant ne doit rien voir
  draft.value = ''
  turn.value++
  if (turn.value < names.value.length) {
    phase.value = 'write-pass'
  } else {
    secrets.value = shuffle(secrets.value)
    phase.value = 'ready'
  }
}

function openSecret(index: number) {
  if (secrets.value[index]?.accused !== null) return
  current.value = index
  selected.value = null
  phase.value = 'accuse'
}

function validateAccusation() {
  const secret = currentSecret.value
  if (!secret || !selected.value) return
  secret.accused = selected.value
  vibrate(secret.accused === secret.author ? [80, 60, 200] : 60)
  phase.value = 'verdict'
}

function afterVerdict() {
  phase.value = allPlayed.value ? 'result' : 'board'
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

    <form v-else-if="phase === 'write'" class="write" @submit.prevent="submitSecret">
      <section class="card write__card">
        <label for="confession" class="write__label">{{ currentName }}, ton secret</label>
        <textarea
          id="confession"
          v-model="draft"
          rows="6"
          :maxlength="MAX_LENGTH"
          placeholder="Un secret ou une anecdote sur toi… (ou un gros mensonge crédible)"
        />
        <span class="write__count">{{ draft.length }}/{{ MAX_LENGTH }}</span>
      </section>
      <button type="submit" class="btn btn--big" :disabled="!draft.trim()">Valider</button>
    </form>

    <section v-else-if="phase === 'ready'" class="ready">
      <p class="ready__emoji" aria-hidden="true">🤫</p>
      <p class="ready__title">Tous les secrets sont prêts</p>
      <p class="ready__hint">Posez le téléphone au milieu, que tout le monde puisse lire.</p>
      <button type="button" class="btn btn--big" @click="phase = 'board'">
        Découvrir les secrets
      </button>
    </section>

    <section v-else-if="phase === 'board'" class="board">
      <header class="board__intro">
        <p class="board__title">🔥 L'heure du débat !</p>
        <p class="board__subtitle">Qui aurait pu dire ou faire ça ?</p>
        <p class="board__rules">
          Mentez, bluffez, semez les autres. Touchez un secret pour accuser quelqu'un :
          démasqué = il boit.
        </p>
        <p class="label">{{ played }}/{{ secrets.length }} secrets joués</p>
      </header>

      <ul class="secrets">
        <li v-for="(s, i) in secrets" :key="i">
          <button
            type="button"
            class="secret"
            :class="{
              'secret--done': s.accused,
              'secret--caught': s.accused === s.author,
            }"
            :disabled="s.accused !== null"
            @click="openSecret(i)"
          >
            <span class="secret__text">{{ s.text }}</span>
            <span v-if="s.accused" class="secret__status">
              {{ s.accused === s.author ? '🍺 Démasqué :' : '🤥 Pas trouvé :' }}
              <strong>{{ s.author }}</strong>
            </span>
          </button>
        </li>
      </ul>
    </section>

    <section v-else-if="phase === 'accuse' && currentSecret" class="accuse">
      <blockquote class="card quote">{{ currentSecret.text }}</blockquote>
      <p class="label">Qui a écrit ça ?</p>
      <div class="suspects">
        <button
          v-for="name in names"
          :key="name"
          type="button"
          class="btn btn--ghost"
          :class="{ 'is-selected': selected === name }"
          :aria-pressed="selected === name"
          @click="selected = name"
        >
          {{ name }}
        </button>
      </div>
      <div class="accuse__actions">
        <button
          type="button"
          class="btn btn--big"
          :disabled="!selected"
          @click="validateAccusation"
        >
          {{ selected ? `Accuser ${selected}` : 'Choisissez un pseudo' }}
        </button>
        <button type="button" class="btn btn--ghost" @click="phase = 'board'">
          Retour aux secrets
        </button>
      </div>
    </section>

    <section v-else-if="phase === 'verdict' && currentSecret" class="verdict">
      <blockquote class="card quote">{{ currentSecret.text }}</blockquote>

      <template v-if="currentSecret.accused === currentSecret.author">
        <p class="verdict__emoji" aria-hidden="true">🍺</p>
        <p class="label">Démasqué !</p>
        <p class="verdict__name">{{ currentSecret.author }}</p>
        <p class="verdict__text">boit !</p>
      </template>
      <template v-else>
        <p class="verdict__emoji" aria-hidden="true">🤥</p>
        <p class="label">Raté ! Ce n'était pas {{ currentSecret.accused }}, c'était</p>
        <p class="verdict__name">{{ currentSecret.author }}</p>
        <p class="verdict__text">Bien joué, tu les as tous semés. Personne ne boit.</p>
      </template>

      <button type="button" class="btn btn--big" @click="afterVerdict">
        {{ allPlayed ? 'Résultats' : 'Retour aux secrets' }}
      </button>
    </section>

    <template v-else-if="phase === 'result'">
      <LoserScreen
        v-if="unmasked.length"
        :losers="unmasked"
        @replay="start"
        @players="phase = 'setup'"
      >
        <p v-if="liars.length" class="liars">
          🤥 Meilleur{{ liars.length > 1 ? 's' : '' }} menteur{{ liars.length > 1 ? 's' : '' }} :
          <strong>{{ liars.join(', ') }}</strong>
        </p>
      </LoserScreen>

      <section v-else class="ready">
        <p class="ready__emoji" aria-hidden="true">🤥</p>
        <p class="ready__title">Personne n'a été démasqué !</p>
        <p class="ready__hint">Bande de menteurs… Personne ne boit cette fois.</p>
        <div class="ready__actions">
          <button type="button" class="btn btn--big" @click="start">Rejouer</button>
          <button type="button" class="btn btn--ghost" @click="phase = 'setup'">
            Changer les joueurs
          </button>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.write,
.accuse,
.verdict,
.board {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.write {
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

/* Écran « tout est prêt » et fin sans perdant */
.ready {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
}

.ready__emoji,
.verdict__emoji {
  font-size: 64px;
  line-height: 1;
}

.ready__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 28px;
  line-height: 1.2;
  color: var(--accent);
}

.ready__hint {
  color: var(--muted);
}

.ready > .btn,
.ready__actions {
  margin-top: 24px;
}

.ready__actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Tableau des secrets */
.board__intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}

.board__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 28px;
  line-height: 1.2;
  color: var(--accent);
}

.board__subtitle {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 20px;
}

.board__rules {
  margin: 4px 0 8px;
  font-size: 14px;
  color: var(--muted);
}

.secrets {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.secret {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px 20px;
  border-radius: 24px;
  border: 2px solid color-mix(in srgb, var(--accent) 45%, transparent);
  background: var(--surface-2);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: transform 0.1s;
}

.secret:active:not(:disabled) {
  transform: scale(0.98);
}

.secret__text {
  overflow-wrap: anywhere;
  font-size: 17px;
  line-height: 25px;
  font-style: italic;
}

.secret__text::before {
  content: '« ';
  color: var(--accent);
}

.secret__text::after {
  content: ' »';
  color: var(--accent);
}

.secret--done {
  cursor: default;
  opacity: 0.7;
  border-color: color-mix(in srgb, var(--primary) 40%, transparent);
  background: color-mix(in srgb, var(--primary) 10%, var(--surface-2));
}

.secret--caught {
  border-color: color-mix(in srgb, var(--danger) 50%, transparent);
  background: color-mix(in srgb, var(--danger) 12%, var(--surface-2));
}

.secret__status {
  font-family: var(--font-display);
  font-size: 14px;
  color: var(--muted);
}

.secret__status strong {
  color: var(--text);
}

/* Secret seul : accusation et verdict */
.quote {
  overflow-wrap: anywhere;
  padding: 24px 20px;
  border-radius: 32px;
  font-size: 20px;
  line-height: 30px;
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
  overflow-wrap: anywhere;
}

.suspects .btn.is-selected {
  background: var(--accent);
  color: var(--on-accent);
  border-color: var(--accent);
}

.accuse__actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
  padding-top: 16px;
}

.verdict {
  align-items: center;
  text-align: center;
}

.verdict .quote {
  align-self: stretch;
  text-align: left;
}

.verdict__emoji {
  margin-top: 8px;
}

.verdict__name {
  max-width: 100%;
  overflow-wrap: anywhere;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 40px;
  line-height: 1.1;
  color: var(--accent);
}

.verdict__text {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 18px;
}

.verdict > .btn {
  align-self: stretch;
  margin-top: auto;
}

.liars {
  margin-top: 8px;
  color: var(--muted);
}

.liars strong {
  color: var(--accent);
}
</style>
