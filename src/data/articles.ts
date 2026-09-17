import type { Article, DbArticle } from '../types'
import generated from './generated.json'

/**
 * Gli articoli del blog arrivano dal database a ogni build (scripts/fetch-content.mjs).
 * Qui c'è solo l'indice: titolo, estratto, copertina, data. I testi completi stanno in
 * generated-bodies.json e li carica soltanto la pagina dell'articolo (vedi articleBodies.ts),
 * così il resto del sito non li scarica.
 */
function fromDb(a: DbArticle): Article {
  return {
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt ?? '',
    category: a.category ?? 'Napoli',
    categorySlug: a.category_slug ?? 'citta',
    author: a.author ?? 'Gianluca Scanni',
    authorRole: a.author_role ?? 'Fondatore',
    authorImage: a.author_image ?? '/cose-beve.webp',
    date: a.date ?? new Date().toISOString().slice(0, 10),
    readingTime: a.reading_time ?? 5,
    coverImage: a.cover_image ?? '/img/napoli-skyline.webp',
    tags: a.tags ?? [],
    body: [],
  }
}

export const ARTICLES: Article[] = ((generated.articles as DbArticle[]) ?? []).map(fromDb)

export const ARTICLES_BY_DATE = [...ARTICLES].sort((a, b) => (a.date < b.date ? 1 : -1))

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug)
}

export function getRelatedArticles(article: Article, limit = 3): Article[] {
  return ARTICLES.filter((a) => a.slug !== article.slug)
    .sort((a, b) => {
      const score = (x: Article) => (x.categorySlug === article.categorySlug ? 1 : 0)
      return score(b) - score(a)
    })
    .slice(0, limit)
}
