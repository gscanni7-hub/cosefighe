import type { ArticleSection } from '../types'
import bodies from './generated-bodies.json'

/** Il testo completo di un articolo. Importato solo dalla pagina dell'articolo, che è caricata a parte. */
export function articleBody(slug: string): ArticleSection[] {
  return ((bodies as Record<string, ArticleSection[]>)[slug] ?? []) as ArticleSection[]
}
