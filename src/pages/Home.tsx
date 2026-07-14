import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Star, Plus, Check } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import BlurText from '@/components/BlurText'
import MagnetButton from '@/components/MagnetButton'
import ParticleField from '@/components/ParticleField'
import SpotlightCard from '@/components/SpotlightCard'
import Stats from '@/components/Stats'
import Marquee from '@/components/Marquee'
import Reveal from '@/components/Reveal'
import Parallax from '@/components/Parallax'
import HorizontalShowcase from '@/components/HorizontalShowcase'
import { useState } from 'react'
import { products, features, stats } from '@/data/products'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/store/cart'

export default function Home() {
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const addToCart = useCart((s) => s.add)
  const [justAdded, setJustAdded] = useState<string | null>(null)

  return (
    <>
      {/* HERO */}
      <section ref={heroRef} className="relative min-h-[100svh] overflow-hidden bg-cream-50">
        {/* Mobile: fewer particles. Desktop: medium. Capped via CSS contain. */}
        <ParticleField color="255, 77, 26" count={32} className="opacity-50 will-change-transform" />

        {/* Background word — GPU layer, doesn't repaint on scroll.
            Sizing: 320px → 11rem, 768px → 18rem, 1920px → 24rem. Always fits container. */}
        <div className="absolute inset-x-0 -top-4 sm:-top-8 md:-top-12 select-none pointer-events-none overflow-hidden will-change-transform">
          <motion.div
            style={{ y: heroY, willChange: 'transform' }}
            className="text-[clamp(5.5rem,28vw,24rem)] sm:text-[clamp(8rem,26vw,24rem)] md:text-[clamp(12rem,28vw,24rem)] font-display font-black leading-[0.85] tracking-[-0.05em] text-stroke text-ink-900/[0.06] text-center whitespace-nowrap"
          >
            AUDENIC
          </motion.div>
        </div>

        <motion.div style={{ opacity: heroOpacity }} className="relative container-fluid pt-24 sm:pt-28 md:pt-32 lg:pt-40 pb-16 sm:pb-20">
          {/* Top eyebrow */}
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <span className="w-6 sm:w-8 h-px bg-ink-300 shrink-0" />
            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-ink-500">
              [ 01 / Hero ] — New for 2026
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <BlurText
                text="Sound that lives in the room with you."
                className="font-display text-[clamp(2.25rem,8vw,5.5rem)] sm:text-display font-medium tracking-tightest text-balance leading-[0.95]"
                delay={0.2}
              />
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="mt-6 sm:mt-8 max-w-xl text-base sm:text-lg text-ink-600 leading-relaxed text-pretty"
              >
                A small studio in Dar es Salaam hand-tunes every Audenic device.
                No algorithms. No compromises. Just music, the way it was meant to be heard.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.8 }}
              className="lg:col-span-4 lg:text-right"
            >
              <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.3em] text-ink-500 mb-2 sm:mb-3">
                Starting at
              </p>
              <p className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-tightest">
                TSh 20K
              </p>
              <p className="mt-2 text-xs sm:text-sm text-ink-500">Mwanga Buds — True Wireless</p>
            </motion.div>
          </div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            className="mt-8 sm:mt-10 md:mt-12 flex flex-wrap items-center gap-3 sm:gap-4"
          >
            <MagnetButton href="/shop" className="btn-primary text-sm sm:text-base">
              Shop the collection
              <ArrowRight size={16} className="sm:size-[18px]" />
            </MagnetButton>
            <MagnetButton href="#features" className="btn-outline text-sm sm:text-base">
              See the craft
            </MagnetButton>
          </motion.div>

          {/* Bottom row: stats + meta */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="mt-12 sm:mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
          >
            <Meta label="Established" value="2019" />
            <Meta label="Hand-tuned in" value="Dar es Salaam" />
            <Meta label="Returns" value="60-day" />
            <Meta label="Warranty" value="Lifetime" />
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4, duration: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-500">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="w-px h-8 bg-ink-300"
          />
        </motion.div>
      </section>

      {/* MARQUEE STRIP */}
      <section className="py-8 border-y border-ink-200/60 bg-cream-100">
        <Marquee
          items={[
            { label: 'Free shipping', value: 'over TSh 200K' },
            { label: 'Lifetime warranty' },
            { label: 'Hand-tuned drivers' },
            { label: '60-day returns' },
            { label: 'Carbon-neutral' },
            { label: 'Crafted in Tanzania' },
          ]}
        />
      </section>

      {/* COLLECTIONS */}
      <section className="py-24 md:py-32 container-fluid">
        <Reveal>
          <SectionHeading
            number="02"
            label="Collection"
            title="Three families. One obsession."
            description="Every Audenic device is built around a use case. Pick the one that fits your day."
          />
        </Reveal>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { id: 'over-ear', name: 'Over-Ear', desc: 'Full immersion. Maximum soundstage.', count: '3 models' },
            { id: 'in-ear', name: 'In-Ear', desc: 'Pocket-sized. Built for movement.', count: '1 model' },
            { id: 'on-ear', name: 'On-Ear', desc: 'Lightweight. All-day comfort.', count: 'Coming soon' },
          ].map((c, i) => (
            <Reveal key={c.id} delay={i * 0.1}>
              <SpotlightCard className="bg-cream-100 aspect-[4/5] group cursor-pointer">
                <Link to="/shop" className="absolute inset-0 flex flex-col justify-between p-7">
                  <div className="flex items-start justify-between">
                    <span className="tag">
                      0{i + 1}
                    </span>
                    <span className="font-mono text-xs text-ink-500">{c.count}</span>
                  </div>
                  <div>
                    <h3 className="font-display text-4xl md:text-5xl font-medium tracking-tightest">
                      {c.name}
                    </h3>
                    <p className="mt-3 text-ink-600 text-pretty">{c.desc}</p>
                    <div className="mt-6 flex items-center gap-2 text-ink-900 group-hover:gap-4 transition-all">
                      <span className="font-medium">Browse</span>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* HORIZONTAL SHOWCASE — premium scroll-driven horizontal scroll */}
      <HorizontalShowcase />

      {/* STATS */}
      <section className="py-20 bg-ink-900 text-cream-100">
        <div className="container-fluid">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
            <div className="md:col-span-3">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-cream-100/50">
                [ 03 / Numbers ]
              </span>
            </div>
            <div className="md:col-span-9">
              <h2 className="font-display text-4xl md:text-5xl font-medium tracking-tightest text-balance text-cream-50">
                Six years. <span className="text-flame-400">A hundred thousand pairs.</span> One standard.
              </h2>
            </div>
          </div>
          <div className="text-cream-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {stats.map((s, i) => (
                <StatCell key={i} {...s} index={i} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 md:py-32 container-fluid">
        <SectionHeading
          number="04"
          label="Engineering"
          title="Engineered around the listener."
          description="Every component, every circuit, every curve — chosen for one reason: to make the music feel closer."
        />
        <div className="mt-16 space-y-6">
          {features.map((f, i) => (
            <FeatureRow key={f.title} feature={f} index={i} />
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="py-24 md:py-32 bg-cream-100">
        <div className="container-fluid">
          <SectionHeading
            number="05"
            label="Shop"
            title="The current collection."
            description="Four pairs. Each one tuned for a different kind of day."
          />
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
          <div className="mt-16 text-center">
            <MagnetButton href="/shop" className="btn-outline">
              View all products
              <ArrowUpRight size={16} />
            </MagnetButton>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 md:py-40 container-fluid text-center">
        <Reveal>
          <h2 className="font-display text-display font-medium tracking-tightest text-balance">
            Find the pair
            <br />
            that finds <span className="shimmer-text">you.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-12 flex justify-center gap-4 flex-wrap">
            <MagnetButton href="/shop" className="btn-primary">
              Start shopping
              <ArrowRight size={18} />
            </MagnetButton>
          </div>
        </Reveal>
      </section>
    </>
  )
}

/* ---------------- local components ---------------- */

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-500 mb-1">
        {label}
      </p>
      <p className="font-display text-lg font-medium">{value}</p>
    </div>
  )
}

