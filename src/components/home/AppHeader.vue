<script setup lang="ts">
import { APP_LOGO, APP_NAME } from '@/lib/app'
import { useUserStore } from '@/stores/user'

const user = useUserStore()
</script>

<template>
  <header class="app-header">
    <div class="brand">
      <img :src="APP_LOGO" alt="" width="36" height="36" />
      <strong>{{ APP_NAME }}</strong>
    </div>
    <RouterLink
      :to="{ name: 'welcome' }"
      class="profile"
      :aria-label="`Profil de ${user.pseudo} (changer de pseudo)`"
    >
      <span class="avatar">{{ user.initial }}</span>
    </RouterLink>
  </header>
</template>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 50%;
  z-index: 10;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  height: calc(64px + env(safe-area-inset-top));
  padding: env(safe-area-inset-top) 16px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(11, 19, 38, 0.8);
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand img {
  border-radius: 10px;
}

.brand strong {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: -0.5px;
  color: var(--text);
}

.profile {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  padding: 6px;
  border-radius: 9999px;
  touch-action: manipulation;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  background: #222a3d;
  box-shadow: 0 0 0 2px rgba(192, 193, 255, 0.4);
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 15px;
  color: #c0c1ff;
}
</style>
