import { useRef, useState, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

type Props = {
  children: ReactNode
  className?: string
  /** spotlight color */
  color?: string
  /** intensity multiplier */
  intensity?: number
}

/**
 * SpotlightCard — wraps content with a soft radial gradient that follows the cursor.
 * The card itself also tilts (3D perspective) as the user moves over it.
 */
export default function SpotlightCard({
  children,
  className,
  color = 'rgba(255, 77, 26, 0.18)',
  intensity = 1,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [hovering, setHovering] = useState(false)

  // 3D tilt
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 220, damping: 22 })
  const sry = useSpring(ry, { stiffness: 220, damping: 22 })
  const rotateX = useTransform(srx, (v) => `${v}deg`)
  const rotateY = useTransform(sry, (v) => `${v}deg`)

  // spotlight position
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    px.set(x)
    py.set(y)
    rx.set((0.5 - y) * 8 * intensity)
    ry.set((x - 0.5) * 8 * intensity)
  }

  const reset = () => {
    setHovering(false)
    rx.set(0)
    ry.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 1000, transformStyle: 'preserve-3d' }}
      className={cn('relative overflow-hidden rounded-3xl', className)}
    >
      {children}
      <motion.div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          background: useTransform(
            [px, py],
            ([x, y]) =>
              `radial-gradient(420px circle at ${(x as number) * 100}% ${(y as number) * 100}%, ${color}, transparent 60%)`
          ),
          opacity: hovering ? 1 : 0,
        }}
      />
    </motion.div>
  )
}
