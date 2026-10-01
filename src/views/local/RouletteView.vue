<script setup lang="ts">
import { computed, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import PlayersSetup from '@/components/PlayersSetup.vue'
import { usePlayersStore } from '@/stores/players'
import { GAMES, accentStyle } from '@/lib/games'
import { pick, randomBetween } from '@/composables/useRandom'
import { useWakeLock } from '@/composables/useWakeLock'
import { vibrate } from '@/composables/useVibrate'
import { playDing, unlockAudio } from '@/composables/useSound'

const game = GAMES.roulette
const SPIN_MS = 4500
// Couleurs des jeux de l'accueil, en dégradé comme les cartes
const COLORS = ['#c0c1ff', '#4ae176', '#ffb4ab', '#f751a1']

const players = usePlayersStore()

const phase = ref<'setup' | 'play'>('setup')
const names = ref<string[]>([])
const rotation = ref(0)
const spinning = ref(false)
const chosen = ref<string | null>(null)
const excludeLast = ref(false)
/** Dernier joueur désigné, exclu du tirage suivant si l'option est active */
const lastPicked = ref<string | null>(null)
let finishTimer: ReturnType<typeof setTimeout> | undefined
let pendingWinner: string | null = null

useWakeLock(computed(() => phase.value === 'play'))

const step = computed(() => 360 / names.value.length)

const excluded = computed(() =>
  excludeLast.value && lastPicked.value && names.value.length > 2 ? lastPicked.value : null,
)

/** Point du bord de la roue à un angle donné (0° = en haut, sens horaire). */
function point(angle: number, radius = 100) {
  const rad = (angle * Math.PI) / 180
  return `${(radius * Math.sin(rad)).toFixed(3)} ${(-radius * Math.cos(rad)).toFixed(3)}`
}

const slices = computed(() =>
  names.value.map((name, i) => {
    const start = i * step.value
    const end = start + step.value
    let color = COLORS[i % COLORS.length]!
    // Évite deux parts voisines de la même couleur entre la dernière et la première
    if (i > 0 && i === names.value.length - 1 && color === COLORS[0]) {
      const previous = COLORS[(i - 1) % COLORS.length]
      color = COLORS.find((c) => c !== COLORS[0] && c !== previous)!
    }
    const center = start + step.value / 2
    return {
      name,
      label: name.length > 10 ? `${name.slice(0, 9)}…` : name,
      color,
      path: `M0 0 L${point(start)} A100 100 0 ${step.value > 180 ? 1 : 0} 1 ${point(end)} Z`,
      center,
      // Le dégradé part du centre (sombre) vers le bord (couleur vive)
      rim: point(center).split(' '),
    }
  }),
)

function start() {
  names.value = [...players.names]
  rotation.value = 0
  chosen.value = null
  lastPicked.value = null
  phase.value = 'play'
}

function spin() {
  if (spinning.value) return
  unlockAudio()

  const candidates = excluded.value ? names.value.filter((n) => n !== excluded.value) : names.value

  // On tire le joueur d'abord, puis on calcule l'angle pour que la roue s'arrête dessus
  const winner = pick(candidates)
  const index = names.value.indexOf(winner)
  const target = index * step.value + step.value / 2 + randomBetween(-0.35, 0.35) * step.value
  const current = rotation.value
  rotation.value = current - (current % 360) + 360 * 6 + ((360 - target) % 360)

  chosen.value = null
  spinning.value = true
  pendingWinner = winner
  // Filet de sécurité si `transitionend` ne se déclenche pas (onglet en arrière-plan)
  finishTimer = setTimeout(() => finish(winner), SPIN_MS + 200)
}

function finish(winner = pendingWinner) {
  if (!spinning.value || !winner) return
  clearTimeout(finishTimer)
  spinning.value = false
  chosen.value = winner
  lastPicked.value = winner
  pendingWinner = null
  vibrate(200)
  playDing()
}
</script>

<template>
  <div class="game-page" :style="accentStyle(game)">
    <PageHeader :title="game.name" back />

    <PlayersSetup v-if="phase === 'setup'" :min-players="game.minPlayers" @play="start" />

    <template v-else>
      <div class="wheel-wrap">
        <div class="pointer" aria-hidden="true" />
        <svg
          class="wheel"
          :class="{ spinning }"
          viewBox="-100 -100 200 200"
          :style="{ transform: `rotate(${rotation}deg)`, transitionDuration: `${SPIN_MS}ms` }"
          role="img"
          :aria-label="`Roue avec ${names.length} joueurs`"
          @transitionend="finish()"
        >
          <defs>
            <linearGradient
              v-for="(slice, i) in slices"
              :id="`slice-${i}`"
              :key="slice.name"
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              :x2="slice.rim[0]"
              :y2="slice.rim[1]"
            >
              <stop offset="0" :stop-color="slice.color" stop-opacity="0.05" />
              <stop offset="0.55" :stop-color="slice.color" stop-opacity="0.3" />
              <stop offset="1" :stop-color="slice.color" stop-opacity="0.85" />
            </linearGradient>
          </defs>
          <circle r="100" fill="#131b2e" />
          <g
            v-for="(slice, i) in slices"
            :key="slice.name"
            class="slice"
            :class="{ 'slice--excluded': slice.name === excluded }"
          >
            <path :d="slice.path" :fill="`url(#slice-${i})`" stroke="#0b1326" stroke-width="1.5" />
            <text
              :transform="`rotate(${slice.center}) translate(0 -58) rotate(90)`"
              text-anchor="middle"
              dominant-baseline="central"
              class="wheel__label"
              :fill="slice.color"
            >
              {{ slice.label }}
            </text>
          </g>
          <circle r="14" fill="#0b1326" />
          <circle r="7" fill="var(--accent)" />
        </svg>
      </div>

      <p class="result" aria-live="polite">
        <template v-if="chosen">
          <span class="label">Le destin a choisi</span>
          <strong>{{ chosen }}</strong>
        </template>
        <span v-else-if="spinning" class="label">Ça tourne…</span>
        <span v-else class="label">Qui sera l'élu ?</span>
      </p>

      <div v-if="names.length > 2" class="option">
        <button
          type="button"
          role="switch"
          class="switch"
          :aria-checked="excludeLast"
          @click="excludeLast = !excludeLast"
        >
          <span class="switch__track"><span class="switch__thumb" /></span>
          Exclure le dernier désigné
        </button>
        <p v-if="excluded" class="option__hint">
          {{ excluded }} ne peut pas être tiré au prochain tour
        </p>
      </div>

      <div class="actions">
        <button type="button" class="btn btn--big" :disabled="spinning" @click="spin">
          {{ chosen ? 'Relancer' : 'Tourner' }}
        </button>
        <button type="button" class="btn btn--ghost" :disabled="spinning" @click="phase = 'setup'">
          Changer les joueurs
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.wheel-wrap {
  position: relative;
  /* Reste dans l'écran même sur un téléphone peu haut */
  width: min(100%, 340px, 38dvh);
  margin: 8px auto 0;
  aspect-ratio: 1;
}

.pointer {
  position: absolute;
  z-index: 1;
  top: -6px;
  left: 50%;
  width: 0;
  height: 0;
  transform: translateX(-50%);
  border-left: 14px solid transparent;
  border-right: 14px solid transparent;
  border-top: 26px solid var(--text);
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5));
}

