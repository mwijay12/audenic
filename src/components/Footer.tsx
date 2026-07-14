import { Link } from 'react-router-dom'
import { Instagram, Twitter, Facebook, ArrowUpRight } from 'lucide-react'

const year = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="relative bg-ink-900 text-cream-100 mt-32 overflow-hidden">
      {/* Giant background word — responsive: 320px → 6rem, 768px → 12rem, 1920px → 20rem.
          Always clipped to container so it never overflows. */}
      <div className="absolute inset-x-0 -top-6 sm:-top-10 md:-top-16 lg:-top-20 select-none pointer-events-none overflow-hidden">
        <div className="text-[clamp(4rem,20vw,20rem)] sm:text-[clamp(6rem,20vw,20rem)] md:text-[clamp(9rem,22vw,20rem)] font-display font-black leading-[0.85] tracking-[-0.05em] text-cream-50/[0.04] text-center whitespace-nowrap">
          AUDENIC AUDIO
        </div>
      </div>

      <div className="relative container-fluid pt-24 sm:pt-32 md:pt-40 pb-8 sm:pb-10">
        {/* Top: huge CTA + columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 pb-16 border-b border-cream-100/10">
          {/* CTA */}
          <div className="md:col-span-7">
            <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.3em] text-cream-100/50 mb-4 sm:mb-6">
              [ 04 / Contact ]
            </p>
            <h3 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-display font-medium tracking-tight text-balance leading-[1.05]">
              Hear something
              <br />
              worth hearing.
            </h3>
            <a
              href="mailto:audenic.audio@gmail.com"
              className="group inline-flex items-center gap-2 sm:gap-3 mt-6 sm:mt-8 text-flame-400 font-display text-lg sm:text-2xl md:text-4xl tracking-tight hover:text-flame-300 transition-colors break-all sm:break-normal"
            >
              <span className="min-w-0">audenic.audio@gmail.com</span>
              <ArrowUpRight
                size={20}
                className="shrink-0 sm:size-7 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
              />
            </a>
          </div>

          {/* Link columns */}
          <div className="md:col-span-3">
            <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.3em] text-cream-100/50 mb-4 sm:mb-6">
              Sitemap
            </p>
            <ul className="space-y-3 text-cream-100/80">
              {[
                { to: '/', label: 'Home' },
                { to: '/shop', label: 'Shop all' },
                { to: '/about', label: 'About' },
                { to: '/terms', label: 'Terms' },
                { to: '/privacy', label: 'Privacy' },
                { to: '/admin', label: 'Admin' },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="hover:text-flame-400 transition-colors inline-flex items-center gap-1 text-sm"
                  >
                    {l.label}
                    <ArrowUpRight size={12} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.3em] text-cream-100/50 mb-4 sm:mb-6">
              Social
            </p>
            <ul className="space-y-3 text-cream-100/80">
              {[
                { icon: Instagram, label: 'Instagram' },
                { icon: Twitter, label: 'Twitter / X' },
                { icon: Facebook, label: 'Facebook' },
              ].map(({ icon: Icon, label }) => (
                <li key={label}>
                  <a
                    href="#"
                    className="hover:text-flame-400 transition-colors inline-flex items-center gap-2"
                  >
                    <Icon size={16} />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-flame-500 flex items-center justify-center">
              <span className="text-cream-50 font-display font-bold text-sm sm:text-base">A</span>
            </div>
            <div className="min-w-0">
              <p className="font-display text-sm sm:text-base font-semibold">Audenic Audio Co.</p>
              <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-cream-100/40 leading-relaxed">
                Crafted in Dar es Salaam · Shipped worldwide
              </p>
            </div>
          </div>

          <p className="font-mono text-[10px] sm:text-xs text-cream-100/40">
            © {year} Audenic Audio Co. All rights reserved.
          </p>
        </div>

        {/* Credit — required by Mwijay */}
        <div className="pt-6 mt-6 border-t border-cream-100/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 sm:gap-3">
          <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-cream-100/40 leading-relaxed">
            Designed &amp; built by{' '}
            <a
              href="https://github.com/mwijay-davie"
              target="_blank"
              rel="noopener noreferrer"
              className="text-flame-400 hover:text-flame-300 break-all sm:break-normal"
            >
              Mwijay Davie
            </a>{' '}
            · A premium audio experience
          </p>
          <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-cream-100/40">
            v2.0 · {year} edition
          </p>
        </div>
      </div>
    </footer>
  )
}
