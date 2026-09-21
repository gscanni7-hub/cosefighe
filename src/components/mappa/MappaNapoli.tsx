import { useEffect, useRef } from 'react'
import maplibregl, { type Map as MLMap, type GeoJSONSource, type StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { COLORS, LANDMARKS, NAPOLI_CENTER, pinName, pinSvg, type MapItem } from '../../lib/mappa'
import type { EventCategory } from '../../types'

/** Mappe libere di OpenFreeMap (OpenStreetMap): niente chiave, niente cookie. */
const STYLE_URL = 'https://tiles.openfreemap.org/styles/bright'
const KINDS: MapItem['kind'][] = ['evento', 'esperienza']
const CATS: EventCategory[] = ['food', 'outdoor', 'sport', 'arte', 'laboratori', 'spettacoli', 'citta']

export interface MappaNapoliProps {
  items: MapItem[]
  selectedId?: string | null
  onSelect?: (id: string | null) => void
  /** Posizione della persona, se l'ha concessa. */
  me?: { lat: number; lng: number } | null
  /** Dove guardare all'apertura: un punto (con zoom) oppure tutti gli elementi. */
  focus?: { lng: number; lat: number; zoom?: number } | null
  /** Mappa che non si muove: per il riquadro "Dove" nelle schede. */
  interactive?: boolean
  className?: string
  /** Spazio in basso coperto da pannelli (px): i punti restano visibili sopra. */
  paddingBottom?: number
  /** Punto sotto il mouse (dalla lista) e avviso quando il mouse passa su un segnaposto. */
  hoveredId?: string | null
  onHover?: (id: string | null) => void
  /** Ogni volta che la persona sposta o zooma la mappa: i limiti visibili (sud, ovest, nord, est). */
  onMove?: (bounds: [number, number, number, number], byUser: boolean) => void
  /** Se le tessere non arrivano (rete assente o bloccata). */
  onError?: () => void
}

/** Colori del sito sopra lo stile "bright": carta sabbia, mare blu, strade bianche, senza negozi e fermate. */
function brandStyle(map: MLMap) {
  const P = (id: string, prop: string, v: unknown) => map.getLayer(id) && map.setPaintProperty(id, prop, v)
  const L = (id: string, prop: string, v: unknown) => map.getLayer(id) && map.setLayoutProperty(id, prop, v)
  P('background', 'background-color', '#fff7f1')
  for (const id of ['landuse-residential', 'landuse-suburb', 'landuse-hospital', 'landuse-school']) P(id, 'fill-color', '#fbeee3')
  P('landuse-commercial', 'fill-color', '#fbe9dd')
  P('landuse-industrial', 'fill-color', '#f3ebe3')
  P('landuse-cemetery', 'fill-color', '#eef0e4')
  P('park', 'fill-color', '#dcebc9')
  P('landcover-grass', 'fill-color', '#e3eed3')
  P('landcover-grass-park', 'fill-color', '#d5e7bf')
  P('landcover-wood', 'fill-color', '#cfe2b8')
  P('water', 'fill-color', '#0055ff')
  P('water', 'fill-opacity', 0.28)
  P('building', 'fill-color', '#efdfd0')
  P('building', 'fill-outline-color', '#dfc9b6')
  P('building-top', 'fill-color', '#f4e6d9')
  const style = map.getStyle() as StyleSpecification
  for (const l of style.layers) {
    if (l.type === 'line' && /inner/.test(l.id)) P(l.id, 'line-color', /motorway|trunk/.test(l.id) ? '#ffd0b3' : /primary/.test(l.id) ? '#fff0e5' : '#ffffff')
    if (l.type === 'line' && /casing/.test(l.id)) P(l.id, 'line-color', '#e8d5c4')
    if (l.type === 'symbol' && /^poi|transit|oneway|shield|airport/.test(l.id)) L(l.id, 'visibility', 'none')
  }
  for (const id of ['label_other', 'label_village', 'label_town', 'label_city', 'label_city_capital']) {
    P(id, 'text-color', COLORS.ink)
    P(id, 'text-halo-color', '#fff7f1')
    L(id, 'text-transform', 'uppercase')
    L(id, 'text-letter-spacing', 0.1)
    L(id, 'text-font', ['Noto Sans Bold'])
    L(id, 'text-field', ['coalesce', ['get', 'name:it'], ['get', 'name']])
  }
  for (const id of ['water_name_point_label', 'water_name_line_label']) {
    P(id, 'text-color', COLORS.evento === '#ff5500' ? '#0055ff' : '#0055ff')
    L(id, 'text-field', ['coalesce', ['get', 'name:it'], ['get', 'name']])
  }
  for (const id of ['highway-name-major', 'highway-name-minor', 'highway-name-path']) {
    P(id, 'text-color', '#7a6a5e')
    P(id, 'text-halo-color', '#ffffff')
  }
}

/** Trasforma un SVG in immagine per la mappa (a 2x, nitida sui telefoni). */
function svgImage(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  })
}

