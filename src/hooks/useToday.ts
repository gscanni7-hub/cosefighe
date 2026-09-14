import { useHydrated } from './useHydrated'
import { todayISO } from '../lib/dates'
import { BUILD_DAY } from '../lib/buildDay'

/**
 * "Oggi" per le pagine che dipendono dalla data: nell'HTML pre-generato (e nel primo
 * render nel browser, che deve combaciare) è il giorno della generazione; subito dopo
 * l'aggancio diventa la data vera del visitatore.
 */
export function useToday(): string {
  const hydrated = useHydrated()
  return hydrated ? todayISO() : BUILD_DAY
}
