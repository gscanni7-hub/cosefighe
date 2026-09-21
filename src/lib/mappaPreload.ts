/** Scarica il motore della mappa in anticipo (al passaggio del mouse o al tocco su un link verso la mappa), così si apre subito. */
let done = false
export function preloadMappa() {
  if (done || typeof window === 'undefined') return
  done = true
  void import('../components/mappa/MapView')
}
