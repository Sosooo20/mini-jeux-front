// Worker : prépare les photos sans bloquer l'écran (le décodage d'une photo de téléphone
// peut prendre plus d'une seconde sur mobile).
import { prepareImage, type ImageJob } from './imagePrepare'

interface Request {
  id: number
  file: Blob
  job: ImageJob
}

self.onmessage = async (event: MessageEvent<Request>) => {
  const { id, file, job } = event.data
  try {
    const blob = await prepareImage(file, job)
    self.postMessage({ id, blob })
  } catch (e) {
    self.postMessage({ id, error: (e as Error).message })
  }
}
