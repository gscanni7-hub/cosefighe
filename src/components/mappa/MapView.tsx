import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Crosshair, LocateFixed, Navigation, Search, Share2, Star, X } from 'lucide-react'
import MappaNapoli from './MappaNapoli'
import { ButtonAnchor, ButtonLink } from '../ui/Button'
import { CAT_LABEL, LANDMARKS, NAPOLI_CENTER, directionsUrl, distanceKm, distanceLabel, walkLabel, type MapItem } from '../../lib/mappa'
import { eventEnd, eventPath } from '../../data/events'
import { experiencePath } from '../../data/schede'
import { DATE_PRESETS, dayParts, formatShort } from '../../lib/dates'
import { useToday } from '../../hooks/useToday'
import { track } from '../../lib/track'
import { PROVIDER_LABEL, type EventCategory } from '../../types'

export interface MapViewProps {
  items: MapItem[]
  /** Periodo fisso (dentro Cosa fare): senza scelta dei giorni, la mappa segue la pagina. */
  range?: { from: string; to: string }
  category?: EventCategory | null
  /** Dentro un'altra pagina: niente titolo, pannello più basso. */
  embedded?: boolean
  /** Punto da mostrare all'apertura (id), per i link "Apri la mappa". */
  initialSelected?: string | null
  onClose?: () => void
}

type Me = { lat: number; lng: number }
type Sheet = 'peek' | 'half' | 'full'
type Bounds = [number, number, number, number]
const PRESETS = DATE_PRESETS.filter((p) => ['oggi', 'weekend', '7', '30'].includes(p.key))
const PEEK = 64

/** Prezzo corto per la lista: "€15", "Gratis" o niente. */
function shortPrice(it: MapItem): string {
  const raw = it.kind === 'evento' ? it.event?.price ?? '' : it.exp?.price ?? ''
  if (/^(gratis|ingresso libero)/i.test(raw)) return 'Gratis'
  const m = raw.match(/€\s?\d+(?:,\d+)?/)
  return m ? m[0].replace(/\s/, '') : ''
}

const inBounds = (it: MapItem, b: Bounds) => it.lat >= b[0] && it.lat <= b[2] && it.lng >= b[1] && it.lng <= b[3]

