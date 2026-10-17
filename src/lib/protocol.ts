// ⚠️ Copie générée depuis back/src/protocol.ts (npm run sync-protocol) : ne pas modifier ici.
// Contrat de messages entre le serveur et les téléphones.
// Source de vérité : back/src/protocol.ts. Copié vers front/src/lib/protocol.ts
// avec `npm run sync-protocol` (dans back/) : ne pas modifier la copie du front.

export const MAX_PLAYERS = 12
export const PSEUDO_MAX_LENGTH = 20
export const VOTE_SECONDS = 30
export const ROOM_CODE_LENGTH = 4
/** Confessions : temps pour écrire son secret, nombre de manches, longueur max */
export const WRITE_SECONDS = 120
export const CONFESSION_ROUNDS = 3
export const CONFESSION_MAX_LENGTH = 280
/** À 2, on n'a qu'un seul auteur possible : impossible de se tromper */
export const CONFESSION_MIN_PLAYERS = 3
/** Le plus rapide : compte à rebours, attente cachée avant le bouton, temps pour appuyer */
export const FASTEST_COUNTDOWN_SECONDS = 3
export const FASTEST_MIN_WAIT_MS = 2000
export const FASTEST_MAX_WAIT_MS = 8000
export const FASTEST_TIMEOUT_MS = 5000
/** Marge réseau : le serveur clôt la manche 1 s après le temps limite */
export const FASTEST_COLLECT_MS = 6000
/** En dessous, impossible pour un humain : compté comme faux départ */
export const FASTEST_MIN_REACTION_MS = 80

/** Dico des potes : lecture du mot, écriture, vote, longueur max, manches */
export const DICO_WORD_SECONDS = 5
export const DICO_WRITE_SECONDS = 45
export const DICO_VOTE_SECONDS = 30
export const DICO_MAX_LENGTH = 140
export const DICO_MIN_PLAYERS = 3
export const DICO_DEFAULT_ROUNDS = 5
export const DICO_MAX_ROUNDS = 10

export type GameId = 'susceptible' | 'quiz' | 'confessions' | 'fastest' | 'dico'

/**
 * Jeux à questions (Qui de nous, Quiz, Dico) : niveau d'une question, et catégorie choisie
 * par l'hôte au lancement (mix = les deux)
 */
export type Level = 'soft' | 'spicy'
export type Category = Level | 'mix'
export const CATEGORIES: Category[] = ['soft', 'spicy', 'mix']

export interface PlayerView {
  /** Identifiant public (empreinte du jeton secret, qui lui n'est jamais envoyé) */
  id: string
  pseudo: string
  /** Adresse de la photo de profil (null = rond avec l'initiale) */
  avatarUrl: string | null
  /** online = connecté · paused = déconnecté depuis moins de 60 s · away = absent */
  status: 'online' | 'paused' | 'away'
  isHost: boolean
}

// ---------- Qui est le plus susceptible de… ? ----------

export type SusceptibleView =
  | {
      id: 'susceptible'
      phase: 'vote'
      category: Category
      question: string
      level: Level
      deadline: number
      /** Qui a déjà voté (pas pour qui) */
      voted: string[]
      myVote: string | null
    }
  | {
      id: 'susceptible'
      phase: 'reveal'
      category: Category
      question: string
      level: Level
      /** votant -> désigné */
      votes: Record<string, string>
      /** Le ou les plus désignés : ils boivent */
      losers: string[]
    }

// ---------- Quiz de potes ----------

export interface QuizRound {
  /** Numéro de la manche (1, 2…) et nombre total */
  round: number
  totalRounds: number
  targetId: string
  question: string
  choices: string[]
  category: Category
  level: Level
}

export type QuizView =
  | (QuizRound & {
      id: 'quiz'
      phase: 'answer'
      deadline: number
      /** Qui a déjà répondu (pas quoi) */
      answered: string[]
      myAnswer: number | null
      scores: Record<string, number>
    })
  | (QuizRound & {
      id: 'quiz'
      phase: 'reveal'
      /** Réponse de la cible (null = elle n'a pas répondu à temps) */
      correct: number | null
      /** joueur -> réponse choisie */
      answers: Record<string, number>
      scores: Record<string, number>
    })
  | {
      id: 'quiz'
      phase: 'final'
      scores: Record<string, number>
      winners: string[]
      losers: string[]
    }

// ---------- Confessions anonymes ----------

interface ConfessionsBase {
  id: 'confessions'
  /** Numéro de la manche (1, 2, 3) et nombre total */
  round: number
  totalRounds: number
  /** Erreurs cumulées par joueur : le plus d'erreurs boit à la fin */
  errors: Record<string, number>
}

export interface ConfessionReveal {
  text: string
  author: string
  /** Qui devait deviner cette phrase -> qui il a désigné (null = pas répondu à temps) */
  guesses: Record<string, string | null>
}

export type ConfessionsView =
  | (ConfessionsBase & {
      phase: 'write'
      deadline: number
      /** Qui a déjà écrit (pas quoi) */
      written: string[]
      mine: string | null
    })
  | (ConfessionsBase & {
      phase: 'guess'
      deadline: number
      /** La phrase à attribuer (null = pas de phrase pour moi cette manche) */
      text: string | null
      /** Auteurs possibles (tous ceux qui ont écrit, sauf moi) */
      choices: string[]
      myGuess: string | null
      /** Qui doit deviner / qui a déjà deviné */
      expected: string[]
      answered: string[]
    })
  | (ConfessionsBase & {
      phase: 'reveal'
      items: ConfessionReveal[]
    })
  | (ConfessionsBase & {
      phase: 'final'
      winners: string[]
      losers: string[]
    })

