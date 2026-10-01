export type GameMode = 'local' | 'online'

export interface GameInfo {
  id: string
  name: string
  emoji: string
  description: string
  mode: GameMode
  routeName: string
  minPlayers: number
}
