import { useRef, useState, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { cn } from '@/lib/utils'

type Props = {
  children: ReactNode
  onClick?: () => void
  className?: string
  strength?: number
  href?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}

/**
 * MagnetButton — pulls toward the cursor while hovered.
 * Works as <button> by default, or as <a> when `href` is set.
 */
export default function MagnetButton({
  children,
  onClick,
  className,
  strength = 0.35,
  href,
  type = 'button',
  disabled,
}: Props) {
  const ref = useRef<HTMLElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 })

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    x.set(dx * strength)
    y.set(dy * strength)
  }

  const reset = () => {
    x.set(0)
    y.set(0)
  }

  const Component: any = href ? motion.a : motion.button
  const props: any = {
    ref,
    style: { x: sx, y: sy },
    onMouseMove: onMove,
    onMouseLeave: reset,
    className: cn('inline-flex items-center gap-2', className),
  }
  if (href) {
    props.href = href
  } else {
    props.type = type
    props.onClick = onClick
    props.disabled = disabled
  }

  return <Component {...props}>{children}</Component>
}
