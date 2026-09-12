import type { DataRouter } from 'react-router'

/**
 * Misurazione senza cookie: nessun dato personale, nessun identificativo
 * persistente. Un id di sessione casuale vive solo finché la scheda è aperta.
 * Gli eventi vanno nella tabella `analytics_events` di Supabase.
 */
const URL_BASE: string = import.meta.env.VITE_SUPABASE_URL ?? ''
const KEY: string = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''
const ENABLED = URL_BASE.length > 10 && KEY.length > 10

export type TrackType = 'pageview' | 'click' | 'scroll' | 'dwell' | 'leave' | 'event'

export interface TrackEvent {
  ts: string
  session: string
  type: TrackType
  path: string
  name?: string
  value?: number
  meta?: Record<string, string | number | boolean>
}

let session = ''
let buffer: TrackEvent[] = []
let currentPath = ''
let pageStart = 0
let maxScroll = 0
const dwell = new Map<string, number>()
const visibleSince = new Map<string, number>()
let observer: IntersectionObserver | null = null
let started = false

const device = () => (window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop')

function sid(): string {
  if (session) return session
  try {
    session = sessionStorage.getItem('cf_sid') ?? ''
    if (!session) {
      session = Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
      sessionStorage.setItem('cf_sid', session)
    }
  } catch {
    session = Math.random().toString(36).slice(2, 10)
  }
  return session
}

function push(type: TrackType, name?: string, value?: number, meta?: TrackEvent['meta']) {
  const ev: TrackEvent = { ts: new Date().toISOString(), session: sid(), type, path: currentPath, name, value, meta }
  buffer.push(ev)
  if (!ENABLED && import.meta.env.DEV) console.debug('[track]', ev)
  if (buffer.length >= 20) flush()
}

function flush() {
  if (!buffer.length) return
  const batch = buffer
  buffer = []
  if (!ENABLED) return
  try {
    void fetch(`${URL_BASE}/rest/v1/analytics_events`, {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json', apikey: KEY, Authorization: `Bearer ${KEY}`, Prefer: 'return=minimal' },
      body: JSON.stringify(batch),
    })
  } catch {
    /* rete assente: si perde il lotto, nessun errore all'utente */
  }
}

/** Chiude la pagina corrente: profondità di scorrimento, tempo, sezioni viste. */
function leavePage() {
  if (!currentPath) return
  const now = performance.now()
  for (const [id, since] of visibleSince) dwell.set(id, (dwell.get(id) ?? 0) + (now - since))
  visibleSince.clear()
  push('scroll', undefined, Math.round(maxScroll))
  push('leave', undefined, Math.round((now - pageStart) / 1000))
  const top = [...dwell.entries()].filter(([, ms]) => ms >= 1000).sort((a, b) => b[1] - a[1]).slice(0, 8)
  for (const [id, ms] of top) push('dwell', id, Math.round(ms / 1000))
  dwell.clear()
  flush()
}

const sectionLabel = (el: Element) => {
  if (el.id) return el.id
  const h = el.querySelector('h1, h2, h3')
  return (h?.textContent ?? el.getAttribute('aria-label') ?? 'sezione').trim().slice(0, 60)
}

function observeSections() {
  observer?.disconnect()
  observer = new IntersectionObserver(
    (entries) => {
      const now = performance.now()
      for (const e of entries) {
        const id = sectionLabel(e.target)
        if (e.isIntersecting) visibleSince.set(id, now)
        else if (visibleSince.has(id)) {
          dwell.set(id, (dwell.get(id) ?? 0) + (now - (visibleSince.get(id) ?? now)))
          visibleSince.delete(id)
        }
      }
    },
    { threshold: 0.4 },
  )
  document.querySelectorAll('main section').forEach((s) => observer!.observe(s))
}

function enterPage(path: string, first: boolean) {
  currentPath = path
  pageStart = performance.now()
  maxScroll = 0
  const params = new URLSearchParams(window.location.search)
  const meta: TrackEvent['meta'] = { device: device(), w: window.innerWidth }
  if (first) {
    try {
      const ref = document.referrer ? new URL(document.referrer).hostname : ''
      if (ref && ref !== window.location.hostname) meta.referrer = ref
    } catch {
      /* referrer non leggibile */
    }
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign']) if (params.get(k)) meta[k] = params.get(k)!
  }
  push('pageview', document.title.slice(0, 80), undefined, meta)
  // Le sezioni compaiono dopo il render: aspetta un attimo.
  window.setTimeout(observeSections, 400)
}

function onScroll() {
  const doc = document.documentElement
  const total = doc.scrollHeight - window.innerHeight
  if (total <= 0) {
    maxScroll = 100
    return
  }
  maxScroll = Math.max(maxScroll, Math.min(100, (window.scrollY / total) * 100))
}

function onClick(e: MouseEvent) {
  const target = (e.target as Element).closest('a, button')
  if (!target) return
  const name = target.getAttribute('data-track') ?? (target.getAttribute('aria-label') || target.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60)
  if (!name) return
  const href = target.getAttribute('href') ?? ''
  const outbound = /^https?:\/\//.test(href) && !href.includes(window.location.hostname)
  const section = target.closest('section, header, footer, nav')
  push('click', name, undefined, { href: href.slice(0, 120), outbound, section: section ? sectionLabel(section) : '' })
}

/** Evento su misura (es. "salva esperienza", "filtro prezzo"). */
export function track(name: string, meta?: TrackEvent['meta'], value?: number) {
  if (!started) return
  push('event', name, value, meta)
}

/** Avvia la misurazione: una pagina vista per ogni cambio di indirizzo. */
export function startTracking(router: DataRouter) {
  if (started || typeof window === 'undefined') return
  started = true
  if (window.location.pathname.startsWith('/admin')) return
  enterPage(router.state.location.pathname, true)
  router.subscribe((state) => {
    const path = state.location.pathname
    if (path !== currentPath && state.navigation.state === 'idle') {
      leavePage()
      if (!path.startsWith('/admin')) enterPage(path, false)
    }
  })
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('click', onClick, { capture: true })
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      leavePage()
      pageStart = performance.now()
    }
  })
  window.setInterval(flush, 10000)

  if (import.meta.env.PROD) {
    import('@vercel/analytics').then(({ inject }) => inject()).catch(() => {})
  }
}
