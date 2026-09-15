import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { ArrowRight, ArrowUpRight, ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import { Page } from '../components/Page'
import { FloatingImage } from '../components/Decorations'
import { PageHero } from '../components/ui/PageHero'
import { Button, ButtonLink } from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'
import { Segmented } from '../components/ui/Segmented'
import { EmptyState } from '../components/ui/EmptyState'
import { ExperienceCard } from '../components/ui/ExperienceCard'
import { CATEGORY_LIST } from '../data/categories'
import { COSA_FARE_FAQ } from '../data/faq'
import { GUIDE, GUIDE_INTRO, GUIDE_TITLE } from '../data/guida'
import { track } from '../lib/track'
import { EVENTS, EVENT_CATEGORIES, EVENT_CATEGORY_LABELS, eventEnd, eventsBetween, isLongRunning } from '../data/events'
import { DATE_PRESETS, ISO_RE, addDays, dayParts, eachDay, formatLong, formatRange, formatShort, presetFor, weekday, weekendRange } from '../lib/dates'
import { usePageMeta } from '../hooks/usePageMeta'
import { useToday } from '../hooks/useToday'
import { useHydrated } from '../hooks/useHydrated'
import type { CityEvent, EventCategory, Experience } from '../types'

const MAX_DAYS = 90
const MAX_EXPERIENCES = 6
const EMPTY_PARAMS = new URLSearchParams()

/** Le pagine a data fissa: /cosa-fare/oggi e /cosa-fare/weekend. Indirizzo stabile, contenuto che cambia ogni giorno. */
export type FixedRange = 'oggi' | 'weekend'

const PRESETS = DATE_PRESETS.map((p) => ({
  key: p.key,
  label: p.key === 'weekend' ? 'Weekend' : p.key === '7' ? '7 giorni' : p.key === '30' ? '30 giorni' : p.label,
  short: p.key === '7' ? '7 gg' : p.key === '30' ? '30 gg' : undefined,
}))

const allExperiences: (Experience & { categorySlug: string; categoryLabel: string })[] = CATEGORY_LIST.flatMap((c) =>
  c.experiences.map((e) => ({ ...e, categorySlug: c.slug, categoryLabel: c.label })),
)

interface Range {
  from: string
  to: string
}

function readRange(params: URLSearchParams, today: string): Range {
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

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** L'esperienza da proporre per una voce della guida: prima quella con lo stesso inizio di titolo, altrimenti niente. */
const guideExperience = (prefix?: string) => (prefix ? allExperiences.find((e) => e.title.startsWith(prefix)) : undefined)

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
          {event.cosefighe && <span className="label rounded-full bg-orange px-2 py-0.5 text-white">Evento Cose Fighe</span>}
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

/** Testi di cornice delle tre pagine: la guida (/cosa-fare), oggi e il weekend. */
function heroCopy(fixed: FixedRange | undefined, today: string, range: Range) {
  if (fixed === 'oggi') {
    return {
      eyebrow: 'Oggi in città',
      title: 'Cosa fare a Napoli oggi',
      subtitle: `${capitalize(formatLong(today))}: gli eventi di oggi in città e le esperienze che puoi prenotare anche all’ultimo.`,
      intro:
        'Questa pagina si rigenera ogni mattina con il programma del giorno: quello che succede in città, con orario, luogo e prezzo, controllato dalla redazione. Se non trovi niente che ti convince, le esperienze in fondo si fanno quasi tutti i giorni e molte si prenotano fino a qualche ora prima.',
      links: [
        { to: '/cosa-fare/weekend', label: 'Il weekend' },
        { to: '/cosa-fare', label: 'I prossimi 7 giorni' },
      ],
    }
  }
  if (fixed === 'weekend') {
    const days = range.from === range.to ? capitalize(formatLong(range.from)) : `${capitalize(formatLong(range.from))} e ${formatLong(range.to)}`
    return {
      eyebrow: 'Il fine settimana',
      title: 'Cosa fare a Napoli questo weekend',
      subtitle: `${days}: il programma del fine settimana e le esperienze da prenotare.`,
      intro:
        'Il weekend a Napoli si decide il giovedì: i concerti si esauriscono, le visite speciali hanno pochi posti, le feste di quartiere vanno viste il giorno giusto. Qui trovi sabato e domenica giorno per giorno, con quello che vale la pena e quanto costa. Le esperienze in fondo si prenotano online, quasi sempre con cancellazione gratuita fino a 24 ore prima.',
      links: [
        { to: '/cosa-fare/oggi', label: 'Solo oggi' },
        { to: '/cosa-fare', label: 'I prossimi 7 giorni' },
      ],
    }
  }
  return {
    eyebrow: 'Il programma',
    title: 'Cosa fare a Napoli',
    subtitle: 'Scegli i giorni in cui sei in città: ti mostriamo gli eventi che valgono la pena e le esperienze prenotabili in quelle date.',
    intro:
      'Napoli non si ferma mai, e non è un modo di dire: tra feste di quartiere, concerti, mostre, mercati e aperture straordinarie ogni settimana c’è più di quanto si riesca a fare. Qui trovi il programma dei prossimi giorni, controllato dalla redazione, con orario, luogo e prezzo. Sotto, le esperienze che puoi prenotare nelle stesse date: tour, laboratori, barche e sotterranei, con i prezzi delle piattaforme e il nostro giudizio.',
    links: [
      { to: '/cosa-fare/oggi', label: 'Solo oggi' },
      { to: '/cosa-fare/weekend', label: 'Questo weekend' },
    ],
  }
}

export default function WhatsOnPage({ fixed }: { fixed?: FixedRange }) {
  const today = useToday()
  const hydrated = useHydrated()
  const navigate = useNavigate()
  const [realParams, setParams] = useSearchParams()
  // L'HTML pre-generato non conosce i parametri dell'indirizzo (?dal=…&cat=…): il primo render
  // nel browser deve combaciare con quello, poi si applicano i parametri veri.
  const params = hydrated ? realParams : EMPTY_PARAMS
  const range: Range = fixed === 'oggi' ? { from: today, to: today } : fixed === 'weekend' ? weekendRange(today) : readRange(params, today)
  const category = fixed ? null : readCategory(params)
  const [sheet, setSheet] = useState(false)

  const update = (next: Partial<Range> & { cat?: EventCategory | null }) => {
    const p = new URLSearchParams(fixed ? undefined : realParams)
    const from = next.from ?? range.from
    const to = next.to ?? range.to
    p.set('dal', from)
    p.set('al', to)
    const cat = next.cat === undefined ? category : next.cat
    if (cat) p.set('cat', cat)
    else p.delete('cat')
    // Dalle pagine a data fissa qualunque scelta porta al programma completo.
    if (fixed) navigate(`/cosa-fare?${p.toString()}`)
    else setParams(p, { preventScrollReset: true })
  }

  const rangeLabel = formatRange(range.from, range.to)
  const copy = heroCopy(fixed, today, range)
  usePageMeta({
    title:
      fixed === 'oggi'
        ? `Cosa fare a Napoli oggi, ${formatLong(today)} · Cose Fighe`
        : fixed === 'weekend'
          ? `Cosa fare a Napoli questo weekend (${rangeLabel}) · Cose Fighe`
          : 'Cosa fare a Napoli: le 25 cose da fare, eventi e programma per date · Cose Fighe',
    description:
      fixed === 'oggi'
        ? 'Gli eventi di oggi a Napoli, controllati dalla redazione, e le esperienze che puoi prenotare anche all’ultimo. Si aggiorna ogni mattina.'
        : fixed === 'weekend'
          ? 'Il programma del fine settimana a Napoli: concerti, feste, mostre, mercati, giorno per giorno, e le esperienze da prenotare.'
          : 'Scegli le date e guarda eventi ed esperienze disponibili a Napoli in quei giorni. Feste, concerti, mercati, mostre e le esperienze prenotabili.',
  })

  const days = useMemo(() => eachDay(range.from, range.to), [range.from, range.to])
  const nDays = days.length
  const preset = presetFor(range.from, range.to, today)

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
        eyebrow={copy.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
        aside={
          <div className="relative mx-auto w-[180px] md:ml-auto md:w-[260px]" aria-hidden="true">
            <FloatingImage src="/mascotte-binocolo.webp" amplitude={10} />
          </div>
        }
      />

      {/* Una riga di comandi: quando, date precise, categoria. */}
      <section className="sticky top-[60px] z-30 border-b border-line bg-white/92 backdrop-blur-md md:top-[60px]" aria-label="Scegli le date">
        <div className="container-x flex items-center gap-3 py-3 md:flex-wrap md:gap-x-4 md:gap-y-3">
          <Segmented
            options={PRESETS}
            value={preset}
            onChange={(k) => update({ ...DATE_PRESETS.find((p) => p.key === k)!.range(today) })}
            label="Quando"
            className="min-w-0 flex-1 md:max-w-full md:flex-none"
          />
          <div className="hidden items-center gap-2 text-sm text-ink/55 md:flex">
            <label className="inline-flex items-center gap-1.5">
              dal
              <input type="date" className={input} value={range.from} min={today} onChange={(e) => e.target.value && update({ from: e.target.value, to: e.target.value > range.to ? e.target.value : range.to })} />
            </label>
            <label className="inline-flex items-center gap-1.5">
              al
              <input type="date" className={input} value={range.to} min={range.from} onChange={(e) => e.target.value && update({ to: e.target.value, from: e.target.value < range.from ? e.target.value : range.from })} />
            </label>
          </div>
          <label className="relative ml-auto hidden items-center md:inline-flex">
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
          <button
            type="button"
            onClick={() => setSheet(true)}
            aria-haspopup="dialog"
            className={`chip shrink-0 md:hidden ${category ? 'chip-on' : ''}`}
          >
            <SlidersHorizontal size={14} />
            {category ? EVENT_CATEGORY_LABELS[category] : 'Filtri'}
          </button>
        </div>
      </section>

      {sheet && (
        <div className="fixed inset-0 z-[60] bg-ink/35 md:hidden" onClick={() => setSheet(false)}>
          <div
            role="dialog"
            aria-label="Date e categoria"
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-soft"
          >
            <div className="mb-5 flex items-center justify-between">
              <p className="font-semibold">Date e categoria</p>
              <button type="button" onClick={() => setSheet(false)} aria-label="Chiudi" className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink/70">
                <X size={16} />
              </button>
            </div>
            <p className="label mb-3 text-ink/50">Giorni</p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-ink/55">
              <label className="inline-flex items-center gap-1.5">
                dal
                <input type="date" className={input} value={range.from} min={today} onChange={(e) => e.target.value && update({ from: e.target.value, to: e.target.value > range.to ? e.target.value : range.to })} />
              </label>
              <label className="inline-flex items-center gap-1.5">
                al
                <input type="date" className={input} value={range.to} min={range.from} onChange={(e) => e.target.value && update({ to: e.target.value, from: e.target.value < range.from ? e.target.value : range.from })} />
              </label>
            </div>
            <p className="label mb-3 mt-6 text-ink/50">Categoria</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" aria-pressed={!category} className={`chip ${!category ? 'chip-on' : ''}`} onClick={() => update({ cat: null })}>
                Tutte
              </button>
              {EVENT_CATEGORIES.map((c) => (
                <button key={c} type="button" aria-pressed={category === c} className={`chip ${category === c ? 'chip-on' : ''}`} onClick={() => update({ cat: category === c ? null : c })}>
                  {EVENT_CATEGORY_LABELS[c]}
                  {counts[c] ? <span className="text-xs opacity-60">{counts[c]}</span> : null}
                </button>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-4">
              <button type="button" onClick={() => update({ from: today, to: addDays(today, 6), cat: null })} className="text-sm font-medium text-ink/60">
                Azzera
              </button>
              <Button size="sm" onClick={() => setSheet(false)}>
                Mostra {nEvents} {nEvents === 1 ? 'evento' : 'eventi'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <section className="section-y bg-white">
        <div className="container-x">
          {/* Cornice: due frasi nostre e i rimandi alle altre due pagine. È il testo che Google legge per primo. */}
          <Reveal className="mb-12 max-w-3xl md:mb-16">
            <p className="text-lg leading-relaxed text-ink/70">{copy.intro}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {copy.links.map((l) => (
                <Link key={l.to} to={l.to} viewTransition className="chip">
                  {l.label} <ArrowRight size={14} />
                </Link>
              ))}
            </div>
          </Reveal>

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
                  <Button onClick={() => update({ from: today, to: addDays(today, 29), cat: null })}>
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

      {/* La guida: le 25 cose da fare, solo sulla pagina guida. */}
      {!fixed && (
        <section className="section-y border-t border-line bg-white" id="guida">
          <div className="container-x">
            <Reveal className="max-w-2xl">
              <p className="label text-orange">La guida</p>
              <h2 className="heading-lg mt-3">{GUIDE_TITLE}</h2>
              <p className="mt-4 text-ink/65">{GUIDE_INTRO}</p>
            </Reveal>
            <ol className="mt-12 grid gap-x-10 gap-y-12 md:grid-cols-2">
              {GUIDE.map((g, i) => {
                const exp = guideExperience(g.experience)
                const cat = CATEGORY_LIST.find((c) => c.slug === g.category)
                return (
                  <li key={g.slug} id={g.slug} className="grid grid-cols-[4.5rem_1fr] gap-4 md:grid-cols-[6rem_1fr] md:gap-5">
                    <img src={g.image} alt={g.title} loading="lazy" decoding="async" width={96} height={96} className="aspect-square w-full rounded-2xl object-cover" />
                    <div className="min-w-0">
                      <p className="label text-ink/45">
                        {i + 1} · {cat?.label ?? g.category}
                        {g.free ? ' · gratis' : ''}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold leading-snug">{g.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink/65">{g.text}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                        {exp && (
                          <a
                            href={exp.affiliateUrl ?? `/categoria/${g.category}`}
                            target={exp.affiliateUrl ? '_blank' : undefined}
                            rel={exp.affiliateUrl ? 'sponsored noopener noreferrer' : undefined}
                            onClick={() => track('prenota', { provider: exp.provider ?? '', title: exp.title, from: 'guida' })}
                            className="inline-flex items-center gap-1 font-medium text-orange hover:underline"
                          >
                            Prenota: {exp.title} · {exp.price} <ArrowUpRight size={14} />
                          </a>
                        )}
                        {cat && (
                          <Link to={`/categoria/${cat.slug}`} viewTransition className="text-ink/55 underline decoration-ink/25 underline-offset-4 hover:text-ink">
                            Tutte le esperienze {cat.label.toLowerCase()}
                          </Link>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        </section>
      )}

      {/* Domande frequenti: solo sulla pagina guida. Le stesse risposte sono nei dati strutturati. */}
      {!fixed && (
        <section className="section-y border-t border-line bg-white">
          <div className="container-x">
            <Reveal>
              <h2 className="heading-lg">Domande frequenti</h2>
              <p className="mt-3 max-w-xl text-ink/60">Le cose che ci chiedono più spesso su cosa fare a Napoli.</p>
            </Reveal>
            <div className="mt-10 grid gap-x-12 gap-y-10 md:grid-cols-2">
              {COSA_FARE_FAQ.map((f) => (
                <div key={f.q}>
                  <h3 className="text-lg font-semibold leading-snug">{f.q}</h3>
                  <p className="mt-2 leading-relaxed text-ink/65">{f.a}</p>
                  {f.link && (
                    <Link to={f.link.to} viewTransition className="mt-3 inline-flex items-center gap-1 font-medium underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
                      {f.link.label} <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </Page>
  )
}

function formatShortInline(iso: string) {
  const p = dayParts(iso)
  return `${p.wdLong} ${p.day} ${p.monLong}`
}
