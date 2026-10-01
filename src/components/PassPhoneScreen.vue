<script setup lang="ts">
defineProps<{ name: string; hint?: string }>()
const emit = defineEmits<{ ready: [] }>()
</script>

<template>
  <section class="pass">
    <p class="label">Passe le téléphone à</p>
    <p class="pass__name">{{ name }}</p>
    <p v-if="hint" class="pass__hint">{{ hint }}</p>
    <button type="button" class="btn btn--big" @click="emit('ready')">C'est moi</button>
  </section>
</template>

<style scoped>
.pass {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
}

.pass__name {
  max-width: 100%;
  overflow-wrap: anywhere;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 44px;
  line-height: 1.1;
  color: var(--accent);
}

.pass__hint {
  color: var(--muted);
  font-size: 14px;
}

.btn {
  margin-top: 24px;
}
</style>
