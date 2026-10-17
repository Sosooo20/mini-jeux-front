<script setup lang="ts">
import { CATEGORY_LABEL, type Level } from '@/lib/categories'

/** Petit badge « 😇 Soft » / « 🌶️ Spicy » sur une question */
defineProps<{ level: Level }>()
</script>

<template>
  <span class="badge" :class="`badge--${level}`">{{ CATEGORY_LABEL[level] }}</span>
</template>

<style scoped>
.badge {
  flex-shrink: 0;
  padding: 2px 10px;
  border-radius: 9999px;
  background: var(--surface-3);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 12px;
  color: var(--text);
}

.badge--spicy {
  background: color-mix(in srgb, var(--danger) 25%, var(--surface-3));
}
</style>
