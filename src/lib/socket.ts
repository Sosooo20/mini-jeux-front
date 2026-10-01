import { io, type Socket } from 'socket.io-client'

const PLAYER_ID_KEY = 'mini-jeux:player-id'

/**
 * Identifiant de joueur persistant : permet de retrouver sa place dans un salon
 * après un verrouillage du téléphone ou une coupure réseau.
 */
export function getPlayerId(): string {
  let id = localStorage.getItem(PLAYER_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(PLAYER_ID_KEY, id)
  }
  return id
}

let socket: Socket | null = null

export function useSocket(): Socket {
  if (!socket) {
    socket = io({ auth: { playerId: getPlayerId() }, autoConnect: false })
  }
  return socket
}
