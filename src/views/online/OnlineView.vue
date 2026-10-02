<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import { ROOM_CODE_LENGTH } from '@/lib/protocol'
import { useRoomStore } from '@/stores/room'

const router = useRouter()
const room = useRoomStore()

const code = ref('')
// Mêmes lettres que les codes générés par le serveur (sans O, I, L)
const cleanCode = computed(() => code.value.toUpperCase().replace(/[^A-HJKMNP-Z]/g, ''))
const valid = computed(() => cleanCode.value.length === ROOM_CODE_LENGTH)

onMounted(() => room.connect())

function joinRoom() {
  if (!valid.value) return
  router.push({ name: 'room-profile', query: { code: cleanCode.value } })
}
</script>

<template>
  <div class="game-page">
    <PageHeader title="Jouer en ligne" back />

    <section v-if="room.view" class="card current">
      <p>
        Tu es dans le salon <strong>{{ room.view.code }}</strong>
      </p>
      <RouterLink :to="{ name: 'room', params: { code: room.view.code } }" class="btn">
        Retourner au salon
      </RouterLink>
    </section>

    <!-- Déjà dans un salon : pas de création ni de nouveau salon (ça ferait quitter l'actuel) -->
    <section v-if="!room.view" class="card block">
      <h2>Créer un salon</h2>
      <p class="help">
        Tu deviens l'hôte : tu lances les jeux, les autres te rejoignent avec un code.
      </p>
      <RouterLink :to="{ name: 'room-profile', query: { creer: '1' } }" class="btn btn--big">
        Créer un salon
      </RouterLink>
    </section>

    <form v-if="!room.view" class="card block" @submit.prevent="joinRoom">
      <h2>Rejoindre un salon</h2>
      <label for="code" class="help">Le code à 4 lettres donné par l'hôte</label>
      <input
        id="code"
        :value="cleanCode"
        class="code-input"
        inputmode="text"
        autocapitalize="characters"
        autocomplete="off"
        :maxlength="ROOM_CODE_LENGTH"
        enterkeyhint="go"
        @input="code = ($event.target as HTMLInputElement).value"
      />
      <button type="submit" class="btn btn--big btn--ghost" :disabled="!valid">Rejoindre</button>
    </form>
  </div>
</template>

<style scoped>
.block,
.current {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

h2 {
  padding: 0 4px;
  font-size: 22px;
}

.help {
  padding: 0 4px;
  font-size: 13px;
  color: var(--muted);
}

.current p {
  padding: 0 4px;
}

.current strong {
  font-family: var(--font-display);
  letter-spacing: 2px;
  color: var(--accent);
}

.code-input {
  text-align: center;
  font-size: 32px;
  letter-spacing: 12px;
  text-transform: uppercase;
}
</style>