// ---------- Le plus rapide ----------

/** ok = a appuyé à temps · early = faux départ · timeout = trop lent (ou rien) */
export type FastestStatus = 'ok' | 'early' | 'timeout'

export interface FastestTap {
  status: FastestStatus
  /** Temps de réaction mesuré par le téléphone (null si faux départ ou trop lent) */
  ms: number | null
}

export interface FastestResult extends FastestTap {
  playerId: string
}

export type FastestView =
  | { id: 'fastest'; phase: 'countdown'; round: number; roundId: string; deadline: number; playing: boolean }
  | {
      id: 'fastest'
      // Pas d'échéance envoyée pendant l'attente : personne ne peut anticiper le bouton
      phase: 'waiting' | 'go'
      round: number
      roundId: string
      /** false = arrivé en cours de manche : spectateur */
      playing: boolean
      /** Qui a déjà appuyé (pas son temps) */
      tapped: string[]
      mine: FastestTap | null
    }
  | {
      id: 'fastest'
      phase: 'results'
      round: number
      /** Du plus rapide au plus lent, puis faux départs et trop lents */
      ranking: FastestResult[]
      losers: string[]
      defeats: Record<string, number>
    }
  | { id: 'fastest'; phase: 'final'; rounds: number; defeats: Record<string, number>; losers: string[] }

// ---------- Le dico des potes ----------

interface DicoRound {
  id: 'dico'
  /** Manche en cours (1, 2…) et nombre total */
  round: number
  rounds: number
  word: string
  category: Category
  level: Level
}

export type DicoView =
  | (DicoRound & { phase: 'word'; deadline: number })
  | (DicoRound & {
      phase: 'writing'
      deadline: number
      /** Qui a déjà envoyé sa définition (pas laquelle) */
      submitted: string[]
      mine: string | null
    })
  | (DicoRound & {
      phase: 'voting'
      deadline: number
      /** Mélangées, avec la vraie, JAMAIS d'auteur ici (mine : la sienne, qu'on ne peut pas choisir) */
      definitions: { id: string; text: string; mine: boolean }[]
      voted: string[]
      myVote: string | null
    })
  | (DicoRound & {
      phase: 'reveal'
      /** authorId null = la vraie définition */
      definitions: { id: string; text: string; authorId: string | null; voters: string[] }[]
      /** Points gagnés pendant la manche */
      gained: Record<string, number>
    })
  | (DicoRound & { phase: 'scores'; scores: Record<string, number>; gained: Record<string, number> })
  | (DicoRound & { phase: 'final'; scores: Record<string, number>; losers: string[] })

export type GameView = SusceptibleView | QuizView | ConfessionsView | FastestView | DicoView

// ---------- Jeu photo (en parallèle des autres jeux) ----------

export interface PhotoView {
  id: string
  by: string
  url: string
  at: number
}

export interface PhotoGameView {
  targetId: string
  photos: PhotoView[]
  /** Nombre de photos par photographe (la cible n'en fait pas partie) */
  counts: Record<string, number>
  /** Rempli quand l'hôte a terminé le jeu */
  result: { winners: string[]; losers: string[] } | null
}

// ---------- Salon ----------

/** Ce qu'un joueur voit du salon : construit par le serveur pour CE joueur */
export interface RoomView {
  code: string
  me: string
  players: PlayerView[]
  game: GameView | null
  photo: PhotoGameView | null
  /** Heure du serveur, pour corriger le décalage d'horloge du téléphone */
  serverNow: number
}

// ---------- Messages ----------

export type AckResult<T = null> = { ok: true; data: T } | { ok: false; error: string }
export type Ack<T = null> = (res: AckResult<T>) => void

export interface ClientToServer {
  'room:create': (p: { pseudo: string }, ack: Ack<{ code: string }>) => void
  'room:join': (p: { code: string; pseudo: string }, ack: Ack) => void
  'room:leave': (ack: Ack) => void
  'player:update': (p: { pseudo: string }, ack: Ack) => void
  'game:start': (
    p: { game: GameId; rounds?: number; category?: Category },
    ack: Ack,
  ) => void
  'game:next': (ack: Ack) => void
  'game:stop': (ack: Ack) => void
  'vote:cast': (p: { target: string }, ack: Ack) => void
  'quiz:answer': (p: { choice: number }, ack: Ack) => void
  'confession:write': (p: { text: string }, ack: Ack) => void
  'confession:guess': (p: { author: string }, ack: Ack) => void
  /** Durée mesurée par le téléphone, ou early: true pour un appui avant le bouton */
  /** Erreur (ack) si la définition est vide, trop longue, ou identique à une autre */
  'dico:submit': (p: { text: string }, ack: Ack) => void
  'dico:vote': (p: { definitionId: string }, ack: Ack) => void
  'fastest:tap': (p: { roundId: string; reactionMs?: number; early?: boolean }, ack: Ack) => void
  'photo:start': (p: { target: string }, ack: Ack) => void
  'photo:finish': (ack: Ack) => void
}

export interface ServerToClient {
  /** Envoyé à la connexion : le salon où l'on était (reconnexion), ou null */
  session: (view: RoomView | null) => void
  'room:state': (view: RoomView) => void
}

/** En-tête HTTP qui porte le jeton secret du joueur pour l'envoi de photos */
export const PLAYER_HEADER = 'x-player-id'
