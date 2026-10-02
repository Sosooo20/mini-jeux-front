<script setup lang="ts">
import { ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { GAMES, accentStyle } from '@/lib/games'
import { DILEMMAS } from '@/lib/data/preferes'
import { useDeck } from '@/composables/useDeck'
import { useWakeLock } from '@/composables/useWakeLock'

const game = GAMES.preferes

const { current, next } = useDeck(DILEMMAS)

/** Page d'accueil du jeu (règles), puis les dilemmes les uns après les autres */
const started = ref(false)

useWakeLock(started)
</script>

<template>
  <div class="game-page" :style="accentStyle(game)">
    <PageHeader :title="game.name" back />

    <section v-if="!started" class="card intro">
      <p class="intro__emoji" aria-hidden="true">⚖️</p>
      <p>Deux choix s'affichent : chacun vote à main levée, en pointant 👈 ou 👉.</p>
      <p class="intro__rule">🍺 La minorité boit</p>
      <p class="intro__small">Égalité : tout le monde débat !</p>
    </section>

    <Transition v-else name="flip" mode="out-in">
      <section :key="current.a" class="dilemma" aria-live="polite">
        <div class="card choice choice--a">
          <span class="choice__side" aria-hidden="true">👈</span>
          <p>{{ current.a }}</p>
        </div>
        <span class="or">ou</span>
        <div class="card choice choice--b">
          <p>{{ current.b }}</p>
          <span class="choice__side" aria-hidden="true">👉</span>
        </div>
      </section>
    </Transition>

    <p v-if="started" class="rule">
      🍺 La minorité boit<br />
      <small>Égalité : tout le monde débat !</small>
    </p>

    <div class="actions">
      <button v-if="!started" type="button" class="btn btn--big" @click="started = true">
        Première question
      </button>
      <button v-else type="button" class="btn btn--big" @click="next">Suivant</button>
    </div>
  </div>
</template>

<style scoped>
.dilemma {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

.choice {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 140px;
  padding: 24px 20px;
  border: 2px solid color-mix(in srgb, var(--accent) 35%, transparent);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 24px;
  line-height: 1.25;
}

.choice p {
  flex: 1;
}

.choice--a {
  background: radial-gradient(
    circle at 0% 0%,
    color-mix(in srgb, var(--accent) 22%, var(--surface)) 0%,
    var(--surface) 65%
  );
}

.choice--b {
  text-align: right;
  background: radial-gradient(
    circle at 100% 100%,
    color-mix(in srgb, var(--accent) 22%, var(--surface)) 0%,
    var(--surface) 65%
  );
}

.choice__side {
  font-size: 28px;
}

.or {
  align-self: center;
  padding: 4px 16px;
  border-radius: 9999px;
  background: var(--accent);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--on-accent);
}

.intro {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  padding: 32px 24px;
  text-align: center;
  font-size: 17px;
  border: 2px solid color-mix(in srgb, var(--accent) 35%, transparent);
}

.intro__emoji {
  font-size: 64px;
  line-height: 1;
}

.intro__rule {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 24px;
  color: var(--accent);
}

.intro__small {
  font-size: 14px;
  color: var(--muted);
}

.rule {
  text-align: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
  color: var(--accent);
}

.rule small {
  font-weight: 600;
  font-size: 14px;
  color: var(--muted);
}

.actions {
  margin-top: auto;
}

.flip-enter-active,
.flip-leave-active {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.flip-enter-from {
  transform: translateX(40px);
  opacity: 0;
}

.flip-leave-to {
  transform: translateX(-40px);
  opacity: 0;
}
</style>
