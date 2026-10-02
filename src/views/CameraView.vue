<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import PlayerAvatar from '@/components/PlayerAvatar.vue'
import ConnectionBanner from '@/components/online/ConnectionBanner.vue'
import { resizedJpeg } from '@/lib/image'
import { useRoomStore } from '@/stores/room'
import { vibrate } from '@/composables/useVibrate'

/** Jeu photo : accessible partout dans l'appli via la barre du bas */
const room = useRoomStore()

const photo = computed(() => room.view?.photo ?? null)
const me = computed(() => room.view?.me ?? '')
const target = computed(() => (photo.value ? room.playerById(photo.value.targetId) : null))
const iAmTarget = computed(() => photo.value?.targetId === me.value)
const myCount = computed(() => photo.value?.counts[me.value] ?? 0)
const photosNewestFirst = computed(() => [...(photo.value?.photos ?? [])].reverse())

const message = ref<string | null>(null)
const error = ref<string | null>(null)

/** Photos prises mais pas encore confirmées par le serveur (affichées tout de suite) */
interface PendingShot {
  id: number
  /** Aperçu de la photo préparée (null tant qu'elle est en préparation) */
  url: string | null
  state: 'preparing' | 'sending' | 'error'
}
const pendingShots = ref<PendingShot[]>([])
let nextShot = 0
/** Les envois partent un par un (le serveur refuse 2 photos à moins de 2 s d'écart) */
let queue: Promise<void> = Promise.resolve()
let lastUpload = 0
const COOLDOWN_MS = 2100

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function updateShot(id: number, patch: Partial<PendingShot>) {
  const shot = pendingShots.value.find((s) => s.id === id)
  if (shot) Object.assign(shot, patch)
}

function removeShot(id: number) {
  const shot = pendingShots.value.find((s) => s.id === id)
  if (shot?.url) URL.revokeObjectURL(shot.url)
  pendingShots.value = pendingShots.value.filter((s) => s.id !== id)
}

onMounted(() => {
  // Si on était dans un salon, on s'y reconnecte pour retrouver le jeu photo
  if (room.lastRoom()) room.connect()
})

/**
 * On n'attend rien : la photo apparaît tout de suite dans la galerie (« envoi… »),
 * la préparation se fait dans un worker et l'envoi en arrière-plan.
 */
function shoot(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  message.value = error.value = null
  vibrate(30)

  const id = nextShot++
  pendingShots.value.unshift({ id, url: null, state: 'preparing' })
  const prepared = resizedJpeg(file)
  prepared
    .then((jpeg) => updateShot(id, { url: URL.createObjectURL(jpeg), state: 'sending' }))
    .catch(() => {})

  queue = queue.then(async () => {
    try {
      const jpeg = await prepared
      const wait = lastUpload + COOLDOWN_MS - Date.now()
      if (wait > 0) await sleep(wait)
      await room.uploadPhoto(jpeg)
      lastUpload = Date.now()
      vibrate(80)
      message.value = 'Photo envoyée ! 🤫'
      removeShot(id)
    } catch (e) {
      updateShot(id, { state: 'error' })
      error.value = (e as Error).message
    }
  })
}
</script>

