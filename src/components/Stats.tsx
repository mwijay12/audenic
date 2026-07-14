import { useRef, useEffect, useState } from 'react'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'

type Stat = { value: number; label: string; suffix?: string; decimals?: number }

export default function Stats({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
      {stats.map((s, i) => (
        <StatCell key={i} {...s} index={i} total={stats.length} />
      ))}
    </div>
  )
}

function StatCell({
  value,
  label,
  suffix,
  decimals = 0,
  index,
  total,
}: Stat & { index: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15%' })
  const [display, setDisplay] = useState('0')
  const motionValue = useMotionValue(0)
  const displayValue = useTransform(motionValue, (latest) =>
    decimals > 0 ? latest.toFixed(decimals) : Math.round(latest).toString()
  )

  useEffect(() => {
    if (!inView) return
    const controls = animate(motionValue, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
    })
    const unsub = displayValue.on('change', (v) => setDisplay(v))
    return () => {
      controls.stop()
      unsub()
    }
  }, [inView, value, decimals, motionValue, displayValue])

  const formatted = decimals === 0 && value >= 100
    ? Number(display).toLocaleString('en-US')
    : display

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-500 mb-3">
        0{index + 1} / {String(total).padStart(2, '0')}
      </p>
      <p className="font-display text-5xl md:text-6xl lg:text-7xl font-medium tracking-tightest text-ink-900">
        {formatted}
        {suffix && <span className="text-flame-500">{suffix}</span>}
      </p>
      <p className="mt-3 text-sm text-ink-500">{label}</p>
    </motion.div>
  )
}