export default function MapView({ items, range, category, embedded = false, initialSelected = null, onClose }: MapViewProps) {
  const today = useToday()
  const [preset, setPreset] = useState<string>('7')
  const [showEv, setShowEv] = useState(true)
  const [showEx, setShowEx] = useState(true)
  const [cat, setCat] = useState<EventCategory | null>(category ?? null)
  const [selected, setSelected] = useState<string | null>(initialSelected)
  const [hovered, setHovered] = useState<string | null>(null)
  const [me, setMe] = useState<Me | null>(null)
  const [meState, setMeState] = useState<'idle' | 'ask' | 'wait' | 'no'>('idle')
  const [focus, setFocus] = useState<{ lng: number; lat: number; zoom?: number } | null>(() => {
    const it = initialSelected ? items.find((i) => i.id === initialSelected) : null
    return it ? { lng: it.lng, lat: it.lat, zoom: 15 } : null
  })
  const [sheet, setSheet] = useState<Sheet>('peek')
  const [dragH, setDragH] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [view, setView] = useState<'citta' | 'golfo'>('citta')
  const [bounds, setBounds] = useState<Bounds | null>(null)
  const [onlyVisible, setOnlyVisible] = useState(false)
  const [moved, setMoved] = useState(false)
  const [netError, setNetError] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const areaRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const openedAt = useRef(Date.now())

  const say = (t: string) => {
    setToast(t)
    window.setTimeout(() => setToast(null), 2600)
  }

  // Tempo passato sulla mappa, per capire se serve.
  useEffect(() => {
    track('mappa_aperta', { embedded: embedded ? 1 : 0 })
    const t0 = openedAt.current
    return () => track('mappa_tempo', { secondi: Math.round((Date.now() - t0) / 1000) })
  }, [embedded])

  useEffect(() => {
    if (category !== undefined) setCat(category)
  }, [category])

  /** Ricerca istantanea su titoli, luoghi e monumenti (senza accenti, senza maiuscole). */
  const norm = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const q = norm(query.trim())
  const hits = q.length < 2 ? [] : items.filter((it) => norm(it.title).includes(q) || norm(it.event?.place ?? it.exp?.location ?? '').includes(q)).slice(0, 6)
  const lmHits = q.length < 2 ? [] : LANDMARKS.filter((lm) => norm(lm.name).includes(q)).slice(0, 3)

  const goView = (v: 'citta' | 'golfo') => {
    setView(v)
    setFocus(v === 'citta' ? { lng: NAPOLI_CENTER[0], lat: NAPOLI_CENTER[1], zoom: 13 } : { lng: 14.3, lat: 40.72, zoom: 10 })
  }

  const period = useMemo(() => {
    if (range) return range
    const p = DATE_PRESETS.find((x) => x.key === preset) ?? DATE_PRESETS[0]
    return p.range(today)
  }, [range, preset, today])

  /** Tutto ciò che passa i filtri: è quello che sta sulla mappa. */
  const filtered = useMemo(() => {
    const list = items.filter((it) => {
      if (it.kind === 'evento') {
        if (!showEv || !it.event) return false
        if (eventEnd(it.event) < period.from || it.event.start > period.to) return false
      } else if (!showEx) return false
      if (cat && it.cat !== cat) return false
      return true
    })
    if (me) return list.sort((a, b) => distanceKm(a, me) - distanceKm(b, me))
    return list.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'evento' ? -1 : 1
      if (a.kind === 'evento') return (a.event!.start > today ? a.event!.start : today).localeCompare(b.event!.start > today ? b.event!.start : today)
      return (b.exp?.reviews ?? 0) - (a.exp?.reviews ?? 0)
    })
  }, [items, showEv, showEx, cat, period, me, today])

  /** La lista: tutto, oppure solo quello che sta nell'inquadratura. */
  const visible = useMemo(() => (onlyVisible && bounds ? filtered.filter((it) => inBounds(it, bounds)) : filtered), [filtered, onlyVisible, bounds])
  const nEv = visible.filter((v) => v.kind === 'evento').length
  const nEx = visible.length - nEv
  const current = selected ? items.find((i) => i.id === selected) ?? null : null
  const currentIndex = current ? visible.findIndex((v) => v.id === current.id) : -1

  const select = useCallback(
    (id: string | null, fly = false) => {
      setSelected(id)
      const it = id ? items.find((i) => i.id === id) : null
      if (it && fly) setFocus({ lng: it.lng, lat: it.lat, zoom: 15 })
      if (it) {
        track('mappa_punto', { punto: it.id })
        setSheet('peek')
        // La riga corrispondente resta in vista nella lista.
        window.setTimeout(() => listRef.current?.querySelector<HTMLElement>(`[data-id="${CSS.escape(it.id)}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 50)
      }
    },
    [items],
  )

  const step = (dir: 1 | -1) => {
    if (!visible.length) return
    const i = currentIndex < 0 ? 0 : (currentIndex + dir + visible.length) % visible.length
    select(visible[i].id, true)
  }

  // Tastiera: frecce per scorrere i risultati, Esc chiude la scheda.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === 'Escape') select(null)
      else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); step(1) }
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); step(-1) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const locate = () => {
    if (me) {
      setMe(null)
      setMeState('idle')
      setMoved(false)
      return
    }
    if (!('geolocation' in navigator)) return setMeState('no')
    if (meState === 'idle') return setMeState('ask')
    setMeState('wait')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setMe(p)
        setMeState('idle')
        setMoved(false)
        setFocus({ lng: p.lng, lat: p.lat, zoom: 14.5 })
        track('mappa_posizione')
      },
      () => setMeState('no'),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    )
  }
  const recenter = () => {
    if (!me) return
    setFocus({ lng: me.lng, lat: me.lat, zoom: 14.5 })
    setMoved(false)
  }

  const share = async (it: MapItem) => {
    const url = `${window.location.origin}/mappa?punto=${encodeURIComponent(it.id)}`
    track('mappa_condividi', { punto: it.id })
    try {
      if (navigator.share) await navigator.share({ title: it.title, text: `${it.title} · Cose Fighe`, url })
      else {
        await navigator.clipboard.writeText(url)
        say('Link copiato')
      }
    } catch {
      /* annullato dalla persona */
    }
  }

  // Foglio della lista su telefono: tre altezze, si trascina dalla maniglia.
  const drag = useRef<{ y0: number; h0: number; t0: number } | null>(null)
  const areaH = () => areaRef.current?.clientHeight ?? 600
  const sheetPx = (s: Sheet) => (s === 'peek' ? PEEK : s === 'half' ? Math.round(areaH() * 0.5) : Math.round(areaH() * 0.9))
  const onHandleDown = (e: React.PointerEvent) => {
    drag.current = { y0: e.clientY, h0: dragH ?? sheetPx(sheet), t0: Date.now() }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onHandleMove = (e: React.PointerEvent) => {
    if (!drag.current) return
    setDragH(Math.max(PEEK, Math.min(areaH() * 0.92, drag.current.h0 + (drag.current.y0 - e.clientY))))
  }
  const onHandleUp = (e: React.PointerEvent) => {
    if (!drag.current) return
    const dy = drag.current.y0 - e.clientY
    const fast = Math.abs(dy) > 30 && Date.now() - drag.current.t0 < 250
    const h = drag.current.h0 + dy
    let next: Sheet
    if (fast) next = dy > 0 ? (sheet === 'peek' ? 'half' : 'full') : sheet === 'full' ? 'half' : 'peek'
    else if (Math.abs(dy) < 8) next = sheet === 'peek' ? 'half' : 'peek'
    else next = h < areaH() * 0.3 ? 'peek' : h < areaH() * 0.72 ? 'half' : 'full'
    drag.current = null
    setDragH(null)
    setSheet(next)
    if (next !== 'peek') select(null)
  }

  // Scorrimento laterale sulla scheda: passa al risultato successivo o precedente.
  const swipe = useRef<{ x0: number; y0: number } | null>(null)
  const onCardDown = (e: React.PointerEvent) => { swipe.current = { x0: e.clientX, y0: e.clientY } }
  const onCardUp = (e: React.PointerEvent) => {
    if (!swipe.current) return
    const dx = e.clientX - swipe.current.x0
    const dy = e.clientY - swipe.current.y0
    swipe.current = null
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1)
    else if (dy > 70 && Math.abs(dy) > Math.abs(dx) * 1.5) select(null)
  }

  const chip = (on: boolean, extra = '') => `chip min-h-[40px] px-3 text-[13px] md:min-h-[34px] ${on ? 'chip-on' : ''} ${extra}`
  const sheetHeight = dragH ?? sheetPx(sheet)
  const cardBottom = PEEK + 10

  const card = current && (
    <ItemCard
      item={current}
      me={me}
      index={currentIndex}
      total={visible.length}
      onClose={() => select(null)}
      onPrev={() => step(-1)}
      onNext={() => step(1)}
      onShare={() => share(current)}
      onPointerDown={onCardDown}
      onPointerUp={onCardUp}
    />
  )

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      {/* Filtri */}
      <div className="mappa-chips flex shrink-0 items-center gap-2 overflow-x-auto border-b border-line bg-white px-3 py-2 [scrollbar-width:none] md:px-4 md:py-2.5">
        {!range &&
          PRESETS.map((p) => (
            <button key={p.key} type="button" aria-pressed={preset === p.key} className={chip(preset === p.key)} onClick={() => setPreset(p.key)}>
              {p.key === 'oggi' ? `Oggi, ${dayParts(today).wd} ${dayParts(today).day}` : p.key === '7' ? '7 giorni' : p.key === '30' ? '30 giorni' : 'Weekend'}
            </button>
          ))}
        {!range && <span className="mx-1 h-6 w-px shrink-0 bg-line" />}
        <button type="button" aria-pressed={showEv} className={chip(showEv, showEv ? '!border-orange !bg-orange' : '')} onClick={() => setShowEv((v) => !v)}>
          <span className={`h-2 w-2 rounded-full ${showEv ? 'bg-white' : 'bg-orange'}`} /> Eventi
        </button>
        <button type="button" aria-pressed={showEx} className={chip(showEx, showEx ? '!border-blue !bg-blue' : '')} onClick={() => setShowEx((v) => !v)}>
          <span className={`h-2 w-2 rounded-full ${showEx ? 'bg-white' : 'bg-blue'}`} /> Esperienze
        </button>
        <span className="mx-1 h-6 w-px shrink-0 bg-line" />
        {(Object.keys(CAT_LABEL) as EventCategory[]).map((c) => (
          <button key={c} type="button" aria-pressed={cat === c} className={chip(cat === c)} onClick={() => setCat(cat === c ? null : c)}>
            {CAT_LABEL[c]}
          </button>
        ))}
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Chiudi la mappa" className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="relative grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)] overflow-hidden lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* Mappa */}
        <div ref={areaRef} className="relative min-h-0">
          <MappaNapoli
            items={filtered}
            selectedId={selected}
            hoveredId={hovered}
            onSelect={(id) => select(id)}
            onHover={setHovered}
            onMove={(b, byUser) => {
              setBounds(b)
              if (byUser) setMoved(true)
            }}
            onError={() => setNetError(true)}
            me={me}
            focus={focus}
            paddingBottom={current ? 240 : 0}
          />

          {/* Cerca e scorciatoie Città / Golfo */}
          <div className="absolute left-3 top-3 z-10 flex max-w-[calc(100%-64px)] flex-col gap-2 lg:left-4 lg:top-4">
            <div className="relative">
              <label className="flex h-11 w-[270px] max-w-full items-center gap-2 rounded-full bg-white px-3.5 shadow-soft">
                <Search size={15} className="shrink-0 text-ink/45" />
                <input
                  id="mappa-cerca"
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setSearchOpen(true)
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                  placeholder="Cerca un posto o un evento"
                  className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink/40 md:text-sm"
                  autoComplete="off"
                />
                {query && (
                  <button type="button" onClick={() => setQuery('')} aria-label="Cancella" className="flex h-8 w-8 items-center justify-center text-ink/45">
                    <X size={14} />
                  </button>
                )}
              </label>
              {searchOpen && (hits.length > 0 || lmHits.length > 0) && (
                <ul className="absolute left-0 top-13 z-20 w-[300px] max-w-[calc(100vw-40px)] overflow-hidden rounded-2xl bg-white py-1 shadow-soft">
                  {lmHits.map((lm) => (
                    <li key={lm.file}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setFocus({ lng: lm.lng, lat: lm.lat, zoom: 15 })
                          setQuery(lm.name)
                          setSearchOpen(false)
                        }}
                        className="flex min-h-[44px] w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-sand"
                      >
                        <img src={`/mappa/${lm.file}.webp`} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
                        <span className="font-medium">{lm.name}</span>
                      </button>
                    </li>
                  ))}
                  {hits.map((it) => (
                    <li key={it.id}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          select(it.id, true)
                          setQuery('')
                          setSearchOpen(false)
                        }}
                        className="flex min-h-[44px] w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-sand"
                      >
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${it.kind === 'evento' ? 'bg-orange' : 'bg-blue'}`} />
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{it.title}</span>
                          <span className="block truncate text-xs text-ink/50">{it.event?.place ?? it.exp?.location}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex w-fit rounded-full bg-white p-1 shadow-soft" role="group" aria-label="Zona">
                {(['citta', 'golfo'] as const).map((v) => (
                  <button key={v} type="button" aria-pressed={view === v} onClick={() => goView(v)} className={`min-h-[36px] rounded-full px-3.5 text-[13px] font-semibold transition-colors ${view === v ? 'bg-ink text-white' : 'text-ink/65 hover:text-ink'}`}>
                    {v === 'citta' ? 'Città' : 'Golfo'}
                  </button>
                ))}
              </div>
              <label className="hidden cursor-pointer items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[13px] font-medium shadow-soft lg:inline-flex">
                <input type="checkbox" checked={onlyVisible} onChange={(e) => setOnlyVisible(e.target.checked)} className="accent-orange" />
                Solo quello che vedo
              </label>
            </div>
          </div>

          {/* Avvisi: rete, posizione */}
          {netError && (
            <div className="absolute left-1/2 top-3 z-10 w-[min(92%,420px)] -translate-x-1/2 rounded-2xl bg-ink px-4 py-2.5 text-center text-sm text-white shadow-soft lg:top-4">
              La mappa fatica a caricarsi: controlla la connessione. I punti restano qui sotto, nella lista.
            </div>
          )}
          {toast && <div className="absolute left-1/2 top-16 z-20 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm text-white shadow-soft">{toast}</div>}

          {/* Vicino a me e Ricentra */}
          <div className="absolute right-3 z-10 flex flex-col items-end gap-2 lg:bottom-5 lg:right-5" style={{ bottom: `calc(${cardBottom}px + 8px)` }}>
            {meState === 'ask' && (
              <div className="w-[240px] rounded-2xl bg-white p-3 text-[13px] leading-snug shadow-soft">
                Usiamo la posizione solo per ordinare i risultati per distanza. Resta sul tuo telefono, non la salviamo.
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={locate} className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white">
                    Va bene
                  </button>
                  <button type="button" onClick={() => setMeState('idle')} className="rounded-full px-3 py-1.5 text-xs font-medium text-ink/60">
                    No, grazie
                  </button>
                </div>
              </div>
            )}
            {meState === 'no' && (
              <div className="w-[240px] rounded-2xl bg-white p-3 text-[13px] leading-snug shadow-soft">
                Posizione non disponibile. Se l'hai negata, puoi riattivarla dalle impostazioni del browser per questo sito.
                <button type="button" onClick={() => setMeState('idle')} className="mt-1 block text-xs font-semibold text-ink/60">
                  Chiudi
                </button>
              </div>
            )}
            {me && moved && (
              <button type="button" onClick={recenter} className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-white px-3.5 text-[13px] font-semibold shadow-soft">
                <Crosshair size={14} /> Ricentra
              </button>
            )}
            <button
              type="button"
              onClick={locate}
              aria-pressed={!!me}
              aria-label="Vicino a me"
              title="Vicino a me"
              className={`inline-flex h-12 w-12 items-center justify-center rounded-full shadow-soft transition-colors lg:h-auto lg:w-auto lg:gap-2 lg:px-4 lg:py-2.5 ${me ? 'bg-blue text-white' : 'bg-white text-ink hover:bg-paper'}`}
            >
              <LocateFixed size={18} className={meState === 'wait' ? 'animate-pulse' : ''} />
              <span className="hidden text-sm font-semibold lg:inline">Vicino a me</span>
            </button>
          </div>

          {/* Mascotte con la legenda, solo su computer */}
          {!current && (
            <div className="pointer-events-none absolute bottom-10 left-5 z-10 hidden items-end gap-2 lg:flex">
              <img src="/mascotte-binocolo.webp" alt="" width={88} height={88} className="h-22 w-22 object-contain drop-shadow-md" />
              <p className="max-w-[220px] rounded-2xl rounded-bl-md bg-white px-3 py-2 text-[12.5px] leading-snug shadow-card">
                <span className="font-semibold text-orange">Ciao.</span> Arancione = eventi, blu = esperienze prenotabili. Tocca un segnaposto.
              </p>
            </div>
          )}

          {/* Scheda del punto scelto: su telefono galleggia sopra il foglio */}
          {card && (
            <div className="absolute inset-x-3 z-30 lg:hidden" style={{ bottom: cardBottom }}>
              {card}
            </div>
          )}

          {/* Telefono: il foglio con la lista, a tre altezze */}
          <aside
            className="absolute inset-x-0 bottom-0 z-20 flex flex-col rounded-t-3xl bg-white shadow-[0_-12px_40px_rgba(17,17,17,0.14)] lg:hidden"
            style={{ height: sheetHeight, transition: dragH === null ? 'height .28s cubic-bezier(.25,1,.5,1)' : 'none' }}
            aria-label="Lista dei risultati"
          >
            <div onPointerDown={onHandleDown} onPointerMove={onHandleMove} onPointerUp={onHandleUp} onPointerCancel={onHandleUp} className="shrink-0 cursor-grab touch-none select-none px-4 pb-2 pt-2.5">
              <span aria-hidden className="mx-auto block h-1 w-10 rounded-full bg-line" />
              <div className="mt-2 flex items-baseline justify-between gap-3">
                <h2 className="font-display text-lg uppercase">{me ? 'Vicino a te' : range ? 'In questi giorni' : preset === 'oggi' ? 'In città oggi' : preset === 'weekend' ? 'Questo weekend' : `I prossimi ${preset} giorni`}</h2>
                <span className="text-xs text-ink/50 tabular-nums">
                  {nEv} eventi · {nEx} esperienze
                </span>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto border-t border-line">
              <label className="flex items-center gap-2 border-b border-line px-4 py-2 text-[13px] text-ink/70">
                <input type="checkbox" checked={onlyVisible} onChange={(e) => setOnlyVisible(e.target.checked)} className="accent-orange" /> Solo quello che vedo sulla mappa
              </label>
              <List visible={visible} me={me} selected={selected} hovered={hovered} select={select} setHovered={setHovered} onWiden={() => setPreset('30')} />
            </div>
          </aside>
        </div>

        {/* Computer: colonna con la scheda in cima e la lista sotto */}
        <aside className="hidden min-h-0 flex-col border-l border-line bg-white lg:flex" aria-label="Lista dei risultati">
          {card ? (
            <div className="shrink-0 border-b border-line p-3">{card}</div>
          ) : (
            <header className="flex items-baseline justify-between gap-3 border-b border-line px-4 py-3">
              <h2 className="font-display text-xl uppercase">{me ? 'Vicino a te' : range ? 'In questi giorni' : preset === 'oggi' ? 'In città oggi' : preset === 'weekend' ? 'Questo weekend' : `I prossimi ${preset} giorni`}</h2>
              <span className="text-xs text-ink/45 tabular-nums">
                {nEv} eventi · {nEx} esperienze
              </span>
            </header>
          )}
          <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto">
            <List visible={visible} me={me} selected={selected} hovered={hovered} select={select} setHovered={setHovered} onWiden={() => setPreset('30')} />
          </div>
        </aside>
      </div>
    </div>
  )
}

function List({ visible, me, selected, hovered, select, setHovered, onWiden }: { visible: MapItem[]; me: Me | null; selected: string | null; hovered: string | null; select: (id: string, fly?: boolean) => void; setHovered: (id: string | null) => void; onWiden: () => void }) {
  if (visible.length === 0)
    return (
      <div className="p-6 text-center text-sm text-ink/60">
        <p>Niente con questi filtri.</p>
        <button type="button" onClick={onWiden} className="mt-3 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:border-ink">
          Guarda i prossimi 30 giorni
        </button>
      </div>
    )
  return (
    <>
      {visible.map((it) => (
        <ListRow key={it.id} item={it} me={me} selected={it.id === selected} hovered={it.id === hovered} onClick={() => select(it.id, true)} onHover={(on) => setHovered(on ? it.id : null)} />
      ))}
    </>
  )
}

function ListRow({ item, me, selected, hovered, onClick, onHover }: { item: MapItem; me: Me | null; selected: boolean; hovered: boolean; onClick: () => void; onHover: (on: boolean) => void }) {
  const ev = item.event
  const ex = item.exp
  const today = useToday()
  // Un evento già iniziato mostra la fine ("fino al"), non una data d'inizio passata.
  const ongoing = !!ev && ev.start < today && eventEnd(ev) > ev.start
  const p = ev ? dayParts(ongoing ? eventEnd(ev) : ev.start) : null
  const meta = ev ? [ev.time, ev.area || ev.place].filter(Boolean).join(' · ') : [ex?.location, me ? distanceLabel(distanceKm(item, me)) : ''].filter(Boolean).join(' · ')
  const price = shortPrice(item)
  return (
    <button
      type="button"
      data-id={item.id}
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
      aria-current={selected ? 'true' : undefined}
      className={`grid min-h-[64px] w-full grid-cols-[52px_1fr_auto] items-center gap-3 border-b border-line px-4 py-2.5 text-left transition-colors ${selected || hovered ? 'bg-sand' : 'hover:bg-sand'}`}
      style={selected ? { boxShadow: `inset 4px 0 0 ${item.kind === 'evento' ? '#ff5500' : '#0055ff'}` } : undefined}
    >
      {ev && p ? (
        <span className="grid h-[52px] w-[52px] place-items-center rounded-xl bg-orange text-center leading-none text-white">
          <span>
            <span className="block text-[9px] font-semibold uppercase tracking-wider opacity-85">{ongoing ? 'fino a' : p.wd}</span>
            <span className="font-display text-sm uppercase">
              {p.day} {p.mon}
            </span>
          </span>
        </span>
      ) : (
        <img src={ex?.image} alt="" width={52} height={52} loading="lazy" className="h-[52px] w-[52px] rounded-xl object-cover" />
      )}
      <span className="min-w-0">
        <span className="line-clamp-2 text-[13.5px] font-semibold leading-snug">{item.title}</span>
        <span className="mt-0.5 block truncate text-xs text-ink/55">{meta}</span>
      </span>
      <span className={`font-display text-lg ${item.kind === 'evento' ? 'text-orange' : 'text-blue'} ${price === 'Gratis' ? 'text-sm' : ''}`}>{price}</span>
    </button>
  )
}

function ItemCard({
  item,
  me,
  index,
  total,
  onClose,
  onPrev,
  onNext,
  onShare,
  onPointerDown,
  onPointerUp,
}: {
  item: MapItem
  me: Me | null
  index: number
  total: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  onShare: () => void
  onPointerDown: (e: React.PointerEvent) => void
  onPointerUp: (e: React.PointerEvent) => void
}) {
  const ev = item.event
  const ex = item.exp
  const km = me ? distanceKm(item, me) : null
  const walk = km !== null ? walkLabel(km) : null
  const dir = directionsUrl(item.lat, item.lng, item.title)
  const today = useToday()
  const end = ev ? eventEnd(ev) : ''
  const ongoing = !!ev && ev.start < today && end > ev.start
  const p = ev ? dayParts(ongoing ? end : ev.start) : null
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-soft" role="dialog" aria-label={item.title} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      {ev && p ? (
        <div className="relative flex h-[104px] items-end bg-orange p-4 text-white lg:h-[112px]">
          <div className="leading-none">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider opacity-90">{ongoing ? 'in corso, fino a' : end !== ev.start ? `dal ${formatShort(ev.start)} al ${formatShort(end)}` : `${p.wdLong}${ev.time ? `, ${ev.time}` : ''}`}</span>
            <span className="font-display text-4xl uppercase">
              {p.day} {p.mon}
            </span>
          </div>
          <img src="/mascotte-hero.webp" alt="" width={110} height={110} className="absolute bottom-0 right-3 h-20 w-20 object-contain" />
          {ev.featured && <span className="label absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-ink">Da non perdere</span>}
        </div>
      ) : (
        <div className="relative h-[120px] bg-paper">
          <img src={ex?.image} alt="" className="h-full w-full object-cover" draggable={false} />
          {ex && (
            <span className="label absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-ink">
              <Star size={11} className="text-orange" fill="currentColor" /> {ex.rating.toLocaleString('it-IT')} · {ex.reviews.toLocaleString('it-IT')}
            </span>
          )}
        </div>
      )}
      <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
        <button type="button" onClick={onShare} aria-label="Condividi" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-ink">
          <Share2 size={15} />
        </button>
        <button type="button" onClick={onClose} aria-label="Chiudi" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-ink">
          <X size={15} />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <p className={`label ${item.kind === 'evento' ? 'text-orange' : 'text-blue'}`}>
            {CAT_LABEL[item.cat]} · {item.kind === 'evento' ? 'evento' : 'si prenota'}
          </p>
          {total > 1 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-ink/45 tabular-nums">
              <button type="button" onClick={onPrev} aria-label="Precedente" className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-paper">
                <ChevronLeft size={14} />
              </button>
              {index + 1} di {total}
              <button type="button" onClick={onNext} aria-label="Successivo" className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-paper">
                <ChevronRight size={14} />
              </button>
            </span>
          )}
        </div>
        <h3 className="mt-1 text-[17px] font-bold leading-snug text-balance">{item.title}</h3>
        <p className="mt-1 text-[13px] text-ink/60">
          {ev ? [ev.place, ev.area && ev.area !== ev.place ? ev.area : ''].filter(Boolean).join(', ') : `Ritrovo: ${ex?.ritrovo ?? ex?.location}`}
          {km !== null && (
            <>
              {' · '}
              <span className="text-ink">{walk ?? distanceLabel(km)}</span>
            </>
          )}
          {item.approx && <span className="text-ink/40"> · posizione indicativa</span>}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {ev && (
            <ButtonLink to={eventPath(ev)} size="sm">
              Dettagli <ArrowRight size={14} />
            </ButtonLink>
          )}
          {ex && experiencePath(ex) && (
            <ButtonLink to={experiencePath(ex)!} size="sm" variant="dark">
              Scheda <ArrowRight size={14} />
            </ButtonLink>
          )}
          {ex?.affiliateUrl && ex.provider && ex.provider !== 'cosefighe' && (
            <ButtonAnchor href={ex.affiliateUrl} target="_blank" rel="sponsored noopener noreferrer" size="sm" onClick={() => track('prenota', { provider: ex.provider ?? '', title: ex.title, from: 'mappa' })}>
              Prenota <ArrowUpRight size={14} />
            </ButtonAnchor>
          )}
          <ButtonAnchor href={dir} target="_blank" rel="noopener noreferrer" size="sm" variant="secondary" onClick={() => track('mappa_indicazioni', { punto: item.id })}>
            <Navigation size={14} /> Indicazioni
          </ButtonAnchor>
        </div>
        {ex?.provider && ex.provider !== 'cosefighe' && <p className="mt-2 text-[11px] text-ink/40">Si prenota su {PROVIDER_LABEL[ex.provider]}, ai loro prezzi.</p>}
      </div>
    </div>
  )
}
