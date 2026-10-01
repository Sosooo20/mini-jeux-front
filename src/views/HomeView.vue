<script setup lang="ts">
import AppHeader from '@/components/home/AppHeader.vue'
import GameShowcaseCard, { type ShowcaseGame } from '@/components/home/GameShowcaseCard.vue'

// Désactivés tant qu'il n'y a pas de jeux en ligne (voir le template)
// import iconBolt from '@/assets/home/icon-bolt.svg'
// import iconJoin from '@/assets/home/icon-join.svg'
import tagBombe from '@/assets/home/tag-bombe.svg'
import tagRoulette from '@/assets/home/tag-roulette.svg'
import tagPalmier from '@/assets/home/tag-palmier.svg'
import tagChrono from '@/assets/home/tag-chrono.svg'
import tagConfessions from '@/assets/home/tag-confessions.svg'
import kickerBombe from '@/assets/home/kicker-bombe.svg'
import kickerRoulette from '@/assets/home/kicker-roulette.svg'
import kickerPalmier from '@/assets/home/kicker-palmier.svg'
import kickerChrono from '@/assets/home/kicker-chrono.svg'
import kickerConfessions from '@/assets/home/kicker-confessions.svg'
import ctaBombe from '@/assets/home/cta-bombe.svg'
import ctaRoulette from '@/assets/home/cta-roulette.svg'
import ctaPalmier from '@/assets/home/cta-palmier.svg'
import ctaChrono from '@/assets/home/cta-chrono.svg'
import ctaConfessions from '@/assets/home/cta-confessions.svg'

const games: ShowcaseGame[] = [
  {
    routeName: 'bombe',
    accent: '#ffb4ab',
    onAccent: '#690005',
    glow: 'rgba(255, 180, 171, 0.25)',
    tag: { icon: tagBombe, label: 'Chaud devant' },
    kicker: { icon: kickerBombe, label: 'Décompte fatal' },
    titleStart: 'Bombe à',
    titleAccent: 'retardement',
    description:
      "Un timer caché tourne, le téléphone passe de main en main avec un défi à chaque tour (citer un pays, une marque…). Celui qui l'a quand elle explose perd !",
    players: '2-12 Joueurs',
    cta: { label: 'Amorcer', icon: ctaBombe },
  },
  {
    routeName: 'roulette',
    accent: '#c0c1ff',
    onAccent: '#1000a9',
    glow: 'rgba(128, 131, 255, 0.3)',
    tag: { icon: tagRoulette, label: 'Aléatoire & frissons' },
    kicker: { icon: kickerRoulette, label: "Qui sera l'élu ?" },
    titleStart: 'Roulette',
    titleAccent: 'du destin',
    description:
      "L'appli désigne un joueur au hasard avec une roulette animée sous tension. Qui sera l'élu du gage fatal ?",
    players: '2-12 Joueurs',
    cta: { label: 'Tourner', icon: ctaRoulette },
  },
  {
    routeName: 'palmier',
    accent: '#4ae176',
    onAccent: '#003915',
    glow: 'rgba(74, 225, 118, 0.25)',
    tag: { icon: tagPalmier, label: 'Jeu culte' },
    kicker: { icon: kickerPalmier, label: 'Le cercle sacré' },
    titleStart: 'Le jeu du',
    titleAccent: 'palmier',
    description:
      "Sortez un vrai jeu de cartes : l'appli vous donne la règle de chaque carte, de l'As au Roi.",
    cta: { label: 'Voir les règles', icon: ctaPalmier },
  },
  {
    routeName: 'chrono',
    accent: '#6bff8f',
    onAccent: '#002109',
    glow: 'rgba(128, 131, 255, 0.2)',
    tag: { icon: tagChrono, label: 'Précision pure' },
    kicker: { icon: kickerChrono, label: 'Instinct & réflexe' },
    titleStart: 'Chrono à',
    titleAccent: "l'aveugle",
    description:
      "Arrête le chrono pile au bon moment sans regarder l'écran ! Objectif défini aléatoirement à chaque manche (de 0.1 à 10.0 secondes).",
    players: '2-12 Joueurs',
    cta: { label: 'Top départ', icon: ctaChrono },
  },
  {
    routeName: 'confessions',
    accent: '#f751a1',
    onAccent: '#570032',
    glow: 'rgba(247, 81, 161, 0.3)',
    kickerColor: '#ffb0cd',
    tag: { icon: tagConfessions, label: 'Secrets & débats' },
    kicker: { icon: kickerConfessions, label: 'Vérités cachées' },
    titleStart: 'Confessions',
    titleAccent: 'anonymes',
    description:
      "Chacun écrit un secret ou une anecdote secrète sur son tour. L'appli mélange tout anonymement : saurez-vous deviner qui a écrit quoi ?",
    players: '3-12 Joueurs',
    cta: { label: 'Confesser', icon: ctaConfessions },
  },
]
</script>

