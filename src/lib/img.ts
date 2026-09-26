/**
 * Varianti leggere delle foto: per ogni /img/<nome>.webp (1400 px) esiste
 * /img/800/<nome>.webp (800 px). Le card la usano con srcset, così su telefono
 * e nelle liste non si scarica la foto grande.
 */
const small = new Set(typeof __IMG800__ === 'undefined' ? [] : __IMG800__)

/** Percorso della variante da 800 px, solo se esiste; altrimenti undefined. */
export function imgSmall(path: string | undefined | null): string | undefined {
  if (!path || !path.startsWith('/img/')) return undefined
  const name = path.slice(5)
  if (name.includes('/') || !small.has(name)) return undefined
  return `/img/800/${name}`
}

/** srcset 800w/1400w per una foto di /img/, oppure undefined se non c'è la variante. */
export function imgSrcSet(path: string | undefined | null): string | undefined {
  const s = imgSmall(path)
  return s ? `${s} 800w, ${path} 1400w` : undefined
}

/** Larghezze mostrate delle card nelle griglie (3 colonne su computer, 2 su tablet, 1 su telefono). */
export const CARD_SIZES = '(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw'
