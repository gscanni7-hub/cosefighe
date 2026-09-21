/**
 * Ritrovi partner: il punto di ritrovo esatto di ogni esperienza, preso dalle piattaforme.
 *
 * Legge le esperienze pubblicate da Supabase (tabella experiences) e per ciascuna cerca il
 * punto d'incontro dell'attività:
 *  - Viator: Partner API v2 (GET /partner/products/{code} -> logistics.start[].location.ref,
 *    POST /partner/locations/bulk). L'API di solito rimanda a un Place ID Google senza
 *    coordinate: in quel caso si apre la pagina pubblica viator.com con Chrome e si legge il
 *    blocco JSON `meetingPoints` (nome, indirizzo, latitudine, longitudine).
 *  - GetYourGuide: nessuna API affiliati. Si apre la pagina pubblica con Chrome (headless
 *    "nuovo", con user agent da browser: le richieste automatiche vengono rifiutate) e si legge
 *    il blocco `meetingPoints` (link Google Maps con le coordinate) e l'indirizzo dal marcatore
 *    della mappa. Se c'è solo l'indirizzo testuale si geocodifica con Nominatim (1 richiesta/s).
 *
 * Scrive src/data/ritrovi.json: { "<provider>:<provider_id>": { lat, lng, label, source } },
 * chiavi in ordine, solo punti con coordinate dentro la Campania. Le esperienze con ritiro in
 * hotel (nessun punto fisso) restano fuori e la mappa continua a usare la posizione di zona.
 * scripts/geocode.mjs legge questo file prima di ogni altra fonte.
 *
 * Uso (dalla radice del progetto, serve .env con SUPABASE_SERVICE_KEY e VIATOR_API_KEY):
 *   node agents/ritrovi-partner.mjs                 tutte le esperienze (refresh mensile)
 *   node agents/ritrovi-partner.mjs --solo viator   solo una piattaforma (viator | getyourguide)
 *   node agents/ritrovi-partner.mjs --solo-nuovi    solo le esperienze non ancora in ritrovi.json
 *   node agents/ritrovi-partner.mjs --id 141978 --id 162012P20   solo alcuni provider_id
 * Limiti rispettati: Viator max 2 richieste al secondo, Nominatim 1 al secondo, pagine una alla
 * volta con 20 secondi di attesa massima. Non stampa mai le chiavi.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { chromium } from 'playwright'

const root = fileURLToPath(new URL('..', import.meta.url))
const fileRitrovi = join(root, 'src', 'data', 'ritrovi.json')

const USER_AGENT_NOMINATIM = 'cosefighenapoli.it (ciao@cosefighenapoli.it)'
const USER_AGENT_CHROME =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
const ATTESA_VIATOR_MS = 550
const ATTESA_NOMINATIM_MS = 1100
const TIMEOUT_PAGINA_MS = 20000
const ATTESA_PAGINA_MS = 4000
/** Riquadro della Campania: fuori da qui il punto è sbagliato e non si salva. */
const CAMPANIA = { latMin: 40.5, latMax: 41.2, lngMin: 13.8, lngMax: 14.8 }
/** Il luogo scritto nel database è il domicilio del cliente: nessun punto fisso da cercare. */
const LUOGO_GENERICO = /^(dal tuo hotel|hotel|casa privata|alloggio|indirizzo alla prenotazione)\b/i

/* ---------- argomenti e ambiente ---------- */

const argv = process.argv.slice(2)
const soloProvider = argv.includes('--solo') ? argv[argv.indexOf('--solo') + 1] : null
const soloNuovi = argv.includes('--solo-nuovi')
const soloId = argv.flatMap((a, i) => (a === '--id' ? [argv[i + 1]] : []))

const env = { ...process.env }
try {
  for (const line of (await readFile(join(root, '.env'), 'utf8')).split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/)
    if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
} catch {
  /* senza .env valgono solo le variabili d'ambiente */
}
const SUPABASE_URL = env.VITE_SUPABASE_URL
const SUPABASE_KEY = env.SUPABASE_SERVICE_KEY || env.VITE_SUPABASE_ANON_KEY
const VIATOR_KEY = env.VIATOR_API_KEY
const VIATOR_HOST = env.VIATOR_API_HOST || 'api.viator.com'
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Mancano VITE_SUPABASE_URL o SUPABASE_SERVICE_KEY in .env')
  process.exit(1)
}

