<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useNavigationStore } from '@/stores/navigation'
import { useRoomStore } from '@/stores/room'

// Onglets désactivés pour l'instant (pas de page dédiée)
// import navRanking from '@/assets/home/nav-ranking.svg'
// import navProfile from '@/assets/home/nav-profile.svg'
// { label: 'Classement', icon: navRanking },
// { label: 'Profil', icon: navProfile },

const route = useRoute()
const navigation = useNavigationStore()
const room = useRoomStore()

const onCamera = computed(() => route.name === 'camera')
/** L'onglet Salon n'apparaît que quand on est dans un salon */
const roomCode = computed(() => room.view?.code ?? null)
const onRoom = computed(() => route.path.startsWith('/salon'))

// Depuis l'appareil photo, « Accueil » ramène à la partie en cours s'il y en a une
const homeTarget = computed(() =>
  onCamera.value && navigation.activeGame ? navigation.activeGame.path : { name: 'home' },
)
</script>

<template>
  <nav class="bottom-nav">
    <RouterLink :to="homeTarget" class="nav-item" :class="{ active: !onCamera && !onRoom }">
      <span class="nav-icon">
        <svg width="22" height="16" viewBox="0 0 19.97 14" aria-hidden="true">
          <path
            fill="currentColor"
            d="M2.535 14C1.685 14 1.02667 13.7042 0.56 13.1125C0.0933333 12.5208 -0.0816667 11.8 0.035 10.95L1.085 3.45C1.235 2.45 1.68083 1.625 2.4225 0.975C3.16417 0.325 4.035 0 5.035 0H14.935C15.935 0 16.8058 0.325 17.5475 0.975C18.2892 1.625 18.735 2.45 18.885 3.45L19.935 10.95C20.0517 11.8 19.8767 12.5208 19.41 13.1125C18.9433 13.7042 18.285 14 17.435 14C17.085 14 16.76 13.9375 16.46 13.8125C16.16 13.6875 15.885 13.5 15.635 13.25L13.385 11H6.585L4.335 13.25C4.085 13.5 3.81 13.6875 3.51 13.8125C3.21 13.9375 2.885 14 2.535 14V14M2.935 11.85L5.785 9H14.185L17.035 11.85C17.0683 11.8833 17.2017 11.9333 17.435 12C17.6183 12 17.7642 11.9458 17.8725 11.8375C17.9808 11.7292 18.0183 11.5833 17.985 11.4L16.885 3.7C16.8183 3.21667 16.6017 2.8125 16.235 2.4875C15.8683 2.1625 15.435 2 14.935 2H5.035C4.535 2 4.10167 2.1625 3.735 2.4875C3.36833 2.8125 3.15167 3.21667 3.085 3.7L1.985 11.4C1.95167 11.5833 1.98917 11.7292 2.0975 11.8375C2.20583 11.9458 2.35167 12 2.535 12C2.56833 12 2.70167 11.95 2.935 11.85V11.85M14.985 8C15.2683 8 15.5058 7.90417 15.6975 7.7125C15.8892 7.52083 15.985 7.28333 15.985 7C15.985 6.71667 15.8892 6.47917 15.6975 6.2875C15.5058 6.09583 15.2683 6 14.985 6C14.7017 6 14.4642 6.09583 14.2725 6.2875C14.0808 6.47917 13.985 6.71667 13.985 7C13.985 7.28333 14.0808 7.52083 14.2725 7.7125C14.4642 7.90417 14.7017 8 14.985 8V8M12.985 5C13.2683 5 13.5058 4.90417 13.6975 4.7125C13.8892 4.52083 13.985 4.28333 13.985 4C13.985 3.71667 13.8892 3.47917 13.6975 3.2875C13.5058 3.09583 13.2683 3 12.985 3C12.7017 3 12.4642 3.09583 12.2725 3.2875C12.0808 3.47917 11.985 3.71667 11.985 4C11.985 4.28333 12.0808 4.52083 12.2725 4.7125C12.4642 4.90417 12.7017 5 12.985 5V5M5.735 8H7.235V6.25H8.985V4.75H7.235V3H5.735V4.75H3.985V6.25H5.735V8V8M9.985 7"
          />
        </svg>
      </span>
      <span>Accueil</span>
    </RouterLink>

    <RouterLink
      v-if="roomCode"
      :to="{ name: 'room', params: { code: roomCode } }"
      class="nav-item"
      :class="{ active: onRoom }"
    >
      <span class="nav-icon">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
          <path d="M16 3.1a4 4 0 0 1 0 7.8" />
        </svg>
      </span>
      <span>Salon</span>
    </RouterLink>

    <RouterLink :to="{ name: 'camera' }" class="nav-item" :class="{ active: onCamera }">
      <span class="nav-icon">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path
            d="M14.5 4h-5L7.5 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3.5z"
          />
          <circle cx="12" cy="13" r="3.5" />
        </svg>
      </span>
      <span>Photo</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  z-index: 10;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  height: calc(80px + env(safe-area-inset-bottom));
  padding: 0 4px env(safe-area-inset-bottom);
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: rgba(6, 14, 32, 0.85);
  backdrop-filter: blur(12px);
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.5);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 88px;
  min-height: 56px;
  padding: 4px 12px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 11px;
  line-height: 14px;
  letter-spacing: 0.88px;
  color: #c7c4d7;
  touch-action: manipulation;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 22px;
}

.active {
  color: #4ae176;
}
</style>
