import { motion, useScroll, useTransform, useSpring, type MotionValue } from 'framer-motion'
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
 */
export default function Parallax({
  children,
  className,
  speed = 0.3,
  scale = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  // Map 0→1 scroll progress to -speed*100 → +speed*100 px
  const range = speed * 120
  const yRaw: MotionValue<number> = useTransform(scrollYProgress, [0, 1], [range, -range])
  const y = useSpring(yRaw, { stiffness: 120, damping: 30, mass: 0.3 })

  const scaleRaw = useTransform(scrollYProgress, [0, 0.5, 1], scale ? [0.92, 1, 1.08] : [1, 1, 1])
  const scaleSpring = useSpring(scaleRaw, { stiffness: 120, damping: 30 })

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ y, scale: scale ? scaleSpring : 1 }}
    >
      {children}
    </motion.div>
  )
}
