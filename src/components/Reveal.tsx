import { motion, type Variants } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  once?: boolean
}

/**
 * Reveal — simple fade-up + slight scale on scroll into view.
 * Use this for generic section content.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 32,
  once = true,
}: Props) {
  const ref = useRef(null)
  const variants: Variants = {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.75,
        delay,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-10% 0px -10% 0px' }}
      variants={variants}
    >
      {children}
    </motion.div>
  )
}
