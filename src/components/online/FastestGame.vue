<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import PlayerAvatar from '@/components/PlayerAvatar.vue'
import { FASTEST_TIMEOUT_MS, type FastestTap, type FastestView } from '@/lib/protocol'
import { useRoomStore } from '@/stores/room'
import { vibrate } from '@/composables/useVibrate'

const props = defineProps<{ game: FastestView }>()
const room = useRoomStore()
const error = ref<string | null>(null)

/** Moment (horloge du téléphone) où le bouton est réellement apparu à l'écran */
let shownAt: number | null = null
let lateTimer: ReturnType<typeof setTimeout> | undefined
/** Appui affiché tout de suite, sans attendre la réponse du serveur */
const localTap = ref<FastestTap | null>(null)
const tooLate = ref(false)

const roundId = computed(() => ('roundId' in props.game ? props.game.roundId : null))
const playing = computed(() => ('playing' in props.game ? props.game.playing : false))
const mine = computed(() => localTap.value ?? ('mine' in props.game ? props.game.mine : null))

// Nouvelle manche : on oublie l'appui précédent
watch(roundId, () => {
  localTap.value = null
  tooLate.value = false
  shownAt = null
  clearTimeout(lateTimer)
})

watch(
  () => props.game.phase,
  async (phase) => {
    if (phase !== 'go') return
    // Le chrono démarre quand le bouton est vraiment dessiné, pas à la réception du message
    await nextTick()
    shownAt = performance.now()
    if (playing.value && !mine.value) vibrate(120)
    // Recalé sur l'image suivante (celle qui affiche le bouton), si personne n'a encore appuyé
    requestAnimationFrame(() => {
      if (!mine.value) shownAt = performance.now()
    })
    lateTimer = setTimeout(() => (tooLate.value = true), FASTEST_TIMEOUT_MS)
  },
  { immediate: true },
)

// ---------- Décompte « 3, 2, 1 » ----------
const now = ref(room.serverNow())
let ticker: ReturnType<typeof setInterval> | undefined
onMounted(() => (ticker = setInterval(() => (now.value = room.serverNow()), 100)))
onBeforeUnmount(() => {
  clearInterval(ticker)
  clearTimeout(lateTimer)
})
const countdown = computed(() =>
  props.game.phase === 'countdown'
    ? Math.max(1, Math.ceil((props.game.deadline - now.value) / 1000))
    : 0,
)

// ---------- Appui ----------
async function press() {
  const g = props.game
  if ((g.phase !== 'waiting' && g.phase !== 'go') || !g.playing || mine.value || tooLate.value)
    return
  if (g.phase === 'go' && shownAt === null) return

  const early = g.phase === 'waiting'
  const reactionMs = early ? undefined : Math.round(performance.now() - shownAt!)
  localTap.value = early ? { status: 'early', ms: null } : { status: 'ok', ms: reactionMs! }
  vibrate(early ? [60, 40, 60] : 30)
  error.value = null
  try {
    await room.tapFastest(
      early ? { roundId: g.roundId, early } : { roundId: g.roundId, reactionMs },
    )
  } catch (e) {
    error.value = (e as Error).message
  }
}

// ---------- Résultats ----------
const STATUS_LABEL = { early: 'Faux départ 🙈', timeout: 'Trop lent 🐢' } as const

const ROASTS = [
  'Même ta grand-mère a appuyé avant toi.',
  'Tu dormais ou tu réfléchissais ?',
  'Le bouton t’attend encore…',
  'Réflexes de paresseux, gorgée de champion.',
  'Il faut boire pour se réveiller !',
  'Un escargot sous somnifères, ce serait toi.',
]
const roast = computed(() =>
  props.game.phase === 'results' ? ROASTS[(props.game.round * 7) % ROASTS.length] : '',
)

const defeatsTable = computed(() => {
  if (props.game.phase !== 'final') return []
  const defeats = props.game.defeats
  return (room.view?.players ?? [])
    .map((p) => ({ id: p.id, n: defeats[p.id] ?? 0 }))
    .sort((a, b) => b.n - a.n)
})
</script>

