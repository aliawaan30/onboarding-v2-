// One short, soft ding. Same sound every time, generated with WebAudio so there
// are no audio assets to ship. Mute preference persists in localStorage.

const MUTE_KEY = 'portal.muted'

let ctx: AudioContext | null = null

let muted = false // sound is always on; toggle removed 2026-08-25

export function isMuted() {
  return muted
}

export function setMuted(next: boolean) {
  muted = next
  try {
    localStorage.setItem(MUTE_KEY, next ? '1' : '0')
  } catch {
    // ignore
  }
}

function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const Ctor: typeof AudioContext | undefined =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      ctx = new Ctor()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/** The step ding. Soft two note bell, about 350ms. */
export function ding() {
  if (muted) return
  const ac = getCtx()
  if (!ac) return
  const now = ac.currentTime
  const out = ac.createGain()
  out.gain.value = 0.13
  out.connect(ac.destination)

  const notes = [
    { freq: 880, at: 0, dur: 0.34 },
    { freq: 1318.5, at: 0.075, dur: 0.32 },
  ]

  for (const n of notes) {
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(n.freq, now + n.at)
    gain.gain.setValueAtTime(0.0001, now + n.at)
    gain.gain.exponentialRampToValueAtTime(1, now + n.at + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + n.at + n.dur)
    osc.connect(gain)
    gain.connect(out)
    osc.start(now + n.at)
    osc.stop(now + n.at + n.dur + 0.05)
  }
}

/** Soft click for button presses, about 60ms. */
export function tick() {
  const ac = getCtx()
  if (!ac) return
  const now = ac.currentTime
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(1650, now)
  osc.frequency.exponentialRampToValueAtTime(950, now + 0.05)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.06, now + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06)
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(now)
  osc.stop(now + 0.08)
}

/** The one big moment, at the final code gate. */
export function fanfare() {
  if (muted) return
  const ac = getCtx()
  if (!ac) return
  const now = ac.currentTime
  const out = ac.createGain()
  out.gain.value = 0.12
  out.connect(ac.destination)

  const notes = [523.25, 659.25, 783.99, 1046.5]
  notes.forEach((freq, i) => {
    const at = i * 0.11
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, now + at)
    gain.gain.setValueAtTime(0.0001, now + at)
    gain.gain.exponentialRampToValueAtTime(1, now + at + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + at + 0.7)
    osc.connect(gain)
    gain.connect(out)
    osc.start(now + at)
    osc.stop(now + at + 0.75)
  })
}
