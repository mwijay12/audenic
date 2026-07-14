import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * ParticleField — lightweight, mobile-friendly 2D canvas.
 * Renders drifting soft dots that react to the cursor.
 * Auto-pauses on tab hidden, respects `prefers-reduced-motion`.
 */
export default function ParticleField({
  className,
  count = 60,
  color = '255, 77, 26',
}: {
  className?: string
  count?: number
  color?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia('(pointer: coarse)').matches
    if (reduceMotion) return

    let raf = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const actualCount = isMobile ? Math.floor(count / 2) : count

    let w = 0
    let h = 0

    const setSize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }
    setSize()
    const ro = new ResizeObserver(setSize)
    ro.observe(canvas)

    const mouse = { x: w / 2, y: h / 2, active: false }
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
      mouse.active = true
    }
    const onLeave = () => (mouse.active = false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseout', onLeave)

    type P = { x: number; y: number; vx: number; vy: number; r: number }
    const particles: P[] = Array.from({ length: actualCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 0.4,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy

        // Soft pull toward mouse
        if (mouse.active) {
          const dx = mouse.x - p.x
          const dy = mouse.y - p.y
          const dist = Math.hypot(dx, dy)
          if (dist < 180) {
            p.vx += (dx / dist) * 0.002
            p.vy += (dy / dist) * 0.002
          }
        }

        // Friction
        p.vx *= 0.985
        p.vy *= 0.985

        // Wrap
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color}, 0.55)`
        ctx.fill()
      }

      // Connect nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d = Math.hypot(dx, dy)
          if (d < 110) {
            ctx.strokeStyle = `rgba(${color}, ${0.12 * (1 - d / 110)})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseout', onLeave)
    }
  }, [count, color])

  return <canvas ref={ref} className={cn('absolute inset-0 w-full h-full', className)} />
}
