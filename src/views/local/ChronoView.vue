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

// Écarts comparés au centième, comme à l'écran : deux « 0,21 s » sont ex æquo
const ranking = computed(() =>
  attempts.value
    .map((a) => {
      const gap = a.time - target.value
      return { ...a, gap, distance: Math.round(Math.abs(gap) * 100) }
    })
    .sort((a, b) => b.distance - a.distance),
)

// Le plus loin de la cible boit ; en cas d'égalité, tous les ex æquo boivent
const losers = computed(() => {
  const worst = ranking.value[0]?.distance ?? 0
  return ranking.value.filter((r) => r.distance === worst).map((r) => r.name)
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
  // Arrondi au centième : c'est la précision affichée et comparée
  const time = Math.round((performance.now() - startedAt) / 10) / 100
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
        Le temps sera caché. Compte dans ta tête et appuie sur le buzzer pour arrêter.
      </p>
      <p v-if="warning" class="warning">{{ warning }}</p>
      <button type="button" class="btn btn--big" @click="go">Top départ</button>
    </section>

    <!-- Temps caché : un buzzer à frapper (tout l'écran réagit, pour ne pas rater l'appui) -->
    <div v-else-if="phase === 'running'" class="blind" @pointerdown.prevent="stop">
      <p class="label blind__name">{{ currentName }}</p>
      <div class="buzzer" aria-hidden="true">
        <span class="buzzer__cap">STOP</span>
      </div>
      <div class="dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p class="blind__hint">Appuie pour arrêter le chrono</p>
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  padding: max(24px, env(safe-area-inset-top)) 16px max(24px, env(safe-area-inset-bottom));
  background: radial-gradient(
    circle at 50% 45%,
    color-mix(in srgb, var(--accent) 14%, var(--bg)) 0%,
    var(--bg-deep) 70%
  );
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  cursor: pointer;
  animation: fade-in 0.2s ease-out;
}

.blind__name {
  font-size: 13px;
  color: var(--muted);
}

/* Gros buzzer vert, qui « respire » pour montrer que ça tourne */
.buzzer {
  display: flex;
  align-items: center;
  justify-content: center;
  width: min(64vw, 240px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #b8ffc9 0%, var(--primary) 35%, #00a845 100%);
  box-shadow:
    0 14px 0 #006b2c,
    0 18px 40px rgba(0, 0, 0, 0.6),
    0 0 0 10px color-mix(in srgb, var(--primary) 18%, transparent),
    inset 0 -10px 20px rgba(0, 60, 20, 0.45);
  animation: breathe 1.6s ease-in-out infinite;
}

.buzzer__cap {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 34px;
  letter-spacing: 2px;
  color: var(--on-primary);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.35);
}

@keyframes breathe {
  0%,
  100% {
    transform: scale(1);
    box-shadow:
      0 14px 0 #006b2c,
      0 18px 40px rgba(0, 0, 0, 0.6),
      0 0 0 10px color-mix(in srgb, var(--primary) 18%, transparent),
      inset 0 -10px 20px rgba(0, 60, 20, 0.45);
  }
  50% {
    transform: scale(1.03);
    box-shadow:
      0 14px 0 #006b2c,
      0 18px 40px rgba(0, 0, 0, 0.6),
      0 0 0 22px color-mix(in srgb, var(--primary) 8%, transparent),
      inset 0 -10px 20px rgba(0, 60, 20, 0.45);
  }
}

/* Trois points qui flottent, décalés : le temps passe sans être affiché */
.dots {
  display: flex;
  gap: 14px;
  height: 28px;
  align-items: flex-end;
}

.dots span {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--accent);
  animation: float 1.2s ease-in-out infinite;
}

.dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  50% {
    transform: translateY(-14px);
    opacity: 1;
  }
}

.blind__hint {
  font-size: 13px;
  color: var(--muted);
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
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
