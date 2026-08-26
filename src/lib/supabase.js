import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

function isValidProjectUrl(value) {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabasePublishableKey && isValidProjectUrl(supabaseUrl),
)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export function requireSupabase() {
  if (!supabase) throw new Error('SUPABASE_NOT_CONFIGURED')
  return supabase
}
