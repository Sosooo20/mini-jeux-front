<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { useRoomStore } from '@/stores/room'
import { REMOTE_SERVER } from '@/lib/server'

const room = useRoomStore()

/**
 * Hébergement gratuit : le serveur s'endort sans visite et met jusqu'à une minute à se
 * réveiller. Si la connexion traîne, on prévient au lieu de laisser croire que ça a planté.
 */
const slow = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
watch(
  () => room.status,
  (status) => {
    clearTimeout(timer)
    slow.value = false
    if (REMOTE_SERVER && status !== 'connected') timer = setTimeout(() => (slow.value = true), 5000)
  },
  { immediate: true },
)
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <p v-if="room.status !== 'connected'" class="banner" role="status">
    <span class="spinner" aria-hidden="true" />
    <span>
      {{ room.status === 'connecting' ? 'Connexion…' : 'Reconnexion au salon…' }}
      <small v-if="slow">Le serveur se réveille, ça peut prendre jusqu'à une minute 😴</small>
    </span>
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

.banner small {
  display: block;
  font-weight: 400;
  font-size: 12px;
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
