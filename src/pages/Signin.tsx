import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export default function Signin() {
  const [params] = useSearchParams()
  const next = params.get('next') || '/account'
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [linkSent, setLinkSent] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Weka email halali')
      return
    }
    setSubmitting(true)
    setError(null)

    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}${next}`,
      },
    })

    if (err) {
      setError(err.message)
      setSubmitting(false)
      return
    }
    setLinkSent(true)
    setSubmitting(false)
  }

  function handleDemoLogin() {
    const demoUser = {
      id: 'demo-user-123',
      email: 'mgeni@audenic.com',
      user_metadata: {
        full_name: 'Mgeni Audenic',
        phone: '+255 712 345 678',
        marketing_opt_in: true,
      },
    }
    localStorage.setItem('audenic-demo-session', JSON.stringify(demoUser))
    // Trigger session update
    window.dispatchEvent(new Event('audenic-demo-auth-change'))
    navigate(next)
  }

  if (!isSupabaseConfigured) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-24 text-center">
        <Lock className="mx-auto mb-6 text-ink-400" size={48} />
        <h1 className="font-display text-3xl mb-4">Akaunti ya Demo</h1>
        <p className="text-ink-600 mb-6">
          Backend haijasanidiwa sasa. Unaweza kuingia kama mtumiaji wa majaribio (Demo Mode) ili kujaribu vipengele vyote.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleDemoLogin}
            className="inline-flex items-center gap-2 bg-ink-900 text-cream-50 font-medium text-sm px-7 py-3.5 rounded-full hover:bg-flame-500 transition-colors"
          >
            Ingia kama Demo User
            <ArrowRight size={16} />
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-mono uppercase tracking-[0.2em] text-ink-500 hover:text-ink-900 transition-colors"
          >
            <ArrowLeft size={14} />
            Rudi nyumbani
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-mono uppercase tracking-[0.2em] text-ink-500 hover:text-flame-600 transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Rudi nyumbani
        </Link>

        <div className="bg-white rounded-3xl p-8 border border-ink-100">
          {!linkSent ? (
            <>
              <h1 className="font-display text-3xl mb-2">Ingia / Sajili</h1>
              <p className="text-ink-600 text-sm mb-6">
                Tuta kutumia magic link kwa email yako. Hakuna password
                inayohitajika.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-[0.2em] text-ink-500 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
                    />
                    <input
                      type="email"
                      autoComplete="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-ink-200 focus:border-flame-500 focus:outline-none transition-colors text-sm"
                      placeholder="wewe@example.com"
                    />
                  </div>
                </div>
                {error && (
                  <p className="text-sm text-rose-600">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full group inline-flex items-center justify-center gap-2 bg-ink-900 text-cream-50 font-medium text-sm py-3.5 rounded-full hover:bg-flame-500 transition-colors disabled:opacity-60 disabled:cursor-wait"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Inatuma link...
                    </>
                  ) : (
                    <>
                      Tuma magic link
                      <ArrowRight
                        size={16}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </>
                  )}
                </button>
              </form>

              <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-ink-100"></div>
                <span className="flex-shrink mx-4 text-ink-400 text-xs font-mono uppercase tracking-wider">au</span>
                <div className="flex-grow border-t border-ink-100"></div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  const { error: err } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: `${window.location.origin}${next}`,
                    },
                  })
                  if (err) setError(err.message)
                }}
                className="w-full inline-flex items-center justify-center gap-3 border border-ink-200 bg-white text-ink-700 font-medium text-sm py-3.5 rounded-full hover:bg-ink-50 transition-colors"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Ingia kwa Google
              </button>
              <p className="text-xs text-ink-500 mt-6 flex items-center gap-1.5">
                <ShieldCheck size={12} />
                Salama · encrypted · hatuhifadhi password
              </p>
            </>
          ) : (
            <div className="text-center py-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mb-5">
                <Mail size={28} />
              </div>
              <h1 className="font-display text-2xl mb-2">Angalia email yako</h1>
              <p className="text-ink-600 text-sm mb-6">
                Tumetuma magic link kwa{' '}
                <span className="font-medium text-ink-900">{email}</span>.
                Bofya kiungo hapo ili uingie.
              </p>
              <p className="text-xs text-ink-500 mb-6">
                Hukuona email? Angalia spam, au{' '}
                <button
                  onClick={() => setLinkSent(false)}
                  className="text-flame-600 hover:underline"
                >
                  jaribu tena
                </button>
                .
              </p>
              <Link
                to="/"
                className="text-sm font-mono uppercase tracking-[0.2em] text-ink-500 hover:text-ink-900 transition-colors"
              >
                Rudi nyumbani
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
