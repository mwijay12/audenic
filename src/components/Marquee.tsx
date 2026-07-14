type Item = { label: string; value?: string }

type Props = { items: Item[]; separator?: string; className?: string; speed?: number }

/**
 * Infinite horizontal marquee. Pauses on hover.
 */
export default function Marquee({ items, separator = '✦', className, speed = 30 }: Props) {
  const content = items.map((it, i) => (
    <span key={i} className="inline-flex items-center gap-8 px-4">
      <span>{it.label}</span>
      {it.value && <span className="text-flame-500">{it.value}</span>}
      <span className="text-flame-500/70">{separator}</span>
    </span>
  ))

  return (
    <div
      className={`overflow-hidden flex whitespace-nowrap ${className ?? ''}`}
      style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}
    >
      <div
        className="flex shrink-0"
        style={{ animation: `marquee ${speed}s linear infinite` }}
      >
        {content}
        {content}
      </div>
    </div>
  )
}
