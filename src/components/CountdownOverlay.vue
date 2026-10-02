<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { vibrate } from '@/composables/useVibrate'
import { playDing, playTick, unlockAudio } from '@/composables/useSound'

/** Compte à rebours « 3, 2, 1 » puis le mot d'action (« Votez ! », « Pointez ! »…) */
const props = defineProps<{ go: string }>()
const emit = defineEmits<{ done: [] }>()

const step = ref<number | string>(3)
let timer: ReturnType<typeof setTimeout> | undefined

function tick() {
  if (typeof step.value === 'number' && step.value > 1) {
    step.value--
    playTick()
    timer = setTimeout(tick, 800)
  } else if (typeof step.value === 'number') {
    step.value = props.go
    playDing()
    vibrate(150)
    timer = setTimeout(() => emit('done'), 900)
  }
}

onMounted(() => {
  unlockAudio()
  playTick()
  timer = setTimeout(tick, 800)
})
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="countdown" aria-live="assertive">
    <!-- :key relance l'animation à chaque chiffre -->
    <span :key="step" class="countdown__value" :class="{ go: typeof step === 'string' }">
      {{ step }}
    </span>
  </div>
</template>

<style scoped>
.countdown {
  position: fixed;
  z-index: 50;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: color-mix(in srgb, var(--bg-deep) 88%, transparent);
  backdrop-filter: blur(6px);
}

.countdown__value {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 160px;
  line-height: 1;
  color: var(--accent);
  text-align: center;
  animation: pop 0.8s ease-out;
}

.countdown__value.go {
  font-size: 64px;
  text-transform: uppercase;
}

@keyframes pop {
  0% {
    transform: scale(1.6);
    opacity: 0;
  }
  30% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.9);
    opacity: 0.85;
  }
}
</style>