<template>
  <!-- Pendant la manche, tout l'écran de jeu est la zone à toucher -->
  <section
    v-if="game.phase === 'countdown' || game.phase === 'waiting' || game.phase === 'go'"
    class="zone"
    :class="[`zone--${game.phase}`, { 'zone--done': mine }]"
    @pointerdown="press"
    @contextmenu.prevent
  >
    <p class="zone__round">Manche {{ game.round }}</p>

    <template v-if="!playing">
      <p class="zone__big">👀</p>
      <p class="zone__hint">Tu regardes cette manche, tu joueras à la suivante.</p>
    </template>

    <template v-else-if="game.phase === 'countdown'">
      <p class="zone__big zone__count">{{ countdown }}</p>
      <p class="zone__hint">Prépare ton doigt… mais ne touche pas avant le bouton !</p>
    </template>

    <template v-else-if="mine?.status === 'early'">
      <p class="zone__big">🙈</p>
      <p class="zone__title">Trop tôt !</p>
      <p class="zone__hint">Faux départ : tu as perdu cette manche.</p>
    </template>

    <template v-else-if="mine">
      <p class="zone__big zone__ms">{{ mine.ms }} ms</p>
      <p class="zone__hint">
        En attente des autres… ({{ game.phase === 'go' ? game.tapped.length : 0 }} ont appuyé)
      </p>
    </template>

    <template v-else-if="game.phase === 'waiting'">
      <p class="zone__title">Attends…</p>
      <p class="zone__hint">Le bouton va apparaître. Touche à ce moment-là, pas avant.</p>
    </template>

    <template v-else-if="tooLate">
      <p class="zone__big">🐢</p>
      <p class="zone__title">Trop tard !</p>
    </template>

    <p v-else class="zone__go">APPUIE !</p>
  </section>

  <template v-else-if="game.phase === 'results'">
    <section class="loser">
      <p class="loser__emoji" aria-hidden="true">🍺</p>
      <template v-if="game.losers.length">
        <p class="loser__names">{{ game.losers.map(room.nameOf).join(', ') }}</p>
        <p class="loser__verb">{{ game.losers.length > 1 ? 'boivent' : 'boit' }} !</p>
        <p class="loser__roast">{{ roast }}</p>
      </template>
      <p v-else class="loser__names">Personne n'a joué…</p>
    </section>

    <ol class="ranking">
      <li
        v-for="r in game.ranking"
        :key="r.playerId"
        :class="{ worst: game.losers.includes(r.playerId) }"
      >
        <PlayerAvatar
          :name="room.nameOf(r.playerId)"
          :src="room.playerById(r.playerId)?.avatarUrl ?? null"
          :size="32"
        />
        <span class="ranking__name">{{ room.nameOf(r.playerId) }}</span>
        <span>{{ r.status === 'ok' ? `${r.ms} ms` : STATUS_LABEL[r.status] }}</span>
      </li>
    </ol>
  </template>

  <template v-else-if="game.phase === 'final'">
    <section class="loser">
      <p class="label">Après {{ game.rounds }} manche{{ game.rounds > 1 ? 's' : '' }}</p>
      <p class="loser__emoji" aria-hidden="true">🍺</p>
      <template v-if="game.losers.length">
        <p class="loser__names">{{ game.losers.map(room.nameOf).join(', ') }}</p>
        <p class="loser__verb">{{ game.losers.length > 1 ? 'boivent' : 'boit' }} !</p>
      </template>
    </section>
    <ol class="ranking">
      <li v-for="d in defeatsTable" :key="d.id" :class="{ worst: game.losers.includes(d.id) }">
        <PlayerAvatar
          :name="room.nameOf(d.id)"
          :src="room.playerById(d.id)?.avatarUrl ?? null"
          :size="32"
        />
        <span class="ranking__name">{{ room.nameOf(d.id) }}</span>
        <span>{{ d.n }} défaite{{ d.n > 1 ? 's' : '' }}</span>
      </li>
    </ol>
  </template>

  <p v-if="error" class="error" role="alert">{{ error }}</p>
</template>

<style scoped>
.zone {
  flex: 1;
  min-height: calc(100dvh - 300px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px 16px;
  border-radius: 32px;
  background: var(--surface);
  text-align: center;
  /* Pas de zoom au double appui, pas de sélection, pas de surbrillance au toucher */
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
}

.zone--waiting {
  background: #05070d;
}

.zone--go {
  background: var(--primary);
  color: #003915;
}

.zone--done {
  background: var(--surface);
  color: var(--text);
}

.zone__round {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0.6;
}

.zone__big {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 72px;
  line-height: 1;
}

.zone__count {
  font-size: 120px;
  color: var(--accent);
}

.zone__ms {
  font-size: 56px;
  color: var(--accent);
}

.zone__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 34px;
}

.zone__hint {
  max-width: 280px;
  font-size: 14px;
  color: var(--muted);
}

.zone__go {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 64px;
  line-height: 1;
}

.loser {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.loser__emoji {
  font-size: 56px;
}

.loser__names {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 34px;
  line-height: 1.15;
  overflow-wrap: anywhere;
  color: var(--accent);
}

.loser__verb {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
  text-transform: uppercase;
}

.loser__roast {
  margin-top: 4px;
  font-size: 14px;
  color: var(--muted);
}

.ranking {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ranking li {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 6px 16px 6px 6px;
  border-radius: 9999px;
  background: var(--surface-2);
  font-family: var(--font-display);
  font-weight: 600;
}

.ranking li.worst {
  background: color-mix(in srgb, var(--danger) 22%, var(--surface-2));
  color: var(--danger);
}

.ranking__name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.error {
  text-align: center;
  font-size: 14px;
  color: var(--danger);
}
</style>
