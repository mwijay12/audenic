import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/**
 * Soft custom cursor — small ring that follows the pointer.
 * Hidden on touch devices.
 */
export default function Cursor() {
  const [hidden, setHidden] = useState(true)
  const [variant, setVariant] = useState<'default' | 'hover'>('default')
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 500, damping: 30, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 500, damping: 30, mass: 0.5 })

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const move = (e: MouseEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setHidden(false)
    }
    const leave = () => setHidden(true)
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('a, button, [data-cursor="hover"]')) setVariant('hover')
      else setVariant('default')
    }

    window.addEventListener('mousemove', move)
    window.addEventListener('mouseout', leave)
    window.addEventListener('mouseover', over)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseout', leave)
      window.removeEventListener('mouseover', over)
    }
  }, [x, y])

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-[100] mix-blend-difference"
      style={{ x: sx, y: sy }}
      animate={{
        opacity: hidden ? 0 : 1,
        scale: variant === 'hover' ? 2.4 : 1,
      }}
      transition={{ duration: 0.18 }}
    >
      <div
        className={`relative -translate-x-1/2 -translate-y-1/2 rounded-full ${
          variant === 'hover' ? 'w-3 h-3 bg-cream-50' : 'w-2.5 h-2.5 bg-flame-500'
        }`}
      />
    </motion.div>
  )
}
