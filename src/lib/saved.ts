import { useCallback, useSyncExternalStore } from 'react'

/** Esperienze salvate con il cuore: vivono nel browser di chi visita, niente account. */
const KEY = 'cosefighe:salvate'
const listeners = new Set<() => void>()
let cache: string[] | null = null

function read(): string[] {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(KEY)
    cache = raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    cache = []
  }
  return cache
}

function write(next: string[]) {
  cache = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* modalità privata o spazio pieno: il cuore funziona solo per la sessione */
  }
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null
      l()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(l)
    window.removeEventListener('storage', onStorage)
  }
}

const EMPTY: string[] = []

export function useSaved() {
  const saved = useSyncExternalStore(subscribe, read, () => EMPTY)
  const has = useCallback((id: string) => saved.includes(id), [saved])
  const toggle = useCallback((id: string) => {
    const cur = read()
    write(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id])
  }, [])
  return { saved, has, toggle }
}