.wheel {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  box-shadow:
    0 0 0 6px var(--surface-2),
    0 12px 40px color-mix(in srgb, var(--accent) 30%, transparent);
}

.wheel.spinning {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.15, 0.6, 0.1, 1);
}

.wheel__label {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 9px;
  paint-order: stroke;
  stroke: #0b1326;
  stroke-width: 2px;
}

.slice {
  transition: opacity 0.3s;
}

/* Joueur exclu du prochain tirage */
.slice--excluded {
  opacity: 0.25;
}

.result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-height: 72px;
  text-align: center;
}

.result strong {
  max-width: 100%;
  overflow-wrap: anywhere;
  font-family: var(--font-display);
  font-size: 36px;
  line-height: 1.1;
  color: var(--accent);
}

.option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.switch {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  padding: 0 8px;
  border: none;
  background: none;
  font-size: 14px;
  color: var(--muted);
  cursor: pointer;
  touch-action: manipulation;
}

.switch__track {
  position: relative;
  width: 48px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 9999px;
  background: var(--surface-3);
  transition: background 0.2s;
}

.switch__thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--text);
  transition: transform 0.2s;
}

.switch[aria-checked='true'] {
  color: var(--text);
}

.switch[aria-checked='true'] .switch__track {
  background: var(--accent);
}

.switch[aria-checked='true'] .switch__thumb {
  transform: translateX(20px);
  background: var(--on-accent);
}

.option__hint {
  font-size: 12px;
  color: var(--accent);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
}
</style>
