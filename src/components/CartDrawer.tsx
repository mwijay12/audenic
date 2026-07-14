import { AnimatePresence, motion } from 'framer-motion'
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useCart, useCartTotal, useCartCount } from '@/store/cart'
import { formatPrice } from '@/lib/utils'

/**
 * CartDrawer — slides in from the right, glass-blur backdrop, full cart UX.
 * - Live qty steppers
 * - Remove line
 * - Subtotal, shipping note
 * - Checkout button (demo: shows an alert)
 * - Closes on Escape, on backdrop click, on route change
 */
export default function CartDrawer() {
  const { isOpen, close, lines, setQuantity, remove } = useCart()
  const count = useCartCount()
  const total = useCartTotal()

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={close}
            className="fixed inset-0 z-[80] bg-ink-900/40 backdrop-blur-sm"
            aria-hidden
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 36, mass: 0.7 }}
            className="fixed right-0 top-0 bottom-0 z-[90] w-full sm:w-[440px] bg-cream-50 shadow-2xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-ink-200/40">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-flame-500" />
                <h2 className="font-display text-xl font-semibold">Your cart</h2>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
                  {count} {count === 1 ? 'item' : 'items'}
                </span>
              </div>
              <button
                onClick={close}
                className="w-9 h-9 rounded-full flex items-center justify-center text-ink-700 hover:bg-ink-100 transition-colors"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>

            {/* Lines */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {lines.length === 0 ? (
                <EmptyState onClose={close} />
              ) : (
                <ul className="space-y-4">
                  {lines.map((line) => {
                    const key = `${line.productId}::${line.color.name}`
                    return (
                      <motion.li
                        key={key}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        className="flex gap-4 p-3 rounded-2xl bg-cream-100/50 border border-ink-200/30"
                      >
                        {/* Image */}
                        <Link
                          to={`/product/${line.slug}`}
                          onClick={close}
                          className="shrink-0 w-20 h-20 rounded-xl bg-cream-100 overflow-hidden"
                        >
                          <img
                            src={line.image}
                            alt={line.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </Link>

                        {/* Body */}
                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <Link
                                to={`/product/${line.slug}`}
                                onClick={close}
                                className="font-medium text-sm leading-snug line-clamp-1 hover:text-flame-600 transition-colors"
                              >
                                {line.name}
                              </Link>
                              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mt-1 flex items-center gap-1.5">
                                <span
                                  className="inline-block w-2.5 h-2.5 rounded-full border border-ink-200"
                                  style={{ background: line.color.hex }}
                                />
                                {line.color.name}
                              </p>
                            </div>
                            <p className="font-display font-semibold text-sm shrink-0">
                              {formatPrice(line.price * line.quantity, 'TSh')}
                            </p>
                          </div>

                          <div className="mt-auto pt-2 flex items-center justify-between">
                            {/* Stepper */}
                            <div className="flex items-center gap-1 bg-ink-100/70 rounded-full p-0.5">
                              <button
                                onClick={() =>
                                  setQuantity(line.productId, line.color.name, line.quantity - 1)
                                }
                                className="w-7 h-7 rounded-full flex items-center justify-center text-ink-700 hover:bg-cream-50 transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-7 text-center font-mono text-xs font-medium">
                                {line.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  setQuantity(line.productId, line.color.name, line.quantity + 1)
                                }
                                className="w-7 h-7 rounded-full flex items-center justify-center text-ink-700 hover:bg-cream-50 transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            <button
                              onClick={() => remove(line.productId, line.color.name)}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-ink-500 hover:text-flame-600 hover:bg-flame-500/10 transition-colors"
                              aria-label="Remove"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            {lines.length > 0 && (
              <div className="px-6 py-5 border-t border-ink-200/40 bg-cream-100/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
                    Subtotal
                  </span>
                  <motion.span
                    key={total}
                    initial={{ scale: 1.1, color: '#ff4d1a' }}
                    animate={{ scale: 1, color: '#0e0d0c' }}
                    transition={{ duration: 0.3 }}
                    className="font-display text-2xl font-semibold"
                  >
                    {formatPrice(total, 'TSh')}
                  </motion.span>
                </div>
                <p className="text-xs text-ink-500 mb-4">
                  Shipping &amp; taxes calculated at checkout.
                </p>
                <Link
                  to="/checkout"
                  onClick={close}
                  className="w-full group inline-flex items-center justify-center gap-2 bg-ink-900 text-cream-50 font-medium text-sm py-3.5 rounded-full hover:bg-flame-500 transition-colors duration-300"
                >
                  Checkout
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
                <Link
                  to="/cart"
                  onClick={close}
                  className="block text-center mt-3 text-xs font-mono uppercase tracking-[0.2em] text-ink-500 hover:text-flame-600 transition-colors"
                >
                  View full cart →
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-4">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.05 }}
        className="w-20 h-20 rounded-full bg-flame-500/10 flex items-center justify-center mb-5"
      >
        <ShoppingBag size={28} className="text-flame-500" />
      </motion.div>
      <h3 className="font-display text-lg font-medium mb-1">Your cart is empty</h3>
      <p className="text-sm text-ink-500 mb-6 max-w-[260px]">
        Add a pair (or three) to get started.
      </p>
      <Link
        to="/shop"
        onClick={onClose}
        className="inline-flex items-center gap-2 text-sm font-medium text-flame-600 hover:text-flame-700 transition-colors"
      >
        Browse the shop <ArrowRight size={14} />
      </Link>
    </div>
  )
}
