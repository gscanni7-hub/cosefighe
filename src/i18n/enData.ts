/**
 * I dati della versione inglese (dizionario dell'interfaccia, esperienze, eventi, articoli, categorie, testi).
 * Non stanno nel pacchetto principale: chi visita il sito in italiano non li scarica.
 * Si caricano con `loadEn()` prima di mostrare una pagina /en (main.tsx, split.ts) e passando all'inglese dal selettore.
 * La generazione delle pagine (entry-server.tsx) li carica subito con `registerEn`.
 */
export interface EnBundle {
  ui: Record<string, string>
  experiences: Record<string, Record<string, string | undefined>>
  events: Record<string, Record<string, string | undefined>>
  articles: Record<string, { slug?: string; title?: string; excerpt?: string; category?: string; tags?: string[] }>
  categories: Record<string, Record<string, unknown>>
  testi: Record<string, unknown>
}

export const EN: EnBundle = { ui: {}, experiences: {}, events: {}, articles: {}, categories: {}, testi: {} }
let loading: Promise<void> | undefined
let loaded = false

export const enLoaded = () => loaded

export function registerEn(bundle: EnBundle) {
  Object.assign(EN, bundle)
  loaded = true
  loading = Promise.resolve()
}

export function loadEn(): Promise<void> {
  loading ??= import('./enBundle').then((m) => registerEn(m.default))
  return loading
}
