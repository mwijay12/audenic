import { useEffect, useState, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ShoppingBag, ArrowRight, CornerDownLeft } from 'lucide-react'
import { useSearch } from '@/store/search'
import { useCart } from '@/store/cart'
import { products, extraProducts, type Product } from '@/data/products'
import { formatPrice, cn } from '@/lib/utils'

export default function SearchModal() {
  const { isOpen, close, open } = useSearch()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const addToCart = useCart((s) => s.add)

  const allProducts = useMemo(() => [...products, ...extraProducts], [])

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!query.trim()) return []
    const lower = query.toLowerCase().trim()
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.category.toLowerCase().includes(lower) ||
        p.tagline.toLowerCase().includes(lower) ||
        p.description.toLowerCase().includes(lower)
    )
  }, [query, allProducts])

  // Keyboard shortcut Ctrl/Cmd + K to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        open()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setQuery('')
      setSelectedIndex(0)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle key navigation within results
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || filteredProducts.length === 0) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filteredProducts.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredProducts.length) % filteredProducts.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const selected = filteredProducts[selectedIndex]
        if (selected) {
          // Navigate to selected product page
          window.location.href = `/shop/${selected.slug}`
          close()
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        close()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredProducts, selectedIndex, close])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 z-[100] bg-ink-900/60 backdrop-blur-md"
            aria-hidden
          />

          {/* Search Box Container */}
          <div className="fixed inset-0 z-[110] flex items-start justify-center pt-20 px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              ref={containerRef}
              className="w-full max-w-2xl bg-cream-50 rounded-3xl border border-ink-200/50 shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[80vh]"
              role="dialog"
              aria-modal="true"
              aria-label="Search products"
            >
              {/* Input wrapper */}
              <div className="relative flex items-center px-6 py-5 border-b border-ink-200/40">
                <Search size={20} className="text-ink-500 mr-3 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setSelectedIndex(0)
                  }}
                  className="w-full bg-transparent border-none outline-none text-ink-900 placeholder-ink-400 text-lg focus:ring-0 focus:outline-none"
                  placeholder="Tafuta spika, headphone au buds..."
                />
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-ink-100 border border-ink-200 text-[10px] font-mono text-ink-500 uppercase mr-3">
                  ESC
                </kbd>
                <button
                  onClick={close}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-ink-600 hover:bg-ink-100 transition-colors"
                  aria-label="Close search"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto p-4 min-h-[100px]">
                {!query.trim() ? (
                  <div className="py-12 text-center text-ink-500">
                    <p className="text-sm font-medium">Anza kuandika ili kutafuta bidhaa...</p>
                    <p className="text-xs text-ink-400 mt-2">
                      Mfano: &quot;Classic&quot;, &quot;Mwanga&quot;, &quot;Soundbar&quot;
                    </p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="py-12 text-center text-ink-500">
                    <p className="text-sm">Hakuna matokeo kwa &quot;{query}&quot;</p>
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {filteredProducts.map((p, idx) => {
                      const active = idx === selectedIndex
                      return (
                        <li
                          key={p.id}
                          className={cn(
                            'rounded-2xl transition-all duration-200 border p-3 flex gap-4 items-center group/item',
                            active
                              ? 'bg-cream-100 border-ink-900/20 shadow-sm'
                              : 'bg-transparent border-transparent hover:bg-cream-100/50'
                          )}
                          onMouseEnter={() => setSelectedIndex(idx)}
                        >
                          {/* Image */}
                          <Link
                            to={`/shop/${p.slug}`}
                            onClick={close}
                            className="w-16 h-16 rounded-xl bg-cream-100 overflow-hidden shrink-0 flex items-center justify-center p-2"
                          >
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover mix-blend-multiply transition-transform group-hover/item:scale-105"
                            />
                          </Link>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-[9px] uppercase tracking-wider text-ink-500 mb-0.5">
                              {p.category.replace('-', ' ')}
                            </p>
                            <Link
                              to={`/shop/${p.slug}`}
                              onClick={close}
                              className="font-display text-base font-semibold text-ink-900 block hover:text-flame-600 transition-colors"
                            >
                              {p.name}
                            </Link>
                            <p className="text-xs text-ink-500 line-clamp-1 mt-0.5">{p.tagline}</p>
                          </div>

                          {/* Price + Action */}
                          <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                            <p className="font-display font-medium text-sm text-ink-900">
                              {formatPrice(p.price, 'TSh')}
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  addToCart(p, p.colors[0], 1)
                                  close()
                                }}
                                className="w-8 h-8 rounded-full bg-ink-900 text-cream-50 flex items-center justify-center hover:bg-flame-500 transition-colors"
                                aria-label={`Weka ${p.name} kwenye kikapu`}
                              >
                                <ShoppingBag size={12} />
                              </button>
                              {active && (
                                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-ink-400">
                                  <span>Fungua</span>
                                  <CornerDownLeft size={10} />
                                </span>
                              )}
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-cream-100/40 border-t border-ink-200/40 text-[10px] font-mono text-ink-400 flex items-center justify-between">
                <span>
                  Tumia <kbd className="font-bold font-mono">↑</kbd>{' '}
                  <kbd className="font-bold font-mono">↓</kbd> kuchagua,{' '}
                  <kbd className="font-bold font-mono">Enter</kbd> kufungua
                </span>
                <span>
                  Ctrl + K kufungua popup
                </span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
