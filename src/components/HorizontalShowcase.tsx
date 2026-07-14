import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { products } from '@/data/products'
import { formatPrice, formatCount } from '@/lib/utils'
import Reveal from './Reveal'
import ScrollLetterShift from './ScrollLetterShift'

/**
 * The full lineup — a clean responsive grid showcasing the full product
 * collection on the home page. Uses premium dark background with
 * generous spacing so cards breathe and prices are scannable.
 *
 * Layout:
 *   - Mobile (default): 1 column
 *   - sm:               2 columns
 *   - lg:              4 columns (1 row, all visible at once)
 */
export default function HorizontalShowcase() {
  return (
    <section className="relative bg-ink-900 text-cream-50 py-24 md:py-32 overflow-hidden">
      <div className="container-fluid">
        {/* Header */}
        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16 md:mb-20">
            <div className="md:col-span-3">
              <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-flame-400">
                [ 03 / Collection ]
              </p>
            </div>
            <div className="md:col-span-9">
              <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-medium tracking-tightest leading-[1.05] text-balance">
                The full <ScrollLetterShift text="lineup" className="text-flame-400" />
              </h2>
              <p className="mt-6 max-w-xl text-lg text-cream-100/60 leading-relaxed text-pretty">
                Scroll down to see them all. Each one is a deliberate answer to
                a question only sound can ask.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Product grid — 1 col mobile, 2 col sm, 4 col lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {products.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08}>
              <ProductShowcaseCard product={p} index={i} />
            </Reveal>
          ))}
        </div>

        {/* Footer CTA */}
        <Reveal delay={0.4}>
          <div className="mt-16 flex justify-center">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-cream-50 hover:text-flame-400 transition-colors"
            >
              View the full collection
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function ProductShowcaseCard({
  product,
  index,
}: {
  product: (typeof products)[number]
  index: number
}) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="h-full"
    >
      <Link
        to={`/product/${product.slug}`}
        className="group relative block aspect-[4/5] rounded-3xl overflow-hidden bg-ink-800"
      >
        {/* Image */}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent" />

        {/* Top-left index */}
        <div className="absolute top-5 left-5 font-mono text-[10px] uppercase tracking-[0.3em] text-cream-50/70">
          {String(index + 1).padStart(2, '0')} / {String(products.length).padStart(2, '0')}
        </div>

        {/* Top-right reviews badge */}
        <div className="absolute top-5 right-5 font-mono text-[10px] uppercase tracking-[0.2em] text-cream-50/70">
          ★ {product.rating} · {formatCount(product.reviewCount)}
        </div>

        {/* Bottom content */}
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-flame-300 mb-2">
            {product.category}
          </p>
          <div className="flex items-end justify-between gap-4">
            <h3 className="font-display text-2xl md:text-3xl font-semibold leading-tight">
              {product.name}
            </h3>
            <ArrowUpRight
              size={22}
              className="shrink-0 text-cream-50 group-hover:text-flame-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
            />
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="font-mono text-sm text-cream-100/80">
              From {formatPrice(product.price, 'TSh')}
            </p>
            <div className="flex gap-1.5">
              {product.colors.slice(0, 4).map((c) => (
                <span
                  key={c.name}
                  className="w-3 h-3 rounded-full border border-cream-50/40"
                  style={{ background: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
