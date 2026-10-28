// Hand rolled canvas confetti. About two seconds, fires once, then cleans up.

interface Piece {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rot: number
  vrot: number
  colour: string
}

const COLOURS = ['#32d09f', '#14926c', '#8b5cf6', '#c9b6f9', '#ffb45c', '#15171d']

export function fireConfetti(durationMs = 2000) {
  if (typeof document === 'undefined') return
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  if (reduced) return

  const canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999'
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    canvas.remove()
    return
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = window.innerWidth
  const h = window.innerHeight
  canvas.width = w * dpr
  canvas.height = h * dpr
  ctx.scale(dpr, dpr)

  const count = w < 600 ? 90 : 160
  const pieces: Piece[] = []
  for (let i = 0; i < count; i++) {
    pieces.push({
      x: w * (0.5 + (Math.random() - 0.5) * 0.5),
      y: h * 0.35 + Math.random() * 40,
      vx: (Math.random() - 0.5) * 9,
      vy: -6 - Math.random() * 9,
      size: 5 + Math.random() * 7,
      rot: Math.random() * Math.PI,
      vrot: (Math.random() - 0.5) * 0.35,
      colour: COLOURS[Math.floor(Math.random() * COLOURS.length)],
    })
  }

  const start = performance.now()
  let raf = 0

  const frame = (now: number) => {
    const elapsed = now - start
    const life = Math.min(elapsed / durationMs, 1)
    ctx.clearRect(0, 0, w, h)

    for (const p of pieces) {
      p.vy += 0.32
      p.vx *= 0.995
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vrot

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.globalAlpha = 1 - life * life
      ctx.fillStyle = p.colour
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
      ctx.restore()
    }

    if (elapsed < durationMs) {
      raf = requestAnimationFrame(frame)
    } else {
      cancelAnimationFrame(raf)
      canvas.remove()
    }
  }

  raf = requestAnimationFrame(frame)
}
