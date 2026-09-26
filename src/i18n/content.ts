/**
 * Versione inglese dei contenuti. Ogni funzione prende il contenuto italiano e, se la lingua è
 * l'inglese e la traduzione esiste, restituisce una copia con i campi tradotti; altrimenti l'originale.
 *
 * File (tutti in src/data/en/):
 * - experiences.json   chiave = providerId dell'esperienza (campi brevi, servono ovunque: card, ricerca, mappa)
 *     { slugIt, slug, title, tag, duration, group, location, included, cancellation, ritrovo }
 * - schede.json        chiave = providerId (testi lunghi, li carica solo la pagina della scheda: vedi schede.ts qui accanto)
 *     { intro, cosaSiFa[], perChi, consiglio, faq[{q,a}] }
 * - events.json        chiave = slug italiano dell'evento
 *     { slug, title, blurb, time, place, area, price }
 * - articles.json      chiave = slug italiano dell'articolo   { slug, title, excerpt, category, tags[] }
 * - articles-bodies.json chiave = slug italiano               [ blocchi come l'italiano ]
 * - categories.json    chiave = slug della categoria          { label, subtitle, ... }  (vedi localizeCategory)
 * - testi.json         testi lunghi dei moduli in src/data (guida, domande frequenti, ecc.), per modulo
 */
import type { Article, CityEvent, Experience } from '../types'
import type { Lang } from './lang'
import expEn from '../data/en/experiences.json'
import eventsEn from '../data/en/events.json'
import articlesEn from '../data/en/articles.json'
import categoriesEn from '../data/en/categories.json'
import testiEn from '../data/en/testi.json'

type ExpEn = Partial<Record<'slugIt' | 'slug' | 'title' | 'tag' | 'duration' | 'group' | 'location' | 'included' | 'cancellation' | 'ritrovo', string>>
const EXP = expEn as Record<string, ExpEn>
const EV = eventsEn as Record<string, Partial<Record<'slug' | 'title' | 'blurb' | 'time' | 'place' | 'area' | 'price', string>>>
const AR = articlesEn as Record<string, { slug?: string; title?: string; excerpt?: string; category?: string; tags?: string[] }>
const CAT = categoriesEn as Record<string, Record<string, unknown>>
const TESTI = testiEn as Record<string, unknown>

const pick = <T,>(en: T | undefined, it: T): T => (en === undefined || en === null || en === '' ? it : en)

export function localizeExperience<E extends Experience>(exp: E, lang: Lang): E {
  if (lang === 'it') return exp
  const en = exp.providerId ? EXP[exp.providerId] : undefined
  if (!en) return exp
  return {
    ...exp,
    title: pick(en.title, exp.title),
    tag: pick(en.tag, exp.tag),
    duration: pick(en.duration, exp.duration),
    group: pick(en.group, exp.group),
    location: pick(en.location, exp.location),
    included: pick(en.included, exp.included),
    cancellation: pick(en.cancellation, exp.cancellation),
    ritrovo: pick(en.ritrovo, exp.ritrovo),
    // Su GetYourGuide la pagina inglese è /en-gb/ invece di /it-it/: stesso prodotto, stesso codice partner.
    affiliateUrl: exp.affiliateUrl?.replace('getyourguide.com/it-it/', 'getyourguide.com/en-gb/'),
  }
}

/** Esperienze senza l'inglese tra le lingue che restano comunque (spettacoli di musica: non serve capire la guida). */
const SENZA_GUIDA = new Set(['71024P23'])
/** Vero se l'esperienza ha la traduzione e si può fare in inglese (senza, nella versione inglese non si mostra). */
export const hasExperienceEn = (exp: Experience) =>
  !!(exp.providerId && EXP[exp.providerId]?.title) &&
  (!exp.languages?.length || exp.languages.includes('en') || SENZA_GUIDA.has(exp.providerId!))

export function localizeEvent(e: CityEvent, lang: Lang): CityEvent {
  if (lang === 'it') return e
  const en = EV[e.slug]
  if (!en) return e
  return { ...e, title: pick(en.title, e.title), blurb: pick(en.blurb, e.blurb), time: pick(en.time, e.time ?? '') || undefined, place: pick(en.place, e.place), area: pick(en.area, e.area), price: pick(en.price, e.price) }
}
export const hasEventEn = (e: CityEvent) => !!EV[e.slug]?.title
/** Slug inglese di un evento (per l'indirizzo /en/events/...). */
export const eventSlugEn = (e: CityEvent) => EV[e.slug]?.slug ?? e.slug
export const eventBySlugEn = (slugEn: string) => Object.entries(EV).find(([, v]) => v.slug === slugEn)?.[0]

export function localizeArticle(a: Article, lang: Lang): Article {
  if (lang === 'it') return a
  const en = AR[a.slug]
  if (!en) return a
  return { ...a, title: pick(en.title, a.title), excerpt: pick(en.excerpt, a.excerpt), category: pick(en.category, a.category), tags: en.tags?.length ? en.tags : a.tags }
}
export const hasArticleEn = (a: Article) => !!AR[a.slug]?.title
export const articleSlugEn = (slugIt: string) => AR[slugIt]?.slug ?? slugIt
export const articleBySlugEn = (slugEn: string) => Object.entries(AR).find(([, v]) => v.slug === slugEn)?.[0]

/** Campi di una categoria (etichetta, sottotitolo, testi introduttivi, domande): quelli tradotti sostituiscono gli italiani. */
export function localizeCategory<C extends { slug: string }>(c: C, lang: Lang): C {
  if (lang === 'it') return c
  const en = CAT[c.slug]
  return en ? ({ ...c, ...en } as C) : c
}

/** Un testo lungo di un modulo dati (es. testiIn('guida', GUIDE, lang)): stessa forma dell'italiano. */
export function testiIn<T>(key: string, it: T, lang: Lang): T {
  if (lang === 'it') return it
  return (TESTI[key] as T | undefined) ?? it
}
