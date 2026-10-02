<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { APP_LOGO, APP_NAME } from '@/lib/app'
import { PSEUDO_MAX_LENGTH, useUserStore } from '@/stores/user'
import { usePwaInstall } from '@/composables/usePwaInstall'

const user = useUserStore()
const router = useRouter()
const { isInstalled, canPrompt, showIosHint, install } = usePwaInstall()

const pseudo = ref(user.pseudo)

function submit() {
  if (!pseudo.value.trim()) return
  user.setPseudo(pseudo.value)
  router.replace({ name: 'home' })
}
</script>

<template>
  <main class="welcome">
    <div class="welcome__glow welcome__glow--violet" />
    <div class="welcome__glow welcome__glow--green" />

    <div class="welcome__brand">
      <img :src="APP_LOGO" alt="" width="112" height="112" class="welcome__logo" />
      <h1>{{ APP_NAME }}</h1>
    </div>

    <form class="welcome__form" @submit.prevent="submit">
      <label for="pseudo">Ton pseudo</label>
      <input
        id="pseudo"
        v-model="pseudo"
        :maxlength="PSEUDO_MAX_LENGTH"
        autocomplete="nickname"
        autocapitalize="words"
        enterkeyhint="go"
      />
      <button type="submit" class="welcome__submit" :disabled="!pseudo.trim()">C'est parti</button>
    </form>

    <!-- Proposé seulement quand l'appli est ouverte dans le navigateur -->
    <section v-if="!isInstalled && (canPrompt || showIosHint)" class="install">
      <button v-if="canPrompt" type="button" class="install__btn" @click="install">
        📲 Installer l'appli
      </button>
      <p v-else class="install__hint">
        📲 Pour installer l'appli : appuie sur <strong>Partager</strong> puis
        <strong>« Sur l'écran d'accueil »</strong>.
      </p>
    </section>
  </main>
</template>

<style scoped>
.welcome {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 32px;
}

.welcome__glow {
  position: fixed;
  z-index: -1;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  filter: blur(48px);
}

.welcome__glow--violet {
  top: 10%;
  right: -80px;
  background: rgba(128, 131, 255, 0.2);
}

.welcome__glow--green {
  bottom: 10%;
  left: -80px;
  background: rgba(0, 185, 84, 0.2);
}

.welcome__brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.welcome__logo {
  border-radius: 28px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.55);
}

.welcome__brand h1 {
  font-size: 34px;
  line-height: 40px;
  letter-spacing: -1px;
}

.welcome__form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px 16px 16px;
  border-radius: 48px;
  background: #171f33;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.55);
}

label {
  padding: 0 12px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 22px;
  line-height: 28px;
  letter-spacing: -0.55px;
  color: #dae2fd;
}

input {
  min-height: 54px;
  padding: 12px 20px;
  border: 2px solid transparent;
  border-radius: 9999px;
  background: #222a3d;
  color: #dae2fd;
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 18px;
}

input:focus {
  outline: none;
  border-color: #4ae176;
}

.welcome__submit,
.install__btn {
  min-height: 54px;
  border: none;
  border-radius: 9999px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 15px;
  line-height: 20px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  cursor: pointer;
  touch-action: manipulation;
  transition: transform 0.08s;
}

.welcome__submit:active,
.install__btn:active {
  transform: scale(0.97);
}

.welcome__submit {
  background: #4ae176;
  color: #003915;
  filter: drop-shadow(0 8px 10px rgba(74, 225, 118, 0.35));
}

.welcome__submit:disabled {
  opacity: 0.5;
  filter: none;
}

.install {
  width: 100%;
}

.install__btn {
  width: 100%;
  background: #222a3d;
  color: #dae2fd;
}

.install__hint {
  padding: 12px 20px;
  border-radius: 24px;
  background: #171f33;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px;
  line-height: 20px;
  text-align: center;
  color: #c7c4d7;
}

.install__hint strong {
  color: #dae2fd;
}
</style>
