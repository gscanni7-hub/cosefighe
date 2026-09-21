import { Link, useParams } from 'react-router'
import { ArrowRight, ArrowUpRight, CalendarDays, Clock, MapPin, Ticket } from 'lucide-react'
import { Page } from '../components/Page'
import { ButtonAnchor, ButtonLink } from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'
import { ExperienceCard } from '../components/ui/ExperienceCard'
import { NextStep } from '../components/ui/NextStep'
import { CATEGORIES, CATEGORY_LIST } from '../data/categories'
import { EVENT_CATEGORY_LABELS, eventDateLabel, eventEnd, eventPath, eventPriceNumber, eventsAlongside, findEvent, isFreeEvent } from '../data/events'
import { articleBySlug } from '../data/correlati'
import { dayParts, eachDay, formatLong, formatRange, formatShort, weekday } from '../lib/dates'
import { usePageMeta } from '../hooks/usePageMeta'
import { useToday } from '../hooks/useToday'
import { track } from '../lib/track'
import { DoveBox } from '../components/mappa/DoveBox'
import { eventToItem } from '../lib/mappa'
import type { CityEvent, EventCategory, Experience } from '../types'
import NotFoundPage from './NotFoundPage'

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Da che categoria di esperienze pescare per ogni categoria di evento. «In città» non ha una sua categoria: le più richieste. */
const EXPERIENCE_CATEGORY: Partial<Record<EventCategory, string>> = {
  food: 'food',
  outdoor: 'outdoor',
  sport: 'sport',
  arte: 'arte',
  laboratori: 'laboratori',
  spettacoli: 'spettacoli',
}

/** L'articolo più vicino al tema dell'evento, per categoria. */
const ARTICLE_BY_CATEGORY: Record<EventCategory, string> = {
  food: 'street-food-napoli-guida-completa',
  outdoor: 'trekking-vesuvio-guida',
  sport: 'napoli-in-3-giorni',
  arte: 'cosa-fare-a-napoli-quando-piove',
  laboratori: 'cosa-fare-a-napoli-con-i-bambini',
  spettacoli: 'cosa-fare-a-napoli-la-sera',
  citta: 'quartieri-napoli-da-scoprire',
}

interface Read {
  to: string
  title: string
  note: string
}

/** Fino a 4 esperienze che si fanno nei giorni dell'evento, della stessa categoria quando ce n'è una. */
function experiencesFor(e: CityEvent, limit = 4): { exp: Experience; label: string }[] {
  const slug = EXPERIENCE_CATEGORY[e.category]
  const pool = slug
    ? (CATEGORIES[slug]?.experiences ?? []).map((exp) => ({ exp, label: CATEGORIES[slug].label }))
    : CATEGORY_LIST.flatMap((c) => c.experiences.map((exp) => ({ exp, label: c.label }))).sort((a, b) => b.exp.reviews - a.exp.reviews)
  // Bastano i primi sette giorni: coprono tutta la settimana.
  const weekdays = new Set(eachDay(e.start, eventEnd(e)).slice(0, 7).map(weekday))
  return pool.filter(({ exp }) => !exp.days || exp.days.some((d) => weekdays.has(d))).slice(0, limit)
}

/** Due letture utili: l'articolo degli eventi del mese se c'è, la guida gratis per gli eventi gratis, poi la categoria e il weekend. */
function readsFor(e: CityEvent, limit = 2): Read[] {
  const p = dayParts(e.start)
  const slugs = [`eventi-napoli-${p.monLong}-${e.start.slice(0, 4)}`]
  if (isFreeEvent(e)) slugs.push('cosa-fare-a-napoli-gratis')
  const hour = Number(e.time?.match(/(\d{1,2})[:.]\d{2}/)?.[1] ?? -1)
  if (hour >= 18) slugs.push('cosa-fare-a-napoli-la-sera')
  slugs.push(ARTICLE_BY_CATEGORY[e.category])
  const out: Read[] = []
  for (const s of slugs) {
    const a = articleBySlug(s)
    if (a && !out.some((r) => r.to === `/blog/${a.slug}`)) out.push({ to: `/blog/${a.slug}`, title: a.title, note: `${a.readingTime} minuti di lettura` })
  }
  out.push({ to: '/cosa-fare/weekend', title: 'Cosa fare a Napoli questo weekend', note: 'Il programma di sabato e domenica, aggiornato ogni mattina' })
  return out.slice(0, limit)
}

