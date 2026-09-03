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