function SectionHeading({
  number,
  label,
  title,
  description,
}: {
  number: string
  label: string
  title: string
  description?: string
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
      <div className="md:col-span-3">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-ink-500">
          [ {number} / {label} ]
        </span>
      </div>
      <div className="md:col-span-9">
        <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-medium tracking-tightest text-balance">
          {title}
        </h2>
        {description && (
          <p className="mt-6 max-w-2xl text-lg text-ink-600 leading-relaxed text-pretty">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

function StatCell({ value, label, index }: { value: number; label: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20%' }}
      transition={{ delay: index * 0.08, duration: 0.7 }}
      className="border-l border-cream-100/15 pl-6 first:border-l-0 first:pl-0"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cream-100/50 mb-3">
        0{index + 1} / 04
      </p>
      <p className="font-display text-5xl md:text-6xl font-medium tracking-tightest text-cream-50">
        {value >= 1000 ? value.toLocaleString('en-US') : value}
        {value === 4.8 && <span className="text-flame-400">★</span>}
      </p>
      <p className="mt-3 text-sm text-cream-100/60">{label}</p>
    </motion.div>
  )
}

function FeatureRow({ feature, index }: { feature: typeof features[number]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.7, delay: index * 0.05 }}
      className="grid grid-cols-12 gap-4 py-10 border-t border-ink-200/60 items-start group hover:bg-cream-100 transition-colors rounded-2xl px-2 -mx-2"
    >
      <div className="col-span-2 md:col-span-1 font-mono text-sm text-ink-400">
        0{index + 1}
      </div>
      <div className="col-span-10 md:col-span-4">
        <h3 className="font-display text-2xl md:text-3xl font-medium tracking-tight">
          {feature.title}
        </h3>
        <p className="mt-1 text-ink-600">{feature.subtitle}</p>
      </div>
      <div className="col-span-12 md:col-span-5 text-ink-600 leading-relaxed">
        {feature.description}
      </div>
      <div className="col-span-12 md:col-span-2 text-right">
        <p className="font-display text-4xl font-medium tracking-tightest text-flame-500">
          {feature.stat}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-500 mt-1">
          {feature.statLabel}
        </p>
      </div>
    </motion.div>
  )
}

function ProductCard({ product, index }: { product: typeof products[number]; index: number }) {
  const addToCart = useCart((s) => s.add)
  const [added, setAdded] = useState(false)
  return (
    <Reveal delay={index * 0.08}>
      <Link to={`/shop/${product.slug}`} className="group block">
        <SpotlightCard className="bg-cream-50 aspect-[4/5] mb-4">
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          {product.badge && (
            <span className="absolute top-4 left-4 tag bg-flame-500 text-cream-50">
              {product.badge}
            </span>
          )}
          <div className="absolute top-4 right-4">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                addToCart(product, product.colors[0], 1)
                setAdded(true)
                setTimeout(() => setAdded(false), 1400)
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                added
                  ? 'bg-flame-500 text-cream-50 scale-110'
                  : 'bg-cream-50 border border-ink-200 group-hover:bg-ink-900 group-hover:text-cream-50'
              }`}
              aria-label={`Add ${product.name} to cart`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {added ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Check size={14} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="plus"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Plus size={14} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </SpotlightCard>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-xl font-medium tracking-tight">{product.name}</h3>
            <p className="text-sm text-ink-500 mt-1 line-clamp-1">{product.tagline}</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-ink-500">
              <Star size={12} className="fill-flame-500 text-flame-500" />
              <span>{product.rating}</span>
              <span>·</span>
              <span>{product.reviewCount} reviews</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="font-display text-lg font-medium">{formatPrice(product.price, 'TSh')}</p>
            {product.compareAt && (
              <p className="text-xs text-ink-500 line-through">
                {formatPrice(product.compareAt, 'TSh')}
              </p>
            )}
          </div>
        </div>
      </Link>
    </Reveal>
  )
}
