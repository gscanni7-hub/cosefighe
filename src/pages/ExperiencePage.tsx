import { Link, useParams } from 'react-router'
import { ArrowLeft, ArrowRight, ArrowUpRight, Ban, CalendarDays, Clock, Globe, Heart, MapPin, Star, Users } from 'lucide-react'
import { Page } from '../components/Page'
import { ButtonAnchor } from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'
import { ExperienceCard } from '../components/ui/ExperienceCard'
import { NextStep } from '../components/ui/NextStep'
import { findExperiencePage, hasTexts, type ExperiencePage as PageData } from '../data/schede'
import credits from '../data/credits.json'
import { usePageMeta } from '../hooks/usePageMeta'
import { track } from '../lib/track'
import { useSaved } from '../lib/saved'
import { PROVIDER_LABEL } from '../types'
import NotFoundPage from './NotFoundPage'

const WEEKDAYS = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab']
const LANGS: Record<string, string> = { it: 'italiano', en: 'inglese', fr: 'francese', es: 'spagnolo', de: 'tedesco', pt: 'portoghese', ru: 'russo', ja: 'giapponese', zh: 'cinese', nl: 'olandese' }
const langNames = (codes?: string[]) => (codes?.length ? codes.map((c) => LANGS[c.toLowerCase()] ?? c).join(', ') : 'italiano e inglese')

type Credit = { artist?: string; license?: string; page?: string }
const creditFor = (image: string): Credit | undefined => (credits as Record<string, Credit>)[image.split('/').pop()!.replace(/\.webp$/, '')]

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper text-ink/60">{icon}</span>
      <div className="min-w-0">
        <p className="label text-ink/45">{label}</p>
        <p className="mt-0.5 text-sm font-medium leading-snug">{value}</p>
      </div>
    </div>
  )
}

