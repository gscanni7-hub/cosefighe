import { getSupabase, isSupabaseConfigured } from './supabase'
import type { TrackEvent } from './track'

export interface AnalyticsRow extends TrackEvent {
  id?: string
}

export interface DayPoint {
  day: string
  sessions: number
  pageviews: number
}

export interface Ranked {
  name: string
  value: number
  /** Valore secondario (es. secondi medi, quota %). */
  extra?: number
}

export interface Summary {
  sessions: number
  pageviews: number
  avgSeconds: number
  avgScroll: number
  pagesPerSession: number
  byDay: DayPoint[]
  topPages: Ranked[]
  topClicks: Ranked[]
  dwell: Ranked[]
  referrers: Ranked[]
  devices: Ranked[]
  scrollByPage: Ranked[]
  demo: boolean
}

const dayKey = (iso: string) => iso.slice(0, 10)

/** Legge gli eventi degli ultimi N giorni. Senza database non c'è niente da mostrare: tutto a zero. */
export async function loadAnalytics(days: number): Promise<{ rows: AnalyticsRow[]; demo: boolean }> {
  if (!isSupabaseConfigured) return { rows: [], demo: true }
  const supabase = await getSupabase()
  if (!supabase) return { rows: [], demo: true }
  const since = new Date(Date.now() - days * 86400000).toISOString()
  const { data, error } = await supabase.from('analytics_events').select('*').gte('ts', since).order('ts', { ascending: true }).limit(50000)
  if (error) {
    console.error(error)
    return { rows: [], demo: false }
  }
  return { rows: (data ?? []) as AnalyticsRow[], demo: false }
}

function rank(map: Map<string, number>, limit = 8): Ranked[] {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, value]) => ({ name, value }))
}

/** Aggrega gli eventi grezzi nei numeri del cruscotto. */
export function summarize(rows: AnalyticsRow[], days: number, demo: boolean): Summary {
  void demo
  const sessions = new Set<string>()
  const pages = new Map<string, number>()
  const clicks = new Map<string, number>()
  const refs = new Map<string, number>()
  const devs = new Map<string, number>()
  const dwellSum = new Map<string, { s: number; n: number }>()
  const scrollSum = new Map<string, { s: number; n: number }>()
  const perDay = new Map<string, { s: Set<string>; p: number }>()
  let leaveTotal = 0
  let leaveCount = 0
  let scrollTotal = 0
  let scrollCount = 0
  let pageviews = 0

  for (let i = days - 1; i >= 0; i--) perDay.set(dayKey(new Date(Date.now() - i * 86400000).toISOString()), { s: new Set(), p: 0 })

  for (const r of rows) {
    sessions.add(r.session)
    const d = perDay.get(dayKey(r.ts))
    if (r.type === 'pageview') {
      pageviews++
      pages.set(r.path, (pages.get(r.path) ?? 0) + 1)
      if (d) {
        d.p++
        d.s.add(r.session)
      }
      const dev = String(r.meta?.device ?? 'desktop')
      devs.set(dev, (devs.get(dev) ?? 0) + 1)
      const ref = r.meta?.referrer ? String(r.meta.referrer) : ''
      refs.set(ref || 'Diretto / segnalibro', (refs.get(ref || 'Diretto / segnalibro') ?? 0) + 1)
    } else if (r.type === 'click' && r.name) {
      const key = r.meta?.outbound ? `${r.name} ↗` : r.name
      clicks.set(key, (clicks.get(key) ?? 0) + 1)
    } else if (r.type === 'dwell' && r.name && r.value != null) {
      const cur = dwellSum.get(r.name) ?? { s: 0, n: 0 }
      dwellSum.set(r.name, { s: cur.s + r.value, n: cur.n + 1 })
    } else if (r.type === 'leave' && r.value != null) {
      leaveTotal += r.value
      leaveCount++
    } else if (r.type === 'scroll' && r.value != null) {
      scrollTotal += r.value
      scrollCount++
      const cur = scrollSum.get(r.path) ?? { s: 0, n: 0 }
      scrollSum.set(r.path, { s: cur.s + r.value, n: cur.n + 1 })
    }
  }

  const dwell = [...dwellSum.entries()]
    .map(([name, v]) => ({ name, value: Math.round(v.s / v.n), extra: v.n }))
    .filter((x) => x.extra! >= 3)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)
  const scrollByPage = [...scrollSum.entries()]
    .map(([name, v]) => ({ name, value: Math.round(v.s / v.n), extra: v.n }))
    .sort((a, b) => b.extra! - a.extra!)
    .slice(0, 6)

  return {
    sessions: sessions.size,
    pageviews,
    avgSeconds: leaveCount ? Math.round(leaveTotal / leaveCount) : 0,
    avgScroll: scrollCount ? Math.round(scrollTotal / scrollCount) : 0,
    pagesPerSession: sessions.size ? Math.round((pageviews / sessions.size) * 10) / 10 : 0,
    byDay: [...perDay.entries()].map(([day, v]) => ({ day, sessions: v.s.size, pageviews: v.p })),
    topPages: rank(pages),
    topClicks: rank(clicks, 10),
    dwell,
    referrers: rank(refs, 6),
    devices: rank(devs, 3),
    scrollByPage,
    demo,
  }
}
