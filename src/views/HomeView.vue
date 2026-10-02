<script setup lang="ts">
import AppHeader from '@/components/home/AppHeader.vue'
import GameShowcaseCard, { type ShowcaseGame } from '@/components/home/GameShowcaseCard.vue'

import iconBolt from '@/assets/home/icon-bolt.svg'
import iconJoin from '@/assets/home/icon-join.svg'
import { useRoomStore } from '@/stores/room'
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
import tagJamais from '@/assets/home/tag-jamais.svg'
import tagPreferes from '@/assets/home/tag-preferes.svg'
import tagPourrait from '@/assets/home/tag-pourrait.svg'
import kickerJamais from '@/assets/home/kicker-jamais.svg'
import kickerPreferes from '@/assets/home/kicker-preferes.svg'
import kickerPourrait from '@/assets/home/kicker-pourrait.svg'
import ctaJamais from '@/assets/home/cta-jamais.svg'
import ctaPreferes from '@/assets/home/cta-preferes.svg'
import ctaPourrait from '@/assets/home/cta-pourrait.svg'

const room = useRoomStore()

/** Jeux qui se jouent dans un salon, chacun sur son téléphone */
const onlineGames = [
  {
    emoji: '👉',
    name: 'Qui est le plus susceptible de… ?',
    description: 'Chacun vote en secret, le plus désigné boit.',
  },
  { emoji: '❓', name: 'Quiz de potes', description: 'Devine ce que tes potes ont répondu.' },
  {
    emoji: '🤫',
    name: 'Confessions anonymes',
    description: 'Chacun écrit un secret, devine qui a écrit celui que tu reçois.',
  },
  {
    emoji: '📸',
    name: 'Jeu photo',
    description: 'Prends la cible en photo en scred, toute la soirée.',
  },
]

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
    accent: '#4cd7f6',
    onAccent: '#003640',
    glow: 'rgba(76, 215, 246, 0.25)',
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
  {
    routeName: 'jamais',
    accent: '#ffd166',
    onAccent: '#3d2e00',
    glow: 'rgba(255, 209, 102, 0.25)',
    tag: { icon: tagJamais, label: 'Classique de soirée' },
    kicker: { icon: kickerJamais, label: 'Avoue tout' },
    titleStart: "J'ai déjà /",
    titleAccent: "Je n'ai jamais",
    description:
      "Une phrase s'affiche : selon la carte, ceux qui l'ont déjà fait, ou ceux qui ne l'ont jamais fait, boivent. Interdit de mentir !",
    cta: { label: 'Piocher', icon: ctaJamais },
  },
  {
    routeName: 'preferes',
    accent: '#ff9f5a',
    onAccent: '#3d1a00',
    glow: 'rgba(255, 159, 90, 0.25)',
    tag: { icon: tagPreferes, label: 'Dilemmes' },
    kicker: { icon: kickerPreferes, label: 'Choisis ton camp' },
    titleStart: 'Tu',
    titleAccent: 'préfères…',
    description:
      'Deux choix, un vote à main levée : la minorité boit. Égalité ? Débat obligatoire.',
    cta: { label: 'Choisir', icon: ctaPreferes },
  },
  {
    routeName: 'pourrait',
    accent: '#c792ff',
    onAccent: '#2e0059',
    glow: 'rgba(199, 146, 255, 0.25)',
    tag: { icon: tagPourrait, label: 'Débats garantis' },
    kicker: { icon: kickerPourrait, label: 'Pointez du doigt' },
    titleStart: 'Qui',
    titleAccent: 'pourrait…',
    description:
      "Une mise en situation, tout le monde pointe quelqu'un en même temps : le plus désigné boit.",
    cta: { label: 'Pointer', icon: ctaPourrait },
  },
]
</script>

<template>
  <AppHeader />

  <main class="home">
    <section class="quick-actions">
      <div class="quick-actions__glow quick-actions__glow--violet" />
      <div class="quick-actions__glow quick-actions__glow--green" />
      <div class="online">
        <div class="online__head">
          <h2><span class="online__bar" />Jeux en ligne</h2>
          <span class="online__badge">Chacun son tél</span>
        </div>
        <ul class="online__list">
          <li v-for="g in onlineGames" :key="g.name">
            <span class="online__emoji" aria-hidden="true">{{ g.emoji }}</span>
            <span>
              <strong>{{ g.name }}</strong>
              <small>{{ g.description }}</small>
            </span>
          </li>
        </ul>
      </div>
      <!-- Déjà dans un salon : on y retourne (en créer ou en rejoindre un autre le ferait quitter) -->
      <div v-if="room.view" class="quick-actions__grid">
        <RouterLink
          :to="{ name: 'room', params: { code: room.view.code } }"
          class="qa-btn qa-btn--primary qa-btn--full"
        >
          Retourner au salon {{ room.view.code }}
        </RouterLink>
      </div>
      <div v-else class="quick-actions__grid">
        <RouterLink
          :to="{ name: 'room-profile', query: { creer: '1' } }"
          class="qa-btn qa-btn--primary"
        >
          <img :src="iconBolt" alt="" />
          Créer un salon
        </RouterLink>
        <RouterLink :to="{ name: 'online' }" class="qa-btn qa-btn--secondary">
          <img :src="iconJoin" alt="" />
          Rejoindre
        </RouterLink>
      </div>
    </section>

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

/* Liste des jeux en ligne, au-dessus des boutons de salon */
.online {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 4px 16px;
}

.online__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.online__head h2 {
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

.online__bar {
  width: 10px;
  height: 24px;
  border-radius: 9999px;
  background: #c0c1ff;
}

.online__badge {
  padding: 4px 10px;
  border-radius: 9999px;
  background: rgba(192, 193, 255, 0.12);
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 11px;
  line-height: 14px;
  letter-spacing: 0.88px;
  text-transform: uppercase;
  white-space: nowrap;
  color: #c0c1ff;
}

.online__list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.online__list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 24px;
  background: rgba(34, 42, 61, 0.8);
}

.online__emoji {
  font-size: 24px;
  line-height: 1;
}

.online__list strong,
.online__list small {
  display: block;
}

.online__list strong {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 15px;
  line-height: 20px;
  color: #dae2fd;
}

.online__list small {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 12px;
  line-height: 18px;
  color: #c7c4d7;
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

.qa-btn--full {
  grid-column: 1 / -1 !important;
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
