/** Testi lunghi delle schede in inglese: li importa solo la pagina della scheda, come schedeTesti.ts per l'italiano. */
import type { Scheda } from '../data/schede'
import type { Lang } from './lang'
import schedeEn from '../data/en/schede.json'

type SchedaEn = { intro?: string; cosaSiFa?: string[]; perChi?: string; consiglio?: string; faq?: { q: string; a: string }[] }
const EN = schedeEn as Record<string, SchedaEn>

export function localizeScheda(providerId: string | undefined, scheda: Scheda | undefined, lang: Lang): Scheda | undefined {
  if (lang === 'it' || !providerId || !scheda) return scheda
  const en = EN[providerId]
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