async function loadImages(map: MLMap) {
  const jobs: Promise<void>[] = []
  for (const kind of KINDS)
    for (const cat of CATS)
      for (const sel of [false, true])
        jobs.push(svgImage(pinSvg(kind, cat, sel)).then((img) => { if (!map.hasImage(pinName(kind, cat, sel))) map.addImage(pinName(kind, cat, sel), img, { pixelRatio: 2 }) }))
  for (const lm of LANDMARKS)
    jobs.push(
      map.loadImage(`/mappa/${lm.file}.webp`).then((r) => { if (!map.hasImage(`lm-${lm.file}`)) map.addImage(`lm-${lm.file}`, r.data, { pixelRatio: 2 }) }).catch(() => undefined),
    )
  await Promise.all(jobs)
}

const itemsGeoJson = (items: MapItem[], selectedId: string | null | undefined, hoveredId?: string | null): GeoJSON.FeatureCollection => ({
  type: 'FeatureCollection',
  features: items.map((it) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [it.lng, it.lat] },
    properties: { id: it.id, title: it.title, icon: pinName(it.kind, it.cat, it.id === selectedId), sel: it.id === selectedId ? 1 : 0, hov: it.id === hoveredId ? 1 : 0, kind: it.kind },
  })),
})

const landmarksGeoJson = (): GeoJSON.FeatureCollection => ({
  type: 'FeatureCollection',
  features: LANDMARKS.map((lm) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [lm.lng, lm.lat] },
    properties: { name: lm.name.toUpperCase(), icon: `lm-${lm.file}`, minZoom: lm.minZoom, size: lm.size / 180, priority: lm.priority },
  })),
})

