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
