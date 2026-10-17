<script setup lang="ts">
import { CATEGORIES, CATEGORY_LABEL, type Category } from '@/lib/categories'

/** Choix soft / spicy / mélange (au lancement d'un jeu à questions) */
const category = defineModel<Category>({ required: true })
defineProps<{ label?: string }>()
</script>

<template>
  <div class="picker">
    <p v-if="label" class="label">{{ label }}</p>
    <div class="picker__options" role="radiogroup" :aria-label="label ?? 'Catégorie'">
      <button
        v-for="c in CATEGORIES"
        :key="c"
        type="button"
        role="radio"
        class="option"
        :class="{ 'is-selected': category === c }"
        :aria-checked="category === c"
        @click="category = c"
      >
        {{ CATEGORY_LABEL[c] }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.picker__options {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}

.option {
  min-height: 40px;
  padding: 0 14px;
  border: 2px solid transparent;
  border-radius: 9999px;
  background: var(--surface-3);
  color: var(--text);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  touch-action: manipulation;
}

.option.is-selected {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 22%, var(--surface-3));
}
</style>
