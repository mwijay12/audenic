import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Nav from './Nav'
import Footer from './Footer'
import Cursor from './Cursor'
import CartDrawer from './CartDrawer'
import SearchModal from './SearchModal'
import ScrollProgress from './ScrollProgress'
import AIChatbot from './AIChatbot'

export default function Layout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <div className="relative min-h-screen bg-cream-50 text-ink-900 overflow-x-hidden">
      <ScrollProgress />
      <Cursor />
      <Nav />
      <main className={isHome ? '' : 'pt-20 md:pt-24'}>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <SearchModal />
      <AIChatbot />
    </div>
  )
}
