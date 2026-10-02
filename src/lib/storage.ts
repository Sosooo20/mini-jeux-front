// Accès au localStorage protégé (navigation privée, stockage plein…)
//
// En développement, `?joueur=2` dans l'adresse fait de l'onglet un autre joueur : ses clés
// (identifiant, pseudo, photo, salon) sont suffixées « :2 ». Pratique pour tester un salon
// à plusieurs sur un seul ordinateur. Le numéro est retenu pour tout l'onglet.
const DEV_PLAYER_KEY = 'mini-jeux:joueur'

function devPlayer(): string | null {
  if (!import.meta.env.DEV) return null
  try {
    const fromUrl = new URLSearchParams(location.search).get('joueur')
    if (fromUrl) sessionStorage.setItem(DEV_PLAYER_KEY, fromUrl)
    return sessionStorage.getItem(DEV_PLAYER_KEY)
  } catch {
    return null
  }
}

const suffix = devPlayer()

/** Clé propre au joueur de cet onglet */
export const playerKey = (key: string) => (suffix ? `${key}:${suffix}` : key)

export function readItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeItem(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    /* stockage indisponible : la valeur reste en mémoire pour cette session */
  }
}
