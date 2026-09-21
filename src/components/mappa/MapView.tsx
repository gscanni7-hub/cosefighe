import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, ArrowUpRight, LocateFixed, Navigation, Star, X } from 'lucide-react'
import MappaNapoli from './MappaNapoli'
import { ButtonAnchor, ButtonLink } from '../ui/Button'
import { CAT_LABEL, directionsUrl, distanceKm, distanceLabel, walkLabel, type MapItem } from '../../lib/mappa'
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
const PRESETS = DATE_PRESETS.filter((p) => ['oggi', 'weekend', '7', '30'].includes(p.key))

/** Prezzo corto per la lista: "€15", "Gratis" o niente. */
function shortPrice(it: MapItem): string {
  const raw = it.kind === 'evento' ? it.event?.price ?? '' : it.exp?.price ?? ''
  if (/^(gratis|ingresso libero)/i.test(raw)) return 'Gratis'
  const m = raw.match(/€\s?\d+(?:,\d+)?/)
  return m ? m[0].replace(/\s/, '') : ''
}

export default function MapView({ items, range, category, embedded = false, initialSelected = null, onClose }: MapViewProps) {
  const today = useToday()
  const [preset, setPreset] = useState<string>('7')
  const [showEv, setShowEv] = useState(true)
  const [showEx, setShowEx] = useState(true)
  const [cat, setCat] = useState<EventCategory | null>(category ?? null)
  const [selected, setSelected] = useState<string | null>(initialSelected)
  const [me, setMe] = useState<Me | null>(null)
  const [meState, setMeState] = useState<'idle' | 'wait' | 'no'>('idle')
  const [focus, setFocus] = useState<{ lng: number; lat: number; zoom?: number } | null>(() => {
    const it = initialSelected ? items.find((i) => i.id === initialSelected) : null
    return it ? { lng: it.lng, lat: it.lat, zoom: 15 } : null
  })
  const [listOpen, setListOpen] = useState(false)

  useEffect(() => {
    if (category !== undefined) setCat(category)
  }, [category])

  const period = useMemo(() => {
    if (range) return range
    const p = DATE_PRESETS.find((x) => x.key === preset) ?? DATE_PRESETS[0]
    return p.range(today)
  }, [range, preset, today])

  const visible = useMemo(() => {
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

  const nEv = visible.filter((v) => v.kind === 'evento').length
  const nEx = visible.length - nEv
  const current = selected ? items.find((i) => i.id === selected) ?? null : null

  const select = (id: string | null, fly = false) => {
    setSelected(id)
    const it = id ? items.find((i) => i.id === id) : null
    if (it && fly) setFocus({ lng: it.lng, lat: it.lat, zoom: 15 })
    if (it) track('mappa_punto', { punto: it.id })
    if (it && window.innerWidth < 1024) setListOpen(false)
  }

  const locate = () => {
    if (me) {
      setMe(null)
      setMeState('idle')
      return
    }
    if (!('geolocation' in navigator)) return setMeState('no')
    setMeState('wait')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setMe(p)
        setMeState('idle')
        setFocus({ lng: p.lng, lat: p.lat, zoom: 14.5 })
        track('mappa_posizione')
      },
      () => setMeState('no'),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    )
  }

  const chip = (on: boolean, extra = '') => `chip min-h-[36px] px-3 text-[13px] md:min-h-[34px] ${on ? 'chip-on' : ''} ${extra}`

  return (
    <div className={`flex min-h-0 flex-col bg-white ${embedded ? 'h-full' : 'h-full'}`}>
      {/* Filtri */}
      <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-line bg-white px-4 py-2.5 [scrollbar-width:none]">
        {!range &&
          PRESETS.map((p) => (
            <button key={p.key} type="button" aria-pressed={preset === p.key} className={chip(preset === p.key)} onClick={() => setPreset(p.key)}>
              {p.key === 'oggi' ? `Oggi, ${dayParts(today).wd} ${dayParts(today).day}` : p.key === '7' ? '7 giorni' : p.key === '30' ? '30 giorni' : p.label}
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
          <button type="button" onClick={onClose} aria-label="Chiudi la mappa" className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="relative grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)] overflow-hidden lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Mappa */}
        <div className="relative min-h-0">
          <MappaNapoli items={visible} selectedId={selected} onSelect={(id) => select(id)} me={me} focus={focus} paddingBottom={current ? 220 : 0} />

          {/* Vicino a me */}
          <div className="absolute bottom-4 right-4 z-10 flex flex-col items-end gap-2 lg:bottom-5 lg:right-5">
            {meState === 'no' && <span className="rounded-full bg-white px-3 py-1.5 text-xs text-ink/60 shadow-card">Posizione non disponibile</span>}
            <button
              type="button"
              onClick={locate}
              aria-pressed={!!me}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold shadow-soft transition-colors ${me ? 'bg-blue text-white' : 'bg-white text-ink hover:bg-paper'}`}
            >
              <LocateFixed size={16} className={meState === 'wait' ? 'animate-pulse' : ''} /> {me ? 'Vicino a me' : 'Vicino a me'}
            </button>
          </div>

          {/* Mascotte con la legenda, solo su computer */}
          {!current && (
            <div className="pointer-events-none absolute bottom-5 left-5 z-10 hidden items-end gap-2 lg:flex">
              <img src="/mascotte-binocolo.webp" alt="" width={88} height={88} className="h-22 w-22 object-contain drop-shadow-md" />
              <p className="max-w-[220px] rounded-2xl rounded-bl-md bg-white px-3 py-2 text-[12.5px] leading-snug shadow-card">
                <span className="font-semibold text-orange">Ciao.</span> Arancione = eventi, blu = esperienze prenotabili. Tocca un segnaposto.
              </p>
            </div>
          )}

          {/* Scheda del punto scelto */}
          {current && <ItemCard item={current} me={me} onClose={() => select(null)} />}

          {/* Telefono: bottone per la lista */}
          <button
            type="button"
            onClick={() => setListOpen(true)}
            className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-soft lg:hidden"
          >
            Lista · {visible.length}
          </button>
        </div>

        {/* Lista: colonna su computer, foglio dal basso su telefono */}
        <aside
          className={`${listOpen ? 'flex' : 'hidden'} absolute inset-x-0 bottom-0 z-20 max-h-[70%] min-h-0 flex-col rounded-t-3xl border-t border-line bg-white shadow-[0_-12px_40px_rgba(17,17,17,0.14)] lg:static lg:flex lg:max-h-none lg:rounded-none lg:border-l lg:border-t-0 lg:shadow-none`}
        >
          <header className="flex items-baseline justify-between gap-3 border-b border-line px-4 py-3">
            <h2 className="font-display text-xl uppercase">{me ? 'Vicino a te' : range ? 'In questi giorni' : preset === 'oggi' ? 'In città oggi' : preset === 'weekend' ? 'Questo weekend' : `I prossimi ${preset} giorni`}</h2>
            <span className="text-xs text-ink/45 tabular-nums">
              {nEv} eventi · {nEx} esperienze
            </span>
            <button type="button" onClick={() => setListOpen(false)} aria-label="Chiudi la lista" className="flex h-8 w-8 items-center justify-center rounded-full border border-line lg:hidden">
              <X size={14} />
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {visible.length === 0 && <p className="p-6 text-center text-sm text-ink/55">Niente con questi filtri. Prova un altro giorno o togli una categoria.</p>}
            {visible.map((it) => (
              <ListRow key={it.id} item={it} me={me} selected={it.id === selected} onClick={() => select(it.id, true)} />
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}

function ListRow({ item, me, selected, onClick }: { item: MapItem; me: Me | null; selected: boolean; onClick: () => void }) {
  const ev = item.event
  const ex = item.exp
  const p = ev ? dayParts(ev.start) : null
  const meta = ev ? [ev.time, ev.area || ev.place].filter(Boolean).join(' · ') : [ex?.location, me ? distanceLabel(distanceKm(item, me)) : ''].filter(Boolean).join(' · ')
  const price = shortPrice(item)
  return (
    <button
      type="button"
      onClick={onClick}
      className={`grid w-full grid-cols-[52px_1fr_auto] items-center gap-3 border-b border-line px-4 py-2.5 text-left transition-colors hover:bg-sand ${selected ? 'bg-sand' : ''}`}
      style={selected ? { boxShadow: `inset 4px 0 0 ${item.kind === 'evento' ? '#ff5500' : '#0055ff'}` } : undefined}
    >
      {ev && p ? (
        <span className="grid h-[52px] w-[52px] place-items-center rounded-xl bg-orange text-center leading-none text-white">
          <span>
            <span className="block text-[9px] font-semibold uppercase tracking-wider opacity-85">{p.wd}</span>
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

function ItemCard({ item, me, onClose }: { item: MapItem; me: Me | null; onClose: () => void }) {
  const ev = item.event
  const ex = item.exp
  const km = me ? distanceKm(item, me) : null
  const walk = km !== null ? walkLabel(km) : null
  const dir = directionsUrl(item.lat, item.lng, item.title)
  const p = ev ? dayParts(ev.start) : null
  const end = ev ? eventEnd(ev) : ''
  return (
    <div className="absolute inset-x-3 bottom-16 z-10 overflow-hidden rounded-3xl bg-white shadow-soft lg:inset-x-auto lg:bottom-5 lg:left-5 lg:w-[380px]" role="dialog" aria-label={item.title}>
      {ev && p ? (
        <div className="relative flex h-[120px] items-end bg-orange p-4 text-white">
          <div className="leading-none">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider opacity-90">{end !== ev.start ? `fino a ${formatShort(end)}` : `${p.wdLong}${ev.time ? `, ${ev.time}` : ''}`}</span>
            <span className="font-display text-4xl uppercase">
              {p.day} {p.mon}
            </span>
          </div>
          <img src="/mascotte-hero.webp" alt="" width={110} height={110} className="absolute bottom-0 right-3 h-24 w-24 object-contain" />
          {ev.featured && <span className="label absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-ink">Da non perdere</span>}
        </div>
      ) : (
        <div className="relative h-[130px] bg-paper">
          <img src={ex?.image} alt="" className="h-full w-full object-cover" />
          {ex && (
            <span className="label absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-ink">
              <Star size={11} className="text-orange" fill="currentColor" /> {ex.rating.toLocaleString('it-IT')} · {ex.reviews.toLocaleString('it-IT')}
            </span>
          )}
        </div>
      )}
      <button type="button" onClick={onClose} aria-label="Chiudi" className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-ink">
        <X size={15} />
      </button>
      <div className="p-4">
        <p className={`label ${item.kind === 'evento' ? 'text-orange' : 'text-blue'}`}>
          {CAT_LABEL[item.cat]} · {item.kind === 'evento' ? 'evento' : 'si prenota'}
        </p>
        <h3 className="mt-1 text-[17px] font-bold leading-snug text-balance">{item.title}</h3>
        <p className="mt-1 text-[13px] text-ink/60">
          {ev ? [ev.place, ev.area && ev.area !== ev.place ? ev.area : ''].filter(Boolean).join(', ') : `Partenza: ${ex?.location}`}
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
        {ev?.url && !ex && (
          <Link to={eventPath(ev)} className="sr-only">
            {ev.title}
          </Link>
        )}
      </div>
    </div>
  )
}
