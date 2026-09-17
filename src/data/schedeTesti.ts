import full from './schede.json'
import type { Scheda } from './schede'

/** I testi di una scheda, per id sulla piattaforma. Importato solo dalla pagina della scheda (caricata a parte) e dalla generazione delle pagine. */
export function schedaTexts(providerId: string | undefined): Scheda | undefined {
  return providerId ? (full as Record<string, Scheda>)[String(providerId)] : undefined
}
