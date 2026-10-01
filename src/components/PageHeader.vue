<script setup lang="ts">
defineProps<{ title: string; back?: boolean }>()
</script>

<template>
  <header class="page-header">
    <RouterLink v-if="back" :to="{ name: 'home' }" class="back" aria-label="Retour à l'accueil">
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M15 5l-7 7 7 7"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </RouterLink>
    <h1>{{ title }}</h1>
  </header>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
}

h1 {
  font-size: 24px;
  line-height: 30px;
  text-transform: uppercase;
}

.back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 9999px;
  background: var(--surface-2);
  color: var(--accent);
  touch-action: manipulation;
}

.back:active {
  transform: scale(0.95);
}
</style>
