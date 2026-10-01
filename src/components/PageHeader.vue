<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{ title: string; back?: boolean }>()
const router = useRouter()
</script>

<template>
  <header class="page-header">
    <button v-if="back" class="back" aria-label="Retour" @click="router.back()">←</button>
    <h1>{{ title }}</h1>
  </header>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
h1 {
  font-size: 1.5rem;
}
.back {
  width: var(--tap);
  height: var(--tap);
  flex-shrink: 0;
  border: none;
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  font-size: 1.5rem;
}
</style>
