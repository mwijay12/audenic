import { motion } from 'framer-motion'
import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { subscribeToNewsletter } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const team = [
  { name: 'Mwijay Davie', role: 'Founder & CEO', init: 'MD' },
  { name: 'Aisha M.', role: 'Head of Tuning', init: 'AM' },
  { name: 'Jonas K.', role: 'Industrial Design', init: 'JK' },
  { name: 'Lena S.', role: 'Customer Care', init: 'LS' },
]

const values = [
  {
    n: '01',
    title: 'Hand-tuned, not algorithmic',
    body: 'Every pair is tuned by a human ear. We listen, adjust, and listen again. Algorithms optimize for average — we optimize for music.',
  },
  {
    n: '02',
    title: 'Built to outlast the trend',
    body: 'We design for the next decade, not the next season. Replaceable parts, modular batteries, serviceable hinges.',
  },
  {
    n: '03',
    title: 'Honest pricing',
    body: 'No middleman markup, no fake sales. Our prices are the price. The people who tune the drivers are paid fairly.',
  },
  {
    n: '04',
    title: 'Crafted in East Africa',
    body: 'A studio in Dar es Salaam, a workshop in Nairobi, parts sourced globally. We hire locally and ship worldwide.',
  },
]

export default function About() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState('loading')
    const res = await subscribeToNewsletter(email)
    setState(res.ok ? 'done' : 'error')
    setMsg(res.message)
    if (res.ok) setEmail('')
  }

  return (
    <>
      {/* Hero */}
      <section className="container-fluid pt-12 md:pt-20 pb-16">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-mono text-xs uppercase tracking-[0.3em] text-ink-500"
        >
          [ About / Audenic Audio Co. ]
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 font-display text-display font-medium tracking-tightest text-balance leading-[0.95]"
        >
          We make
          <br />
          <span className="shimmer-text">audio for people</span>
          <br />
          who actually listen to music.
        </motion.h1>
      </section>

      {/* Story */}
      <section className="py-20 border-t border-ink-200/60">
        <div className="container-fluid grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-3">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-ink-500">
              [ 01 / The story ]
            </span>
          </div>
          <div className="md:col-span-9 max-w-3xl text-lg text-ink-700 leading-relaxed text-pretty space-y-6">
            <p>
              Audenic Audio started in 2019 in a small studio in Dar es Salaam. The first pair
              was built from spare parts, a soldering iron, and a single belief: that music
              is meant to be felt, not just heard.
            </p>
            <p>
              Six years later, we've shipped over 100,000 pairs to 47 countries. We still tune
              every pair by ear. We still pay our tuners fairly. We still believe the same
              thing we did in 2019.
            </p>
            <p className="font-display text-2xl text-ink-900">
              — Mwijay Davie, Founder
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-cream-100">
        <div className="container-fluid">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-ink-500">
            [ 02 / Values ]
          </span>
          <h2 className="mt-4 font-display text-5xl md:text-6xl font-medium tracking-tightest">
            Four things we won't compromise.
          </h2>

          <div className="mt-16 space-y-6">
            {values.map((v, i) => (
              <motion.div
                key={v.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="grid grid-cols-12 gap-4 py-8 border-t border-ink-200/60 items-baseline"
              >
                <span className="col-span-2 md:col-span-1 font-mono text-sm text-ink-400">
                  {v.n}
                </span>
                <h3 className="col-span-10 md:col-span-4 font-display text-2xl md:text-3xl font-medium tracking-tight">
                  {v.title}
                </h3>
                <p className="col-span-12 md:col-span-7 text-ink-600 leading-relaxed text-pretty">
                  {v.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container-fluid">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-ink-500">
            [ 03 / The studio ]
          </span>
          <h2 className="mt-4 font-display text-5xl md:text-6xl font-medium tracking-tightest">
            The people who tune your pair.
          </h2>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {team.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="p-6 rounded-3xl bg-cream-100 aspect-square flex flex-col justify-between"
              >
                <div className="w-14 h-14 rounded-full bg-ink-900 text-cream-50 flex items-center justify-center font-display font-medium text-lg">
                  {p.init}
                </div>
                <div>
                  <p className="font-display text-lg font-medium">{p.name}</p>
                  <p className="text-sm text-ink-500">{p.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 md:py-32">
        <div className="container-fluid max-w-3xl text-center">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-ink-500">
            [ 04 / The list ]
          </span>
          <h2 className="mt-4 font-display text-5xl md:text-6xl font-medium tracking-tightest text-balance">
            Be the first to hear.
          </h2>
          <p className="mt-6 text-lg text-ink-600">
            New models, restocks, behind-the-scenes from the studio. Roughly one email a month.
          </p>

          <form onSubmit={submit} className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="flex-1 px-5 py-4 rounded-full bg-cream-100 border border-ink-200 focus:outline-none focus:border-ink-900"
              required
            />
            <button
              type="submit"
              disabled={state === 'loading'}
              className="btn-primary"
            >
              {state === 'loading' ? 'Joining…' : 'Join'}
              <ArrowRight size={16} />
            </button>
          </form>

          {state !== 'idle' && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'mt-6 text-sm inline-flex items-center gap-2',
                state === 'done' ? 'text-flame-600' : 'text-ink-600'
              )}
            >
              {state === 'done' && <Check size={14} />}
              {msg}
            </motion.p>
          )}
        </div>
      </section>
    </>
  )
}
