import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const isSupabaseConfigured = supabaseUrl.length > 10 && supabaseAnonKey.length > 10

let clientPromise: Promise<SupabaseClient> | null = null

/**
 * Restituisce il client Supabase, caricando la libreria solo alla prima chiamata.
 * Così le pagine pubbliche non scaricano il client se non serve.
 * Restituisce null quando Supabase non è configurato.
 */
export function getSupabase(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return Promise.resolve(null)
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) => createClient(supabaseUrl, supabaseAnonKey))
  }
  return clientPromise
}
