import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react'
import { Page } from '../components/Page'
import { FloatingImage } from '../components/Decorations'
import { PageHero } from '../components/ui/PageHero'
import { Button, ButtonLink } from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'
import { Segmented } from '../components/ui/Segmented'
import { EmptyState } from '../components/ui/EmptyState'
import { ExperienceCard } from '../components/ui/ExperienceCard'
import { CATEGORY_LIST } from '../data/categories'
import { EVENTS, EVENT_CATEGORIES, EVENT_CATEGORY_LABELS, eventEnd, eventsBetween, isLongRunning } from '../data/events'
import { DATE_PRESETS, ISO_RE, addDays, dayParts, eachDay, formatLong, formatRange, formatShort, presetFor, todayISO, weekday } from '../lib/dates'
import { usePageMeta } from '../hooks/usePageMeta'
import { useHydrated } from '../hooks/useHydrated'
import type { CityEvent, EventCategory, Experience } from '../types'

const MAX_DAYS = 90
const MAX_EXPERIENCES = 6

const PRESETS = DATE_PRESETS.map((p) => ({
  key: p.key,
  label: p.key === 'weekend' ? 'Weekend' : p.key === '7' ? '7 giorni' : p.key === '30' ? '30 giorni' : p.label,
}))

const allExperiences: (Experience & { categorySlug: string; categoryLabel: string })[] = CATEGORY_LIST.flatMap((c) =>
  c.experiences.map((e) => ({ ...e, categorySlug: c.slug, categoryLabel: c.label })),
)

interface Range {
  from: string
  to: string
}

function readRange(params: URLSearchParams): Range {
  const today = todayISO()
  let from = params.get('dal') ?? ''
  let to = params.get('al') ?? ''
  if (!ISO_RE.test(from)) from = today
  if (!ISO_RE.test(to)) to = addDays(from, 6)
  if (to < from) to = from
  if (eachDay(from, to).length > MAX_DAYS) to = addDays(from, MAX_DAYS - 1)
  return { from, to }
}

function readCategory(params: URLSearchParams): EventCategory | null {
  const c = params.get('cat')
  return c && (EVENT_CATEGORIES as string[]).includes(c) ? (c as EventCategory) : null
}

/** Una riga della lista: orario, titolo e luogo, prezzo. Tutta la riga è un link se l'evento ne ha uno. */
function EventRow({ event, shownOn }: { event: CityEvent; shownOn: string }) {
  const multi = !!event.end && event.end !== event.start
  const ongoing = multi && shownOn > event.start
  const body = (
    <>
      <span className="text-sm tabular-nums text-ink/55 md:pt-0.5">{event.time || (multi ? 'tutto il giorno' : '')}</span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold leading-snug">{event.title}</span>
          {event.featured && <span className="label rounded-full bg-orange/10 px-2 py-0.5 text-orange">Da non perdere</span>}
          {ongoing && <span className="label rounded-full bg-ink/[0.06] px-2 py-0.5 text-ink/60">in corso</span>}
        </span>
        <span className="mt-1 block text-sm text-ink/60">
          {event.place}
          {event.area && event.area !== event.place ? `, ${event.area}` : ''}
          <span className="text-ink/35"> · </span>
          {EVENT_CATEGORY_LABELS[event.category]}
          {multi && (
            <>
              <span className="text-ink/35"> · </span>
              fino a {formatShort(event.end!)}
            </>
          )}
        </span>
        {event.blurb && <span className="mt-1.5 block max-w-2xl text-sm leading-relaxed text-ink/60">{event.blurb}</span>}
      </span>
      <span className="flex items-center justify-between gap-3 text-sm md:flex-col md:items-end md:justify-start">
        <span className="font-medium text-ink">{event.price}</span>
        {event.url && (
          <span className="inline-flex items-center gap-1 text-ink/45 transition-colors group-hover:text-orange">
            Info <ArrowUpRight size={14} />
          </span>
        )}
      </span>
    </>
  )
  const cls = 'group grid gap-x-6 gap-y-2 px-5 py-4 md:grid-cols-[6rem_1fr_9rem] md:px-6 md:py-5'
  return event.url ? (
    <a href={event.url} target="_blank" rel="noopener noreferrer" className={`${cls} transition-colors hover:bg-paper`}>
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  )
}

