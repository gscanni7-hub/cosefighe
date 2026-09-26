/** Titoli per Google (qui a parte, così le pagine non si portano dietro tutto seo.ts). */
export const cut = (text: string, max: number) => (text.length > max ? text.slice(0, max - 1).replace(/\s+\S*$/, '') + '…' : text)
/**
 * <title> entro 65 caratteri: con il suffisso « · Cose Fighe» se ci sta, altrimenti senza; se il testo da solo
 * è ancora lungo, resta la parte prima dei due punti (è quella con la parola chiave), altrimenti si taglia.
 */
export const seoTitle = (text: string, suffix = ' · Cose Fighe') => {
  if (text.length + suffix.length <= 65) return text + suffix
  if (text.length <= 65) return text
  const head = text.split(':')[0].trim()
  if (head.length >= 30 && head.length <= 65) return head.length + suffix.length <= 65 ? head + suffix : head
  return cut(text, 65)
}
