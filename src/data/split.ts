/**
 * Testi lunghi caricati uno per pagina (li prepara scripts/dividi-dati.mjs in src/data/split/).
 * Il browser scarica solo la scheda o l'articolo che sta guardando, non tutti.
 *
 * - Prima che React si agganci all'HTML (main.tsx) e prima di generare una pagina (entry-server.tsx)
 *   si chiama `preloadPath(pathname)`, così il testo è già pronto e l'HTML combacia.
 * - Navigando da una pagina all'altra, `useSplit` lo scarica al volo e ridisegna quando arriva.
 */
import { useEffect, useState } from 'react'
import schedeSlugs from './schede-slugs.json'
import { itSlug, langOf } from '../i18n/lang'
import { loadEn } from '../i18n/enData'

export type SplitKind = 'schede-it' | 'schede-en' | 'bodies-it' | 'bodies-en'

const FILES = import.meta.glob<unknown>('./split/*/*.json', { import: 'default' })
const cache = new Map<string, unknown>()
const pending = new Map<string, Promise<void>>()
const fileOf = (kind: SplitKind, id: string) => `./split/${kind}/${id}.json`

/** Il testo se è già stato caricato; null se non esiste proprio; undefined se va ancora scaricato. */
export function peekSplit<T>(kind: SplitKind, id: string | undefined): T | null | undefined {
  if (!id) return null
  const f = fileOf(kind, id)
  if (!FILES[f]) return null
  return cache.has(f) ? (cache.get(f) as T) : undefined
}

export function loadSplit(kind: SplitKind, id: string | undefined): Promise<void> {
  if (!id) return Promise.resolve()
  const f = fileOf(kind, id)
  const loader = FILES[f]
  if (!loader || cache.has(f)) return Promise.resolve()
  let p = pending.get(f)
  if (!p) {
    p = loader().then((v) => void cache.set(f, v))
    pending.set(f, p)
  }
  return p
}

/** Come peekSplit, ma se il testo manca lo scarica e ridisegna il componente quando arriva. */
export function useSplit<T>(kind: SplitKind, id: string | undefined): T | null | undefined {
  const value = peekSplit<T>(kind, id)
  const [, bump] = useState(0)
  useEffect(() => {
    if (value !== undefined) return
    let alive = true
    loadSplit(kind, id).then(() => alive && bump((n) => n + 1))
    return () => {
      alive = false
    }
  }, [kind, id, value])
  return value
}

const PROVIDER_BY_SLUG = Object.fromEntries(Object.entries(schedeSlugs as Record<string, string>).map(([id, slug]) => [slug, id]))
/** L'id della scheda dato lo slug italiano. */
export const providerOfSlug = (slugIt: string): string | undefined => PROVIDER_BY_SLUG[slugIt]

/** Carica tutto quello che serve alla pagina di questo indirizzo (lingua inglese, scheda, articolo). */
export async function preloadPath(pathname: string): Promise<void> {
  const lang = langOf(pathname)
  const jobs: Promise<void>[] = []
  if (lang === 'en') jobs.push(loadEn())
  let m = pathname.match(/^\/(?:esperienze|en\/experiences)\/([^/]+)\/?$/)
  if (m) {
    const id = providerOfSlug(itSlug('esperienze', decodeURIComponent(m[1])))
    jobs.push(loadSplit('schede-it', id))
    if (lang === 'en') jobs.push(loadSplit('schede-en', id))
  }
  m = pathname.match(/^\/(?:blog|en\/blog)\/([^/]+)\/?$/)
  if (m) {
    const slug = itSlug('blog', decodeURIComponent(m[1]))
    jobs.push(loadSplit('bodies-it', slug))
    if (lang === 'en') jobs.push(loadSplit('bodies-en', slug))
  }
  await Promise.all(jobs)
}
