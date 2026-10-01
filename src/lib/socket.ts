import { io, type Socket } from 'socket.io-client'

const PLAYER_ID_KEY = 'mini-jeux:player-id'

/**
 * Identifiant aléatoire (format UUID v4).
 * `crypto.randomUUID()` n'existe qu'en https ou sur localhost : en démo sur le réseau local
 * (http://192.168…) il est absent, alors que `crypto.getRandomValues()` marche partout.
 */
function randomId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6]! & 0x0f) | 0x40 // version 4
  bytes[8] = (bytes[8]! & 0x3f) | 0x80 // variante RFC 4122
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

/**
 * Identifiant de joueur persistant : permet de retrouver sa place dans un salon
 * après un verrouillage du téléphone ou une coupure réseau.
 */
export function getPlayerId(): string {
  let id: string | null = null
  try {
    id = localStorage.getItem(PLAYER_ID_KEY)
  } catch {
    /* stockage indisponible */
  }
  if (!id) {
    id = randomId()
    try {
      localStorage.setItem(PLAYER_ID_KEY, id)
    } catch {
      /* stockage indisponible : identifiant valable pour cette session seulement */
    }
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
