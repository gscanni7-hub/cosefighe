import type { CityEvent, EventCategory } from '../types'
import { overlaps, todayISO } from '../lib/dates'
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

/** I prossimi eventi a data fissa; le mostre e le rassegne lunghe solo se manca altro. */
export function upcomingEvents(limit = 4, today = todayISO()): CityEvent[] {
  const live = EVENTS.filter((e) => eventEnd(e) >= today)
  const dated = live.filter((e) => !isLongRunning(e)).sort((a, b) => a.start.localeCompare(b.start))
  const long = live.filter(isLongRunning).sort((a, b) => eventEnd(a).localeCompare(eventEnd(b)))
  return [...dated, ...long].slice(0, limit)
}