const pausa = (ms) => new Promise((r) => setTimeout(r, ms))
const arrotonda = (n) => Math.round(Number(n) * 1e6) / 1e6
const inCampania = (lat, lng) =>
  Number.isFinite(lat) && Number.isFinite(lng) && lat >= CAMPANIA.latMin && lat <= CAMPANIA.latMax && lng >= CAMPANIA.lngMin && lng <= CAMPANIA.lngMax

/** «Naplesbay Cooking Lab» + «Via delle Zite, 30, 80139 Napoli NA, Italy» -> una riga pulita. */
function componiLabel(nome, indirizzo) {
  const pulisci = (s) =>
    String(s ?? '')
      .replace(/\s+/g, ' ')
      .replace(/,\s*(Italia|Italy)\s*$/i, '')
      .trim()
  const n = pulisci(nome)
  const a = pulisci(indirizzo)
  if (n && a && !a.toLowerCase().includes(n.toLowerCase())) return `${n}, ${a}`
  return a || n
}

/* ---------- JSON annidato nell'HTML ---------- */

/**
 * Trova `"chiave":` nell'HTML e restituisce il valore JSON che segue (oggetto o array),
 * leggendo le parentesi bilanciate e rispettando le stringhe. Le pagine dei partner
 * incorporano lo stato dell'applicazione come JSON dentro uno script.
 */
function estraiJson(html, chiave, da = 0) {
  const i = html.indexOf(`"${chiave}":`, da)
  if (i < 0) return null
  let j = i + chiave.length + 3
  while (j < html.length && html[j] === ' ') j++
  const apre = html[j]
  if (apre !== '[' && apre !== '{') return null
  let livello = 0
  let inStringa = false
  for (let k = j; k < html.length; k++) {
    const c = html[k]
    if (inStringa) {
      if (c === '\\') k++
      else if (c === '"') inStringa = false
      continue
    }
    if (c === '"') inStringa = true
    else if (c === '[' || c === '{') livello++
    else if (c === ']' || c === '}') {
      livello--
      if (livello === 0) {
        try {
          return { valore: JSON.parse(html.slice(j, k + 1)), fine: k + 1 }
        } catch {
          return null
        }
      }
    }
  }
  return null
}

/* ---------- Chrome ---------- */

let browser = null
let contesto = null
async function apriPagina(url) {
  if (!browser) {
    browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--disable-blink-features=AutomationControlled', '--headless=new'] })
    contesto = await browser.newContext({ locale: 'it-IT', viewport: { width: 1366, height: 900 }, userAgent: USER_AGENT_CHROME })
  }
  const page = await contesto.newPage()
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_PAGINA_MS })
    await page.waitForTimeout(ATTESA_PAGINA_MS)
    return await page.content()
  } finally {
    await page.close().catch(() => {})
  }
}

/* ---------- Nominatim ---------- */

let ultimaNominatim = 0
async function nominatim(testo) {
  const attesa = ATTESA_NOMINATIM_MS - (Date.now() - ultimaNominatim)
  if (attesa > 0) await pausa(attesa)
  ultimaNominatim = Date.now()
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=it&q=${encodeURIComponent(testo)}`
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT_NOMINATIM }, signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`Nominatim ${res.status}`)
  const [primo] = await res.json()
  return primo ? { lat: arrotonda(primo.lat), lng: arrotonda(primo.lon) } : null
}

/* ---------- Viator ---------- */

const headersViator = { 'exp-api-key': VIATOR_KEY, Accept: 'application/json;version=2.0', 'Accept-Language': 'it-IT' }
let ultimaViator = 0
async function viatorApi(percorso, body) {
  const attesa = ATTESA_VIATOR_MS - (Date.now() - ultimaViator)
  if (attesa > 0) await pausa(attesa)
  ultimaViator = Date.now()
  const res = await fetch(`https://${VIATOR_HOST}${percorso}`, {
    method: body ? 'POST' : 'GET',
    headers: body ? { ...headersViator, 'Content-Type': 'application/json' } : headersViator,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new Error(`Viator ${res.status} su ${percorso}`)
  return res.json()
}

