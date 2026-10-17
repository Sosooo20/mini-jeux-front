import { io, type Socket } from 'socket.io-client'
import type { ClientToServer, ServerToClient } from '@/lib/protocol'
import { playerKey, readItem, writeItem } from '@/lib/storage'
import { SERVER_URL } from '@/lib/server'

const PLAYER_ID_KEY = playerKey('mini-jeux:player-id')

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
  let id = readItem(PLAYER_ID_KEY)
  if (!id) {
    id = randomId()
    writeItem(PLAYER_ID_KEY, id)
  }
  return id
}

export type GameSocket = Socket<ServerToClient, ClientToServer>

let socket: GameSocket | null = null

export function useSocket(): GameSocket {
  if (!socket) {
    // Sans adresse : même serveur que le front (développement, démo sur le réseau local)
    const options = { auth: { playerId: getPlayerId() }, autoConnect: false }
    socket = SERVER_URL ? io(SERVER_URL, options) : io(options)
  }
  return socket
}
