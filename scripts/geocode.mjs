/**
 * Coordinate per la mappa: aggiunge lat/lng a eventi ed esperienze.
 *
 * Il database non ha colonne per le coordinate, quindi si passa da src/data/luoghi.json,
 * una tabella di luoghi con chiave = testo normalizzato (minuscolo, senza accenti né
 * punteggiatura). Le voci "manuale" sono scritte a mano e valgono anche per contenimento:
 * «Real Bosco di Capodimonte, Sala da Ballo» contiene «real bosco di capodimonte».
 * Se un luogo non è in tabella si chiede a Nominatim (OpenStreetMap), al massimo una
 * richiesta al secondo, e la risposta si salva in luoghi.json (source "nominatim") così
 * la build successiva non chiama più la rete. Senza rete l'elemento resta senza
 * coordinate: nessun errore, la build va avanti.
 *
 * Per aggiungere un luogo a mano: una voce in luoghi.json con chiave normalizzata
 * (es. "teatro diana") e valore { lat, lng, label, source: "manuale" }, più "approx": true
 * se la coordinata è di zona e non di palazzo.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const root = fileURLToPath(new URL('..', import.meta.url))
const cacheFile = join(root, 'src', 'data', 'luoghi.json')

const NOMINATIM = 'https://nominatim.openstreetmap.org/search'
const USER_AGENT = 'cosefighenapoli.it (ciao@cosefighenapoli.it)'
const INTERVALLO_MS = 1100
const TIMEOUT_MS = 8000
/** Lunghezza minima di una chiave manuale perché valga anche per contenimento. */
const MIN_CHIAVE_CONTENIMENTO = 4

/** Punto di riserva per le partenze da hotel o da casa: il centro di Napoli. */
const CHIAVE_CENTRO = 'piazza del gesu'
/** Il luogo è il domicilio del cliente («Dal tuo hotel», «Casa privata, indirizzo alla prenotazione»): non «Vesuvio, prelievo in hotel». */
const LUOGO_GENERICO = /^(dal tuo hotel|hotel|casa privata|alloggio|indirizzo alla prenotazione)\b/

/** «Port’Alba, Piazza Dante» -> «port alba piazza dante». */
export function normalizza(testo) {
  return String(testo ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

async function leggiCache() {
  try {
    return JSON.parse(await readFile(cacheFile, 'utf8'))
  } catch {
    return {}
  }
}

async function scriviCache(cache) {
  const ordinata = Object.fromEntries(Object.keys(cache).sort().map((k) => [k, cache[k]]))
  await writeFile(cacheFile, JSON.stringify(ordinata, null, 1) + '\n')
}

/**
 * Cerca il testo nella cache: prima la chiave esatta, poi una voce manuale contenuta nel testo
 * (parole intere). Se ne combaciano più d'una vince quella che compare prima nel testo, perché il
 * luogo preciso viene di solito prima della zona («Teatro Grande, Parco Archeologico di Pompei»);
 * a parità di posizione vince la chiave più lunga («real bosco di capodimonte» batte «capodimonte»).
 */
function cercaInCache(cache, testo) {
  const chiave = normalizza(testo)
  if (!chiave) return null
  if (cache[chiave]) return { chiave, voce: cache[chiave] }
  const spaziato = ` ${chiave} `
  let migliore = null
  for (const [k, v] of Object.entries(cache)) {
    if (v.source !== 'manuale' || k.length < MIN_CHIAVE_CONTENIMENTO) continue
    const pos = spaziato.indexOf(` ${k} `)
    if (pos < 0) continue
    if (!migliore || pos < migliore.pos || (pos === migliore.pos && k.length > migliore.chiave.length)) migliore = { chiave: k, voce: v, pos }
  }
  return migliore
}

function risultato(voce, approx) {
  return { lat: voce.lat, lng: voce.lng, approx: approx || voce.approx === true }
}

function creaGeocoder(cache, opzioni) {
  let ultimaRichiesta = 0
  let modificata = false
  const falliti = new Set()
  const rete = opzioni.rete !== false && typeof fetch === 'function'

  async function nominatim(testo) {
    const chiave = normalizza(testo)
    if (!chiave || !rete || falliti.has(chiave)) return null
    const attesa = INTERVALLO_MS - (Date.now() - ultimaRichiesta)
    if (attesa > 0) await new Promise((r) => setTimeout(r, attesa))
    ultimaRichiesta = Date.now()
    try {
      const url = `${NOMINATIM}?format=json&limit=1&countrycodes=it&q=${encodeURIComponent(testo)}`
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(TIMEOUT_MS) })
      if (!res.ok) throw new Error(`Nominatim ${res.status}`)
      const [primo] = await res.json()
      if (!primo) {
        falliti.add(chiave)
        return null
      }
      const voce = {
        lat: Math.round(Number(primo.lat) * 1e5) / 1e5,
        lng: Math.round(Number(primo.lon) * 1e5) / 1e5,
        label: String(primo.display_name ?? testo).split(',').slice(0, 3).join(',').trim(),
        source: 'nominatim',
      }
      cache[chiave] = voce
      modificata = true
      return voce
    } catch (e) {
      falliti.add(chiave)
      opzioni.log?.(`Nominatim non risponde per «${testo}»: ${e.message}`)
      return null
    }
  }

  return {
    /**
     * Prova i testi in ordine: prima tutti nella cache, poi quelli da chiedere a Nominatim.
     * `approssimativi` sono i testi (zona, titolo) che danno solo una posizione di massima.
     * Una corrispondenza di sola zona («Stadio Maradona, Fuorigrotta» che combacia con «fuorigrotta»)
     * resta come riserva: si chiede prima a Nominatim il punto preciso e, se non arriva, vale la zona.
     * Se però il primo testo (il luogo scritto nel database) è proprio una voce della cache, anche di
     * zona («Vomero», «Dal tuo hotel»), quella è la risposta e non si interroga la rete.
     */
    async trova(testiCache, testiRete, approssimativi = new Set()) {
      let riserva = null
      for (const [i, t] of testiCache.entries()) {
        const hit = cercaInCache(cache, t)
        if (!hit) continue
        const r = risultato(hit.voce, approssimativi.has(t))
        if (!r.approx || (i === 0 && hit.chiave === normalizza(t))) return r
        riserva ??= r
      }
      for (const t of testiRete) {
        const voce = await nominatim(t)
        if (voce) return risultato(voce, approssimativi.has(t))
      }
      return riserva
    },
    get modificata() {
      return modificata
    },
  }
}

