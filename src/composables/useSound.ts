// Sons générés avec Web Audio : pas de fichier à charger, marche hors ligne.
// Sur iPhone, le son ne peut démarrer qu'après un appui : appeler `unlockAudio()` dans un clic.

let ctx: AudioContext | null = null

export function unlockAudio() {
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
  } catch {
    ctx = null
  }
}

function beep(frequency: number, duration: number, volume = 0.3, type: OscillatorType = 'square') {
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(volume, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  osc.connect(gain).connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + duration)
}

export function playTick() {
  beep(1200, 0.05, 0.2)
}

export function playDing() {
  beep(880, 0.4, 0.25, 'sine')
}

export function playExplosion() {
  if (!ctx) return
  const duration = 1.2
  const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    // Bruit blanc qui s'éteint progressivement
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2)
  }
  const source = ctx.createBufferSource()
  const filter = ctx.createBiquadFilter()
  const gain = ctx.createGain()
  source.buffer = buffer
  filter.type = 'lowpass'
  filter.frequency.value = 900
  gain.gain.value = 0.8
  source.connect(filter).connect(gain).connect(ctx.destination)
  source.start()
}