function ExperienceView({ page }: { page: PageData }) {
  const { exp, category, scheda } = page
  const { has, toggle } = useSaved()
  const saved = has(exp.title)
  const bookable = !!exp.affiliateUrl && !!exp.provider && exp.provider !== 'cosefighe'
  const provider = exp.provider ? PROVIDER_LABEL[exp.provider] : ''
  const credit = creditFor(exp.image)
  const intro = scheda.intro ?? `${category.label} a Napoli, ${exp.location}. ${exp.duration}. ${exp.included}.`

  usePageMeta({
    title: `${exp.title} · da ${exp.price} · Cose Fighe`,
    description: intro.slice(0, 160),
    image: exp.image,
  })

  const others = category.experiences.filter((e) => e.title !== exp.title).slice(0, 3)
  const days = exp.days?.length ? exp.days.map((d) => WEEKDAYS[d]).join(', ') : 'tutti i giorni'
  const onBook = () => track('prenota', { provider: exp.provider ?? '', title: exp.title, from: 'scheda' })

  return (
    <Page>
      {/* Testata: categoria, titolo, intro e la foto. */}
      <section className="bg-sand pb-10 pt-24 md:pb-16 md:pt-36">
        <div className="container-x grid gap-8 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:items-center md:gap-14">
          <div>
            <Link to={`/categoria/${category.slug}`} viewTransition className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-ink">
              <ArrowLeft size={14} /> {category.label} a Napoli
            </Link>
            <p className="label mt-6 text-orange">
              {exp.tag} · {exp.duration}
            </p>
            <h1 className="mt-3 font-display text-[clamp(2.1rem,4.2vw,3.6rem)] uppercase leading-[0.98] tracking-tight text-balance">{exp.title}</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/70">{intro}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink/60">
              <span className="inline-flex items-center gap-1 font-semibold text-ink">
                <Star size={14} className="text-orange" fill="currentColor" />
                {exp.rating.toLocaleString('it-IT')}
                <span className="font-normal text-ink/45">
                  ({exp.reviews.toLocaleString('it-IT')} recensioni{provider ? ` su ${provider}` : ''})
                </span>
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin size={14} /> {exp.location}
              </span>
            </div>
          </div>
          <figure className="m-0">
            <div className="overflow-hidden rounded-[2rem] bg-cream">
              <img src={exp.image} alt={exp.title} width={1200} height={900} fetchPriority="high" decoding="async" className="aspect-[4/3] w-full object-cover" />
            </div>
            {credit?.artist && (
              <figcaption className="mt-2 text-right text-[11px] text-ink/40">
                Foto: {credit.artist}
                {credit.license ? `, ${credit.license}` : ''} ·{' '}
                <Link to="/privacy#fotografie" className="underline underline-offset-2">
                  crediti
                </Link>
              </figcaption>
            )}
          </figure>
        </div>
      </section>

      <section className="section-y">
        <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
          {/* Colonna dei testi */}
          <div className="min-w-0 max-w-2xl">
            <Reveal>
              <div className="grid grid-cols-2 gap-x-6 gap-y-5 rounded-3xl border border-line p-5 sm:grid-cols-3 md:p-6">
                <Fact icon={<Clock size={15} />} label="Durata" value={exp.duration} />
                <Fact icon={<Users size={15} />} label="Gruppo" value={exp.group || 'piccolo gruppo'} />
                <Fact icon={<Globe size={15} />} label="Lingue" value={langNames(exp.languages)} />
                <Fact icon={<Ban size={15} />} label="Cancellazione" value={exp.cancellation || 'vedi la piattaforma'} />
                <Fact icon={<CalendarDays size={15} />} label="Giorni" value={days} />
                <Fact icon={<MapPin size={15} />} label="Partenza" value={exp.location} />
              </div>
            </Reveal>

            {hasTexts(scheda) ? (
              <>
                <Reveal className="mt-12">
                  <h2 className="heading-md">Cosa si fa</h2>
                  {scheda.cosaSiFa!.map((p, i) => (
                    <p key={i} className="mt-4 text-lg leading-relaxed text-ink/75">
                      {p}
                    </p>
                  ))}
                </Reveal>
                {scheda.perChi && (
                  <Reveal className="mt-10">
                    <h2 className="heading-md">Per chi è</h2>
                    <p className="mt-4 text-lg leading-relaxed text-ink/75">{scheda.perChi}</p>
                  </Reveal>
                )}
                {scheda.consiglio && (
                  <Reveal className="mt-10">
                    <div className="rounded-3xl bg-blue p-6 text-white md:p-8">
                      <p className="label text-white/70">Consiglio da local</p>
                      <p className="mt-3 text-lg leading-relaxed">{scheda.consiglio}</p>
                    </div>
                  </Reveal>
                )}
              </>
            ) : null}

            <Reveal className="mt-10">
              <h2 className="heading-md">Cosa è incluso</h2>
              <p className="mt-4 text-lg leading-relaxed text-ink/75">{exp.included}.</p>
              <p className="mt-3 text-sm text-ink/55">
                Prezzo, disponibilità e dettagli sono quelli di {provider || 'la piattaforma partner'}, aggiornati. Se prenoti da qui, a noi resta una piccola commissione, a te non costa niente di più.
              </p>
            </Reveal>

            {scheda.faq?.length ? (
              <Reveal className="mt-12">
                <h2 className="heading-md">Domande frequenti</h2>
                <div className="mt-6 divide-y divide-line border-y border-line">
                  {scheda.faq.map((f) => (
                    <div key={f.q} className="py-5">
                      <h3 className="font-semibold leading-snug">{f.q}</h3>
                      <p className="mt-2 leading-relaxed text-ink/65">{f.a}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            ) : null}
          </div>

          {/* Riquadro di prenotazione: fisso a lato su computer, in coda su telefono. */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6">
              <div className="flex items-end justify-between gap-3">
                <div className="leading-none">
                  <span className="text-xs font-medium text-ink/45">da</span>
                  <span className="ml-1 font-display text-4xl text-orange">{exp.price}</span>
                  <span className="mt-1 block text-xs text-ink/45">a persona</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(exp.title)}
                  aria-pressed={saved}
                  aria-label={saved ? 'Togli dalle salvate' : 'Salva tra le preferite'}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border border-line transition-colors ${saved ? 'text-orange' : 'text-ink'}`}
                >
                  <Heart size={16} fill={saved ? 'currentColor' : 'none'} strokeWidth={2.2} />
                </button>
              </div>
              {bookable ? (
                <ButtonAnchor href={exp.affiliateUrl} target="_blank" rel="sponsored noopener noreferrer" onClick={onBook} className="mt-5 w-full">
                  Prenota su {provider} <ArrowUpRight size={16} />
                </ButtonAnchor>
              ) : (
                <p className="mt-5 text-sm text-ink/55">Prenotazioni in arrivo.</p>
              )}
              <ul className="mt-5 space-y-2 text-sm text-ink/60">
                <li className="flex gap-2">
                  <Clock size={15} className="mt-0.5 shrink-0" /> {exp.duration}
                  {exp.group ? `, ${exp.group}` : ''}
                </li>
                {exp.cancellation && (
                  <li className="flex gap-2">
                    <Ban size={15} className="mt-0.5 shrink-0" /> {exp.cancellation}
                  </li>
                )}
                <li className="flex gap-2">
                  <MapPin size={15} className="mt-0.5 shrink-0" /> {exp.location}
                </li>
              </ul>
            </div>
            <p className="mt-4 text-center text-xs text-ink/45">
              <Link to="/cosa-fare" viewTransition className="underline underline-offset-4 hover:text-ink">
                Cosa succede a Napoli in questi giorni
              </Link>
            </p>
          </aside>
        </div>
      </section>

      {others.length > 0 && (
        <section className="section-y bg-paper">
          <div className="container-x">
            <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-xl">
                <h2 className="heading-lg">Altre esperienze {category.label.toLowerCase()}</h2>
                <p className="mt-3 text-ink/60">{category.subtitle}.</p>
              </div>
              <Link to={`/categoria/${category.slug}`} viewTransition className="inline-flex items-center gap-1 font-medium underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
                Tutte le {category.experiences.length} <ArrowRight size={15} />
              </Link>
            </Reveal>
            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
              {others.map((e, i) => (
                <ExperienceCard key={e.title} exp={e} category={category.label} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <NextStep
        title="Cosa fare a Napoli nei giorni in cui ci sei"
        text="Feste, mercati, concerti e mostre, giorno per giorno, e le esperienze prenotabili in quelle date."
        primary={{ to: '/cosa-fare', label: 'Il programma' }}
        secondary={{ to: '/esperienze', label: 'Tutte le esperienze' }}
      />
    </Page>
  )
}

export default function ExperiencePage() {
  const { slug } = useParams()
  const page = findExperiencePage(slug ?? '')
  if (!page) return <NotFoundPage />
  return <ExperienceView key={page.slug} page={page} />
}
