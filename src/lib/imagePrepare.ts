// Préparation d'une photo (décodage, recadrage / réduction, compression JPEG).
// Utilisé dans le worker (lib/image.worker.ts) et, en secours, sur le fil principal.

export type ImageJob =
  /** Photo de profil : plus grand carré au centre, réduit à size × size */
  | { kind: 'square'; size: number; quality: number }
  /** Photo du jeu : plus grand côté réduit à max pixels */
  | { kind: 'fit'; max: number; quality: number }

/** En dessous de cette taille, décoder en entier est déjà rapide */
const SMALL_FILE_BYTES = 1_500_000

async function decode(file: Blob, hintWidth: number): Promise<ImageBitmap> {
  // Grosses photos de téléphone : on demande au navigateur de décoder directement en petit
  // (plus rapide, et beaucoup moins de mémoire qu'une image de 12 à 50 Mpx)
  if (file.size > SMALL_FILE_BYTES) {
    try {
      return await createImageBitmap(file, { resizeWidth: hintWidth, resizeQuality: 'high' })
    } catch {
      /* option non prise en charge : décodage complet ci-dessous */
    }
  }
  try {
    // L'orientation de l'appareil photo (EXIF) est appliquée par défaut
    return await createImageBitmap(file)
  } catch {
    throw new Error('Impossible de lire cette image (format non pris en charge ?).')
  }
}

function makeCanvas(width: number, height: number): OffscreenCanvas | HTMLCanvasElement {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(width, height)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

function toJpeg(canvas: OffscreenCanvas | HTMLCanvasElement, quality: number): Promise<Blob> {
  if ('convertToBlob' in canvas) return canvas.convertToBlob({ type: 'image/jpeg', quality })
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Impossible de préparer l'image."))),
      'image/jpeg',
      quality,
    ),
  )
}

export async function prepareImage(file: Blob, job: ImageJob): Promise<Blob> {
  // Indice de largeur au décodage : le double du carré final pour le profil (marge pour le
  // recadrage), la taille finale pour le jeu
  const img = await decode(file, job.kind === 'square' ? job.size * 2 : job.max)
  let canvas: OffscreenCanvas | HTMLCanvasElement
  if (job.kind === 'square') {
    const side = Math.min(img.width, img.height)
    canvas = makeCanvas(job.size, job.size)
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    ctx.drawImage(
      img,
      (img.width - side) / 2,
      (img.height - side) / 2,
      side,
      side,
      0,
      0,
      job.size,
      job.size,
    )
  } else {
    const scale = Math.min(1, job.max / Math.max(img.width, img.height))
    canvas = makeCanvas(Math.round(img.width * scale), Math.round(img.height * scale))
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  }
  img.close()
  return toJpeg(canvas, job.quality)
}
