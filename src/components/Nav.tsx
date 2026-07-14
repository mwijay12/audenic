import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useCart, useCartCount } from '@/store/cart'
import { useSearch } from '@/store/search'

const links = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const openCart = useCart((s) => s.open)
  const count = useCartCount()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        scrolled ? 'py-3' : 'py-5'
      )}
    >
      <div
        className={cn(
          'container-fluid flex items-center justify-between rounded-full transition-all duration-500',
          scrolled
            ? 'bg-cream-50/80 backdrop-blur-xl border border-ink-200/40 shadow-sm px-5 md:px-7 py-2.5'
            : 'bg-transparent px-2 md:px-3 py-2'
        )}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-full bg-ink-900 flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="text-cream-50 font-display font-bold text-sm">M</span>
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="font-display text-lg font-semibold tracking-tight">Audenic</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-500">
              Audio Co.
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors relative',
                  isActive ? 'text-ink-900' : 'text-ink-500 hover:text-ink-900'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-ink-100 -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => useSearch.getState().open()}
            className="flex w-10 h-10 rounded-full items-center justify-center text-ink-700 hover:bg-ink-100 transition-colors"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
          <Link
            to="/account"
            className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center text-ink-700 hover:bg-ink-100 transition-colors"
            aria-label="Profile"
          >
            <User size={18} />
          </Link>
          <button
            onClick={openCart}
            className="w-10 h-10 rounded-full flex items-center justify-center text-ink-700 hover:bg-ink-100 transition-colors relative group"
            aria-label={`Open cart (${count} ${count === 1 ? 'item' : 'items'})`}
          >
            <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-flame-500 text-cream-50 text-[10px] font-mono font-semibold flex items-center justify-center shadow-sm"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden w-10 h-10 rounded-full flex items-center justify-center text-ink-700 hover:bg-ink-100 transition-colors"
            aria-label="Menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden mt-2 mx-5 rounded-3xl bg-cream-50 border border-ink-200/60 p-4 shadow-lg"
          >
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'block px-4 py-3 rounded-2xl text-base font-medium',
                    isActive ? 'bg-ink-900 text-cream-50' : 'text-ink-700 hover:bg-ink-100'
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
