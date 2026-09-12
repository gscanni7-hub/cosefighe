/** Utilità per le date del programma: tutto in ora locale, formato AAAA-MM-GG. */

const WEEKDAYS = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab']
const WEEKDAYS_LONG = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato']
const MONTHS = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic']
const MONTHS_LONG = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']

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

/** "sab 19 set" */
export function formatShort(iso: string): string {
  const d = fromISO(iso)
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

/** "sabato 19 settembre" */
export function formatLong(iso: string): string {
  const d = fromISO(iso)
  return `${WEEKDAYS_LONG[d.getDay()]} ${d.getDate()} ${MONTHS_LONG[d.getMonth()]}`
}

export function dayParts(iso: string) {
  const d = fromISO(iso)
  return { day: d.getDate(), wd: WEEKDAYS[d.getDay()], wdLong: WEEKDAYS_LONG[d.getDay()], mon: MONTHS[d.getMonth()], monLong: MONTHS_LONG[d.getMonth()], month: d.getMonth() }
}

/** "19 set" oppure "19 – 21 set" oppure "30 set – 2 ott" */
export function formatRange(from: string, to: string): string {
  if (from === to) return formatShort(from)
  const a = fromISO(from)
  const b = fromISO(to)
  if (a.getMonth() === b.getMonth()) return `${a.getDate()} – ${b.getDate()} ${MONTHS[a.getMonth()]}`
  return `${a.getDate()} ${MONTHS[a.getMonth()]} – ${b.getDate()} ${MONTHS[b.getMonth()]}`
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
  range: () => { from: string; to: string }
}

export const DATE_PRESETS: DatePreset[] = [
  { key: 'oggi', label: 'Oggi', range: () => ({ from: todayISO(), to: todayISO() }) },
  { key: 'domani', label: 'Domani', range: () => ({ from: addDays(todayISO(), 1), to: addDays(todayISO(), 1) }) },
  { key: 'weekend', label: 'Questo weekend', range: () => weekendRange() },
  { key: '7', label: 'Prossimi 7 giorni', range: () => ({ from: todayISO(), to: addDays(todayISO(), 6) }) },
  { key: '30', label: 'Prossimi 30 giorni', range: () => ({ from: todayISO(), to: addDays(todayISO(), 29) }) },
]

export function presetFor(from: string, to: string): string | null {
  const p = DATE_PRESETS.find((p) => {
    const r = p.range()
    return r.from === from && r.to === to
  })
  return p?.key ?? null
}
