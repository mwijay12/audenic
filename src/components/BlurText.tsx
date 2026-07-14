import { motion, type Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

type Props = {
  text: string
  className?: string
  delay?: number
  staggerChildren?: number
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div'
}

const container: Variants = {
  hidden: {},
  visible: (custom: { stagger: number; delay: number }) => ({
    transition: {
      staggerChildren: custom.stagger,
      delayChildren: custom.delay,
    },
  }),
}

const word: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(12px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
}

/**
 * BlurText — splits a string into words and reveals them with a blur+fade.
 * Stagger and delay are customizable.
 */
export default function BlurText({
  text,
  className,
  delay = 0,
  staggerChildren = 0.08,
  as: As = 'h1',
}: Props) {
  const words = text.split(' ')

  return (
    <motion.div
      className={cn('inline-block', className)}
      variants={container}
      custom={{ stagger: staggerChildren, delay }}
      initial="hidden"
      animate="visible"
      aria-label={text}
    >
      {words.map((w, i) => (
        <span
          key={i}
          aria-hidden
          className="inline-block overflow-hidden align-baseline mr-[0.28em] last:mr-0"
        >
          <motion.span variants={word} className="inline-block">
            {w}
          </motion.span>
        </span>
      ))}
    </motion.div>
  )
}
