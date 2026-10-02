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

const sending = ref(false)
const message = ref<string | null>(null)
const error = ref<string | null>(null)

onMounted(() => {
  // Si on était dans un salon, on s'y reconnecte pour retrouver le jeu photo
  if (room.lastRoom()) room.connect()
})

async function shoot(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  sending.value = true
  message.value = error.value = null
  try {
    await room.uploadPhoto(await resizedJpeg(file))
    vibrate(80)
    message.value = 'Photo envoyée ! 🤫'
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    sending.value = false
  }
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
        <label class="btn btn--big shoot" :class="{ busy: sending }">
          📸 {{ sending ? 'Envoi…' : `Prendre ${target?.pseudo ?? ''} en photo` }}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            :disabled="sending"
            @change="shoot"
          />
        </label>
        <p class="count">Tu en as pris {{ myCount }}</p>
      </template>

      <p v-if="message" class="message">{{ message }}</p>
      <p v-if="error" class="error" role="alert">{{ error }}</p>

      <section v-if="photosNewestFirst.length" class="gallery">
        <h2>Galerie ({{ photosNewestFirst.length }})</h2>
        <div class="gallery__grid">
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

.shoot.busy {
  opacity: 0.6;
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
