import { useEffect, useRef, useState } from 'react'
import { useInView, useMotionValue, useSpring } from 'framer-motion'

/**
 * Animates a number from 0 to `target` with a spring when the element scrolls into view.
 * Decimals, commas, and suffixes (h, ms, etc.) are all preserved.
 */
export function useCountUp(target: number, duration = 1.5, decimals = 0) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20%' })
  const motion = useMotionValue(0)
  const spring = useSpring(motion, { duration: duration * 1000, bounce: 0 })
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (inView) motion.set(target)
  }, [inView, target, motion])

  useEffect(() => {
    return spring.on('change', (v) => {
      setDisplay(v.toFixed(decimals))
    })
  }, [spring, decimals])

  return { ref, display }
}

/** Formatted count-up, e.g. useCountUp(128400) → "128,400" */
export function useFormattedCount(target: number, duration = 2) {
  const { ref, display } = useCountUp(target, duration, 0)
  const formatted = Number(display).toLocaleString('en-US')
  return { ref, display: formatted }
}
