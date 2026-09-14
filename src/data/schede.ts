/**
 * Le schede delle esperienze: una pagina per ogni attività, /esperienze/<slug>.
 * Gli indirizzi (slug) sono congelati in schede.json, chiave = id sulla piattaforma partner,
 * così non cambiano se ritocchiamo un titolo. I testi sono nostri; i dati (prezzo, durata,
 * voto…) vengono dal database come per le card.
 */
import raw from './schede.json'
import { CATEGORY_LIST } from './categories'
import type { Category, Experience } from '../types'

export interface SchedaFaq {
  q: string
  a: string
}

export interface Scheda {
  slug: string
  intro?: string
  cosaSiFa?: string[]
  perChi?: string
  consiglio?: string
  faq?: SchedaFaq[]
}

export interface ExperiencePage {
  slug: string
  path: string
  exp: Experience
  category: Category
  scheda: Scheda
}

export const SCHEDE: Record<string, Scheda> = raw as Record<string, Scheda>

const key = (exp: Experience) => (exp.providerId ? String(exp.providerId) : '')

/** Tutte le pagine esperienza, nell'ordine delle categorie. Solo le esperienze con una scheda. */
export const EXPERIENCE_PAGES: ExperiencePage[] = CATEGORY_LIST.flatMap((category) =>
  category.experiences.flatMap((exp) => {
    const scheda = SCHEDE[key(exp)]
    return scheda ? [{ slug: scheda.slug, path: `/esperienze/${scheda.slug}`, exp, category, scheda }] : []
  }),
)

const bySlug = new Map(EXPERIENCE_PAGES.map((p) => [p.slug, p]))
const byTitle = new Map(EXPERIENCE_PAGES.map((p) => [p.exp.title, p]))

export function findExperiencePage(slug: string): ExperiencePage | undefined {
  return bySlug.get(slug)
}

/** L'indirizzo della scheda di un'esperienza, se esiste. */
export function experiencePath(exp: Experience): string | undefined {
  return (byTitle.get(exp.title) ?? EXPERIENCE_PAGES.find((p) => key(p.exp) === key(exp)))?.path
}

/** Vero se la scheda ha i testi (non solo l'indirizzo). */
export function hasTexts(s: Scheda): boolean {
  return !!s.intro && !!s.cosaSiFa?.length
}
