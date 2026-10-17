import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useSocket, getPlayerId } from '@/lib/socket'
import {
  PLAYER_HEADER,
  type Ack,
  type GameId,
  type PlayerView,
  type RoomView,
  type Category,
} from '@/lib/protocol'
import { playerKey, readItem, writeItem } from '@/lib/storage'
import { serverUrl } from '@/lib/server'

/** Dernier salon rejoint : à la réouverture de l'appli, on se reconnecte pour le retrouver */
const LAST_ROOM_KEY = playerKey('mini-jeux:last-room')
const REQUEST_TIMEOUT_MS = 8000

/**
 * Salon en ligne. Le serveur arbitre tout : ce store garde simplement le dernier état
 * reçu (`view`) et envoie les actions du joueur.
 */
export const useRoomStore = defineStore('room', () => {
  const socket = useSocket()

  const view = ref<RoomView | null>(null)
  const status = ref<'idle' | 'connecting' | 'connected' | 'disconnected'>('idle')
  /** true dès que le serveur a dit dans quel salon on est (ou aucun) après la connexion */
  const sessionReady = ref(false)
  /**
   * Salon où on était et que le serveur ne connaît plus (redémarrage du serveur, ou salon
   * resté vide trop longtemps) : on l'explique au lieu de renvoyer vers « rejoindre ».
   */
  const lostRoom = ref<string | null>(null)
  /** Décalage entre l'horloge du serveur et celle du téléphone */
  const clockOffset = ref(0)
  let started = false

  const me = computed<PlayerView | null>(
    () => view.value?.players.find((p) => p.id === view.value?.me) ?? null,
  )
  const isHost = computed(() => me.value?.isHost ?? false)
  const lastRoom = () => readItem(LAST_ROOM_KEY)

  /** Les adresses des images viennent du serveur : complètes si le serveur est ailleurs */
  function withServerUrls(v: RoomView): RoomView {
    return {
      ...v,
      players: v.players.map((p) => ({ ...p, avatarUrl: p.avatarUrl && serverUrl(p.avatarUrl) })),
      photo: v.photo && {
        ...v.photo,
        photos: v.photo.photos.map((photo) => ({ ...photo, url: serverUrl(photo.url) })),
      },
    }
  }

  function setView(next: RoomView | null) {
    view.value = next && withServerUrls(next)
    if (next) {
      lostRoom.value = null
      clockOffset.value = next.serverNow - Date.now()
      writeItem(LAST_ROOM_KEY, next.code)
    }
  }

  /** Ouvre la connexion temps réel (une seule fois) */
  function connect() {
    if (started) return
    started = true
    status.value = 'connecting'

    socket.on('connect', () => (status.value = 'connected'))
    socket.on('disconnect', () => {
      status.value = 'disconnected'
      sessionReady.value = false
    })
    socket.on('connect_error', () => (status.value = 'disconnected'))
    socket.on('session', (v) => {
      // Le téléphone se croyait dans un salon, le serveur ne le connaît pas : il a disparu
      const last = lastRoom()
      if (!v && last) lostRoom.value = last
      setView(v)
      if (!v) writeItem(LAST_ROOM_KEY, null)
      sessionReady.value = true
    })
    socket.on('room:state', setView)

    // Au retour dans l'appli (téléphone déverrouillé), on se reconnecte sans attendre
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && !socket.connected) socket.connect()
    })

    socket.connect()
  }

  /** Envoie une action et attend la réponse du serveur (erreur = exception avec message) */
  function call<T>(send: (ack: Ack<T>) => void): Promise<T> {
    connect()
    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error('Le serveur ne répond pas. Vérifie ta connexion.')),
        REQUEST_TIMEOUT_MS,
      )
      send((res) => {
        clearTimeout(timer)
        if (res.ok) resolve(res.data)
        else reject(new Error(res.error))
      })
    })
  }

  // ---------- Salon ----------

  const create = (pseudo: string) =>
    call<{ code: string }>((ack) => socket.emit('room:create', { pseudo }, ack)).then((d) => d.code)

  const join = (code: string, pseudo: string) =>
    call((ack) => socket.emit('room:join', { code, pseudo }, ack))

  async function leave() {
    await call((ack) => socket.emit('room:leave', ack))
    view.value = null
    writeItem(LAST_ROOM_KEY, null)
  }

  const updatePseudo = (pseudo: string) =>
    call((ack) => socket.emit('player:update', { pseudo }, ack))

  // ---------- Jeux ----------

  const startGame = (game: GameId, options: { rounds?: number; category?: Category } = {}) =>
    call((ack) => socket.emit('game:start', { game, ...options }, ack))
  const nextStep = () => call((ack) => socket.emit('game:next', ack))
  const stopGame = () => call((ack) => socket.emit('game:stop', ack))
  const vote = (target: string) => call((ack) => socket.emit('vote:cast', { target }, ack))
  const answer = (choice: number) => call((ack) => socket.emit('quiz:answer', { choice }, ack))
  const writeConfession = (text: string) =>
    call((ack) => socket.emit('confession:write', { text }, ack))
  const guessAuthor = (author: string) =>
    call((ack) => socket.emit('confession:guess', { author }, ack))
  const submitDefinition = (text: string) =>
    call((ack) => socket.emit('dico:submit', { text }, ack))
  const tapFastest = (p: { roundId: string; reactionMs?: number; early?: boolean }) =>
    call((ack) => socket.emit('fastest:tap', p, ack))
  const startPhotoGame = (target: string) =>
    call((ack) => socket.emit('photo:start', { target }, ack))
  const finishPhotoGame = () => call((ack) => socket.emit('photo:finish', ack))

  // ---------- Fichiers (HTTP) ----------

  async function send(
    method: 'PUT' | 'DELETE' | 'POST',
    path: string,
    body?: Blob,
    code = view.value?.code,
  ) {
    if (!code) throw new Error("Tu n'es dans aucun salon.")
    const res = await fetch(serverUrl(`/rooms/${code}/${path}`), {
      method,
      headers: { [PLAYER_HEADER]: getPlayerId(), ...(body && { 'Content-Type': 'image/jpeg' }) },
      body,
    })
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      throw new Error(data?.error ?? "L'envoi a échoué.")
    }
  }

  /** `code` : à préciser juste après avoir rejoint (l'état du salon peut ne pas être arrivé) */
  const uploadAvatar = (jpeg: Blob | null, code?: string) =>
    jpeg ? send('PUT', 'avatar', jpeg, code) : send('DELETE', 'avatar', undefined, code)
  const uploadPhoto = (jpeg: Blob) => send('POST', 'photos', jpeg)

  // ---------- Aides d'affichage ----------

  const playerById = (id: string) => view.value?.players.find((p) => p.id === id)
  const nameOf = (id: string) => playerById(id)?.pseudo ?? '?'
  /** Heure actuelle du serveur (pour les comptes à rebours) */
  const serverNow = () => Date.now() + clockOffset.value

  return {
    view,
    status,
    sessionReady,
    lostRoom,
    me,
    isHost,
    lastRoom,
    connect,
    create,
    join,
    leave,
    updatePseudo,
    startGame,
    nextStep,
    stopGame,
    vote,
    answer,
    writeConfession,
    guessAuthor,
    submitDefinition,
    tapFastest,
    startPhotoGame,
    finishPhotoGame,
    uploadAvatar,
    uploadPhoto,
    playerById,
    nameOf,
    serverNow,
  }
})
