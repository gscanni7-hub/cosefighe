import { lazy, Suspense, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { Page } from '../components/Page'
import { Reveal } from '../components/ui/Reveal'
import { EVENTS, eventEnd, eventPath } from '../data/events'
import { CATEGORY_LIST } from '../data/categories'
import { CAT_LABEL, LANDMARKS, eventToItem, experienceToItem, type MapItem } from '../lib/mappa'
import { usePageMeta } from '../hooks/usePageMeta'
import { useHydrated } from '../hooks/useHydrated'
import { useToday } from '../hooks/useToday'
import { addDays, formatLong } from '../lib/dates'

// Il motore della mappa pesa: arriva solo nel browser, quando la pagina è già leggibile.
const MapView = lazy(() => import('../components/mappa/MapView'))

/** Tutti i punti della mappa: gli eventi non ancora finiti e tutte le esperienze con coordinate. */
export function useMapItems(today: string): MapItem[] {
  return useMemo(() => {
    const events = EVENTS.filter((e) => eventEnd(e) >= today).map(eventToItem).filter((x): x is MapItem => !!x)
    const exps = CATEGORY_LIST.flatMap((c) => c.experiences.map((x) => experienceToItem(x, c.slug))).filter((x): x is MapItem => !!x)
    return [...events, ...exps]
  }, [today])
}

export default function MappaPage() {
  const today = useToday()
  const hydrated = useHydrated()
  const [params] = useSearchParams()
  const items = useMapItems(today)
  const punto = hydrated ? params.get('punto') : null
  const week = items.filter((it) => it.kind === 'evento' && it.event!.start <= addDays(today, 6))

  usePageMeta({
    title: 'Mappa di Napoli: eventi ed esperienze, dove sono davvero',
    description: 'La mappa di Cose Fighe: gli eventi dei prossimi giorni e le esperienze prenotabili a Napoli e nel golfo, ognuno al suo posto, con le indicazioni per arrivarci.',
  })

  return (
    <Page>
      <section className="hidden border-b border-line bg-sand pt-20 md:pt-24 lg:block">
        <div className="container-x flex flex-wrap items-end justify-between gap-3 py-4 md:py-5">
          <div>
            <p className="label text-orange">La mappa</p>
            <h1 className="mt-1 font-display text-3xl uppercase leading-none md:text-4xl">Napoli sulla mappa</h1>
          </div>
          <p className="max-w-md text-sm text-ink/60">Eventi in arancione, esperienze prenotabili in blu, i monumenti disegnati da noi. Tocca un punto, poi «Indicazioni» per arrivarci.</p>
        </div>
      </section>

      {/* La mappa vera: alta quanto lo schermo, meno la barra. */}
      {/* Su telefono: la mappa sotto la barra, a tutto schermo; il titolo (h1) è comunque nel testo sotto per chi legge e per Google. */}
      <section className="h-[calc(100dvh-64px)] min-h-[520px] border-b border-line pt-16 lg:pt-0" aria-label="Mappa interattiva">
        {hydrated ? (
          <Suspense fallback={<MapPlaceholder />}>
            <MapView items={items} initialSelected={punto} />
          </Suspense>
        ) : (
          <MapPlaceholder />
        )}
      </section>

      {/* Testo per chi legge senza mappa (e per Google): cosa c'è sopra, in parole. */}
      <section className="section-y bg-white">
        <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="max-w-2xl">
            <Reveal>
              <h2 className="heading-lg">Come si usa</h2>
              <p className="mt-4 text-lg leading-relaxed text-ink/70">
                Scegli i giorni (oggi, il weekend, la settimana), accendi o spegni eventi ed esperienze, filtra per categoria. Ogni segnaposto apre una scheda con orario, prezzo e il bottone per le indicazioni, che si aprono nel navigatore del telefono. «Vicino a me» ordina tutto per distanza: la posizione resta sul tuo telefono, noi non la salviamo.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-ink/70">
                Allontanando la mappa si vede il golfo: Pompei, il Vesuvio, Capri, Ischia e Procida, la Costiera. Le gite di un giorno partono quasi tutte dal centro o dal porto di Napoli.
              </p>
            </Reveal>
            <Reveal className="mt-12">
              <h2 className="heading-md">Eventi sulla mappa questa settimana</h2>
              <p className="mt-2 text-ink/60">Da {formatLong(today)} a {formatLong(addDays(today, 6))}.</p>
              <ul className="mt-5 divide-y divide-line border-y border-line">
                {week.slice(0, 20).map((it) => (
                  <li key={it.id}>
                    <Link to={eventPath(it.event!)} viewTransition className="group flex items-start justify-between gap-4 py-3">
                      <span className="min-w-0">
                        <span className="block font-semibold leading-snug transition-colors group-hover:text-orange">{it.title}</span>
                        <span className="mt-0.5 block text-sm text-ink/55">
                          {it.event!.place}
                          {it.event!.area && it.event!.area !== it.event!.place ? `, ${it.event!.area}` : ''} · {CAT_LABEL[it.cat]}
                        </span>
                      </span>
                      <ArrowRight size={16} className="mt-1 shrink-0 text-ink/40 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
              <Link to="/cosa-fare" viewTransition className="mt-5 inline-flex items-center gap-1 font-medium text-orange hover:underline">
                Tutto il programma <ArrowRight size={14} />
              </Link>
            </Reveal>
          </div>
          <aside>
            <div className="card p-6">
              <p className="label text-orange">I monumenti disegnati</p>
              <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4">
                {LANDMARKS.map((lm) => (
                  <li key={lm.file} className="flex items-center gap-2 text-sm">
                    <img src={`/mappa/${lm.file}.webp`} alt="" width={44} height={44} loading="lazy" className="h-11 w-11 shrink-0 object-contain" />
                    <span className="leading-tight">{lm.name}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs leading-relaxed text-ink/50">Mappa di base: OpenStreetMap, servita da OpenFreeMap, senza cookie. I disegni sono nostri.</p>
            </div>
          </aside>
        </div>
      </section>
    </Page>
  )
}

function MapPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-sand">
      <div className="flex items-center gap-3 text-sm text-ink/55">
        <img src="/mascotte-binocolo.webp" alt="" width={64} height={64} className="h-16 w-16 object-contain" />
        La mappa sta arrivando…
      </div>
    </div>
  )
}
