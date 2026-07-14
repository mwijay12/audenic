/**
 * Supabase client — singleton.
 *
 * Auth + Postgres + Storage for Audenic Audio.
 * Database tables live in /supabase/schema.sql; RLS in /supabase/rls.sql.
 *
 * Env vars (set in .env):
 *   VITE_SUPABASE_URL         e.g. https://abcdefg.supabase.co
 *   VITE_SUPABASE_ANON_KEY    public anon key (safe to ship to the browser)
 *
 * The anon key is safe in the browser — RLS policies on every table ensure
 * users can only read/write their own data. Never use the service_role key
 * in the client; that's server-side only.
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. ' +
      'Auth and database calls will fail. See supabase/README.md for setup.'
  )
}

export const supabase = createClient(
  SUPABASE_URL ?? 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY ?? 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      storageKey: 'audenic-auth',
    },
  }
)

/** True when real credentials are configured (vs. the placeholder fallback). */
export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes('placeholder') &&
    !SUPABASE_ANON_KEY.includes('placeholder')
)

// ---------------------------------------------------------------------------
// Domain helpers — thin wrappers around the client so call sites stay clean.
// ---------------------------------------------------------------------------

export type NewsletterResult =
  | { ok: true;  message: string }
  | { ok: false; message: string }

/**
 * Add an email to the newsletter_subscribers table.
 * Public insert is allowed by RLS, so this works for anon + signed-in users.
 */
export async function subscribeToNewsletter(
  email: string,
  source: 'homepage' | 'cart' | 'checkout' | 'footer' | 'about' = 'footer'
): Promise<NewsletterResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase is not configured. Set VITE_SUPABASE_* in .env.' }
  }
  const trimmed = email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, message: 'Tafadhali ingiza email halali.' }
  }
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email: trimmed, source })
  if (error) {
    if (error.code === '23505') {
      // unique_violation — already subscribed
      return { ok: true, message: 'Umeshajisajili — asante sana!' }
    }
    return { ok: false, message: 'Hitilafu imetokea. Jaribu tena.' }
  }
  return { ok: true, message: 'Asante! Utapata updates zetu.' }
}
