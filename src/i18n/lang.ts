/**
 * Lingue del sito: italiano (di serie, indirizzi di sempre) e inglese (tutto sotto /en).
 *
 * Regole:
 * - La lingua si legge dall'indirizzo: /en/... è inglese, il resto italiano.
 * - I testi dell'interfaccia si scrivono in italiano nel codice e passano da `t()`:
 *   in inglese si prende la traduzione dai file src/i18n/ui/*.json (chiave = testo italiano).
 * - I link si scrivono con l'indirizzo italiano e passano da `lp()`, che lo porta nella lingua giusta.
 * - I contenuti (esperienze, eventi, articoli, categorie) hanno la loro versione in src/data/en/*.json.
 */
import { useLocation } from 'react-router'
import slugsEn from '../data/split/slugs.json'
import { EN } from './enData'

export type Lang = 'it' | 'en'

/** La lingua di un indirizzo. */
export const langOf = (pathname: string): Lang => (pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'it')

/** La lingua della pagina in cui ci si trova. */
export function useLang(): Lang {
  return langOf(useLocation().pathname)
}

/** Traduce un testo dell'interfaccia. Senza traduzione resta l'italiano (e la build lo segnala). */
export function translate(text: string, lang: Lang): string {
  if (lang === 'it') return text
  return EN.ui[text] ?? text
}

/** Testo con segnaposto: t('{n} esperienze', { n: 12 }). */
export function translateWith(text: string, lang: Lang, vars: Record<string, string | number>): string {
  return translate(text, lang).replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))
}

/** `const t = useT()` e poi `t('Esperienze')` oppure `t('{n} esperienze', { n })`. */
export function useT() {
  const lang = useLang()
  return (text: string, vars?: Record<string, string | number>) => (vars ? translateWith(text, lang, vars) : translate(text, lang))
}

// ---------------------------------------------------------------- indirizzi

/** Pagine fisse: indirizzo italiano → indirizzo inglese. */
export const STATIC_PATHS: Record<string, string> = {
  '/': '/en',
  '/esperienze': '/en/experiences',
  '/cosa-fare': '/en/things-to-do',
  '/cosa-fare/oggi': '/en/things-to-do/today',
  '/cosa-fare/weekend': '/en/things-to-do/weekend',
  '/mappa': '/en/map',
  '/blog': '/en/blog',
  '/creator': '/en/creators',
  '/chi-siamo': '/en/about',
  '/contatti': '/en/contact',
  '/privacy': '/en/privacy',
  '/cookie': '/en/cookies',
}
const STATIC_BACK = Object.fromEntries(Object.entries(STATIC_PATHS).map(([it, en]) => [en, it]))

/** Prefissi delle pagine con un nome: la parte dopo il prefisso è lo slug. */
const PREFIX: [string, string][] = [
  ['/esperienze/', '/en/experiences/'],
  ['/eventi/', '/en/events/'],
  ['/blog/', '/en/blog/'],
  ['/categoria/', '/en/category/'],
]

/** Slug inglesi per slug italiano (generati da scripts/dividi-dati.mjs, leggeri: servono anche sulle pagine italiane). */
const SLUGS = slugsEn as Record<'experiences' | 'events' | 'articles', Record<string, string>>
const back = (m: Record<string, string>) => Object.fromEntries(Object.entries(m).map(([it, en]) => [en, it]))
const EXP = { fwd: SLUGS.experiences, back: back(SLUGS.experiences) }
const EV = { fwd: SLUGS.events, back: back(SLUGS.events) }
const AR = { fwd: SLUGS.articles, back: back(SLUGS.articles) }

function slugTo(prefixIt: string, slug: string, lang: Lang): string {
  const table =
    prefixIt === '/esperienze/' ? (lang === 'en' ? EXP.fwd : EXP.back)
    : prefixIt === '/eventi/' ? (lang === 'en' ? EV.fwd : EV.back)
    : prefixIt === '/blog/' ? (lang === 'en' ? AR.fwd : AR.back)
    : {}
  return table[slug] ?? slug
}

const LIST_EN: Record<string, string> = { '/esperienze/': '/en/experiences', '/eventi/': '/en/things-to-do', '/blog/': '/en/blog' }
const hasEnSlug = (prefixIt: string, slug: string) =>
  !!(prefixIt === '/esperienze/' ? EXP.fwd : prefixIt === '/eventi/' ? EV.fwd : AR.fwd)[slug]

/** Lo slug italiano di una pagina, dato lo slug che si trova nell'indirizzo (in inglese o già italiano). */
export function itSlug(kind: 'esperienze' | 'eventi' | 'blog', slug: string): string {
  return slugTo('/' + kind + '/', slug, 'it')
}

/** Porta un indirizzo (scritto in italiano o in inglese, con eventuali ?query e #ancora) nella lingua voluta. */
export function localizePath(path: string, lang: Lang): string {
  const m = path.match(/^([^?#]*)(.*)$/)!
  const bare = m[1] || '/'
  const rest = m[2]
  const from = langOf(bare)
  if (from === lang) return path
  if (!bare.startsWith('/') || bare.startsWith('/admin')) return path
  if (lang === 'en') {
    if (STATIC_PATHS[bare]) return STATIC_PATHS[bare] + rest
    for (const [it, en] of PREFIX) {
      if (!bare.startsWith(it)) continue
      const slug = bare.slice(it.length)
      // Pagina senza versione inglese (es. un tour solo in italiano): si va all'elenco inglese.
      if (it !== '/categoria/' && !hasEnSlug(it, slug)) return LIST_EN[it]
      return en + slugTo(it, slug, 'en') + rest
    }
    return '/en' + bare + rest
  }
  if (STATIC_BACK[bare]) return STATIC_BACK[bare] + rest
  for (const [it, en] of PREFIX) if (bare.startsWith(en)) return it + slugTo(it, bare.slice(en.length), 'it') + rest
  return (bare.replace(/^\/en/, '') || '/') + rest
}

/** `const lp = useLp()` e poi `<Link to={lp('/esperienze')}>`: il link resta nella lingua della pagina. */
export function useLp() {
  const lang = useLang()
  return (path: string) => localizePath(path, lang)
}

/** La stessa pagina nell'altra lingua (per il selettore IT | EN e per hreflang). */
export const otherLangPath = (pathname: string): string => localizePath(pathname, langOf(pathname) === 'en' ? 'it' : 'en')

/** Tutti gli indirizzi inglesi delle pagine fisse (per le rotte). */
export const EN_STATIC = Object.values(STATIC_PATHS)
