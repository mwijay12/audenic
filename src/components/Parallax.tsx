import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
  speed?: number // -1 to 1, negative = move up faster than scroll
  scale?: boolean
}

/**
 * Parallax — translates children at a different rate than scroll.
 * Wrap large background images or text blocks that should drift.
 * Disabled on touch devices — native scroll is faster without it.
 */
export default function Parallax({
  children,
  className,
  speed = 0.3,
  scale = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  // Skip parallax on touch/mobile — native scroll is much faster
  const isTouchDevice =
    typeof window !== 'undefined' &&
    window.matchMedia('(pointer: coarse)').matches

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Use raw transforms — no spring wrapper (springs keep running ~600ms after scroll stops)
  const range = speed * 120
  const y: MotionValue<number> = useTransform(
    scrollYProgress,
    [0, 1],
    isTouchDevice ? [0, 0] : [range, -range]
  )

  const scaleValue = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    scale && !isTouchDevice ? [0.92, 1, 1.08] : [1, 1, 1]
  )

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ y, scale: scale ? scaleValue : 1, willChange: 'transform' }}
    >
      {children}
    </motion.div>
  )
}