/** Pagina pubblica in italiano, senza parametri di affiliazione. */
function urlPubblico(x) {
  const u = String(x.affiliate_url ?? '').split('?')[0]
  return x.provider === 'viator' ? u.replace('viator.com/tours/', 'viator.com/it-IT/tours/') : u
}

/** Dalla pagina viator.com: il primo punto di partenza con coordinate. */
async function ritrovoViatorPagina(x) {
  const html = await apriPagina(urlPubblico(x))
  const punti = estraiJson(html, 'meetingPoints')?.valore
  if (!Array.isArray(punti)) return { errore: 'nessun blocco meetingPoints in pagina' }
  const inizio = punti.filter((p) => !p.locationCategory || p.locationCategory === 'START')
  for (const p of inizio.length ? inizio : punti) {
    const loc = p.locationData?.location
    if (!loc || !Number.isFinite(loc.latitude)) continue
    return {
      lat: arrotonda(loc.latitude),
      lng: arrotonda(loc.longitude),
      label: componiLabel(loc.name, loc.address?.readableFormat || loc.unstructuredAddress || loc.description),
      source: 'viator',
    }
  }
  return { errore: 'punti di partenza senza coordinate in pagina' }
}

async function ritrovoViator(x) {
  if (!VIATOR_KEY) return ritrovoViatorPagina(x)
  let prodotto
  try {
    prodotto = await viatorApi(`/partner/products/${x.provider_id}`)
  } catch (e) {
    console.log(`  API non risponde (${e.message}), provo la pagina`)
    return ritrovoViatorPagina(x)
  }
  const logistica = prodotto.logistics ?? {}
  if (logistica.travelerPickup?.pickupOptionType === 'PICKUP_EVERYONE') return { errore: 'ritiro in hotel per tutti, nessun punto fisso' }
  const partenze = (logistica.start ?? []).filter((s) => s.location?.ref)
  if (!partenze.length) return { errore: 'nessun punto di partenza nella logistica' }
  const refs = [...new Set(partenze.map((s) => s.location.ref))]
  let luoghi = []
  try {
    luoghi = (await viatorApi('/partner/locations/bulk', { locations: refs })).locations ?? []
  } catch (e) {
    console.log(`  locations/bulk non risponde (${e.message})`)
  }
  for (const ref of refs) {
    const l = luoghi.find((v) => v.reference === ref)
    if (l?.center && Number.isFinite(l.center.latitude)) {
      return {
        lat: arrotonda(l.center.latitude),
        lng: arrotonda(l.center.longitude),
        label: componiLabel(l.name, [l.address?.street, l.address?.postcode, l.address?.administrativeArea].filter(Boolean).join(', ')),
        source: 'viator',
      }
    }
  }
  /* L'API rimanda a Place ID Google senza coordinate: la pagina pubblica le ha già risolte. */
  return ritrovoViatorPagina(x)
}

/* ---------- GetYourGuide ---------- */

async function ritrovoGyg(x) {
  const url = urlPubblico(x)
  if (!url) return { errore: 'manca affiliate_url' }
  const html = await apriPagina(url)
  if (/<title>\s*GetYourGuide\s*[–-]\s*Error/i.test(html)) return { errore: 'pagina di errore GetYourGuide (richiesta rifiutata)' }

  /* Indirizzo: il marcatore GetYourGuide sulla mappa dell'itinerario, altrimenti la descrizione del ritrovo. */
  let indirizzo = ''
  let coordinateMarcatore = null
  for (let da = 0; ; ) {
    const m = estraiJson(html, 'mapMarkers', da)
    if (!m) break
    da = m.fine
    const gyg = (Array.isArray(m.valore) ? m.valore : []).find((k) => /pin-gyg/.test(k.pin ?? '') && k.location)
    if (gyg) {
      indirizzo = gyg.title ?? ''
      coordinateMarcatore = { lat: gyg.location.latitude, lng: gyg.location.longitude }
      break
    }
  }
  const blocco = estraiJson(html, 'meetingPoints')
  const punti = Array.isArray(blocco?.valore) ? blocco.valore : []
  let coordinate = null
  for (const p of punti) {
    const link = p.link?.href ?? p.onClick?.interactionConfigurations?.find((c) => c.link)?.link ?? ''
    const m = String(link).match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (m) {
      coordinate = { lat: Number(m[1]), lng: Number(m[2]) }
      break
    }
  }
  coordinate ??= coordinateMarcatore
  if (!indirizzo) {
    const i = html.indexOf('"meeting-point-links"')
    const desc = i >= 0 ? estraiJson(html, 'description', i)?.valore?.text : ''
    if (desc && desc.length <= 160) indirizzo = desc
  }
  if (coordinate) return { lat: arrotonda(coordinate.lat), lng: arrotonda(coordinate.lng), label: componiLabel('', indirizzo || x.location), source: 'gyg' }
  if (!indirizzo) return { errore: 'nessun punto di incontro in pagina (probabile ritiro in hotel)' }
  const geo = await nominatim(indirizzo)
  if (!geo) return { errore: `Nominatim non trova «${indirizzo}»` }
  return { ...geo, label: componiLabel('', indirizzo), source: 'gyg+nominatim' }
}