<template>
  <div class="game-page">
    <PageHeader title="Appareil photo" />
    <ConnectionBanner v-if="room.lastRoom()" />

    <section v-if="!room.view" class="card empty">
      <p>Le jeu photo se joue dans un salon en ligne : rejoins-en un, puis l'hôte lance le jeu.</p>
      <RouterLink :to="{ name: 'online' }" class="btn">Jouer en ligne</RouterLink>
    </section>

    <section v-else-if="!photo" class="card empty">
      <p>Le jeu photo n'est pas encore lancé dans le salon {{ room.view.code }}.</p>
      <RouterLink :to="{ name: 'room', params: { code: room.view.code } }" class="btn btn--ghost">
        Aller au salon
      </RouterLink>
    </section>

    <template v-else>
      <section class="card target">
        <PlayerAvatar :name="target?.pseudo ?? '?'" :src="target?.avatarUrl" :size="72" />
        <div>
          <p class="label">Cible</p>
          <p class="target__name">{{ target?.pseudo ?? '?' }}</p>
        </div>
      </section>

      <section v-if="photo.result" class="card result">
        <p v-if="photo.result.winners.length">
          🏆 <strong>{{ photo.result.winners.map(room.nameOf).join(', ') }}</strong> gagne
        </p>
        <p>
          🍺 <strong>{{ photo.result.losers.map(room.nameOf).join(', ') }}</strong> boit
        </p>
      </section>
      <p v-else-if="iAmTarget" class="card warn">C'est toi la cible 👀 Méfie-toi des téléphones…</p>
      <template v-else>
        <label class="btn btn--big shoot">
          📸 Prendre {{ target?.pseudo ?? '' }} en photo
          <input type="file" accept="image/*" capture="environment" hidden @change="shoot" />
        </label>
        <p class="count">
          Tu en as pris {{ myCount }}
          <template v-if="pendingShots.length">
            · {{ pendingShots.length }} en cours d'envoi</template
          >
        </p>
      </template>

      <p v-if="message" class="message">{{ message }}</p>
      <p v-if="error" class="error" role="alert">{{ error }}</p>

      <section v-if="photosNewestFirst.length || pendingShots.length" class="gallery">
        <h2>Galerie ({{ photosNewestFirst.length }})</h2>
        <div class="gallery__grid">
          <!-- Mes photos en cours d'envoi, affichées sans attendre le serveur -->
          <figure
            v-for="s in pendingShots"
            :key="`pending-${s.id}`"
            class="pending"
            :class="s.state"
            @click="s.state === 'error' && removeShot(s.id)"
          >
            <div class="pending__tile">
              <img v-if="s.url" :src="s.url" alt="" />
              <span v-if="s.state !== 'error'" class="pending__spinner" aria-hidden="true" />
              <span v-else class="pending__error" aria-hidden="true">⚠️</span>
            </div>
            <figcaption>
              {{
                s.state === 'preparing'
                  ? 'Préparation…'
                  : s.state === 'sending'
                    ? 'Envoi…'
                    : 'Échec (toucher pour retirer)'
              }}
            </figcaption>
          </figure>
          <figure v-for="p in photosNewestFirst" :key="p.id">
            <a :href="p.url" target="_blank" rel="noopener">
              <img :src="p.url" alt="" loading="lazy" />
            </a>
            <figcaption>{{ room.nameOf(p.by) }}</figcaption>
          </figure>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: var(--muted);
}

.target {
  display: flex;
  align-items: center;
  gap: 16px;
}

.target__name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 28px;
  color: var(--accent);
}

.result p,
.warn {
  font-family: var(--font-display);
  font-weight: 600;
}

.result strong {
  color: var(--accent);
}

.shoot {
  min-height: 96px;
  font-size: 18px;
  text-transform: none;
  cursor: pointer;
}

.pending__tile {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 12px;
  background: var(--surface-2);
}

.pending__tile img {
  position: absolute;
  inset: 0;
  opacity: 0.55;
}

.pending__spinner {
  position: relative;
  width: 24px;
  height: 24px;
  border: 3px solid var(--accent);
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.pending__error {
  position: relative;
  font-size: 24px;
}

.pending.error {
  cursor: pointer;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.count,
.message {
  text-align: center;
  font-size: 14px;
  color: var(--muted);
}

.message {
  color: var(--accent);
}

.error {
  text-align: center;
  font-size: 14px;
  color: var(--danger);
}

.gallery {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.gallery h2 {
  padding: 0 4px;
  font-size: 20px;
}

.gallery__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

figure {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

figure img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 12px;
  background: var(--surface-2);
}

figcaption {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  color: var(--muted);
}
</style>
