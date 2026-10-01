<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import PlayersSetup from '@/components/PlayersSetup.vue'
import PassPhoneScreen from '@/components/PassPhoneScreen.vue'
import LoserScreen from '@/components/LoserScreen.vue'
import { usePlayersStore } from '@/stores/players'
import { GAMES, accentStyle } from '@/lib/games'
import { randomInt } from '@/composables/useRandom'
import { useWakeLock } from '@/composables/useWakeLock'
import { vibrate } from '@/composables/useVibrate'

const game = GAMES.chrono

interface Attempt {
  name: string
  time: number
}

const players = usePlayersStore()

const phase = ref<'setup' | 'pass' | 'ready' | 'running' | 'results'>('setup')
const names = ref<string[]>([])
const target = ref(0)
const current = ref(0)
const attempts = ref<Attempt[]>([])
const warning = ref<string | null>(null)
let startedAt = 0

useWakeLock(computed(() => phase.value !== 'setup'))

const currentName = computed(() => names.value[current.value] ?? '')

const ranking = computed(() =>
  attempts.value
    .map((a) => ({ ...a, gap: a.time - target.value }))
    .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap)),
)

const losers = computed(() => {
  const worst = Math.abs(ranking.value[0]?.gap ?? 0)
  return ranking.value.filter((r) => Math.abs(r.gap) === worst).map((r) => r.name)
})

const format = (seconds: number) => seconds.toFixed(2).replace('.', ',')
const formatGap = (gap: number) => `${gap >= 0 ? '+' : '−'}${format(Math.abs(gap))} s`

function start() {
  names.value = [...players.names]
  newRound()
}

function newRound() {
  // Cible entre 0,1 s et 10 s, au dixième
  target.value = randomInt(1, 100) / 10
  attempts.value = []
  current.value = 0
  phase.value = 'pass'
}

function ready() {
  warning.value = null
  phase.value = 'ready'
}

function go() {
  startedAt = performance.now()
  phase.value = 'running'
}

function stop() {
  if (phase.value !== 'running') return
  const time = (performance.now() - startedAt) / 1000
  vibrate(60)
  attempts.value.push({ name: currentName.value, time })
  current.value++
  phase.value = current.value < names.value.length ? 'pass' : 'results'
  swallowNextClick()
}

// Le chrono s'arrête au contact du doigt, mais le navigateur envoie aussi un « clic »
// au relâchement : sans ça, il appuierait sur le bouton apparu sous le doigt
// (« C'est moi », « Rejouer »…) et sauterait l'écran suivant.
function swallowNextClick() {
  const block = (e: Event) => {
    e.stopPropagation()
    e.preventDefault()
  }
  window.addEventListener('click', block, { capture: true, once: true })
  setTimeout(() => window.removeEventListener('click', block, { capture: true }), 700)
}

// Si l'appli passe en arrière-plan pendant le chrono, l'essai est annulé
function onVisibility() {
  if (document.visibilityState === 'hidden' && phase.value === 'running') {
    warning.value = "Essai annulé : l'appli est passée en arrière-plan. Recommence !"
    phase.value = 'ready'
  }
}
document.addEventListener('visibilitychange', onVisibility)
onBeforeUnmount(() => document.removeEventListener('visibilitychange', onVisibility))
</script>

<template>
  <div class="game-page" :style="accentStyle(game)">
    <PageHeader :title="game.name" back />

    <PlayersSetup v-if="phase === 'setup'" :min-players="game.minPlayers" @play="start" />

    <PassPhoneScreen
      v-else-if="phase === 'pass'"
      :name="currentName"
      :hint="`Joueur ${current + 1} sur ${names.length}`"
      @ready="ready"
    />

    <section v-else-if="phase === 'ready'" class="ready">
      <p class="label">{{ currentName }}, arrête le chrono à</p>
      <p class="target">{{ format(target) }}<small> s</small></p>
      <p class="explain">
        L'écran va devenir noir. Compte dans ta tête et appuie n'importe où pour arrêter.
      </p>
      <p v-if="warning" class="warning">{{ warning }}</p>
      <button type="button" class="btn btn--big" @click="go">Top départ</button>
    </section>

    <!-- Écran noir : on ne voit rien, on appuie n'importe où pour arrêter -->
    <div v-else-if="phase === 'running'" class="blind" @pointerdown.prevent="stop">
      <p>Appuie pour arrêter</p>
    </div>

    <LoserScreen v-else :losers="losers" @replay="newRound" @players="phase = 'setup'">
      <p class="label">Cible : {{ format(target) }} s</p>
      <ol class="ranking">
        <li v-for="r in ranking" :key="r.name" :class="{ worst: losers.includes(r.name) }">
          <span class="ranking__name">{{ r.name }}</span>
          <span class="ranking__time">{{ format(r.time) }} s</span>
          <span class="ranking__gap">{{ formatGap(r.gap) }}</span>
        </li>
      </ol>
    </LoserScreen>
  </div>
</template>

<style scoped>
.ready {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
}

.target {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 88px;
  line-height: 1;
  letter-spacing: -2px;
  color: var(--accent);
}

.target small {
  font-size: 32px;
}

.explain {
  max-width: 300px;
  font-size: 14px;
  color: var(--muted);
}

.warning {
  padding: 8px 16px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--danger) 15%, transparent);
  font-size: 13px;
  color: var(--danger);
}

.ready .btn {
  margin-top: 24px;
}

.blind {
  position: fixed;
  z-index: 50;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: max(32px, env(safe-area-inset-bottom));
  background: #000;
  touch-action: none;
  user-select: none;
  cursor: pointer;
}

.blind p {
  font-size: 13px;
  color: #333;
}

.ranking {
  width: 100%;
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

.ranking li {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  padding: 8px 16px;
  border-radius: 9999px;
  background: var(--surface-2);
  font-family: var(--font-display);
  font-weight: 600;
  text-align: left;
}

.ranking li.worst {
  background: color-mix(in srgb, var(--danger) 18%, var(--surface-2));
}

.ranking__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ranking__time {
  color: var(--muted);
  font-size: 14px;
}

.ranking__gap {
  min-width: 72px;
  text-align: right;
  color: var(--accent);
}

.worst .ranking__gap {
  color: var(--danger);
}
</style>
