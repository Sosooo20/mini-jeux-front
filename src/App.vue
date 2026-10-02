<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import BottomNav from '@/components/home/BottomNav.vue'
import { useNavigationStore } from '@/stores/navigation'
import { useRoomStore } from '@/stores/room'

const route = useRoute()
const navigation = useNavigationStore()

// Si on était dans un salon, on s'y reconnecte dès l'ouverture (jeu photo, onglet Salon…)
const room = useRoomStore()
if (room.lastRoom()) room.connect()
</script>

<template>
  <RouterView v-slot="{ Component }">
    <KeepAlive :include="navigation.keepAlive">
      <component :is="Component" />
    </KeepAlive>
  </RouterView>

  <template v-if="!route.meta.hideNav">
    <div class="nav-spacer" />
    <BottomNav />
  </template>
</template>

<style scoped>
/* Réserve la place de la barre de navigation fixe en bas */
.nav-spacer {
  flex-shrink: 0;
  height: calc(80px + env(safe-area-inset-bottom));
}
</style>
