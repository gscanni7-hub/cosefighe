import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { Page } from '../components/Page'
import { FloatingImage } from '../components/Decorations'
import { PageHero } from '../components/ui/PageHero'
import { Button, ButtonLink } from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'
import { DateRange, type DateRangeValue } from '../components/ui/DateRange'
import { EventCard } from '../components/ui/EventCard'
import { EmptyState } from '../components/ui/EmptyState'
import { ExperienceCard } from '../components/ui/ExperienceCard'
import { CATEGORY_LIST } from '../data/categories'
import { EVENTS, EVENT_CATEGORIES, EVENT_CATEGORY_LABELS, eventEnd, eventsBetween } from '../data/events'
import { ISO_RE, addDays, dayParts, eachDay, formatLong, formatRange, todayISO, weekday } from '../lib/dates'
import { usePageMeta } from '../hooks/usePageMeta'
import { useHydrated } from '../hooks/useHydrated'
import type { EventCategory, Experience } from '../types'

const MAX_DAYS = 90
const MAX_EXPERIENCES = 6

const allExperiences: (Experience & { categorySlug: string; categoryLabel: string })[] = CATEGORY_LIST.flatMap((c) =>
  c.experiences.map((e) => ({ ...e, categorySlug: c.slug, categoryLabel: c.label })),
)

function readRange(params: URLSearchParams): DateRangeValue {
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

export default function WhatsOnPage() {
  const hydrated = useHydrated()
  const [params, setParams] = useSearchParams()
  const range = readRange(params)
  const category = readCategory(params)

  const update = (next: Partial<DateRangeValue> & { cat?: EventCategory | null }) => {
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
    description: 'Scegli le date e guarda eventi ed esperienze disponibili a Napoli in quei giorni. Feste, concerti, mercati, mostre e le esperienze dei nostri creator.',
  })

  const days = useMemo(() => eachDay(range.from, range.to), [range.from, range.to])
  const nDays = days.length

  /** Eventi raggruppati per giorno: quelli di più giorni compaiono solo nel primo giorno utile. */
  const groups = useMemo(() => {
    const matching = eventsBetween(range.from, range.to, category)
    const seen = new Set<string>()
    return days
      .map((day) => {
        const items = matching.filter((e) => e.start <= day && eventEnd(e) >= day && !seen.has(e.slug))
        items.forEach((e) => seen.add(e.slug))
        return { day, items }
      })
      .filter((g) => g.items.length > 0)
  }, [days, range.from, range.to, category])
  const nEvents = groups.reduce((n, g) => n + g.items.length, 0)

  const experiences = useMemo(() => {
    if (category === 'citta') return []
    const weekdays = new Set(days.map(weekday))
    return allExperiences.filter(
      (e) => (!category || e.categorySlug === category) && (!e.days || e.days.some((d) => weekdays.has(d))),
    )
  }, [days, category])

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const e of EVENTS) if (e.start <= range.to && eventEnd(e) >= range.from) c[e.category] = (c[e.category] ?? 0) + 1
    return c
  }, [range.from, range.to])

  const chip = (active: boolean) => `chip ${active ? 'chip-on' : ''}`

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
      <section className="border-b border-line bg-white py-8 md:py-10" aria-label="Scegli le date">
        <div className="container-x">
          <DateRange value={range} onChange={(v) => update(v)} />
          <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Categorie">
            <button type="button" aria-pressed={!category} className={chip(!category)} onClick={() => update({ cat: null })}>
              Tutto
            </button>
            {EVENT_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={category === c}
                className={chip(category === c)}
                onClick={() => update({ cat: category === c ? null : c })}
              >
                {EVENT_CATEGORY_LABELS[c]}
                {counts[c] ? <span className={`text-xs ${category === c ? 'text-white/60' : 'text-ink/40'}`}>{counts[c]}</span> : null}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y bg-paper">
        <div className="container-x">
          <Reveal className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="heading-lg">
                {nEvents > 0 ? `${nEvents} ${nEvents === 1 ? 'evento' : 'eventi'}` : 'Nessun evento'}{' '}
                <span className="text-orange">{rangeLabel}</span>
              </h2>
              <p className="mt-2 text-ink/60">
                {nDays === 1 ? formatLong(range.from) : `${nDays} giorni, da ${formatLong(range.from)} a ${formatLong(range.to)}`}
                {category ? ` · ${EVENT_CATEGORY_LABELS[category]}` : ''}
              </p>
            </div>
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
            <div className="mt-10 flex flex-col gap-12">
              {groups.map((g, gi) => {
                const p = dayParts(g.day)
                return (
                  <div key={g.day} className="grid gap-5 md:grid-cols-[7rem_1fr] md:gap-8">
                    <div className="flex items-baseline gap-2 md:sticky md:top-24 md:block md:self-start">
                      <span className="font-display text-display-lg leading-none text-ink">{p.day}</span>
                      <span className="text-sm font-semibold uppercase tracking-wide text-ink/55 md:mt-1 md:block">
                        {p.wdLong} <span className="md:block">{p.monLong}</span>
                      </span>
                    </div>
                    <div className={`grid gap-5 md:gap-6 ${g.items.length > 1 ? 'lg:grid-cols-2' : 'max-w-2xl'}`}>
                      {g.items.map((e, i) => (
                        <EventCard key={e.slug} event={e} index={gi + i} shownOn={g.day} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {experiences.length > 0 && (
        <section className="section-y bg-white">
          <div className="container-x">
            <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-xl">
                <h2 className="heading-lg">Esperienze prenotabili {nDays === 1 ? formatShortInline(range.from) : 'in questi giorni'}</h2>
                <p className="mt-3 text-ink/60">
                  {experiences.length} esperienze dei nostri creator si fanno {nDays === 1 ? 'quel giorno' : 'in almeno uno di questi giorni'}.
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
