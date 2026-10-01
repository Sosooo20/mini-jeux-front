<script setup lang="ts">
import iconClock from '@/assets/home/icon-clock.svg'
import iconPlayers from '@/assets/home/icon-players.svg'
import iconRules from '@/assets/home/icon-rules.svg'

export interface ShowcaseChip {
  label: string
  color: string
}

export interface ShowcaseGame {
  routeName: string
  image: string
  /** Couleur d'accent (badge, mot du titre, bouton) */
  accent: string
  /** Couleur du texte posé sur l'accent */
  onAccent: string
  glow: string
  /** Couleur du sur-titre, parfois plus claire que l'accent */
  kickerColor?: string
  tag: { icon: string; label: string }
  subtag: string
  duration: string
  kicker: { icon: string; label: string }
  titleStart: string
  titleAccent: string
  description: string
  players: string
  cta: { label: string; icon: string }
  chips?: ShowcaseChip[]
  withRules?: boolean
}

defineProps<{ game: ShowcaseGame }>()
</script>

<template>
  <article
    class="game"
    :style="{
      '--accent': game.accent,
      '--on-accent': game.onAccent,
      '--glow': game.glow,
      '--kicker': game.kickerColor ?? game.accent,
    }"
  >
    <img class="game__bg" :src="game.image" alt="" />
    <div class="game__gradient" />
    <div class="game__glow" />

    <div class="game__top">
      <div class="game__tags">
        <span class="pill pill--accent">
          <img :src="game.tag.icon" alt="" />
          {{ game.tag.label }}
        </span>
        <span class="pill pill--glass">{{ game.subtag }}</span>
      </div>
      <span class="pill pill--glass pill--strong">
        <img :src="iconClock" alt="" />
        {{ game.duration }}
      </span>
    </div>

    <div class="game__body">
      <p class="game__kicker">
        <img :src="game.kicker.icon" alt="" />
        {{ game.kicker.label }}
      </p>
      <h3 class="game__title">
        {{ game.titleStart }} <span>{{ game.titleAccent }}</span>
      </h3>
      <p class="game__desc">{{ game.description }}</p>

      <div v-if="game.chips" class="game__chips">
        <span v-for="chip in game.chips" :key="chip.label" :style="{ color: chip.color }">
          {{ chip.label }}
        </span>
      </div>

      <div class="game__footer">
        <span class="players">
          <img :src="iconPlayers" alt="" />
          {{ game.players }}
        </span>
        <div class="game__actions">
          <button v-if="game.withRules" type="button" class="rules">
            <img :src="iconRules" alt="" />
            Règles
          </button>
          <RouterLink :to="{ name: game.routeName }" class="cta">
            {{ game.cta.label }}
            <img :src="game.cta.icon" alt="" />
          </RouterLink>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.game {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: 48px;
  background: #131b2e;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
  isolation: isolate;
}

.game__bg {
  position: absolute;
  inset: -6px -9px;
  width: calc(100% + 18px);
  height: calc(100% + 12px);
  object-fit: cover;
  opacity: 0.3;
  mix-blend-mode: screen;
  pointer-events: none;
}

.game__gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    #060e20 0%,
    rgba(6, 14, 32, 0.8) 50%,
    rgba(6, 14, 32, 0) 100%
  );
}

.game__glow {
  position: absolute;
  top: -48px;
  right: -48px;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: var(--glow);
  filter: blur(32px);
}

.game__top,
.game__body {
  position: relative;
}

.game__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 16px 16px 0;
}

.game__tags {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 9999px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 11px;
  line-height: 14px;
  letter-spacing: 0.88px;
}

.pill img {
  flex-shrink: 0;
}

.pill--accent {
  padding: 2px 10px;
  background: var(--accent);
  color: var(--on-accent);
  text-transform: uppercase;
  filter: drop-shadow(0 0 6px color-mix(in srgb, var(--accent) 30%, transparent));
}

.pill--glass {
  background: rgba(45, 52, 73, 0.8);
  backdrop-filter: blur(6px);
  color: #c7c4d7;
}

.pill--strong {
  padding: 2px 10px;
  background: rgba(45, 52, 73, 0.9);
  color: #dae2fd;
}

.game__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
}

.game__kicker {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 11px;
  line-height: 14px;
  letter-spacing: 0.55px;
  text-transform: uppercase;
  color: var(--kicker);
}

.game__title {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 24px;
  line-height: 30px;
  letter-spacing: -0.6px;
  text-transform: uppercase;
  color: #dae2fd;
}

.game__title span {
  color: var(--kicker);
}

.game__desc {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 12px;
  line-height: 19.5px;
  color: #c7c4d7;
}

.game__chips {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  overflow-x: auto;
}

.game__chips span {
  padding: 2px 8px;
  border-radius: 16px;
  background: #222a3d;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 12px;
  line-height: 16px;
}

.game__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 4px;
}

.players {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 9999px;
  background: rgba(34, 42, 61, 0.9);
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 13px;
  line-height: 16px;
  letter-spacing: 0.78px;
  color: #dae2fd;
}

.game__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rules,
.cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  border: none;
  border-radius: 9999px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  touch-action: manipulation;
  transition: transform 0.08s;
}

.rules:active,
.cta:active {
  transform: scale(0.96);
}

.rules {
  gap: 4px;
  padding: 10px 14px;
  background: #222a3d;
  color: var(--accent);
  font-size: 11px;
  line-height: 14px;
  letter-spacing: 0.88px;
}

.cta {
  gap: 6px;
  padding: 8px 20px;
  background: var(--accent);
  color: var(--on-accent);
  font-size: 13px;
  line-height: 16px;
  letter-spacing: 0.65px;
  text-transform: uppercase;
  filter: drop-shadow(0 4px 8px color-mix(in srgb, var(--accent) 35%, transparent));
}
</style>
