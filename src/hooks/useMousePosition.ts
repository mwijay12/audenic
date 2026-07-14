import { useEffect, useState } from 'react'

/** Tracks mouse position normalized 0..1 across the viewport. */
export function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0, nx: 0.5, ny: 0.5 })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth
      const ny = e.clientY / window.innerHeight
      setPos({ x: e.clientX, y: e.clientY, nx, ny })
    }
    window.addEventListener('mousemove', handler, { passive: true })
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  return pos
}