const pulito = (s) => String(s ?? '').trim()
const unici = (arr) => [...new Set(arr.filter(Boolean))]

/**
 * Aggiunge lat/lng (e approx se la posizione è di zona) a ogni evento ed esperienza.
 * Restituisce { events, experiences, stats } dove stats elenca quante righe hanno coordinate
 * e i luoghi di quelle rimaste senza.
 */
export async function geocodeAll(events = [], experiences = [], opzioni = {}) {
  const cache = await leggiCache()
  const geocoder = creaGeocoder(cache, opzioni)
  const stats = { eventi: { con: 0, senza: [] }, esperienze: { con: 0, senza: [] } }

  const eventiOut = []
  for (const e of events) {
    const place = pulito(e.place)
    const area = pulito(e.area)
    const conArea = place && area ? `${place}, ${area}` : ''
    const approssimativi = new Set([area, pulito(e.title)])
    const geo = await geocoder.trova(
      unici([place, conArea, area, pulito(e.title)]),
      unici([conArea || (place && `${place}, Napoli`), place, area && `${area}, Napoli`]),
      approssimativi,
    )
    eventiOut.push(applica(e, geo))
    if (geo) stats.eventi.con++
    else stats.eventi.senza.push(place || area || e.title)
  }

  const esperienzeOut = []
  for (const x of experiences) {
    const location = pulito(x.location)
    let geo = null
    if (LUOGO_GENERICO.test(normalizza(location))) {
      const centro = cache[CHIAVE_CENTRO]
      geo = centro ? { lat: centro.lat, lng: centro.lng, approx: true } : null
    } else if (location) {
      geo = await geocoder.trova([location], unici([`${location}, Napoli`, location]))
    }
    esperienzeOut.push(applica(x, geo))
    if (geo) stats.esperienze.con++
    else stats.esperienze.senza.push(location || x.title)
  }

  if (geocoder.modificata) {
    try {
      await scriviCache(cache)
    } catch (e) {
      opzioni.log?.(`luoghi.json non aggiornato: ${e.message}`)
    }
  }
  return { events: eventiOut, experiences: esperienzeOut, stats }
}

function applica(riga, geo) {
  if (!geo) return riga
  const out = { ...riga, lat: geo.lat, lng: geo.lng }
  if (geo.approx) out.approx = true
  return out
}
