<script setup lang="ts">
import { useRoomStore } from '@/stores/room'

const room = useRoomStore()
</script>

<template>
  <p v-if="room.status !== 'connected'" class="banner" role="status">
    <span class="spinner" aria-hidden="true" />
    {{ room.status === 'connecting' ? 'Connexion…' : 'Reconnexion au salon…' }}
  </p>
</template>

<style scoped>
.banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--danger) 18%, var(--surface-2));
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 14px;
  color: var(--danger);
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
