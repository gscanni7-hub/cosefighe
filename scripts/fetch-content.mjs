/**
 * Scarica dal database i contenuti pubblicati (esperienze, articoli, eventi)
 * e li scrive in src/data/generated.json prima della build.
 * Così le pagine pre-generate contengono i contenuti veri e Google li legge.
 * Se il database non risponde, lascia il file com'è: il sito usa i contenuti di riserva.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const root = fileURLToPath(new URL('..', import.meta.url))
const file = join(root, 'src', 'data', 'generated.json')

const env = {}
try {
  for (const line of (await readFile(join(root, '.env'), 'utf8')).split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/)
    if (m) env[m[1]] = m[2].trim()
  }
} catch {
  /* nessun .env: si usano i valori pubblici */
}
const URL_BASE = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || 'https://uayjzwdbcfyinhzwwdje.supabase.co'
const KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVheWp6d2RiY2Z5aW5oend3ZGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMzI2ODgsImV4cCI6MjEwNDgwODY4OH0.-iEny83grtTVwbDWwUNKqMF3BMC4APcVw_t4FACiuoA'

async function get(path) {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } })
  if (!res.ok) throw new Error(`${path}: ${res.status}`)
  return res.json()
}

try {
  const [experiences, articles, events] = await Promise.all([
    get('experiences?select=*&published=eq.true&order=created_at.asc'),
    get('articles?select=*&published=eq.true&order=date.desc'),
    get('events?select=*&published=eq.true&order=start_date.asc').catch(() => []),
  ])
  experiences.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  await writeFile(file, JSON.stringify({ fetchedAt: new Date().toISOString(), experiences, articles, events }, null, 1))
  console.log(`Contenuti dal database: ${experiences.length} esperienze, ${articles.length} articoli, ${events.length} eventi.`)
} catch (e) {
  if (process.env.VERCEL) {
    console.error('Database non raggiungibile: la build si ferma, il sito online resta quello precedente.', e.message)
    process.exit(1)
  }
  console.warn('Database non raggiungibile (in locale il sito resta vuoto):', e.message)
}
