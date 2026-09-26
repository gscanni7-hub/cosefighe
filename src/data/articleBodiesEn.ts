import type { ArticleSection } from '../types'
import bodies from './en/articles-bodies.json'

/**
 * Il testo completo di un articolo in inglese (chiave = slug italiano, stessi blocchi dell'italiano).
 * Come articleBodies.ts: lo importa solo la pagina dell'articolo, caricata a parte, così il resto del sito non lo scarica.
 */
export function articleBodyEn(slugIt: string): ArticleSection[] | undefined {
  const b = (bodies as unknown as Record<string, ArticleSection[]>)[slugIt]
  return b?.length ? b : undefined
}
