/** Testi lunghi delle schede in inglese sopra quelli italiani (i file arrivano uno per scheda, vedi data/split.ts). */
import type { Scheda } from '../data/schede'
import type { Lang } from './lang'

export type SchedaEn = { intro?: string; cosaSiFa?: string[]; perChi?: string; consiglio?: string; faq?: { q: string; a: string }[] }
export function localizeScheda(scheda: Scheda | undefined, en: SchedaEn | null | undefined, lang: Lang): Scheda | undefined {
  if (lang === 'it' || !scheda) return scheda
  if (!en) return scheda
  return {
    ...scheda,
    intro: en.intro || scheda.intro,
    cosaSiFa: en.cosaSiFa?.length ? en.cosaSiFa : scheda.cosaSiFa,
    perChi: en.perChi || scheda.perChi,
    consiglio: en.consiglio || scheda.consiglio,
    faq: en.faq?.length ? en.faq : scheda.faq,
  }
}
