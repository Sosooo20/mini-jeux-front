<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import PlayerAvatar from '@/components/PlayerAvatar.vue'
import { blobToDataUrl, dataUrlToBlob, squareJpeg } from '@/lib/image'
import { PSEUDO_MAX_LENGTH, useUserStore } from '@/stores/user'
import { useRoomStore } from '@/stores/room'

const route = useRoute()
const router = useRouter()
const user = useUserStore()
const room = useRoomStore()

/** creer=1 → nouveau salon · code=XXXX → rejoindre · edit=1 → modifier son profil dans le salon */
const creating = computed(() => route.query.creer === '1')
const editing = computed(() => route.query.edit === '1' && !!room.view)
const code = computed(() => String(route.query.code ?? '').toUpperCase())

const pseudo = ref(user.pseudo)
const avatar = ref<string | null>(user.avatar)
const busy = ref(false)
const error = ref<string | null>(null)

const title = computed(() =>
  editing.value ? 'Mon profil' : creating.value ? 'Créer un salon' : `Salon ${code.value}`,
)
const submitLabel = computed(() =>
  editing.value ? 'Enregistrer' : creating.value ? 'Créer le salon' : 'Entrer dans le salon',
)

onMounted(() => {
  room.connect()
  if (!creating.value && !editing.value && !code.value) router.replace({ name: 'online' })
})

// Déjà dans un salon : pas de création d'un nouveau, on y retourne
watch(
  () => room.view?.code,
  (current) => {
    if (current && creating.value) router.replace({ name: 'room', params: { code: current } })
  },
  { immediate: true },
)

/** Photo en cours de préparation (recadrage dans le worker) */
const preparing = ref(false)

async function pickImage(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // pour pouvoir reprendre la même photo
  if (!file) return
  error.value = null
  preparing.value = true
  try {
    avatar.value = await blobToDataUrl(await squareJpeg(file))
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    preparing.value = false
  }
}

/**
 * Envoi de la photo de profil en arrière-plan : on entre dans le salon sans l'attendre.
 * Un nouvel essai en cas d'échec (réseau instable).
 */
async function uploadAvatarInBackground(dataUrl: string | null, roomCode: string) {
  const blob = dataUrl ? await dataUrlToBlob(dataUrl) : null
  try {
    await room.uploadAvatar(blob, roomCode)
  } catch {
    await new Promise((r) => setTimeout(r, 2000))
    await room.uploadAvatar(blob, roomCode).catch(() => {})
  }
}

async function submit() {
  if (!pseudo.value.trim() || busy.value || preparing.value) return
  busy.value = true
  error.value = null
  try {
    // Le pseudo du salon devient aussi celui de l'appli
    user.setPseudo(pseudo.value)
    let roomCode = code.value
    if (editing.value) {
      await room.updatePseudo(user.pseudo)
      roomCode = room.view!.code
    } else if (creating.value) {
      roomCode = await room.create(user.pseudo)
    } else {
      await room.join(code.value, user.pseudo)
    }

    const avatarChanged = avatar.value !== user.avatar
    user.setAvatar(avatar.value)
    // Nouveau salon : on envoie la photo s'il y en a une ; modification : seulement si elle a changé
    if ((avatar.value && (!editing.value || avatarChanged)) || (editing.value && avatarChanged)) {
      void uploadAvatarInBackground(avatar.value, roomCode)
    }

    router.replace({ name: 'room', params: { code: roomCode } })
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="game-page">
    <PageHeader :title="title" back />

    <form class="card profile" @submit.prevent="submit">
      <div class="photo">
        <div class="photo__preview" :class="{ preparing }">
          <PlayerAvatar :name="pseudo || '?'" :src="avatar" :size="112" />
          <span v-if="preparing" class="photo__spinner" aria-label="Préparation de la photo" />
        </div>
        <div class="photo__buttons">
          <label class="btn btn--ghost photo__btn">
            🖼️ Galerie
            <input type="file" accept="image/*" hidden @change="pickImage" />
          </label>
          <label class="btn btn--ghost photo__btn">
            📸 Prendre une photo
            <input type="file" accept="image/*" capture="user" hidden @change="pickImage" />
          </label>
          <button v-if="avatar" type="button" class="remove" @click="avatar = null">
            Retirer la photo
          </button>
        </div>
      </div>

      <label for="pseudo" class="label">Ton pseudo</label>
      <input
        id="pseudo"
        v-model="pseudo"
        :maxlength="PSEUDO_MAX_LENGTH"
        autocomplete="nickname"
        autocapitalize="words"
        enterkeyhint="go"
      />

      <p v-if="error" class="error" role="alert">{{ error }}</p>
    </form>

    <div class="actions">
      <button
        type="button"
        class="btn btn--big"
        :disabled="!pseudo.trim() || busy || preparing"
        @click="submit"
      >
        {{ busy ? 'Un instant…' : preparing ? 'Préparation de la photo…' : submitLabel }}
      </button>
      <RouterLink
        v-if="error && !creating && !editing"
        :to="{ name: 'online' }"
        class="btn btn--ghost"
      >
        Changer de code
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.profile {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.photo {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.photo__preview {
  position: relative;
  display: flex;
}

.photo__preview.preparing :deep(.avatar) {
  opacity: 0.4;
}

.photo__spinner {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 32px;
  height: 32px;
  border: 3px solid var(--accent);
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.photo__buttons {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.photo__btn {
  min-height: 46px;
  padding: 8px 14px;
  font-size: 13px;
  text-transform: none;
  cursor: pointer;
}

.remove {
  min-height: 36px;
  border: none;
  background: none;
  font-size: 13px;
  color: var(--muted);
  text-decoration: underline;
  cursor: pointer;
}

.label {
  padding: 0 8px;
}

.error {
  padding: 0 8px;
  font-size: 14px;
  color: var(--danger);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
}
</style>