<template>
  <AppHeader />

  <main class="home">
    <!-- Désactivé tant qu'il n'y a pas de jeux en ligne
    <section class="quick-actions">
      <div class="quick-actions__glow quick-actions__glow--violet" />
      <div class="quick-actions__glow quick-actions__glow--green" />
      <div class="quick-actions__grid">
        <RouterLink :to="{ name: 'online' }" class="qa-btn qa-btn--primary">
          <img :src="iconBolt" alt="" />
          Créer un salon
        </RouterLink>
        <RouterLink :to="{ name: 'online' }" class="qa-btn qa-btn--secondary">
          <img :src="iconJoin" alt="" />
          Rejoindre
        </RouterLink>
      </div>
    </section>
    -->

    <section class="games">
      <div class="games__head">
        <h2><span class="games__bar" />Les Mini-Jeux</h2>
        <span class="games__badge">Pass &amp; Play</span>
      </div>
      <GameShowcaseCard v-for="game in games" :key="game.routeName" :game="game" />
    </section>
  </main>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 24px;
  /* place pour le header fixe (64px) */
  padding: calc(64px + 30px - 16px) 0 24px;
}

.quick-actions {
  position: relative;
  overflow: hidden;
  padding: 16px;
  border-radius: 48px;
  background: #171f33;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.55);
}

.quick-actions__glow {
  position: absolute;
  width: 192px;
  height: 192px;
  border-radius: 50%;
  filter: blur(32px);
}

.quick-actions__glow--violet {
  top: -48px;
  right: -48px;
  background: rgba(128, 131, 255, 0.2);
}

.quick-actions__glow--green {
  bottom: -48px;
  left: -48px;
  background: rgba(0, 185, 84, 0.2);
}

.quick-actions__grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  padding-top: 4px;
}

.qa-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 54px;
  border-radius: 9999px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  white-space: nowrap;
  touch-action: manipulation;
  transition: transform 0.08s;
}

.qa-btn:active {
  transform: scale(0.97);
}

.qa-btn--primary {
  grid-column: 1 / span 3;
  gap: 8px;
  padding: 11px 19px;
  background: #4ae176;
  color: #003915;
  font-size: 15px;
  line-height: 20px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  filter: drop-shadow(0 8px 10px rgba(74, 225, 118, 0.35));
}

.qa-btn--secondary {
  grid-column: 4 / span 2;
  gap: 6px;
  padding: 13px 17px;
  background: #222a3d;
  color: #dae2fd;
  font-size: 13px;
  line-height: 16px;
  letter-spacing: 0.78px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.games {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.games__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.games__head h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 22px;
  line-height: 28px;
  letter-spacing: -0.55px;
  color: #dae2fd;
}

.games__bar {
  width: 10px;
  height: 24px;
  border-radius: 9999px;
  background: #4ae176;
}

.games__badge {
  padding: 4px 10px;
  border-radius: 9999px;
  background: rgba(74, 225, 118, 0.1);
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 11px;
  line-height: 14px;
  letter-spacing: 0.88px;
  text-transform: uppercase;
  color: #4ae176;
}
</style>