function addLayers(map: MLMap, items: MapItem[], selectedId: string | null | undefined, interactive: boolean) {
  // Edifici in 3D leggeri quando si è molto vicini, prima di tutte le scritte.
  const firstSymbol = (map.getStyle() as StyleSpecification).layers.find((l) => l.type === 'symbol')?.id
  if (map.getSource('openmaptiles') && !map.getLayer('edifici-3d'))
    map.addLayer(
      {
        id: 'edifici-3d',
        type: 'fill-extrusion',
        source: 'openmaptiles',
        'source-layer': 'building',
        minzoom: 15.5,
        paint: {
          'fill-extrusion-color': '#f8ebdf',
          'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 8],
          'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
          'fill-extrusion-opacity': ['interpolate', ['linear'], ['zoom'], 15.5, 0, 16.5, 0.45],
        },
      },
      firstSymbol,
    )
  map.addSource('monumenti', { type: 'geojson', data: landmarksGeoJson() })
  // Fasce di zoom: da lontano solo i grandi (Vesuvio, Capri, Pompei, isole), poi castelli e piazze, da vicino teatro e galleria.
  // Le collisioni le gestisce la mappa: quando due si toccano resta quello con priorità più alta, l'altro compare zoomando.
  for (const [suffix, min, max] of [['lontano', 0, 11], ['citta', 11, 12.5], ['medio', 12.5, 14], ['vicino', 14, 99]] as const) {
    map.addLayer({
      id: `monumenti-${suffix}`,
      type: 'symbol',
      source: 'monumenti',
      minzoom: min === 0 ? 7.5 : min,
      filter: ['all', ['>=', ['get', 'minZoom'], min], ['<', ['get', 'minZoom'], max]],
      layout: {
        'icon-image': ['get', 'icon'],
        'icon-size': ['interpolate', ['linear'], ['zoom'], 8, ['*', ['get', 'size'], 0.45], 12, ['*', ['get', 'size'], 0.7], 15, ['get', 'size'], 17, ['*', ['get', 'size'], 1.4]],
        'icon-anchor': 'bottom',
        'icon-allow-overlap': false,
        'icon-ignore-placement': false,
        'icon-padding': 4,
        'symbol-sort-key': ['get', 'priority'],
        'text-field': ['get', 'name'],
        'text-font': ['Noto Sans Bold'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 10, 9, 15, 11],
        'text-letter-spacing': 0.08,
        'text-anchor': 'top',
        'text-offset': [0, 0.3],
        'text-optional': true,
      },
      paint: { 'text-color': COLORS.ink, 'text-halo-color': '#fff7f1', 'text-halo-width': 1.6 },
    })
  }

  map.addSource('punti', { type: 'geojson', data: itemsGeoJson(items, selectedId), cluster: interactive,
    clusterRadius: 44,
    clusterMaxZoom: 14,
    clusterProperties: { ev: ['+', ['case', ['==', ['get', 'kind'], 'evento'], 1, 0]], ex: ['+', ['case', ['==', ['get', 'kind'], 'esperienza'], 1, 0]] },
  })
  if (interactive) {
    map.addLayer({
      id: 'gruppi',
      type: 'circle',
      source: 'punti',
      filter: ['has', 'point_count'],
      paint: {
        // Solo eventi = arancione, solo esperienze = blu, misto = nero.
        'circle-color': ['case', ['==', ['get', 'ex'], 0], COLORS.evento, ['==', ['get', 'ev'], 0], COLORS.esperienza, COLORS.ink],
        'circle-radius': ['step', ['get', 'point_count'], 16, 10, 20, 30, 24],
        'circle-stroke-color': COLORS.white,
        'circle-stroke-width': 2.5,
      },
    })
    map.addLayer({
      id: 'gruppi-numero',
      type: 'symbol',
      source: 'punti',
      filter: ['has', 'point_count'],
      layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-font': ['Noto Sans Bold'], 'text-size': 13, 'text-allow-overlap': true, 'text-ignore-placement': true },
      paint: { 'text-color': COLORS.white },
    })
  }
  map.addLayer({
    id: 'punti',
    type: 'symbol',
    source: 'punti',
    filter: ['!', ['has', 'point_count']],
    layout: {
      'icon-image': ['get', 'icon'],
      // Lo zoom sta fuori e il dato dentro: è l'unica forma che la mappa accetta per una dimensione che dipende da entrambi.
      'icon-size': ['interpolate', ['linear'], ['zoom'], 9, ['case', ['==', ['coalesce', ['get', 'hov'], 0], 1], 0.9, 0.75], 13, ['case', ['==', ['coalesce', ['get', 'hov'], 0], 1], 1.18, 1], 17, ['case', ['==', ['coalesce', ['get', 'hov'], 0], 1], 1.35, 1.15]],
      'icon-anchor': 'bottom',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'symbol-sort-key': ['-', 2, ['+', ['coalesce', ['get', 'sel'], 0], ['coalesce', ['get', 'hov'], 0]]],
      'symbol-z-order': 'source',
    },
  })
}