export default function WhatsOnPage() {
  const hydrated = useHydrated()
  const [params, setParams] = useSearchParams()
  const range = readRange(params)
  const category = readCategory(params)
  const today = todayISO()

  const update = (next: Partial<Range> & { cat?: EventCategory | null }) => {
    const p = new URLSearchParams(params)
    const from = next.from ?? range.from
    const to = next.to ?? range.to
    p.set('dal', from)
    p.set('al', to)
    const cat = next.cat === undefined ? category : next.cat
    if (cat) p.set('cat', cat)
    else p.delete('cat')
    setParams(p, { preventScrollReset: true })
  }

  const rangeLabel = formatRange(range.from, range.to)
  usePageMeta({
    title: `Cosa fare a Napoli ${rangeLabel} · Cose Fighe`,
    description: 'Scegli le date e guarda eventi ed esperienze disponibili a Napoli in quei giorni. Feste, concerti, mercati, mostre e le esperienze prenotabili.',
  })

  const days = useMemo(() => eachDay(range.from, range.to), [range.from, range.to])
  const nDays = days.length
  const preset = presetFor(range.from, range.to)

  /** Eventi raggruppati per giorno: quelli di più giorni compaiono solo nel primo giorno utile. */
  const groups = useMemo(() => {
    const matching = eventsBetween(range.from, range.to, category)
    const seen = new Set<string>()
    return days
      .map((day) => {
        const items = matching
          .filter((e) => e.start <= day && eventEnd(e) >= day && !seen.has(e.slug))
          .sort((a, b) => Number(isLongRunning(a)) - Number(isLongRunning(b)) || (a.time || '').localeCompare(b.time || ''))
        items.forEach((e) => seen.add(e.slug))
        return { day, items }
      })
      .filter((g) => g.items.length > 0)
  }, [days, range.from, range.to, category])
  const nEvents = groups.reduce((n, g) => n + g.items.length, 0)

  const experiences = useMemo(() => {
    if (category === 'citta') return []
    const weekdays = new Set(days.map(weekday))
    return allExperiences.filter((e) => (!category || e.categorySlug === category) && (!e.days || e.days.some((d) => weekdays.has(d))))
  }, [days, category])

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const e of EVENTS) if (e.start <= range.to && eventEnd(e) >= range.from) c[e.category] = (c[e.category] ?? 0) + 1
    return c
  }, [range.from, range.to])

  const input = 'h-9 rounded-full border border-line bg-white px-3 text-sm font-medium tabular-nums text-ink outline-none focus-visible:ring-[3px] focus-visible:ring-orange/60'

  return (
    <Page>
      <PageHero
        eyebrow="Il programma"
        title="Cosa fare a Napoli"
        subtitle="Scegli i giorni in cui sei in città: ti mostriamo gli eventi che valgono la pena e le esperienze prenotabili in quelle date."
        aside={
          <div className="relative mx-auto w-[180px] md:ml-auto md:w-[260px]" aria-hidden="true">
            <FloatingImage src="/mascotte-binocolo.webp" amplitude={10} />
          </div>
        }
      />

      {!hydrated ? (
        <section className="section-y bg-white" aria-busy="true">
          <div className="container-x">
            <p className="text-ink/60">Feste, concerti, mercati, mostre e le esperienze prenotabili, giorno per giorno. Scegli le date per vedere il programma.</p>
          </div>
        </section>
      ) : (
        <>
          {/* Una riga di comandi: quando, date precise, categoria. */}
          <section className="sticky top-[56px] z-30 border-b border-line bg-white/92 backdrop-blur-md md:top-[60px]" aria-label="Scegli le date">
            <div className="container-x flex flex-wrap items-center gap-x-4 gap-y-3 py-3">
              <Segmented
                options={PRESETS}
                value={preset}
                onChange={(k) => update({ ...DATE_PRESETS.find((p) => p.key === k)!.range() })}
                label="Quando"
                className="max-w-full"
              />
              <div className="flex items-center gap-2 text-sm text-ink/55">
                <label className="inline-flex items-center gap-1.5">
                  dal
                  <input type="date" className={input} value={range.from} min={today} onChange={(e) => e.target.value && update({ from: e.target.value, to: e.target.value > range.to ? e.target.value : range.to })} />
                </label>
                <label className="inline-flex items-center gap-1.5">
                  al
                  <input type="date" className={input} value={range.to} min={range.from} onChange={(e) => e.target.value && update({ to: e.target.value, from: e.target.value < range.from ? e.target.value : range.from })} />
                </label>
              </div>
              <label className="relative ml-auto inline-flex items-center">
                <span className="sr-only">Categoria</span>
                <select
                  value={category ?? ''}
                  onChange={(e) => update({ cat: (e.target.value || null) as EventCategory | null })}
                  className={`h-9 appearance-none rounded-full border border-line bg-white pl-4 pr-9 text-sm font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-orange/60 ${category ? 'border-ink' : ''}`}
                >
                  <option value="">Tutte le categorie</option>
                  {EVENT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {EVENT_CATEGORY_LABELS[c]}
                      {counts[c] ? ` (${counts[c]})` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 text-ink/50" />
              </label>
            </div>
          </section>

          <section className="section-y bg-white">
            <div className="container-x">
              <Reveal>
                <h2 className="heading-lg">
                  {nEvents > 0 ? `${nEvents} ${nEvents === 1 ? 'evento' : 'eventi'}` : 'Nessun evento'} <span className="text-ink/40">{rangeLabel}</span>
                </h2>
                <p className="mt-2 text-ink/60">
                  {nDays === 1 ? formatLong(range.from) : `${nDays} giorni, da ${formatLong(range.from)} a ${formatLong(range.to)}`}
                  {category ? ` · ${EVENT_CATEGORY_LABELS[category]}` : ''}
                </p>
              </Reveal>

              {groups.length === 0 ? (
                <EmptyState
                  className="mt-10"
                  title="Niente in programma in questi giorni"
                  text="Non abbiamo ancora segnalato eventi per queste date. Prova ad allargare il periodo oppure guarda le esperienze qui sotto: quelle si fanno quasi ogni giorno."
                  actions={
                    <>
                      <Button onClick={() => update({ from: todayISO(), to: addDays(todayISO(), 29), cat: null })}>
                        Prossimi 30 giorni <ArrowRight size={15} />
                      </Button>
                      {category && (
                        <Button variant="secondary" onClick={() => update({ cat: null })}>
                          Tutte le categorie
                        </Button>
                      )}
                    </>
                  }
                />
              ) : (
                <div className="mt-10 flex flex-col gap-10">
                  {groups.map((g) => {
                    const p = dayParts(g.day)
                    return (
                      <section key={g.day} aria-label={`${p.wdLong} ${p.day} ${p.monLong}`}>
                        <h3 className="mb-3 flex items-baseline gap-2 text-lg font-semibold">
                          <span className="capitalize">{p.wdLong}</span> {p.day} {p.monLong}
                          {g.day === today && <span className="label rounded-full bg-blue/10 px-2 py-0.5 text-blue">oggi</span>}
                          <span className="ml-auto text-sm font-normal text-ink/45">
                            {g.items.length} {g.items.length === 1 ? 'evento' : 'eventi'}
                          </span>
                        </h3>
                        <div className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white">
                          {g.items.map((e) => (
                            <EventRow key={e.slug} event={e} shownOn={g.day} />
                          ))}
                        </div>
                      </section>
                    )
                  })}
                </div>
              )}
            </div>
          </section>

          {experiences.length > 0 && (
            <section className="section-y bg-paper">
              <div className="container-x">
                <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-xl">
                    <h2 className="heading-lg">Esperienze prenotabili {nDays === 1 ? formatShortInline(range.from) : 'in questi giorni'}</h2>
                    <p className="mt-3 text-ink/60">
                      {experiences.length} esperienze si fanno {nDays === 1 ? 'quel giorno' : 'in almeno uno di questi giorni'}.
                    </p>
                  </div>
                  <ButtonLink to="/esperienze" variant="link">
                    Tutte le esperienze <ArrowRight size={15} />
                  </ButtonLink>
                </Reveal>
                <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
                  {experiences.slice(0, MAX_EXPERIENCES).map((exp, i) => (
                    <ExperienceCard key={exp.title} exp={exp} category={exp.categoryLabel} index={i} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </Page>
  )
}

function formatShortInline(iso: string) {
  const p = dayParts(iso)
  return `${p.wdLong} ${p.day} ${p.monLong}`
}
