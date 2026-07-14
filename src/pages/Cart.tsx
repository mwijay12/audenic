import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ShoppingBag, Plus, Minus, Trash2, Tag, X } from 'lucide-react'
import { useCart, useCartCount, useCartTotal } from '@/store/cart'
import { formatPrice, cn } from '@/lib/utils'
import Reveal from '@/components/Reveal'

/**
 * Cart page — full cart view with qty edit, remove, totals, "continue shopping".
 * Empty state is friendly and links back to /shop.
 */
export default function CartPage() {
  const {
    lines,
    setQuantity,
    remove,
    clear,
    promoCode,
    discountPercent,
    freeShippingPromo,
    applyPromoCode,
    removePromoCode,
  } = useCart()

  const count = useCartCount()
  const total = useCartTotal()

  const [promoInput, setPromoInput] = useState('')
  const [promoMsg, setPromoMsg] = useState({ text: '', type: 'success' })

  const discountAmount = Math.round(total * (discountPercent / 100))
  const subtotalAfterDiscount = total - discountAmount

  const shipping = subtotalAfterDiscount > 0
    ? ((subtotalAfterDiscount >= 30000 || freeShippingPromo) ? 0 : 1500)
    : 0

  const tax = Math.round(subtotalAfterDiscount * 0.06) // 6% demo tax
  const grandTotal = subtotalAfterDiscount + shipping + tax

  function handlePromoSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!promoInput.trim()) return
    const res = applyPromoCode(promoInput)
    setPromoMsg({ text: res.message, type: res.success ? 'success' : 'error' })
    if (res.success) setPromoInput('')
  }

  return (
    <section className="container-fluid pt-12 md:pt-20 pb-24 min-h-[60vh]">
      <Reveal>
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-ink-500 mb-2">
              [ Cart ]
            </p>
            <h1 className="font-display text-4xl md:text-6xl font-medium tracking-tight">
              Your <em className="text-flame-500 not-italic">selection</em>
            </h1>
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-500">
            {count} {count === 1 ? 'item' : 'items'}
          </p>
        </div>
      </Reveal>

      {lines.length === 0 ? (
        <Reveal delay={0.1}>
          <div className="rounded-3xl border border-ink-200/40 bg-cream-100/40 p-10 md:p-16 text-center">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="w-24 h-24 mx-auto rounded-full bg-flame-500/10 flex items-center justify-center mb-6"
            >
              <ShoppingBag size={32} className="text-flame-500" />
            </motion.div>
            <h2 className="font-display text-2xl md:text-3xl font-medium mb-2">
              Nothing here yet
            </h2>
            <p className="text-ink-500 max-w-md mx-auto mb-8">
              Your cart is waiting. Add a pair of Audenic headphones, a speaker, or
              one of our soundbars to get started.
            </p>
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 bg-ink-900 text-cream-50 font-medium text-sm px-7 py-3.5 rounded-full hover:bg-flame-500 transition-colors duration-300"
            >
              Browse the shop
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </Reveal>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Lines */}
          <div className="lg:col-span-8 space-y-3">
            {lines.map((line, i) => {
              const key = `${line.productId}::${line.color.name}`
              return (
                <Reveal key={key} delay={i * 0.05}>
                  <motion.div
                    layout
                    className="grid grid-cols-[100px_1fr_auto] sm:grid-cols-[120px_1fr_auto] gap-4 sm:gap-6 p-4 rounded-3xl border border-ink-200/40 bg-cream-100/40 hover:border-ink-200/70 transition-colors"
                  >
                    <Link
                      to={`/product/${line.slug}`}
                      className="block aspect-square rounded-2xl overflow-hidden bg-cream-100"
                    >
                      <img
                        src={line.image}
                        alt={line.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                    </Link>

                    <div className="min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <Link
                          to={`/product/${line.slug}`}
                          className="font-display text-lg sm:text-xl font-medium leading-snug hover:text-flame-600 transition-colors"
                        >
                          {line.name}
                        </Link>
                        <p className="font-display text-lg sm:text-xl font-semibold shrink-0 sm:hidden">
                          {formatPrice(line.price * line.quantity, 'TSh')}
                        </p>
                      </div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 flex items-center gap-1.5 mb-3">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full border border-ink-200"
                          style={{ background: line.color.hex }}
                        />
                        {line.color.name}
                      </p>

                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-1 bg-ink-100/70 rounded-full p-0.5">
                          <button
                            onClick={() =>
                              setQuantity(line.productId, line.color.name, line.quantity - 1)
                            }
                            className="w-8 h-8 rounded-full flex items-center justify-center text-ink-700 hover:bg-cream-50 transition-colors"
                            aria-label="Decrease"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-9 text-center font-mono text-sm font-medium">
                            {line.quantity}
                          </span>
                          <button
                            onClick={() =>
                              setQuantity(line.productId, line.color.name, line.quantity + 1)
                            }
                            className="w-8 h-8 rounded-full flex items-center justify-center text-ink-700 hover:bg-cream-50 transition-colors"
                            aria-label="Increase"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          onClick={() => remove(line.productId, line.color.name)}
                          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.2em] text-ink-500 hover:text-flame-600 transition-colors"
                        >
                          <Trash2 size={12} />
                          Remove
                        </button>
                      </div>
                    </div>

                    <p className="font-display text-lg sm:text-xl font-semibold self-start hidden sm:block">
                      {formatPrice(line.price * line.quantity, 'TSh')}
                    </p>
                  </motion.div>
                </Reveal>
              )
            })}

            <div className="flex items-center justify-between pt-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-sm font-mono uppercase tracking-[0.2em] text-ink-700 hover:text-flame-600 transition-colors"
              >
                ← Continue shopping
              </Link>
              <button
                onClick={clear}
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.2em] text-ink-500 hover:text-flame-600 transition-colors"
              >
                <Trash2 size={12} />
                Clear cart
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-4">
            <Reveal delay={0.1}>
              <div className="rounded-3xl border border-ink-200/40 bg-cream-100/40 p-6 sm:p-8 lg:sticky lg:top-28">
                <h2 className="font-display text-xl font-semibold mb-6">Order summary</h2>
                <dl className="space-y-3 text-sm">
                  <Row label="Subtotal" value={formatPrice(total, 'TSh')} />
                  {discountPercent > 0 && (
                    <Row
                      label={`Discount (${discountPercent}%)`}
                      value={`-${formatPrice(discountAmount, 'TSh')}`}
                      valueClass="text-flame-600 font-semibold"
                    />
                  )}
                  <Row
                    label="Shipping"
                    value={shipping === 0 ? 'Free' : formatPrice(shipping, 'TSh')}
                    valueClass={shipping === 0 ? 'text-flame-600 font-semibold' : ''}
                  />
                  <Row label="Tax (est.)" value={formatPrice(tax, 'TSh')} />
                </dl>
                <div className="mt-6 pt-6 border-t border-ink-200/40 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
                    Total
                  </span>
                  <motion.span
                    key={grandTotal}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="font-display text-2xl sm:text-3xl font-semibold"
                  >
                    {formatPrice(grandTotal, 'TSh')}
                  </motion.span>
                </div>

                {/* Promo Code Box */}
                <div className="mt-6 pt-6 border-t border-ink-200/40">
                  {promoCode ? (
                    <div className="flex items-center justify-between bg-flame-500/10 text-flame-600 rounded-xl px-4 py-2 text-xs font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Tag size={12} />
                        <span>Kuponi: {promoCode} ({discountPercent > 0 ? `${discountPercent}% Off` : 'Free Ship'})</span>
                      </div>
                      <button
                        onClick={removePromoCode}
                        className="p-1 hover:bg-flame-500/20 rounded-full transition-colors"
                        aria-label="Remove promo code"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handlePromoSubmit} className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Nambari ya Kuponi"
                        className="flex-1 px-3 py-2 text-xs bg-white border border-ink-200 rounded-xl focus:outline-none focus:border-ink-900 transition-colors"
                      />
                      <button
                        type="submit"
                        className="bg-ink-900 text-cream-50 font-medium text-xs px-4 py-2 rounded-xl hover:bg-flame-500 transition-colors"
                      >
                        Weka
                      </button>
                    </form>
                  )}
                  {promoMsg.text && (
                    <p
                      className={cn(
                        'text-[10px] mt-1.5 font-medium',
                        promoMsg.type === 'success' ? 'text-emerald-600' : 'text-rose-600'
                      )}
                    >
                      {promoMsg.text}
                    </p>
                  )}
                  <p className="text-[10px] text-ink-500 mt-2">
                    Tip: Jaribu kuponi <span className="font-bold text-ink-700">KARIBU10</span> au <span className="font-bold text-ink-700">DARFREE</span>
                  </p>
                </div>

                <Link
                  to="/checkout"
                  onClick={() => useCart.getState().close()}
                  className="w-full mt-6 group inline-flex items-center justify-center gap-2 bg-ink-900 text-cream-50 font-medium text-sm py-4 rounded-full hover:bg-flame-500 transition-colors duration-300"
                >
                  Checkout
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <p className="text-[10px] text-center text-ink-500 font-mono uppercase tracking-[0.2em] mt-4">
                  Secure · Encrypted · Audenic Promise
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      )}
    </section>
  )
}

function Row({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-500">{label}</dt>
      <dd className={`font-medium ${valueClass}`}>{value}</dd>
    </div>
  )
}