/* ---------- esecuzione ---------- */

const res = await fetch(`${SUPABASE_URL}/rest/v1/experiences?select=title,provider,provider_id,affiliate_url,location&order=provider,provider_id`, {
  headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
})
if (!res.ok) {
  console.error(`Supabase ${res.status}`)
  process.exit(1)
}
let esperienze = await res.json()
if (soloProvider) esperienze = esperienze.filter((x) => x.provider === soloProvider)
if (soloId.length) esperienze = esperienze.filter((x) => soloId.includes(String(x.provider_id)))

let ritrovi = {}
try {
  ritrovi = JSON.parse(await readFile(fileRitrovi, 'utf8'))
} catch {
  /* prima esecuzione */
}
if (soloNuovi) esperienze = esperienze.filter((x) => !ritrovi[`${x.provider}:${x.provider_id}`])

const esito = { viator: { ok: 0, no: [] }, getyourguide: { ok: 0, no: [] } }
console.log(`${esperienze.length} esperienze da controllare`)
for (const x of esperienze) {
  const chiave = `${x.provider}:${x.provider_id}`
  const conto = esito[x.provider] ?? (esito[x.provider] = { ok: 0, no: [] })
  console.log(`\n${chiave} — ${x.title} [${x.location || 'senza luogo'}]`)
  if (LUOGO_GENERICO.test(String(x.location ?? '').trim())) {
    console.log('  saltata: ritiro in hotel o a casa')
    conto.no.push({ chiave, titolo: x.title, motivo: 'ritiro in hotel o a casa' })
    delete ritrovi[chiave]
    continue
  }
  let r
  try {
    r = x.provider === 'viator' ? await ritrovoViator(x) : x.provider === 'getyourguide' ? await ritrovoGyg(x) : { errore: `provider sconosciuto ${x.provider}` }
  } catch (e) {
    r = { errore: e.message.split('\n')[0] }
  }
  if (r.errore) {
    console.log(`  niente: ${r.errore}${ritrovi[chiave] ? ' (resta il valore precedente)' : ''}`)
    conto.no.push({ chiave, titolo: x.title, motivo: r.errore })
    continue
  }
  if (!inCampania(r.lat, r.lng)) {
    console.log(`  scartato: ${r.lat},${r.lng} è fuori dalla Campania`)
    conto.no.push({ chiave, titolo: x.title, motivo: `coordinate fuori dalla Campania (${r.lat}, ${r.lng})` })
    continue
  }
  ritrovi[chiave] = { lat: r.lat, lng: r.lng, label: r.label, source: r.source }
  conto.ok++
  console.log(`  ${r.lat}, ${r.lng} — ${r.label} [${r.source}]`)
  await pausa(800)
}
if (browser) await browser.close()

const ordinati = Object.fromEntries(Object.keys(ritrovi).sort().map((k) => [k, ritrovi[k]]))
await writeFile(fileRitrovi, JSON.stringify(ordinati, null, 1) + '\n')

console.log(`\nScritto ${fileRitrovi}: ${Object.keys(ordinati).length} ritrovi`)
for (const [p, c] of Object.entries(esito)) {
  console.log(`${p}: ${c.ok} esatti, ${c.no.length} senza`)
  for (const n of c.no) console.log(`  - ${n.chiave} ${n.titolo}: ${n.motivo}`)
}
