import type { CityEvent, EventCategory } from '../types'
import { addDays, dayParts, overlaps, todayISO } from '../lib/dates'
import generated from './generated.json'

/** Gli eventi arrivano dal database a ogni build (generated.json). */
const SAMPLE_EVENTS: CityEvent[] = []

interface DbEvent {
  slug: string
  title: string
  category: EventCategory
  start_date: string
  end_date?: string | null
  time?: string | null
  place?: string | null
  area?: string | null
  price?: string | null
  blurb?: string | null
  url?: string | null
  featured?: boolean | null
  source?: string | null
  /** Aggiunti alla build da scripts/geocode.mjs, non sono colonne del database. */
  lat?: number | null
  lng?: number | null
  approx?: boolean | null
}

const dbEvents: CityEvent[] = ((generated.events as DbEvent[]) ?? []).map((e) => ({
  slug: e.slug,
  title: e.title,
  category: e.category,
  start: e.start_date,
  end: e.end_date ?? undefined,
  time: e.time ?? undefined,
  place: e.place ?? '',
  area: e.area ?? '',
  price: e.price ?? '',
  blurb: e.blurb ?? '',
  url: e.url ?? undefined,
  featured: e.featured ?? false,
  cosefighe: e.source === 'cosefighe',
  lat: e.lat ?? undefined,
  lng: e.lng ?? undefined,
  approx: e.approx ?? undefined,
}))

/** Eventi pubblicati nel database; finché non ce ne sono, restano gli esempi. */
export const EVENTS: CityEvent[] = dbEvents.length ? dbEvents : SAMPLE_EVENTS
export const HAS_DB_EVENTS = dbEvents.length > 0

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  food: 'Food',
  outdoor: 'Outdoor',
  sport: 'Sport',
  arte: 'Arte',
  laboratori: 'Laboratori',
  spettacoli: 'Spettacoli',
  citta: 'In città',
}

export const EVENT_CATEGORIES = Object.keys(EVENT_CATEGORY_LABELS) as EventCategory[]

export function eventEnd(e: CityEvent): string {
  return e.end ?? e.start
}

/** Eventi che cadono, anche solo in parte, tra due date. Ordinati per inizio. */
export function eventsBetween(from: string, to: string, category?: EventCategory | null): CityEvent[] {
  return EVENTS.filter((e) => overlaps(e.start, eventEnd(e), from, to) && (!category || e.category === category)).sort(
    (a, b) => a.start.localeCompare(b.start),
  )
}

/** I prossimi eventi da oggi in poi. */
/** Vero se l'evento dura più di una settimana (mostre, rassegne): nelle liste brevi va in coda. */
export function isLongRunning(e: CityEvent): boolean {
  return !!e.end && eachDayCount(e.start, e.end) > 7
}

function eachDayCount(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86400000) + 1
}

/** Il prossimo evento targato Cose Fighe (segnato nel pannello), se ce n'è uno non ancora passato. */
export function nextCoseFigheEvent(today = todayISO()): CityEvent | undefined {
  return EVENTS.filter((e) => e.cosefighe && eventEnd(e) >= today).sort((a, b) => a.start.localeCompare(b.start))[0]
}

/** I prossimi eventi a data fissa; le mostre e le rassegne lunghe solo se manca altro. */
export function upcomingEvents(limit = 4, today = todayISO()): CityEvent[] {
  const live = EVENTS.filter((e) => eventEnd(e) >= today)
  const dated = live.filter((e) => !isLongRunning(e)).sort((a, b) => a.start.localeCompare(b.start))
  const long = live.filter(isLongRunning).sort((a, b) => eventEnd(a).localeCompare(eventEnd(b)))
  return [...dated, ...long].slice(0, limit)
}

/** L'indirizzo della pagina di un evento. */
export const eventPath = (e: CityEvent): string => `/eventi/${e.slug}`

export function findEvent(slug: string): CityEvent | undefined {
  return EVENTS.find((e) => e.slug === slug)
}

/** Vero se il prezzo dice che si entra gratis (non «€2,50, gratis under 18»: lì conta il prezzo). */
export const isFreeEvent = (e: CityEvent): boolean => /^\s*(gratis|gratuit[oa]|ingresso libero|ingresso gratuito)/i.test(e.price)

/**
 * Il prezzo come numero, se dal testo si ricava: «€12» e «da €25» danno 12 e 25, «€8, ridotto €4» dà 8
 * (il primo importo è quello intero), «Gratis» dà 0. «Biglietto del museo» non dà niente.
 */
export function eventPriceNumber(e: CityEvent): number | undefined {
  if (isFreeEvent(e)) return 0
  const m = e.price.match(/€\s*(\d+(?:[.,]\d{1,2})?)/) ?? e.price.match(/^\s*(\d+(?:[.,]\d{1,2})?)\s*(?:€|euro)/i)
  if (!m) return undefined
  const n = Number(m[1].replace(',', '.'))
  return Number.isFinite(n) ? n : undefined
}

/** Gli altri eventi che si sovrappongono alle date di questo, da un giorno in poi: quelli a data fissa prima, poi mostre e rassegne. */
export function eventsAlongside(e: CityEvent, from: string, limit = 6): CityEvent[] {
  const start = from > e.start ? from : e.start
  return eventsBetween(start, eventEnd(e))
    .filter((o) => o.slug !== e.slug)
    .sort((a, b) => Number(isLongRunning(a)) - Number(isLongRunning(b)) || a.start.localeCompare(b.start))
    .slice(0, limit)
}

/** Gli eventi con una pagina da pre-generare: tutti quelli finiti da non più di `days` giorni. */
export function eventsForPages(today: string, days = 0): CityEvent[] {
  const limit = addDays(today, -days)
  return EVENTS.filter((e) => eventEnd(e) >= limit)
}

/** «24 ottobre 2026» per un giorno solo, «fino al 10 ottobre 2026» per mostre e rassegne. */
export function eventDateLabel(e: CityEvent): string {
  const end = eventEnd(e)
  const p = dayParts(end)
  const label = `${p.day} ${p.monLong} ${end.slice(0, 4)}`
  return end === e.start ? label : `fino al ${label}`
}
