// Photos préparées sur le téléphone avant l'envoi : plus légères, plus rapides.
// Le travail se fait dans un worker (l'écran ne fige pas) ; en secours, sur le fil principal.
import { prepareImage, type ImageJob } from './imagePrepare'

type Pending = { resolve: (blob: Blob) => void; reject: (error: Error) => void }

let worker: Worker | null = null
let nextId = 0
const pending = new Map<number, Pending>()

function getWorker(): Worker | null {
  if (worker) return worker
  if (typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined') return null
  try {
    worker = new Worker(new URL('./image.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (event: MessageEvent<{ id: number; blob?: Blob; error?: string }>) => {
      const { id, blob, error } = event.data
      const job = pending.get(id)
      pending.delete(id)
      if (blob) job?.resolve(blob)
      else job?.reject(new Error(error ?? "Impossible de préparer l'image."))
    }
    return worker
  } catch {
    return null
  }
}

async function run(file: Blob, job: ImageJob): Promise<Blob> {
  const w = getWorker()
  if (w) {
    try {
      return await new Promise<Blob>((resolve, reject) => {
        const id = nextId++
        pending.set(id, { resolve, reject })
        w.postMessage({ id, file, job })
      })
    } catch (e) {
      // Image illisible : inutile de réessayer ailleurs
      if ((e as Error).message.startsWith('Impossible de lire')) throw e
    }
  }
  // Pas de worker (vieux navigateur) ou échec du worker : fil principal
  return prepareImage(file, job)
}

/** Photo de profil : plus grand carré au centre, réduit à size × size */
export const squareJpeg = (file: Blob, size = 256, quality = 0.82) =>
  run(file, { kind: 'square', size, quality })

/** Photo du jeu : réduite pour que le plus grand côté fasse au plus `max` pixels */
export const resizedJpeg = (file: Blob, max = 1280, quality = 0.8) =>
  run(file, { kind: 'fit', max, quality })

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export const dataUrlToBlob = (dataUrl: string) => fetch(dataUrl).then((r) => r.blob())
