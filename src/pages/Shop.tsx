import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Plus, Check, Heart } from 'lucide-react'
import SpotlightCard from '@/components/SpotlightCard'
import { products, extraProducts, type ProductCategory } from '@/data/products'
import { formatPrice, cn } from '@/lib/utils'
import { useCart } from '@/store/cart'
import { useWishlist } from '@/store/wishlist'
import { useSession } from '@/lib/useSession'

const categories: ProductCategory[] = ['over-ear', 'in-ear', 'on-ear', 'speaker', 'soundbar']
type CategoryFilter = ProductCategory | 'all'

export default function Shop() {
  const [cat, setCat] = useState<CategoryFilter>('all')
  const [sort, setSort] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured')
  const [justAdded, setJustAdded] = useState<string | null>(null)
  const addToCart = useCart((s) => s.add)
  const { user } = useSession()
  const wishlistIds = useWishlist((s) => s.productIds)
  const toggleWishlist = useWishlist((s) => s.toggle)

  const allProducts = useMemo(() => [...products, ...extraProducts], [])

  const filtered = useMemo(() => {
    let arr = cat === 'all' ? [...allProducts] : allProducts.filter((p) => p.category === cat)
    if (sort === 'price-asc') arr.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') arr.sort((a, b) => b.price - a.price)
    if (sort === 'rating') arr.sort((a, b) => b.rating - a.rating)
    return arr
  }, [cat, sort, allProducts])

  return (
    <>
      {/* Header */}
      <section className="container-fluid pt-12 md:pt-20 pb-12">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-mono text-xs uppercase tracking-[0.3em] text-ink-500"
        >
          [ Shop / All ]
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 font-display text-display font-medium tracking-tightest text-balance"
        >
          The full catalogue.
        </motion.h1>
        <p className="mt-6 max-w-2xl text-lg text-ink-600">
          {allProducts.length} devices. Each one tuned by ear.
        </p>
      </section>

      {/* Filter bar */}
      <section className="container-fluid border-y border-ink-200/60 py-4 sticky top-20 z-30 bg-cream-50/80 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setCat('all')}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                cat === 'all'
                  ? 'bg-ink-900 text-cream-50'
                  : 'text-ink-600 hover:text-ink-900 hover:bg-ink-100'
              )}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all capitalize',
                  cat === c
                    ? 'bg-ink-900 text-cream-50'
                    : 'text-ink-600 hover:text-ink-900 hover:bg-ink-100'
                )}
              >
                {c.replace('-', ' ')}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-500 mr-2">
              Sort
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="bg-transparent border border-ink-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-ink-900"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low → high</option>
              <option value="price-desc">Price: high → low</option>
              <option value="rating">Highest rated</option>
            </select>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="container-fluid py-12">
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
            >
              <Link to={`/shop/${p.slug}`} className="group block">
                <SpotlightCard className="bg-cream-100 aspect-square mb-4">
                  <div className="absolute inset-0 flex items-center justify-center p-10">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  {p.badge && (
                    <span className="absolute top-4 left-4 tag bg-flame-500 text-cream-50">
                      {p.badge}
                    </span>
                  )}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        addToCart(p, p.colors[0], 1)
                        setJustAdded(p.id)
                        setTimeout(() => setJustAdded((id) => (id === p.id ? null : id)), 1200)
                      }}
                      className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300',
                        justAdded === p.id
                          ? 'bg-flame-500 text-cream-50 scale-110'
                          : 'bg-cream-50 border border-ink-200 text-ink-900 hover:bg-ink-900 hover:text-cream-50'
                      )}
                      aria-label={`Add ${p.name} to cart`}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {justAdded === p.id ? (
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

                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleWishlist(p.id, user?.id)
                      }}
                      className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 bg-cream-50 border border-ink-200 text-ink-900 hover:scale-110',
                        wishlistIds.includes(p.id) ? 'text-flame-500 border-flame-500/20' : 'text-ink-500 hover:text-flame-500'
                      )}
                      aria-label="Wishlist"
                    >
                      <Heart size={14} className={wishlistIds.includes(p.id) ? 'fill-flame-500' : ''} />
                    </button>
                  </div>
                </SpotlightCard>

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500 mb-1">
                      {p.category.replace('-', ' ')}
                    </p>
                    <h3 className="font-display text-2xl font-medium tracking-tight">
                      {p.name}
                    </h3>
                    <p className="mt-1 text-sm text-ink-500 line-clamp-1">{p.tagline}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-ink-500">
                      <Star size={12} className="fill-flame-500 text-flame-500" />
                      <span>{p.rating}</span>
                      <span>·</span>
                      <span>{p.reviewCount} reviews</span>
                    </div>
                  </div>
                  <p className="font-display text-xl font-medium shrink-0">
                    {formatPrice(p.price, 'TSh')}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <p className="text-center py-32 text-ink-500">No products match this filter.</p>
        )}
      </section>
    </>
  )
}
