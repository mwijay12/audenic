import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'

type Props = {
  text: string
  className?: string
}

/**
 * ScrollLetterShift — splits text into letters and shifts each one vertically
 * by a different amount as the user scrolls past. Creates a hand-drawn
 * "letters rearranging" effect.
 */
export default function ScrollLetterShift({ text, className }: Props) {
  const ref = (motion as any).useElementRef ?? null
  // Fallback: use a window-level scroll progress so this works without a target ref
  const { scrollYProgress } = useScroll()
  const letters = text.split('')

  return (
    <span ref={ref} className={className} aria-label={text}>
      {letters.map((ch, i) => {
        // Stagger each letter's animation by index so they ripple
        const start = i * 0.008
        const end = start + 0.25
        const y = useTransform(scrollYProgress, [start, end], [40, 0])
        const opacity = useTransform(scrollYProgress, [start, end], [0.4, 1])
        return (
          <motion.span
            key={i}
            style={{ y, opacity, display: 'inline-block', willChange: 'transform' }}
            aria-hidden
          >
            {ch === ' ' ? '\u00A0' : ch}
          </motion.span>
        )
      })}
    </span>
  )
}
