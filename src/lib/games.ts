import type { LocalGame } from '@/types/game'

export const MAX_PLAYERS = 12

export const GAMES = {
  roulette: {
    name: 'Roulette du destin',
    accent: '#c0c1ff',
    onAccent: '#1000a9',
    minPlayers: 2,
  },
  bombe: {
    name: 'Bombe à retardement',
    accent: '#ffb4ab',
    onAccent: '#690005',
    minPlayers: 2,
  },
  palmier: {
    name: 'Jeu du palmier',
    accent: '#4ae176',
    onAccent: '#003915',
    minPlayers: 0,
  },
  chrono: {
    name: "Chrono à l'aveugle",
    accent: '#4cd7f6',
    onAccent: '#003640',
    minPlayers: 2,
  },
  confessions: {
    name: 'Confessions anonymes',
    accent: '#f751a1',
    onAccent: '#570032',
    minPlayers: 3,
  },
} satisfies Record<string, LocalGame>

/** Variables CSS à poser sur la page d'un jeu */
export function accentStyle(game: LocalGame) {
  return { '--accent': game.accent, '--on-accent': game.onAccent }
}
