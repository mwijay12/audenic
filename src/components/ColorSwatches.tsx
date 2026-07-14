import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type Props = {
  colors: { name: string; hex: string }[]
  selected: { name: string; hex: string }
  onChange: (color: { name: string; hex: string }) => void
  className?: string
}

export default function ColorSwatches({ colors, selected, onChange, className }: Props) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {colors.map((c) => {
        const active = c.name === selected.name
        return (
          <button
            key={c.name}
            type="button"
            onClick={() => onChange(c)}
            className="group relative flex flex-col items-center"
            aria-label={`Color: ${c.name}`}
          >
            <motion.span
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.92 }}
              animate={{ scale: active ? 1.15 : 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              className={cn(
                'block w-8 h-8 rounded-full border transition-shadow',
                active
                  ? 'border-ink-900 shadow-[0_0_0_2px_#fefdfb,0_0_0_4px_#0e0d0c]'
                  : 'border-ink-200 group-hover:border-ink-500'
              )}
              style={{ background: c.hex }}
            />
            <span
              className={cn(
                'mt-2 font-mono text-[9px] uppercase tracking-[0.2em] transition-colors',
                active ? 'text-ink-900' : 'text-ink-500 group-hover:text-ink-700'
              )}
            >
              {c.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
