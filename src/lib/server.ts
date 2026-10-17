// Adresse du serveur des jeux en ligne (temps réel, photos).
//
// En développement et en démo sur le réseau local : vide, le front et le serveur partagent
// la même adresse (Vite redirige /socket.io et /rooms vers le serveur).
// En ligne (front sur Vercel, serveur sur Render) : VITE_SERVER_URL=https://….onrender.com
export const SERVER_URL = (import.meta.env.VITE_SERVER_URL ?? '').replace(/\/+$/, '')

/** Le serveur est-il hébergé ailleurs que le front ? (il peut alors être en veille) */
export const REMOTE_SERVER = SERVER_URL !== ''

/** Adresse complète d'un chemin du serveur (« /rooms/KBZT/… ») */
export function serverUrl(path: string): string {
  return path.startsWith('/') ? SERVER_URL + path : path
}
