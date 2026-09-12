import type { SupabaseClient } from '@supabase/supabase-js'

/*
 * Indirizzo e chiave "anon" del progetto Supabase. Sono valori pubblici per natura
 * (finiscono comunque nel sito): stanno qui così il deploy non dipende dalle
 * variabili di Vercel. Una variabile d'ambiente, se presente, ha la precedenza.
 */
const DEFAULT_URL = 'https://uayjzwdbcfyinhzwwdje.supabase.co'
const DEFAULT_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVheWp6d2RiY2Z5aW5oend3ZGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMzI2ODgsImV4cCI6MjEwNDgwODY4OH0.-iEny83grtTVwbDWwUNKqMF3BMC4APcVw_t4FACiuoA'

export const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL || DEFAULT_URL
export const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY

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
