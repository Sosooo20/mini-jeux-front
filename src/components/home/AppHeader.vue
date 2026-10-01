<script setup lang="ts">
import logo from '@/assets/home/logo.png'
import profile from '@/assets/home/profile.jpg'
</script>

<template>
  <header class="app-header">
    <div class="brand">
      <img :src="logo" alt="" width="32" height="32" />
      <div>
        <strong>PlaySquad</strong>
        <small>Jeux</small>
      </div>
    </div>
    <button type="button" class="profile" aria-label="Profil">
      <img :src="profile" alt="" width="32" height="32" />
    </button>
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
  gap: 8px;
}

.brand strong,
.brand small {
  display: block;
  font-family: 'Outfit', sans-serif;
}

.brand strong {
  font-weight: 600;
  font-size: 18px;
  line-height: 18px;
  letter-spacing: -0.45px;
  color: #c0c1ff;
}

.brand small {
  font-weight: 700;
  font-size: 11px;
  line-height: 14px;
  letter-spacing: 0.88px;
  color: #c7c4d7;
}

.profile {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  padding: 6px;
  border: none;
  border-radius: 9999px;
  background: none;
  cursor: pointer;
}

.profile img {
  border-radius: 9999px;
  box-shadow: 0 0 0 2px rgba(192, 193, 255, 0.4);
}
</style>