/** L'orario in una frase: «alle 21:00», «dalle 19:00 alle 23:30», oppure com'è scritto. */
function timePhrase(time: string): string {
  const t = time.trim()
  const one = t.match(/^(\d{1,2}[:.]\d{2})$/)
  if (one) return `alle ${one[1]}`
  const range = t.match(/^(\d{1,2}[:.]\d{2})\s*[–-]\s*(\d{1,2}[:.]\d{2})$/)
  if (range) return `dalle ${range[1]} alle ${range[2]}`
  return /^(dalle|dalla|dal|fino|ore|sera|mattina|pomeriggio)/i.test(t) ? t : `con questi orari: ${t}`
}

/** Prezzo corto per il riquadro: «Gratis», «€10», «€2,50». Se non si ricava, niente. */
function shortPrice(e: CityEvent): string | undefined {
  if (isFreeEvent(e)) return 'Gratis'
  const n = eventPriceNumber(e)
  if (n === undefined) return undefined
  return '€' + (n % 1 ? n.toFixed(2).replace('.', ',') : String(n))
}

/** I fatti in prosa: data, orario, luogo, prezzo e un consiglio su quando andare. */
function factsProse(e: CityEvent, today: string): string[] {
  const end = eventEnd(e)
  const single = end === e.start
  const where = `${e.place || 'a Napoli'}${e.area && e.area !== e.place ? ` (${e.area})` : ''}`
  const when = single ? `è ${formatLong(e.start)}` : `va da ${formatLong(e.start)} a ${formatLong(end)}`
  const first = `${e.title} ${when}${e.time ? `, ${timePhrase(e.time)}` : ''}, ${e.place ? 'a ' : ''}${where}.`
  const price = e.price
    ? `Ingresso: ${e.price.charAt(0).toLowerCase() + e.price.slice(1)}.`
    : 'Il prezzo non è indicato dall’organizzatore: controllalo sul sito ufficiale prima di uscire.'
  const days = eachDay(e.start, end).length
  let tip: string
  if (end < today) tip = 'La data è passata: tienila come riferimento per la prossima edizione, il programma qui sotto è quello vivo.'
  else if (e.start === today) tip = single ? 'È oggi: se ti interessa, decidi adesso.' : 'Comincia oggi e va avanti per un po’: non serve correre.'
  else if (single) tip = `È un giorno solo, ${formatShort(e.start)}: se ti interessa, segnalo in agenda.`
  else if (days > 7) tip = `Dura ${days} giorni: hai tempo fino a ${formatLong(end)}, ma i fine settimana sono i più affollati.`
  else tip = `Sono ${days} giorni di fila: scegli quello in cui hai meno cose in programma.`
  const source = 'Le informazioni vengono dal sito dell’organizzatore e le controlla la redazione. Orari e prezzi possono cambiare: l’ultima parola ce l’ha il sito ufficiale.'
  return [first, `${price} ${tip}`, source]
}

