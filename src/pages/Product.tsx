import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, ArrowRight, Check, Truck, RotateCcw, Shield, ShoppingBag, Heart } from 'lucide-react'
import SpotlightCard from '@/components/SpotlightCard'
import MagnetButton from '@/components/MagnetButton'
import Reveal from '@/components/Reveal'
import { products, extraProducts } from '@/data/products'
import { formatPrice, cn } from '@/lib/utils'
import { useCart } from '@/store/cart'
import { useWishlist } from '@/store/wishlist'
import { useSession } from '@/lib/useSession'

export default function Product() {
  const { slug } = useParams()

  // Merge all products so every slug resolves to a dedicated page
  const allProducts = useMemo(() => [...products, ...extraProducts], [])
  const product = useMemo(() => allProducts.find((p) => p.slug === slug), [slug, allProducts])

  const [color, setColor] = useState(product?.colors[0] ?? { name: '', hex: '#000' })
  const [imgIdx, setImgIdx] = useState(0)
  const [orderState, setOrderState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [orderMsg, setOrderMsg] = useState('')
  const [email, setEmail] = useState('')
  const [justAdded, setJustAdded] = useState(false)
  const addToCart = useCart((s) => s.add)
  const openCart = useCart((s) => s.open)
  const { user } = useSession()
  const wishlistIds = useWishlist((s) => s.productIds)
  const toggleWishlist = useWishlist((s) => s.toggle)

  if (!product) {
    return (
      <div className="container-fluid py-32 text-center">
        <h1 className="font-display text-5xl">Not found.</h1>
        <p className="mt-4 text-ink-500 max-w-md mx-auto">
          Hakuna bidhaa inayolingana na kiungo hiki. Tafadhali angalia duka letu.
        </p>
        <Link to="/shop" className="btn-outline mt-8 inline-flex">
          Back to shop
        </Link>
      </div>
    )
  }

  const handleAdd = () => {
    addToCart(product, color, 1)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1600)
  }

  const handleBuyNow = () => {
    addToCart(product, color, 1)
    openCart()
  }

  return (
    <article>
      {/* Header */}
      <section className="container-fluid pt-12 md:pt-20">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-ink-900"
        >
          ← Back to shop
        </Link>
      </section>

      <section className="container-fluid pt-8 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Gallery */}
        <div>
          <motion.div
            key={imgIdx}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="aspect-square rounded-3xl bg-cream-100 overflow-hidden"
          >
            <img
              src={product.gallery[imgIdx]}
              alt={product.name}
              className="w-full h-full object-cover mix-blend-multiply"
            />
          </motion.div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {product.gallery.map((src, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                className={cn(
                  'aspect-square rounded-xl overflow-hidden border-2 transition-all',
                  imgIdx === i ? 'border-ink-900' : 'border-transparent opacity-60 hover:opacity-100'
                )}
              >
                <img src={src} alt="" className="w-full h-full object-cover mix-blend-multiply" />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-ink-500">
            [{product.category.replace('-', ' ')}]
          </span>
          <h1 className="mt-3 font-display text-6xl md:text-7xl font-medium tracking-tightest">
            {product.name}
          </h1>
          <p className="mt-3 text-xl text-ink-600">{product.tagline}</p>

          <div className="mt-4 flex items-center gap-2 text-sm text-ink-500">
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-flame-500 text-flame-500" />
              <Star size={14} className="fill-flame-500 text-flame-500" />
              <Star size={14} className="fill-flame-500 text-flame-500" />
              <Star size={14} className="fill-flame-500 text-flame-500" />
              <Star size={14} className="fill-flame-500 text-flame-500 opacity-60" />
            </div>
            <span>{product.rating} · {product.reviewCount} reviews</span>
          </div>

          <p className="mt-8 text-ink-600 leading-relaxed">{product.description}</p>

          {/* Color picker */}
          <div className="mt-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-500 mb-3">
              Color · <span className="text-ink-700">{color.name}</span>
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              {product.colors.map((c) => {
                const active = c.name === color.name
                return (
                  <button
                    key={c.name}
                    onClick={() => setColor(c)}
                    className={cn(
                      'group relative w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center',
                      active
                        ? 'border-ink-900 scale-110'
                        : 'border-ink-200 hover:border-ink-500 hover:scale-105'
                    )}
                    style={{ backgroundColor: c.hex }}
                    aria-label={c.name}
                    aria-pressed={active}
                  >
                    {active && (
                      <Check
                        size={16}
                        className="text-cream-50 drop-shadow"
                      />
                    )}
                    <span
                      className={cn(
                        'absolute -bottom-6 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.2em] transition-opacity whitespace-nowrap',
                        active ? 'text-ink-900 opacity-100' : 'text-ink-500 opacity-0 group-hover:opacity-100'
                      )}
                    >
                      {c.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Price + buy */}
          <div className="mt-10 p-6 rounded-3xl bg-cream-100">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-500 mb-1">
                  Price
                </p>
                <p className="font-display text-5xl font-medium tracking-tightest">
                  {formatPrice(product.price, 'TSh')}
                </p>
              </div>
              {product.compareAt && (
                <p className="text-lg text-ink-500 line-through">
                  {formatPrice(product.compareAt, 'TSh')}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <MagnetButton
                onClick={handleAdd}
                className="btn-outline flex-1 justify-center text-base py-3"
              >
                {justAdded ? (
                  <>
                    <Check size={16} className="text-flame-500" />
                    Added
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    Add to cart
                  </>
                )}
              </MagnetButton>
              <MagnetButton
                onClick={handleBuyNow}
                className="btn-primary flex-1 justify-center text-base py-3"
              >
                Buy now
                <ArrowRight size={16} />
              </MagnetButton>
              <button
                onClick={() => toggleWishlist(product.id, user?.id)}
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center border transition-all shrink-0 self-center sm:self-auto',
                  wishlistIds.includes(product.id)
                    ? 'border-flame-500/30 text-flame-500 bg-flame-500/5'
                    : 'border-ink-200 text-ink-500 hover:border-ink-900 hover:text-ink-900'
                )}
                aria-label="Wishlist"
              >
                <Heart size={18} className={wishlistIds.includes(product.id) ? 'fill-flame-500' : ''} />
              </button>
            </div>

            {orderState !== 'idle' && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'mt-4 text-sm text-center',
                  orderState === 'done' ? 'text-flame-600' : 'text-ink-600'
                )}
              >
                {orderMsg}
              </motion.p>
            )}

            <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs text-ink-600">
              <div className="flex flex-col items-center gap-1">
                <Truck size={16} />
                <span>Free ship TSh 200K+</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw size={16} />
                <span>60-day returns</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Shield size={16} />
                <span>Lifetime warranty</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specs */}
      <section className="border-t border-ink-200/60 py-20">
        <div className="container-fluid">
          <h2 className="font-display text-4xl md:text-5xl font-medium tracking-tightest">
            Technical specifications
          </h2>
          <dl className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-12 max-w-4xl">
            {product.specs.map((s, i) => (
              <div
                key={s.label}
                className="flex items-baseline justify-between py-4 border-b border-ink-200/60"
              >
                <dt className="font-mono text-xs uppercase tracking-[0.2em] text-ink-500">
                  0{i + 1} · {s.label}
                </dt>
                <dd className="font-display text-lg">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-cream-100">
        <div className="container-fluid">
          <h2 className="font-display text-4xl md:text-5xl font-medium tracking-tightest">
            What you get
          </h2>
          <ul className="mt-10 space-y-4 max-w-2xl">
            {product.features.map((f, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-4 py-3"
              >
                <div className="w-6 h-6 rounded-full bg-flame-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={14} className="text-cream-50" />
                </div>
                <span className="text-lg text-ink-700">{f}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>
    </article>
  )
}