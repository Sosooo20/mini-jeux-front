<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { VOTE_SECONDS } from '@/lib/protocol'
import { useRoomStore } from '@/stores/room'

/** Temps restant avant l'échéance fixée par le serveur (corrigé du décalage d'horloge) */
const props = defineProps<{ deadline: number }>()

const room = useRoomStore()
const now = ref(room.serverNow())
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => (timer = setInterval(() => (now.value = room.serverNow()), 250)))
onBeforeUnmount(() => clearInterval(timer))

const remaining = computed(() => Math.max(0, props.deadline - now.value))
const seconds = computed(() => Math.ceil(remaining.value / 1000))
const ratio = computed(() => Math.min(1, remaining.value / (VOTE_SECONDS * 1000)))
</script>

<template>
  <div class="deadline" :class="{ urgent: seconds <= 5 }">
    <div class="deadline__track">
      <div class="deadline__fill" :style="{ transform: `scaleX(${ratio})` }" />
    </div>
    <span class="deadline__seconds">{{ seconds }} s</span>
  </div>
</template>

<style scoped>
.deadline {
  display: flex;
  align-items: center;
  gap: 10px;
}

.deadline__track {
  flex: 1;
  height: 8px;
  overflow: hidden;
  border-radius: 9999px;
  background: var(--surface-2);
}

.deadline__fill {
  height: 100%;
  background: var(--accent);
  transform-origin: left;
  transition: transform 0.25s linear;
}

.deadline__seconds {
  min-width: 36px;
  text-align: right;
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--accent);
}

.urgent .deadline__fill {
  background: var(--danger);
}

.urgent .deadline__seconds {
  color: var(--danger);
}
</style>