function EventView({ event }: { event: CityEvent }) {
  const today = useToday()
  const end = eventEnd(event)
  const single = end === event.start
  const past = end < today
  const dateLabel = single ? capitalize(formatLong(event.start)) : `${formatRange(event.start, end)}, da ${formatLong(event.start)} a ${formatLong(end)}`
  const price = shortPrice(event)
  const alongside = eventsAlongside(event, today, 6)
  const experiences = experiencesFor(event)
  const reads = readsFor(event)
  const programme = past ? '/cosa-fare' : `/cosa-fare?dal=${event.start}&al=${end}`

  usePageMeta({
    title: `${event.title} · ${eventDateLabel(event)} · Cose Fighe`,
    description: `${event.blurb} Data, orario, luogo e prezzo, e cosa fare a Napoli negli stessi giorni.`.trim().slice(0, 158),
  })

  const onSite = () => track('evento_sito', { event: event.slug })

  return (
    <Page>
      {/* Testata: percorso, categoria, titolo e i fatti in una riga. */}
      <section className="bg-sand pb-10 pt-24 md:pb-14 md:pt-36">
        <div className="container-x">
          <nav aria-label="Percorso" className="text-sm text-ink/60">
            <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
              <li>
                <Link to="/" viewTransition className="hover:text-ink">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">›</li>
              <li>
                <Link to="/cosa-fare" viewTransition className="hover:text-ink">
                  Cosa fare a Napoli
                </Link>
              </li>
              <li aria-hidden="true">›</li>
              <li aria-current="page" className="max-w-[40ch] truncate text-ink/80">
                {event.title}
              </li>
            </ol>
          </nav>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <p className="label text-orange">{EVENT_CATEGORY_LABELS[event.category]}</p>
            {event.cosefighe && <span className="label rounded-full bg-orange px-2 py-0.5 text-white">Evento Cose Fighe</span>}
            {event.featured && <span className="label rounded-full bg-orange/10 px-2 py-0.5 text-orange">Da non perdere</span>}
            {past && <span className="label rounded-full bg-ink/[0.06] px-2 py-0.5 text-ink/60">passato</span>}
          </div>
          <h1 className="mt-3 max-w-4xl font-display text-[clamp(2.1rem,4.2vw,3.6rem)] uppercase leading-[0.98] tracking-tight text-balance">{event.title}</h1>
          <ul className="mt-6 flex max-w-3xl flex-wrap gap-x-6 gap-y-2 text-sm text-ink/70">
            <li className="inline-flex items-center gap-1.5">
              <CalendarDays size={15} className="shrink-0 text-orange" /> {dateLabel}
            </li>
            {event.time && (
              <li className="inline-flex items-center gap-1.5">
                <Clock size={15} className="shrink-0 text-orange" /> {event.time}
              </li>
            )}
            {event.place && (
              <li className="inline-flex items-center gap-1.5">
                <MapPin size={15} className="shrink-0 text-orange" /> {event.place}
                {event.area && event.area !== event.place ? `, ${event.area}` : ''}
              </li>
            )}
            {event.price && (
              <li className="inline-flex items-center gap-1.5">
                <Ticket size={15} className="shrink-0 text-orange" /> {event.price}
              </li>
            )}
          </ul>
        </div>
      </section>

      <section className="section-y">
        <div className="container-x grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
          {/* Riquadro con prezzo e bottoni: a lato su computer, subito sotto i fatti su telefono. */}
          <aside className="lg:order-2 lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 leading-none">
                  {price ? (
                    <>
                      <span className="text-xs font-medium text-ink/45">{isFreeEvent(event) ? 'ingresso' : 'da'}</span>
                      <span className="ml-1 font-display text-4xl text-orange">{price}</span>
                    </>
                  ) : (
                    <span className="block text-base font-semibold leading-snug">{event.price || 'Prezzo sul sito ufficiale'}</span>
                  )}
                  {price && event.price && event.price.toLowerCase() !== price.toLowerCase() && <span className="mt-2 block text-xs leading-snug text-ink/50">{event.price}</span>}
                </div>
                <img src="/mascotte-binocolo.webp" alt="" width={96} height={96} decoding="async" className="h-16 w-16 shrink-0 object-contain md:h-20 md:w-20" />
              </div>
              {past ? (
                <div className="mt-5 rounded-2xl bg-paper p-4 text-sm">
                  <p className="font-semibold">Questo evento è passato</p>
                  <p className="mt-1 text-ink/60">Guarda cosa c’è in programma nei prossimi giorni.</p>
                  <Link to="/cosa-fare" viewTransition className="mt-2 inline-flex items-center gap-1 font-medium text-orange hover:underline">
                    Il programma <ArrowRight size={14} />
                  </Link>
                </div>
              ) : event.url ? (
                <ButtonAnchor href={event.url} target="_blank" rel="noopener noreferrer" onClick={onSite} className="mt-5 w-full">
                  Sito ufficiale e biglietti <ArrowUpRight size={16} />
                </ButtonAnchor>
              ) : null}
              <ButtonLink to={programme} variant="secondary" className="mt-3 w-full">
                Tutto il programma <ArrowRight size={16} />
              </ButtonLink>
              <ul className="mt-5 space-y-2 text-sm text-ink/60">
                <li className="flex gap-2">
                  <CalendarDays size={15} className="mt-0.5 shrink-0" /> {single ? formatLong(event.start) : `dal ${formatShort(event.start)} al ${formatShort(end)}`}
                  {event.time ? `, ${event.time}` : ''}
                </li>
                {event.place && (
                  <li className="flex gap-2">
                    <MapPin size={15} className="mt-0.5 shrink-0" /> {event.place}
                    {event.area && event.area !== event.place ? `, ${event.area}` : ''}
                  </li>
                )}
              </ul>
            </div>
            {(() => {
              const item = eventToItem(event)
              return item ? <DoveBox item={item} place={event.place || 'Napoli'} detail={event.area && event.area !== event.place ? event.area : undefined} /> : null
            })()}
            {!past && (
              <p className="mt-4 text-center text-xs text-ink/45">
                <Link to="/cosa-fare/oggi" viewTransition className="underline underline-offset-4 hover:text-ink">
                  Cosa fare a Napoli oggi
                </Link>
              </p>
            )}
          </aside>

          {/* Colonna dei testi */}
          <div className="min-w-0 max-w-2xl lg:order-1">
            {event.blurb && <p className="text-lg leading-relaxed text-ink/75 md:text-xl">{event.blurb}</p>}

            <Reveal className="mt-10">
              <h2 className="heading-md">Cose da sapere</h2>
              {factsProse(event, today).map((p, i) => (
                <p key={i} className="mt-4 leading-relaxed text-ink/70">
                  {p}
                </p>
              ))}
            </Reveal>

            {alongside.length > 0 && (
              <Reveal className="mt-12">
                <h2 className="heading-md">Negli stessi giorni</h2>
                <p className="mt-2 text-sm text-ink/55">Cos’altro succede a Napoli {single ? formatLong(event.start) : 'in quei giorni'}.</p>
                <ul className="mt-5 divide-y divide-line border-y border-line">
                  {alongside.map((o) => (
                    <li key={o.slug}>
                      <Link to={eventPath(o)} viewTransition className="group grid grid-cols-[4.5rem_1fr_auto] items-start gap-3 py-3.5">
                        <span className="pt-0.5 text-sm tabular-nums text-ink/55">{o.end && o.end !== o.start ? `fino al ${formatShort(o.end).replace(/^\w+ /, '')}` : formatShort(o.start)}</span>
                        <span className="min-w-0">
                          <span className="block font-semibold leading-snug transition-colors group-hover:text-orange">{o.title}</span>
                          <span className="mt-0.5 block text-sm text-ink/55">
                            {o.place}
                            {o.price ? ` · ${o.price}` : ''}
                          </span>
                        </span>
                        <ArrowRight size={16} className="mt-1 shrink-0 text-ink/40 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link to={programme} viewTransition className="mt-4 inline-flex items-center gap-1 text-sm font-medium underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
                  Tutto il programma di quei giorni <ArrowRight size={14} />
                </Link>
              </Reveal>
            )}

            {experiences.length > 0 && (
              <Reveal className="mt-12">
                <h2 className="heading-md">Da prenotare in quei giorni</h2>
                <p className="mt-2 text-sm text-ink/55">
                  Le esperienze si fanno quasi ogni giorno e si prenotano online, spesso con cancellazione gratuita.
                  {EXPERIENCE_CATEGORY[event.category] ? ` Queste sono le ${EVENT_CATEGORY_LABELS[event.category].toLowerCase()}, come l’evento.` : ' Queste sono le più richieste.'}
                </p>
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {experiences.map(({ exp, label }, i) => (
                    <ExperienceCard key={exp.title} exp={exp} category={label} index={i} />
                  ))}
                </div>
              </Reveal>
            )}

            {reads.length > 0 && (
              <Reveal className="mt-12">
                <h2 className="heading-md">Da leggere</h2>
                <ul className="mt-5 divide-y divide-line border-y border-line">
                  {reads.map((r) => (
                    <li key={r.to}>
                      <Link to={r.to} viewTransition className="group flex items-start justify-between gap-4 py-4">
                        <span className="min-w-0">
                          <span className="block font-semibold leading-snug transition-colors group-hover:text-orange">{r.title}</span>
                          <span className="mt-1 block text-sm text-ink/55">{r.note}</span>
                        </span>
                        <ArrowRight size={16} className="mt-1 shrink-0 text-ink/40 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      <NextStep
        title="Cosa fare a Napoli nei giorni in cui ci sei"
        text="Feste, mercati, concerti e mostre, giorno per giorno, e le esperienze prenotabili in quelle date."
        primary={{ to: '/cosa-fare', label: 'Il programma' }}
        secondary={{ to: '/cosa-fare/weekend', label: 'Questo weekend' }}
      />
    </Page>
  )
}

export default function EventPage() {
  const { slug } = useParams()
  const event = findEvent(slug ?? '')
  if (!event) return <NotFoundPage />
  return <EventView key={event.slug} event={event} />
}
