import { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from './supabase'

// Custom event for demo auth changes
const DEMO_AUTH_EVENT = 'audenic-demo-auth-change'

export function triggerDemoAuthChange() {
  window.dispatchEvent(new Event(DEMO_AUTH_EVENT))
}

export function getDemoSession(): Session | null {
  const stored = localStorage.getItem('audenic-demo-session')
  if (!stored) return null
  try {
    const user = JSON.parse(stored) as User
    return {
      access_token: 'demo-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'demo-refresh',
      user,
    }
  } catch {
    return null
  }
}

/**
 * useSession — track the current auth session reactively.
 *
 * Returns:
 *   session    : the active Supabase or Demo session, or null when signed out
 *   user       : session.user convenience, or null
 *   loading    : true while the initial getSession() is in flight
 *   configured : true when VITE_SUPABASE_* env vars are set (or fallback is active)
 */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. If not configured, check for Demo Session
    if (!isSupabaseConfigured) {
      const checkDemo = () => {
        setSession(getDemoSession())
        setLoading(false)
      }
      checkDemo()
      window.addEventListener(DEMO_AUTH_EVENT, checkDemo)
      window.addEventListener('storage', checkDemo)
      return () => {
        window.removeEventListener(DEMO_AUTH_EVENT, checkDemo)
        window.removeEventListener('storage', checkDemo)
      }
    }

    // 2. If configured, use Supabase authentication
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return {
    session,
    user: session?.user ?? null,
    loading,
    configured: isSupabaseConfigured || Boolean(session), // treat as configured if in demo session
    isDemo: !isSupabaseConfigured,
  }
}
