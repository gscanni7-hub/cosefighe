/** Utilità per le date del programma: tutto in ora locale, formato AAAA-MM-GG. */

const WEEKDAYS = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab']
const WEEKDAYS_LONG = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato']
const MONTHS = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic']
const MONTHS_LONG = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']
// Inglese: stesse forme, per le pagine /en.
const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEKDAYS_LONG_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_LONG_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
type L = 'it' | 'en'
const W = (l: L) => (l === 'en' ? WEEKDAYS_EN : WEEKDAYS)
const WL = (l: L) => (l === 'en' ? WEEKDAYS_LONG_EN : WEEKDAYS_LONG)
const M = (l: L) => (l === 'en' ? MONTHS_EN : MONTHS)
const ML = (l: L) => (l === 'en' ? MONTHS_LONG_EN : MONTHS_LONG)

export const ISO_RE = /^\d{4}-\d{2}-\d{2}$/

export function toISO(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayISO(): string {
  return toISO(new Date())
}

export function addDays(iso: string, n: number): string {
  const d = fromISO(iso)
  d.setDate(d.getDate() + n)
  return toISO(d)
}

export function weekday(iso: string): number {
  return fromISO(iso).getDay()
}

/** "sab 19 set" · in inglese "Sat 19 Sep" */
export function formatShort(iso: string, lang: L = 'it'): string {
  const d = fromISO(iso)
  return `${W(lang)[d.getDay()]} ${d.getDate()} ${M(lang)[d.getMonth()]}`
}

/** "sabato 19 settembre" · in inglese "Saturday 19 September" */
export function formatLong(iso: string, lang: L = 'it'): string {
  const d = fromISO(iso)
  return `${WL(lang)[d.getDay()]} ${d.getDate()} ${ML(lang)[d.getMonth()]}`
}

export function dayParts(iso: string, lang: L = 'it') {
  const d = fromISO(iso)
  return { day: d.getDate(), wd: W(lang)[d.getDay()], wdLong: WL(lang)[d.getDay()], mon: M(lang)[d.getMonth()], monLong: ML(lang)[d.getMonth()], month: d.getMonth() }
}

/** "19 set" oppure "19 – 21 set" oppure "30 set – 2 ott" (in inglese con i mesi inglesi) */
export function formatRange(from: string, to: string, lang: L = 'it'): string {
  if (from === to) return formatShort(from, lang)
  const a = fromISO(from)
  const b = fromISO(to)
  if (a.getMonth() === b.getMonth()) return `${a.getDate()} – ${b.getDate()} ${M(lang)[a.getMonth()]}`
  return `${a.getDate()} ${M(lang)[a.getMonth()]} – ${b.getDate()} ${M(lang)[b.getMonth()]}`
}

/** Elenco dei giorni tra due date, estremi inclusi. */
export function eachDay(from: string, to: string): string[] {
  const out: string[] = []
  let cur = from
  let guard = 0
  while (cur <= to && guard < 400) {
    out.push(cur)
    cur = addDays(cur, 1)
    guard++
  }
  return out
}

export function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart <= bEnd && aEnd >= bStart
}

/** Il prossimo fine settimana (o quello in corso). */
export function weekendRange(today = todayISO()): { from: string; to: string } {
  const wd = weekday(today)
  if (wd === 6) return { from: today, to: addDays(today, 1) }
  if (wd === 0) return { from: today, to: today }
  const sat = addDays(today, 6 - wd)
  return { from: sat, to: addDays(sat, 1) }
}

export interface DatePreset {
  key: string
  label: string
  /** Intervallo del preset a partire da un "oggi" dato (nelle pagine pre-generate è il giorno della build). */
  range: (today?: string) => { from: string; to: string }
}

export const DATE_PRESETS: DatePreset[] = [
  { key: 'oggi', label: 'Oggi', range: (t = todayISO()) => ({ from: t, to: t }) },
  { key: 'domani', label: 'Domani', range: (t = todayISO()) => ({ from: addDays(t, 1), to: addDays(t, 1) }) },
  { key: 'weekend', label: 'Questo weekend', range: (t = todayISO()) => weekendRange(t) },
  { key: '7', label: 'Prossimi 7 giorni', range: (t = todayISO()) => ({ from: t, to: addDays(t, 6) }) },
  { key: '30', label: 'Prossimi 30 giorni', range: (t = todayISO()) => ({ from: t, to: addDays(t, 29) }) },
]

export function presetFor(from: string, to: string, today = todayISO()): string | null {
  const p = DATE_PRESETS.find((p) => {
    const r = p.range(today)
    return r.from === from && r.to === to
  })
  return p?.key ?? null
}
