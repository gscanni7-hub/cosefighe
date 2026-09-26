/**
 * Collegamenti interni tra schede, categorie, guida e articoli.
 * Google pesa le pagine anche da quanti link interni ricevono: ogni scheda rimanda agli articoli
 * che la riguardano, le categorie e la home alle guide evergreen. Si sceglie per parole nel titolo
 * e nel luogo dell'esperienza, poi per categoria. Compaiono solo gli articoli che esistono davvero.
 */
import { ARTICLES } from './articles'
import type { Article, Experience } from '../types'
import { testiIn } from '../i18n/content'

const bySlug = new Map(ARTICLES.map((a) => [a.slug, a]))
const pick = (slugs: string[], limit: number): Article[] => {
  const out: Article[] = []
  for (const s of slugs) {
    const a = bySlug.get(s)
    if (a && !out.includes(a)) out.push(a)
    if (out.length === limit) break
  }
  return out
}

/** Le guide evergreen, nell'ordine in cui le mostriamo in home. */
export const GUIDE_SLUGS = [
  'napoli-in-un-giorno',
  'napoli-in-3-giorni',
  'cosa-fare-a-napoli-gratis',
  'cosa-fare-a-napoli-la-sera',
  'cosa-fare-a-napoli-quando-piove',
  'cosa-fare-a-napoli-con-i-bambini',
]

/** Nome corto di una guida, per le etichette. */
export const GUIDE_LABELS: Record<string, string> = {
  'napoli-in-un-giorno': 'Napoli in un giorno',
  'napoli-in-3-giorni': 'Napoli in 3 giorni',
  'cosa-fare-a-napoli-gratis': 'Cosa fare gratis',
  'cosa-fare-a-napoli-la-sera': 'Cosa fare la sera',
  'cosa-fare-a-napoli-quando-piove': 'Cosa fare quando piove',
  'cosa-fare-a-napoli-con-i-bambini': 'Con i bambini',
}

/** Gli stessi nomi corti in inglese, per le pagine /en (di riserva: vincono quelli di src/data/en/testi.json, chiave GUIDE_LABELS). */
export const GUIDE_LABELS_EN: Record<string, string> = {
  'napoli-in-un-giorno': 'Naples in a day',
  'napoli-in-3-giorni': 'Naples in 3 days',
  'cosa-fare-a-napoli-gratis': 'Free things to do',
  'cosa-fare-a-napoli-la-sera': 'Naples at night',
  'cosa-fare-a-napoli-quando-piove': 'When it rains',
  'cosa-fare-a-napoli-con-i-bambini': 'With kids',
}

/** Nome corto di una guida nella lingua della pagina (undefined se non c'è). */
export const guideLabel = (slug: string, lang: 'it' | 'en' = 'it'): string | undefined => lang === 'en' ? (testiIn<Record<string, string>>('GUIDE_LABELS', GUIDE_LABELS_EN, lang)[slug] ?? GUIDE_LABELS_EN[slug]) : GUIDE_LABELS[slug]

export const guideArticles = (): Article[] => pick(GUIDE_SLUGS, GUIDE_SLUGS.length)

/** Regole per parole: la prima che combacia decide i primi articoli. */
const RULES: [RegExp, string[]][] = [
  [/pompei|ercolano|caserta|capri|ischia|procida|amalfi|positano|sorrento|ravello/i, ['napoli-in-3-giorni']],
  [/vesuvio/i, ['trekking-vesuvio-guida', 'napoli-in-3-giorni']],
  [/sotterran|borbonica|catacomb|fontanelle|san lorenzo|quaranta metri/i, ['napoli-sotterranea-tunnel-greci', 'cosa-fare-a-napoli-quando-piove']],
  [/street food|pignasecca|tarallo|frittatina|assaggi|soste|pub|polpette|babà/i, ['street-food-napoli-guida-completa', 'cosa-fare-a-napoli-la-sera']],
  [/spritz|aperitivo|tramonto|vino|cantina|calici/i, ['aperitivo-napoli-dove-andare', 'cosa-fare-a-napoli-la-sera']],
  [/pizza|pasta|ravioli|fettuccine|gnocchi|calzone|tiramisù|mozzarella|gelato/i, ['cosa-fare-a-napoli-con-i-bambini', 'cosa-fare-a-napoli-quando-piove']],
  [/quartieri|sanità|petraio|vomero|murales|spaccanapoli|decumani|centro storico/i, ['quartieri-napoli-da-scoprire', 'cosa-fare-a-napoli-gratis']],
  [/cristo velato|mann|capodimonte|san martino|palazzo reale|museo/i, ['napoli-in-un-giorno', 'cosa-fare-a-napoli-quando-piove']],
  [/barca|vela|golfo|gaiola|snorkeling|bici|bike|cavallo/i, ['napoli-in-3-giorni', 'cosa-fare-a-napoli-con-i-bambini']],
  [/canzone|tarantella|concerto/i, ['cosa-fare-a-napoli-la-sera']],
]

const BY_CATEGORY: Record<string, string[]> = {
  food: ['street-food-napoli-guida-completa', 'aperitivo-napoli-dove-andare', 'cosa-fare-a-napoli-la-sera'],
  outdoor: ['napoli-in-3-giorni', 'trekking-vesuvio-guida', 'cosa-fare-a-napoli-gratis'],
  sport: ['napoli-in-3-giorni', 'cosa-fare-a-napoli-con-i-bambini', 'trekking-vesuvio-guida'],
  arte: ['napoli-in-un-giorno', 'cosa-fare-a-napoli-quando-piove', 'napoli-sotterranea-tunnel-greci'],
  laboratori: ['cosa-fare-a-napoli-con-i-bambini', 'cosa-fare-a-napoli-quando-piove', 'workshop-ceramica-napoli'],
  spettacoli: ['cosa-fare-a-napoli-la-sera', 'eventi-napoli-ottobre-2026', 'napoli-in-un-giorno'],
}

/** Gli articoli da proporre in fondo a una scheda. */
export function relatedForExperience(exp: Experience, categorySlug: string, limit = 3): Article[] {
  const hay = `${exp.title} ${exp.location} ${exp.included}`
  const slugs: string[] = []
  for (const [re, list] of RULES) if (re.test(hay)) slugs.push(...list)
  slugs.push(...(BY_CATEGORY[categorySlug] ?? []), 'napoli-in-un-giorno', 'napoli-in-3-giorni')
  return pick(slugs, limit)
}

/** Le guide da proporre in una pagina categoria. */
export function relatedForCategory(categorySlug: string, limit = 3): Article[] {
  return pick([...(BY_CATEGORY[categorySlug] ?? []), ...GUIDE_SLUGS], limit)
}

export const articleBySlug = (slug: string): Article | undefined => bySlug.get(slug)
