/**
 * Le pagine delle esperienze: una per ogni attività, /esperienze/<slug>.
 * Gli indirizzi (slug) sono congelati, chiave = id sulla piattaforma partner, così non cambiano
 * se ritocchiamo un titolo. Qui ci sono solo gli indirizzi (schede-slugs.json, leggero, generato
 * a ogni build da schede.json); i testi lunghi li carica soltanto la pagina della scheda.
 */
import slugs from './schede-slugs.json'
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
}

const SLUGS = slugs as Record<string, string>
const key = (exp: Experience) => (exp.providerId ? String(exp.providerId) : '')

/** Tutte le pagine esperienza, nell'ordine delle categorie. Solo le esperienze con un indirizzo. */
export const EXPERIENCE_PAGES: ExperiencePage[] = CATEGORY_LIST.flatMap((category) =>
  category.experiences.flatMap((exp) => {
    const slug = SLUGS[key(exp)]
    return slug ? [{ slug, path: `/esperienze/${slug}`, exp, category }] : []
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
export function hasTexts(s: Scheda | undefined): s is Scheda {
  return !!s?.intro && !!s.cosaSiFa?.length
}
