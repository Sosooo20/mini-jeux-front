import type { GameInfo } from '@/types/game'

export const LOCAL_GAMES: GameInfo[] = [
  {
    id: 'bombe',
    name: 'Bombe à retardement',
    emoji: '💣',
    description: 'Fais passer le téléphone avant que ça pète !',
    mode: 'local',
    routeName: 'bombe',
    minPlayers: 2,
  },
  {
    id: 'roulette',
    name: 'Roulette',
    emoji: '🎯',
    description: 'Le hasard désigne un joueur.',
    mode: 'local',
    routeName: 'roulette',
    minPlayers: 2,
  },
  {
    id: 'palmier',
    name: 'Jeu du palmier',
    emoji: '🌴',
    description: 'Tire une carte, applique la règle.',
    mode: 'local',
    routeName: 'palmier',
    minPlayers: 2,
  },
  {
    id: 'chrono',
    name: "Chrono à l'aveugle",
    emoji: '⏱️',
    description: 'Arrête le chrono pile au bon moment… sans regarder.',
    mode: 'local',
    routeName: 'chrono',
    minPlayers: 2,
  },
  {
    id: 'confessions',
    name: 'Confessions anonymes',
    emoji: '🤫',
    description: 'Qui a écrit ce secret ?',
    mode: 'local',
    routeName: 'confessions',
    minPlayers: 3,
  },
]

export const ONLINE_GAMES: GameInfo[] = [
  {
    id: 'susceptible',
    name: 'Qui est le plus susceptible de… ?',
    emoji: '👉',
    description: 'Tout le monde vote, le plus désigné boit.',
    mode: 'online',
    routeName: 'susceptible',
    minPlayers: 3,
  },
  {
    id: 'quiz',
    name: 'Quiz de potes',
    emoji: '❓',
    description: 'Qui connaît le mieux ses amis ?',
    mode: 'online',
    routeName: 'quiz',
    minPlayers: 2,
  },
]
