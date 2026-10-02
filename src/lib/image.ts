// Préparation des photos sur le téléphone avant l'envoi : plus légères, plus rapides.

async function decode(file: Blob): Promise<ImageBitmap> {
  try {
    // L'orientation de l'appareil photo (EXIF) est appliquée par défaut
    return await createImageBitmap(file)
  } catch {
    throw new Error('Impossible de lire cette image (format non pris en charge ?).')
  }
}

function toJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Impossible de préparer l'image."))),
      'image/jpeg',
      quality,
    ),
  )
}

/** Photo de profil : plus grand carré au centre, réduit à size × size */
export async function squareJpeg(file: Blob, size = 256, quality = 0.82): Promise<Blob> {
  const img = await decode(file)
  const side = Math.min(img.width, img.height)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  canvas
    .getContext('2d')!
    .drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size)
  img.close()
  return toJpeg(canvas, quality)
}

/** Photo du jeu : réduite pour que le plus grand côté fasse au plus `max` pixels */
export async function resizedJpeg(file: Blob, max = 1280, quality = 0.8): Promise<Blob> {
  const img = await decode(file)
  const scale = Math.min(1, max / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
  img.close()
  return toJpeg(canvas, quality)
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export const dataUrlToBlob = (dataUrl: string) => fetch(dataUrl).then((r) => r.blob())
