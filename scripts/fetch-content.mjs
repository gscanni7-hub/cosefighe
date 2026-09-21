/**
 * Scarica dal database i contenuti pubblicati (esperienze, articoli, eventi)
 * e li scrive in src/data/generated.json prima della build.
 * Così le pagine pre-generate contengono i contenuti veri e Google li legge.
 * Se il database non risponde, lascia il file com'è: il sito usa i contenuti di riserva.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { geocodeAll } from './geocode.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const file = join(root, 'src', 'data', 'generated.json')
const bodiesFile = join(root, 'src', 'data', 'generated-bodies.json')

// Indirizzi delle schede: versione leggera di schede.json (solo id -> slug), usata da card e ricerca.
try {
  const schede = JSON.parse(await readFile(join(root, 'src', 'data', 'schede.json'), 'utf8'))
  await writeFile(join(root, 'src', 'data', 'schede-slugs.json'), JSON.stringify(Object.fromEntries(Object.entries(schede).map(([k, v]) => [k, v.slug])), null, 1))
} catch (e) {
  console.warn('schede-slugs non rigenerato:', e.message)
}

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
  const [experiencesDb, articles, eventsDb] = await Promise.all([
    get('experiences?select=*&published=eq.true&order=created_at.asc'),
    get('articles?select=*&published=eq.true&order=date.desc'),
    get('events?select=*&published=eq.true&order=start_date.asc').catch(() => []),
  ])
  experiencesDb.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

  // Coordinate per la mappa (da src/data/luoghi.json, poi Nominatim): se qualcosa manca la riga resta senza.
  let { experiences, events } = { experiences: experiencesDb, events: eventsDb }
  try {
    const geo = await geocodeAll(eventsDb, experiencesDb, { log: (m) => console.warn(m) })
    experiences = geo.experiences
    events = geo.events
    const { eventi, esperienze } = geo.stats
    console.log(`Coordinate: ${eventi.con}/${eventsDb.length} eventi, ${esperienze.con}/${experiencesDb.length} esperienze.`)
    if (eventi.senza.length) console.log('Eventi senza coordinate:', eventi.senza.join(' | '))
    if (esperienze.senza.length) console.log('Esperienze senza coordinate:', esperienze.senza.join(' | '))
  } catch (e) {
    console.warn('Coordinate non calcolate:', e.message)
  }
  // I testi degli articoli vanno in un file a parte: li scarica solo la pagina dell'articolo.
  const bodies = Object.fromEntries(articles.map((a) => [a.slug, a.body ?? []]))
  const index = articles.map(({ body, ...meta }) => meta)
  await writeFile(bodiesFile, JSON.stringify(bodies))
  await writeFile(file, JSON.stringify({ fetchedAt: new Date().toISOString(), experiences, articles: index, events }, null, 1))
  console.log(`Contenuti dal database: ${experiences.length} esperienze, ${articles.length} articoli, ${events.length} eventi.`)
} catch (e) {
  if (process.env.VERCEL) {
    console.error('Database non raggiungibile: la build si ferma, il sito online resta quello precedente.', e.message)
    process.exit(1)
  }
  console.warn('Database non raggiungibile (in locale il sito resta vuoto):', e.message)
}
