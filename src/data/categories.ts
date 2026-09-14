import type { Category, DbExperience, Experience } from '../types'
import generated from './generated.json'

/** Le sei categorie. Le esperienze arrivano dal database a ogni build (generated.json). */
const STATIC_CATEGORIES: Record<string, Category> = {
  food: {
    slug: 'food',
    label: 'Food',
    subtitle: 'Mangia come un vero napoletano',
    accent: '#FF5500',
    bg: '#FF5500',
    marqueeBg: 'bg-[#FF5500]',
    experiences: [],
  },
  outdoor: {
    slug: 'outdoor',
    label: 'Outdoor',
    subtitle: 'Esplora il paesaggio campano',
    accent: '#0055FF',
    bg: '#0055FF',
    marqueeBg: 'bg-[#0055FF]',
    experiences: [],
  },
  sport: {
    slug: 'sport',
    label: 'Sport',
    subtitle: 'Muoviti tra storia e adrenalina',
    accent: '#FF5500',
    bg: '#111111',
    marqueeBg: 'bg-[#111111]',
    experiences: [],
  },
  arte: {
    slug: 'arte',
    label: 'Arte',
    subtitle: 'Immergiti nella cultura napoletana',
    accent: '#FF5500',
    bg: '#FF5500',
    marqueeBg: 'bg-[#FF5500]',
    experiences: [],
  },
  laboratori: {
    slug: 'laboratori',
    label: 'Laboratori',
    subtitle: 'Impara facendo, con i maestri napoletani',
    accent: '#0055FF',
    bg: '#0055FF',
    marqueeBg: 'bg-[#0055FF]',
    experiences: [],
  },
  spettacoli: {
    slug: 'spettacoli',
    label: 'Spettacoli',
    subtitle: 'Vivi la scena culturale di Napoli',
    accent: '#FF5500',
    bg: '#111111',
    marqueeBg: 'bg-[#111111]',
    experiences: [],
  },
}

function fromDb(e: DbExperience): Experience {
  return {
    title: e.title,
    duration: e.duration ?? '',
    group: e.group_size ?? '',
    rating: e.rating ?? 4.8,
    reviews: e.reviews ?? 0,
    price: e.price ?? '',
    tag: e.tag ?? '',
    color: e.color ?? 'white',
    image: e.image ?? '',
    location: e.location ?? '',
    included: e.included ?? '',
    days: (e as { days?: number[] }).days ?? undefined,
    provider: e.provider,
    providerId: e.provider_id,
    affiliateUrl: e.affiliate_url,
    languages: e.languages,
    cancellation: e.cancellation,
  }
}

const dbExperiences = (generated.experiences as DbExperience[]) ?? []

/**
 * Categorie del sito. Se nel database ci sono esperienze pubblicate per una
 * categoria, quelle sostituiscono le esperienze di riserva di quella categoria.
 * Il file generated.json viene riempito a ogni build da scripts/fetch-content.mjs.
 */
export const CATEGORIES: Record<string, Category> = Object.fromEntries(
  Object.entries(STATIC_CATEGORIES).map(([slug, cat]) => {
    const fromDbRows = dbExperiences.filter((e) => e.category_slug === slug).map(fromDb)
    return [slug, fromDbRows.length ? { ...cat, experiences: fromDbRows } : cat]
  }),
)

export const CATEGORY_LIST: Category[] = Object.values(CATEGORIES)

/** Vero se almeno una categoria mostra esperienze dal database. */
export const HAS_DB_EXPERIENCES = dbExperiences.length > 0
