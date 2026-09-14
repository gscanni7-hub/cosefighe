import generated from '../data/generated.json'
import { todayISO } from './dates'

/**
 * Il giorno in cui il sito è stato generato, in ora di Roma (AAAA-MM-GG).
 * Le pagine pre-generate lo usano come "oggi", così Google legge il programma
 * vero fin dal primo HTML; nel browser, dopo l'aggancio, vale la data reale.
 * Il sito si rigenera ogni mattina (api/rebuild.js), quindi il giorno è quasi sempre quello giusto.
 */
export const BUILD_DAY: string = (() => {
  const t = (generated as { fetchedAt?: string }).fetchedAt
  if (!t) return todayISO()
  try {
    return new Date(t).toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' })
  } catch {
    return t.slice(0, 10)
  }
})()
