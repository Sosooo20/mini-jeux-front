<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import PlayersSetup from '@/components/PlayersSetup.vue'
import LoserScreen from '@/components/LoserScreen.vue'
import { usePlayersStore } from '@/stores/players'
import { GAMES, accentStyle } from '@/lib/games'
import { randomInt } from '@/composables/useRandom'
import { useWakeLock } from '@/composables/useWakeLock'
import { vibrate } from '@/composables/useVibrate'
import { playExplosion, playTick, unlockAudio } from '@/composables/useSound'

const game = GAMES.bombe
const MIN_SECONDS = 15
const MAX_SECONDS = 60

const players = usePlayersStore()

const phase = ref<'setup' | 'category' | 'armed' | 'boom' | 'result'>('setup')
const names = ref<string[]>([])
const category = ref('')
const passes = ref(0)
const tickInterval = ref(1000)
const loser = ref('')
let endAt = 0
let timer: ReturnType<typeof setTimeout> | undefined

useWakeLock(computed(() => phase.value !== 'setup'))

function start() {
  names.value = [...players.names]
  phase.value = 'category'
}

function arm() {
  if (!category.value.trim()) return
  // Le son doit être débloqué pendant un appui (iPhone)
  unlockAudio()
  endAt = performance.now() + randomInt(MIN_SECONDS, MAX_SECONDS) * 1000
  passes.value = 0
  phase.value = 'armed'
  tick()
}

// Tic-tac qui accélère sur la fin, sans révéler la durée exacte
function tick() {
  const remaining = endAt - performance.now()
  if (remaining <= 0) return explode()
  playTick()
  tickInterval.value = remaining > 10_000 ? 1000 : remaining > 4000 ? 500 : 250
  timer = setTimeout(tick, Math.min(tickInterval.value, remaining))
}

function pass() {
  passes.value++
  vibrate(30)
}

function explode() {
  clearTimeout(timer)
  if (phase.value !== 'armed') return
  playExplosion()
  vibrate([400, 100, 400])
  phase.value = 'boom'
}

function chooseLoser(name: string) {
  loser.value = name
  phase.value = 'result'
}

// Les minuteurs sont ralentis en arrière-plan : au retour, on vérifie si elle a explosé
function onVisibility() {
  if (document.visibilityState === 'visible' && phase.value === 'armed') {
    if (performance.now() >= endAt) explode()
  }
}
document.addEventListener('visibilitychange', onVisibility)

onBeforeUnmount(() => {
  clearTimeout(timer)
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<template>
  <div class="game-page" :style="accentStyle(game)">
    <PageHeader :title="game.name" back />

    <PlayersSetup v-if="phase === 'setup'" :min-players="game.minPlayers" @play="start" />

    <form v-else-if="phase === 'category'" class="category" @submit.prevent="arm">
      <section class="card category__card">
        <label for="category" class="category__label">Catégorie</label>
        <p class="category__help">
          Chacun son tour, il faut citer quelque chose de cette catégorie avant de passer le
          téléphone.
        </p>
        <input
          id="category"
          v-model="category"
          maxlength="60"
          placeholder="Ex. : des pays, des marques de voiture…"
          autocomplete="off"
          enterkeyhint="go"
        />
      </section>
      <button type="submit" class="btn btn--big" :disabled="!category.trim()">
        Amorcer la bombe
      </button>
      <button type="button" class="btn btn--ghost" @click="phase = 'setup'">
        Changer les joueurs
      </button>
    </form>

    <section v-else-if="phase === 'armed'" class="armed">
      <p class="label">Cite</p>
      <p class="armed__category">{{ category }}</p>
      <p class="armed__bomb" :style="{ animationDuration: `${tickInterval}ms` }" aria-hidden="true">
        💣
      </p>
      <p class="armed__passes">{{ passes }} passe{{ passes > 1 ? 's' : '' }}</p>
      <button type="button" class="btn btn--big pass-btn" @click="pass">
        J'ai répondu → je passe
      </button>
    </section>

    <section v-else-if="phase === 'boom'" class="boom">
      <p class="boom__title">BOUM !</p>
      <p class="label boom__question">Qui avait la bombe ?</p>
      <div class="boom__players">
        <button
          v-for="name in names"
          :key="name"
          type="button"
          class="btn btn--ghost"
          @click="chooseLoser(name)"
        >
          {{ name }}
        </button>
      </div>
    </section>

    <LoserScreen v-else :losers="[loser]" @replay="phase = 'category'" @players="phase = 'setup'">
      <p class="recap">
        La bombe a explosé après {{ passes }} passe{{ passes > 1 ? 's' : '' }} sur «
        {{ category }} ».
      </p>
    </LoserScreen>
  </div>
</template>

<style scoped>
.category {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category__card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 8px;
}

.category__label {
  padding: 0 4px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 22px;
  line-height: 28px;
}

.category__help {
  padding: 0 4px;
  font-size: 13px;
  line-height: 20px;
  color: var(--muted);
}

.category .btn--big {
  margin-top: auto;
}

.armed {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.armed__category {
  max-width: 100%;
  overflow-wrap: anywhere;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 34px;
  line-height: 1.15;
  text-transform: uppercase;
  color: var(--accent);
}

.armed__bomb {
  margin: 24px 0 8px;
  font-size: 120px;
  line-height: 1;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
}

.armed__passes {
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--muted);
}

.pass-btn {
  margin-top: auto;
  min-height: 120px;
  border-radius: 40px;
  font-size: 20px;
}

.boom {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 16px;
  border-radius: var(--radius-lg);
  background: radial-gradient(circle at 50% 20%, #ff5a4a 0%, #8f0010 70%);
  box-shadow: 0 0 60px rgba(255, 90, 74, 0.5);
  animation: flash 0.6s ease-out;
}

@keyframes flash {
  0% {
    transform: scale(1.06);
    filter: brightness(2.5);
  }
  100% {
    transform: scale(1);
    filter: brightness(1);
  }
}

.boom__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 72px;
  line-height: 1;
  color: #fff;
}

.boom__question {
  color: #ffe0dc;
}

.boom__players {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.boom__players .btn {
  text-transform: none;
  font-size: 16px;
}

.recap {
  max-width: 320px;
  overflow-wrap: anywhere;
  font-size: 14px;
  color: var(--muted);
}
</style>
