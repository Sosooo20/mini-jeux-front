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
const COLORS = ['#c0c1ff', '#4ae176', '#ffb4ab', '#f751a1', '#6bff8f', '#ffd166']

const players = usePlayersStore()

const phase = ref<'setup' | 'play'>('setup')
const names = ref<string[]>([])
const rotation = ref(0)
const spinning = ref(false)
const chosen = ref<string | null>(null)
const excludeLast = ref(false)
let finishTimer: ReturnType<typeof setTimeout> | undefined
let pendingWinner: string | null = null

useWakeLock(computed(() => phase.value === 'play'))

const step = computed(() => 360 / names.value.length)

/** Point du bord de la roue à un angle donné (0° = en haut, sens horaire). */
function point(angle: number, radius = 100) {
  const rad = (angle * Math.PI) / 180
  return `${(radius * Math.sin(rad)).toFixed(3)} ${(-radius * Math.cos(rad)).toFixed(3)}`
}

const slices = computed(() =>
  names.value.map((name, i) => {
    const start = i * step.value
    const end = start + step.value
    let color = COLORS[i % COLORS.length]
    // Évite deux parts voisines de la même couleur entre la dernière et la première
    if (i === names.value.length - 1 && i % COLORS.length === 0) color = COLORS[2]
    return {
      name,
      label: name.length > 10 ? `${name.slice(0, 9)}…` : name,
      color,
      path: `M0 0 L${point(start)} A100 100 0 ${step.value > 180 ? 1 : 0} 1 ${point(end)} Z`,
      center: start + step.value / 2,
    }
  }),
)

function start() {
  names.value = [...players.names]
  rotation.value = 0
  chosen.value = null
  phase.value = 'play'
}

function spin() {
  if (spinning.value) return
  unlockAudio()

  const candidates =
    excludeLast.value && chosen.value && names.value.length > 2
      ? names.value.filter((n) => n !== chosen.value)
      : names.value

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
          <g v-for="slice in slices" :key="slice.name">
            <path :d="slice.path" :fill="slice.color" stroke="#0b1326" stroke-width="1.2" />
            <text
              :transform="`rotate(${slice.center}) translate(0 -58) rotate(90)`"
              text-anchor="middle"
              dominant-baseline="central"
              class="wheel__label"
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

      <label v-if="names.length > 2" class="option">
        <input v-model="excludeLast" type="checkbox" />
        Exclure le dernier désigné
      </label>

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
  fill: #0b1326;
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
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 44px;
  font-size: 14px;
  color: var(--muted);
}

.option input {
  width: 22px;
  min-height: 22px;
  height: 22px;
  accent-color: var(--accent);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
}
</style>
