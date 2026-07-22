import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Smooth scroll provider. Tuned for buttery 60fps — shorter duration,
 * less wheel smoothing, ScrollTrigger throttled to RAF.
 *
 * Key: we disable CSS scroll-behavior so it doesn't fight Lenis
 * (double-smoothing causes the jank seen on lower-end machines).
 */
export function useSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    // Prevent CSS scroll-behavior from double-smoothing with Lenis
    document.documentElement.style.scrollBehavior = 'auto'

    // Detect low-power / mobile to dial back further
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const lenis = new Lenis({
      duration: prefersReduced ? 0 : 0.6,         // was 1.2 — half the time, snappier
      easing: (t) => 1 - Math.pow(1 - t, 3),      // simpler easeOutCubic, less CPU per frame
      smoothWheel: !isMobile && !prefersReduced,   // OFF on mobile (native scroll is faster)
      wheelMultiplier: 1,                          // 1:1 wheel feel
      touchMultiplier: isMobile ? 2 : 1,          // mobile: ignore Lenis, native handles it
    })
    lenisRef.current = lenis

    // Throttle ScrollTrigger updates — only fire when scroll position actually changes
    let scheduled = false
    const onScroll = () => {
      if (scheduled) return
      scheduled = true
      requestAnimationFrame(() => {
        ScrollTrigger.update()
        scheduled = false
      })
    }
    lenis.on('scroll', onScroll)

    const raf = (time: number) => lenis.raf(time)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy() // destroy() already clears all listeners
      document.documentElement.style.scrollBehavior = ''
    }
  }, [])

  return lenisRef
}

