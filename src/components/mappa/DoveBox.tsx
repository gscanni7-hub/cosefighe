import { lazy, Suspense } from 'react'
import { ArrowRight, Navigation } from 'lucide-react'
import { ButtonAnchor, ButtonLink } from '../ui/Button'
import { useHydrated } from '../../hooks/useHydrated'
import { directionsUrl, type MapItem } from '../../lib/mappa'
import { track } from '../../lib/track'

const MappaNapoli = lazy(() => import('./MappaNapoli'))

/** Il riquadro «Dove» delle schede: mappa piccola col segnaposto, indirizzo, indicazioni. */
export function DoveBox({ item, place, detail }: { item: MapItem; place: string; detail?: string }) {
  const hydrated = useHydrated()
  return (
    <div className="card mt-4 overflow-hidden">
      <div className="relative h-40 bg-sand">
        {hydrated ? (
          <Suspense fallback={null}>
            <MappaNapoli items={[item]} selectedId={item.id} interactive={false} focus={{ lng: item.lng, lat: item.lat + 0.0005, zoom: 15 }} />
          </Suspense>
        ) : null}
      </div>
      <div className="p-5">
        <p className="label text-orange">Dove</p>
        <p className="mt-1 font-semibold leading-snug">{place}</p>
        {detail && <p className="mt-0.5 text-sm text-ink/60">{detail}</p>}
        {item.approx && <p className="mt-0.5 text-xs text-ink/45">Posizione indicativa: il punto esatto arriva con la prenotazione.</p>}
        <p className="mt-1 text-[10px] text-ink/35">Mappa © OpenStreetMap, via OpenFreeMap</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <ButtonAnchor href={directionsUrl(item.lat, item.lng, item.title)} target="_blank" rel="noopener noreferrer" size="sm" variant="dark" onClick={() => track('mappa_indicazioni', { punto: item.id, from: 'scheda' })}>
            <Navigation size={14} /> Indicazioni
          </ButtonAnchor>
          <ButtonLink to={`/mappa?punto=${encodeURIComponent(item.id)}`} size="sm" variant="secondary">
            Apri la mappa <ArrowRight size={14} />
          </ButtonLink>
        </div>
      </div>
    </div>
  )
}
