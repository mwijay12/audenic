import { motion, useScroll, useSpring, useTransform, useMotionValueEvent } from 'framer-motion'
import { useEffect, useState } from 'react'

/**
 * ScrollProgress — thin bar pinned to the top of the viewport.
 * Shows reading/scroll progress on the current page.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 30 })
  const [pct, setPct] = useState(0)

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setPct(Math.round(v * 100))
  })

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] bg-flame-500 z-[60] origin-left"
      style={{ scaleX }}
      aria-hidden
    >
      <span className="sr-only">Page scroll: {pct}%</span>
    </motion.div>
  )
}
