import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

/**
 * Vero solo dopo che React ha "agganciato" la pagina nel browser.
 * Serve per le parti che dipendono dalla data di oggi o dal browser:
 * nell'HTML pre-generato si mostra un segnaposto identico a quello del primo render.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}
