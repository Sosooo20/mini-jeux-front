<script setup lang="ts">
import navGames from '@/assets/home/nav-games.svg'
import navRoom from '@/assets/home/nav-room.svg'
import navRanking from '@/assets/home/nav-ranking.svg'
import navProfile from '@/assets/home/nav-profile.svg'

// Classement et Profil n'ont pas encore de page : pas de route associée
const items = [
  { label: 'Jeux', icon: navGames, to: { name: 'home' } },
  { label: 'Salon', icon: navRoom, to: { name: 'online' } },
  { label: 'Classement', icon: navRanking },
  { label: 'Profil', icon: navProfile },
]
</script>

<template>
  <nav class="bottom-nav">
    <template v-for="item in items" :key="item.label">
      <RouterLink v-if="item.to" :to="item.to" class="nav-item" exact-active-class="active">
        <span class="nav-icon"><img :src="item.icon" alt="" /></span>
        <span>{{ item.label }}</span>
      </RouterLink>
      <span v-else class="nav-item" aria-disabled="true">
        <span class="nav-icon"><img :src="item.icon" alt="" /></span>
        <span>{{ item.label }}</span>
      </span>
    </template>
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
  min-width: 44px;
  min-height: 44px;
  padding: 4px 12px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 11px;
  line-height: 14px;
  letter-spacing: 0.88px;
  color: #c7c4d7;
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
