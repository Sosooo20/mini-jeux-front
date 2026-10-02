<script setup lang="ts">
/** Photo de profil, ou rond avec l'initiale s'il n'y en a pas */
defineProps<{ name: string; src?: string | null; size?: number; dimmed?: boolean }>()
</script>

<template>
  <span
    class="avatar"
    :class="{ dimmed }"
    :style="{
      width: `${size ?? 40}px`,
      height: `${size ?? 40}px`,
      fontSize: `${(size ?? 40) * 0.42}px`,
    }"
  >
    <img v-if="src" :src="src" alt="" />
    <template v-else>{{ name.charAt(0).toUpperCase() }}</template>
  </span>
</template>

<style scoped>
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--accent) 20%, var(--surface-3));
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 35%, transparent);
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--accent);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dimmed {
  opacity: 0.4;
  filter: grayscale(1);
}
</style>