/** La mappa di Napoli: motore MapLibre, stile nostro, monumenti disegnati e segnaposto per categoria. */
export default function MappaNapoli({ items, selectedId, onSelect, me, focus, interactive = true, className = '', paddingBottom = 0, hoveredId, onHover, onMove, onError }: MappaNapoliProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MLMap | null>(null)
  const readyRef = useRef(false)
  const meMarker = useRef<maplibregl.Marker | null>(null)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect
  const itemsRef = useRef(items)
  itemsRef.current = items
  const selectedRef = useRef(selectedId)
  selectedRef.current = selectedId
  const onHoverRef = useRef(onHover)
  onHoverRef.current = onHover
  const onMoveRef = useRef(onMove)
  onMoveRef.current = onMove
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError
  const selMarker = useRef<maplibregl.Marker | null>(null)
  const tip = useRef<maplibregl.Popup | null>(null)

  // Creazione, una volta sola.
  useEffect(() => {
    const el = containerRef.current
    if (!el || mapRef.current) return
    const map = new maplibregl.Map({
      container: el,
      style: STYLE_URL,
      center: focus ? [focus.lng, focus.lat] : NAPOLI_CENTER,
      zoom: focus?.zoom ?? 12.4,
      minZoom: 7.5,
      maxZoom: 18,
      attributionControl: false,
      interactive,
      pitchWithRotate: interactive,
      fadeDuration: 150,
      locale: { 'NavigationControl.ZoomIn': 'Avvicina', 'NavigationControl.ZoomOut': 'Allontana', 'NavigationControl.ResetBearing': 'Riallinea a nord' },
    })
    mapRef.current = map
    if (import.meta.env.DEV) (window as unknown as { __mappa?: MLMap }).__mappa = map
    // Nel riquadro piccolo delle schede l'attribuzione sta nel testo sotto, non sopra la mappa.
    if (interactive) map.addControl(new maplibregl.AttributionControl({ compact: true, customAttribution: '© OpenStreetMap · OpenFreeMap' }), 'bottom-left')
    if (interactive) map.addControl(new maplibregl.NavigationControl({ visualizePitch: true, showCompass: true }), 'top-right')
    map.touchZoomRotate.enableRotation()

    map.on('load', async () => {
      brandStyle(map)
      // L'attribuzione parte chiusa anche su telefono: si apre con la (i).
      el.querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show')
      await loadImages(map)
      if (!mapRef.current) return
      addLayers(map, itemsRef.current, selectedRef.current, interactive)
      readyRef.current = true
      if (!focus && itemsRef.current.length && interactive) fitTo(map, itemsRef.current, paddingBottom)
      if (!interactive) return
      map.on('click', 'punti', (e) => {
        const f = e.features?.[0]
        if (f) onSelectRef.current?.(String(f.properties.id))
      })
      map.on('click', 'gruppi', async (e) => {
        const f = e.features?.[0]
        if (!f) return
        const src = map.getSource('punti') as GeoJSONSource
        const zoom = await src.getClusterExpansionZoom(Number(f.properties.cluster_id))
        map.easeTo({ center: (f.geometry as GeoJSON.Point).coordinates as [number, number], zoom: Math.min(zoom + 0.3, 17) })
      })
      map.on('click', (e) => {
        const hit = map.queryRenderedFeatures(e.point, { layers: ['punti', 'gruppi'] })
        if (!hit.length) onSelectRef.current?.(null)
      })
      for (const layer of ['punti', 'gruppi']) {
        map.on('mouseenter', layer, () => (map.getCanvas().style.cursor = 'pointer'))
        map.on('mouseleave', layer, () => (map.getCanvas().style.cursor = ''))
      }
      // Sopra un segnaposto: titolo in un fumetto e avviso alla lista.
      map.on('mousemove', 'punti', (e) => {
        const f = e.features?.[0]
        if (!f) return
        const id = String(f.properties.id)
        onHoverRef.current?.(id)
        const coords = (f.geometry as GeoJSON.Point).coordinates as [number, number]
        if (!tip.current) tip.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: [0, -44], className: 'mappa-tip', maxWidth: '260px' })
        tip.current.setLngLat(coords).setText(String(f.properties.title)).addTo(map)
      })
      map.on('mouseleave', 'punti', () => {
        onHoverRef.current?.(null)
        tip.current?.remove()
      })
      const report = (byUser: boolean) => {
        const b = map.getBounds()
        onMoveRef.current?.([b.getSouth(), b.getWest(), b.getNorth(), b.getEast()], byUser)
      }
      map.on('moveend', (e) => report(!!(e as { originalEvent?: unknown }).originalEvent))
      report(false)
    })
    map.on('error', (e) => {
      // Solo i problemi di rete sulle tessere: gli altri avvisi non riguardano la persona.
      if (/tile|source|Failed to fetch|NetworkError/i.test(String((e as { error?: { message?: string } }).error?.message ?? ''))) onErrorRef.current?.()
    })

    const ro = new ResizeObserver(() => map.resize())
    ro.observe(el)
    return () => {
      ro.disconnect()
      readyRef.current = false
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Dati, selezione e punto sotto il mouse.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !readyRef.current) return
    ;(map.getSource('punti') as GeoJSONSource | undefined)?.setData(itemsGeoJson(items, selectedId, hoveredId))
  }, [items, selectedId, hoveredId])

  // Il punto scelto è un marcatore HTML sopra la mappa: così può rimbalzare, e il simbolo sotto viene nascosto.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !readyRef.current || !interactive) return
    selMarker.current?.remove()
    selMarker.current = null
    const it = selectedId ? items.find((i) => i.id === selectedId) : null
    if (map.getLayer('punti')) map.setFilter('punti', ['all', ['!', ['has', 'point_count']], ['!=', ['get', 'id'], it?.id ?? '']])
    if (!it) return
    const el = document.createElement('div')
    el.className = 'mappa-sel'
    el.innerHTML = pinSvg(it.kind, it.cat, true)
    el.setAttribute('aria-label', it.title)
    selMarker.current = new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat([it.lng, it.lat]).addTo(map)
    tip.current?.remove()
  }, [items, selectedId, interactive])

  // Posizione della persona: la mascotte col binocolo.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (!me) {
      meMarker.current?.remove()
      meMarker.current = null
      return
    }
    if (!meMarker.current) {
      const el = document.createElement('div')
      el.className = 'mappa-me'
      el.innerHTML = '<img src="/mappa/sei-qui.webp" alt="Sei qui" width="72" height="72"><span></span>'
      meMarker.current = new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat([me.lng, me.lat]).addTo(map)
    } else meMarker.current.setLngLat([me.lng, me.lat])
  }, [me])

  // Sposta la vista quando cambia il punto da guardare.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !focus) return
    map.flyTo({ center: [focus.lng, focus.lat], zoom: focus.zoom ?? Math.max(map.getZoom(), 14.5), padding: { bottom: paddingBottom }, duration: 700, essential: true })
  }, [focus, paddingBottom])

  return <div ref={containerRef} className={`mappa-napoli h-full w-full ${className}`} aria-label="Mappa di Napoli" role="region" />
}

function fitTo(map: MLMap, items: MapItem[], paddingBottom: number) {
  const b = new maplibregl.LngLatBounds()
  // Il golfo intero appiattisce la città: si parte dalla città, le gite restano a un pizzico di zoom.
  // Su telefono la finestra è stretta: si parte dal centro (Chiaia–Sanità), il resto è a un pizzico di zoom.
  const narrow = map.getContainer().clientWidth < 640
  const box = narrow ? { s: 40.822, n: 40.868, w: 14.215, e: 14.285 } : { s: 40.79, n: 40.9, w: 14.15, e: 14.33 }
  const city = items.filter((it) => it.lat > box.s && it.lat < box.n && it.lng > box.w && it.lng < box.e)
  for (const it of city.length >= 3 ? city : items) b.extend([it.lng, it.lat])
  if (b.isEmpty()) return
  map.fitBounds(b, { padding: { top: 70, left: 40, right: 40, bottom: 40 + paddingBottom }, maxZoom: 14.2, duration: 0 })
}
