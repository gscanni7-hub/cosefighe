import type { CityEvent, EventCategory, Experience } from '../types'

/** Un punto sulla mappa: un evento o un'esperienza con coordinate. */
export interface MapItem {
  id: string
  kind: 'evento' | 'esperienza'
  cat: EventCategory
  title: string
  lng: number
  lat: number
  approx?: boolean
  /** Solo eventi */
  event?: CityEvent
  /** Solo esperienze */
  exp?: Experience
  categorySlug?: string
}

/** Monumenti disegnati: stanno sulla mappa come le illustrazioni di Apple Maps, ma nel nostro tratto. */
export interface Landmark {
  file: string
  name: string
  lng: number
  lat: number
  /** Da quale zoom compare (le gite lontane si vedono anche da lontano). */
  minZoom: number
  /** Larghezza in pixel a zoom 15; cresce e cala con lo zoom. */
  size: number
}

export const LANDMARKS: Landmark[] = [
  { file: 'vesuvio', name: 'Vesuvio', lng: 14.426, lat: 40.8214, minZoom: 8, size: 110 },
  { file: 'faraglioni', name: 'Capri', lng: 14.2429, lat: 40.5509, minZoom: 8, size: 96 },
  { file: 'pompei', name: 'Pompei', lng: 14.485, lat: 40.75, minZoom: 8.5, size: 90 },
  { file: 'castel-ovo', name: 'Castel dell’Ovo', lng: 14.2476, lat: 40.8283, minZoom: 11, size: 96 },
  { file: 'sant-elmo', name: 'Castel Sant’Elmo', lng: 14.2385, lat: 40.8445, minZoom: 11, size: 104 },
  { file: 'maschio-angioino', name: 'Maschio Angioino', lng: 14.2527, lat: 40.8385, minZoom: 12, size: 92 },
  { file: 'plebiscito', name: 'Piazza del Plebiscito', lng: 14.2482, lat: 40.8358, minZoom: 12.5, size: 104 },
  { file: 'duomo', name: 'Duomo', lng: 14.26, lat: 40.8523, minZoom: 12, size: 88 },
  { file: 'san-carlo', name: 'Teatro San Carlo', lng: 14.2497, lat: 40.8375, minZoom: 13.5, size: 84 },
  { file: 'galleria-umberto', name: 'Galleria Umberto', lng: 14.2493, lat: 40.839, minZoom: 13.5, size: 76 },
]

export const CAT_LABEL: Record<EventCategory, string> = {
  food: 'Food',
  outdoor: 'Outdoor',
  sport: 'Sport',
  arte: 'Arte',
  laboratori: 'Laboratori',
  spettacoli: 'Spettacoli',
  citta: 'In città',
}

/** Icone di categoria (tratto semplice, 24×24) disegnate dentro il segnaposto. */
const ICON_PATHS: Record<EventCategory, string> = {
  food: '<path d="M4 3v7a3 3 0 0 0 6 0V3M7 3v18M16 3c-1.7 0-3 2.2-3 5v3h3v10"/>',
  outdoor: '<path d="M3 18c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2M3 12l5-7 4 5 2-2 6 4"/>',
  sport: '<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-8h5l3 8M10 8l2 8h3M13 5h3"/>',
  arte: '<path d="M4 21h16M5 21V10M9 21V10M15 21V10M19 21V10M3 10l9-6 9 6"/>',
  laboratori: '<path d="M12 3v4M8 7h8l-1 6a3 3 0 0 1-6 0zM9 21h6M12 16v5"/>',
  spettacoli: '<path d="M9 18V6l11-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  citta: '<path d="M12 3l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.3l6-.8z"/>',
}

export const COLORS = { evento: '#ff5500', esperienza: '#0055ff', ink: '#111111', white: '#ffffff' }

/** SVG del segnaposto: goccia colorata con contorno nero e l'icona della categoria nel cerchio bianco. */
export function pinSvg(kind: MapItem['kind'], cat: EventCategory, selected = false): string {
  const fill = COLORS[kind]
  const scale = selected ? 1.25 : 1
  const w = Math.round(34 * scale)
  const h = Math.round(42 * scale)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w * 2}" height="${h * 2}" viewBox="0 0 34 42">
    <path d="M17 41c6-9 14-16 14-24A14 14 0 0 0 3 17c0 8 8 15 14 24z" fill="${fill}" stroke="${COLORS.ink}" stroke-width="2.6" stroke-linejoin="round"/>
    <circle cx="17" cy="16" r="9.5" fill="${COLORS.white}" stroke="${COLORS.ink}" stroke-width="1.6"/>
    <g transform="translate(9 8) scale(0.67)" fill="none" stroke="${COLORS.ink}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[cat]}</g>
  </svg>`
}

export const pinName = (kind: MapItem['kind'], cat: EventCategory, selected = false) => `pin-${kind}-${cat}${selected ? '-sel' : ''}`

/** Link "Indicazioni": Apple Maps su iPhone e iPad, Google Maps altrove. A piedi, come si gira Napoli. */
export function directionsUrl(lat: number, lng: number, label?: string): string {
  const apple = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent)
  return apple
    ? `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=w${label ? `&q=${encodeURIComponent(label)}` : ''}`
    : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`
}

/** Distanza in chilometri tra due punti (formula dell'emisenoverso). */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

export function distanceLabel(km: number): string {
  if (km < 1) return `${Math.round(km * 1000 / 50) * 50} m`
  if (km < 10) return `${km.toFixed(1).replace('.', ',')} km`
  return `${Math.round(km)} km`
}

/** Minuti a piedi, a passo napoletano (4,5 km/h), solo sotto i 6 km. */
export function walkLabel(km: number): string | null {
  if (km > 6) return null
  const min = Math.max(1, Math.round((km / 4.5) * 60))
  return `${min} min a piedi`
}

export const NAPOLI_CENTER: [number, number] = [14.2466, 40.8418]

/** Chiavi dei parametri con cui si apre la mappa su un punto: /mappa?punto=evento:slug */
export const itemId = (kind: MapItem['kind'], key: string) => `${kind}:${key}`

export function eventToItem(e: CityEvent): MapItem | null {
  if (typeof e.lat !== 'number' || typeof e.lng !== 'number') return null
  return { id: itemId('evento', e.slug), kind: 'evento', cat: e.category, title: e.title, lng: e.lng, lat: e.lat, approx: e.approx, event: e }
}

export function experienceToItem(x: Experience, categorySlug: string): MapItem | null {
  if (typeof x.lat !== 'number' || typeof x.lng !== 'number') return null
  const cat = (categorySlug in CAT_LABEL ? categorySlug : 'citta') as EventCategory
  return { id: itemId('esperienza', x.title), kind: 'esperienza', cat, title: x.title, lng: x.lng, lat: x.lat, approx: x.approx, exp: x, categorySlug }
}
