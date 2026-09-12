export type ExperienceColor = 'orange' | 'blue' | 'white'

export interface Experience {
  title: string
  duration: string
  group: string
  rating: number
  reviews: number
  price: string
  tag: string
  color: ExperienceColor
  image: string
  location: string
  included: string
  /** Giorni della settimana in cui si fa (0 = domenica ... 6 = sabato). Assente = tutti i giorni. */
  days?: number[]
  /** Da dove viene: piattaforma partner o esperienza nostra. */
  provider?: Provider
  /** Id del prodotto sulla piattaforma partner. */
  providerId?: string
  /** Link di prenotazione con il nostro codice partner. Se c'è, la card mostra "Prenota su ...". */
  affiliateUrl?: string
  languages?: string[]
  cancellation?: string
}

export type Provider = 'getyourguide' | 'viator' | 'cosefighe'

export const PROVIDER_LABEL: Record<Provider, string> = {
  getyourguide: 'GetYourGuide',
  viator: 'Viator',
  cosefighe: 'Cose Fighe',
}

export type DraftStatus = 'bozza' | 'approvata' | 'scartata' | 'pubblicata'

/** Esperienza proposta da un agente, in attesa di revisione nel pannello. */
export interface ExperienceDraft {
  id: string
  created_at: string
  agent_run_id?: string | null
  provider: Provider
  provider_id: string
  source_url: string
  affiliate_url: string
  original_title: string
  title: string
  description: string
  category_slug: string
  price?: string | null
  duration?: string | null
  group_size?: string | null
  languages?: string[] | null
  cancellation?: string | null
  image?: string | null
  location?: string | null
  included?: string | null
  rating?: number | null
  reviews?: number | null
  score?: number | null
  reason?: string | null
  rule_matched?: string | null
  status: DraftStatus
  notes?: string | null
}

export interface AgentRun {
  id: string
  agent: string
  started_at: string
  finished_at?: string | null
  status: 'in corso' | 'ok' | 'errore'
  summary?: string | null
  items?: number | null
}

export type EventCategory = 'food' | 'outdoor' | 'sport' | 'arte' | 'laboratori' | 'spettacoli' | 'citta'

/** Evento in città a data fissa (festa, concerto, mercato, mostra...). */
export interface CityEvent {
  slug: string
  title: string
  category: EventCategory
  /** Data di inizio, formato AAAA-MM-GG. */
  start: string
  /** Data di fine, se dura più giorni. */
  end?: string
  time?: string
  place: string
  area: string
  price: string
  blurb: string
  url?: string
  featured?: boolean
}

export interface Category {
  slug: string
  label: string
  subtitle: string
  accent: string
  bg: string
  marqueeBg: string
  experiences: Experience[]
}

export type ArticleSectionType = 'paragraph' | 'heading' | 'subheading' | 'list' | 'tip' | 'quote'

export interface ArticleSection {
  type: ArticleSectionType
  content: string
  items?: string[]
}

export interface Article {
  slug: string
  title: string
  excerpt: string
  category: string
  categorySlug: string
  author: string
  authorRole: string
  authorImage: string
  date: string
  readingTime: number
  coverImage: string
  tags: string[]
  body: ArticleSection[]
}

/* ---- Tipi delle tabelle Supabase ---- */

export interface DbExperience {
  id?: string
  title: string
  category_slug: string
  duration?: string
  group_size?: string
  rating?: number
  reviews?: number
  price?: string
  tag?: string
  color?: ExperienceColor
  image?: string
  location?: string
  included?: string
  published?: boolean
  provider?: Provider
  provider_id?: string
  affiliate_url?: string
  languages?: string[]
  cancellation?: string
  created_at?: string
  updated_at?: string
}

export interface DbArticle {
  id?: string
  slug: string
  title: string
  excerpt?: string
  category?: string
  category_slug?: string
  author?: string
  author_role?: string
  author_image?: string
  date?: string
  reading_time?: number
  cover_image?: string
  tags?: string[]
  body?: ArticleSection[]
  published?: boolean
  created_at?: string
  updated_at?: string
}

export interface Lead {
  id: string
  name?: string
  email?: string
  topic?: string
  message?: string
  source?: string
  read: boolean
  created_at: string
}
