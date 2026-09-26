import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, ArrowRight, ArrowUpRight, Ban, CalendarDays, Clock, Globe, Heart, MapPin, Star, Users } from 'lucide-react'
import { Page } from '../components/Page'
import { ButtonAnchor } from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'
import { ExperienceCard } from '../components/ui/ExperienceCard'
import { NextStep } from '../components/ui/NextStep'
import { findExperiencePage, hasTexts, type ExperiencePage as PageData } from '../data/schede'
import { schedaTexts } from '../data/schedeTesti'
import { relatedForExperience } from '../data/correlati'
import credits from '../data/credits.json'
import { usePageMeta } from '../hooks/usePageMeta'
import { track } from '../lib/track'
import { seoTitle } from '../seo'
import { DoveBox } from '../components/mappa/DoveBox'
import { experienceToItem } from '../lib/mappa'
import { useSaved } from '../lib/saved'
import { PROVIDER_LABEL } from '../types'
import NotFoundPage from './NotFoundPage'
import { itSlug, useLang, useLp, useT, type Lang } from '../i18n/lang'
import { hasArticleEn, hasExperienceEn, localizeArticle, localizeCategory, localizeExperience } from '../i18n/content'
import { localizeScheda } from '../i18n/schede'

const WEEKDAYS = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab']
const LANGS: Record<string, string> = { it: 'italiano', en: 'inglese', fr: 'francese', es: 'spagnolo', de: 'tedesco', pt: 'portoghese', ru: 'russo', ja: 'giapponese', zh: 'cinese', nl: 'olandese' }
const langNames = (codes?: string[]) => (codes?.length ? codes.map((c) => LANGS[c.toLowerCase()] ?? c).join(', ') : 'italiano e inglese')
const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const LANGS_EN: Record<string, string> = { it: 'Italian', en: 'English', fr: 'French', es: 'Spanish', de: 'German', pt: 'Portuguese', ru: 'Russian', ja: 'Japanese', zh: 'Chinese', nl: 'Dutch' }
const langNamesIn = (codes: string[] | undefined, lang: Lang) =>
  lang === 'it' ? langNames(codes) : codes?.length ? codes.map((c) => LANGS_EN[c.toLowerCase()] ?? c).join(', ') : 'Italian and English'

/** Testo con segnaposto diviso in pezzi come nel JSX di prima, così l'HTML italiano resta identico. */
const parts = (text: string, vars: Record<string, string | number>) =>
  text
    .split(/(\{\w+\})/)
    .filter(Boolean)
    .map((p) => (/^\{\w+\}$/.test(p) ? vars[p.slice(1, -1)] : p))

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
  const t = useT()
  const lp = useLp()
  const lang = useLang()
  // Contenuti nella lingua della pagina. Il titolo italiano resta la chiave per le salvate e le statistiche.
  const itTitle = page.exp.title
  const exp = localizeExperience(page.exp, lang)
  const category = localizeCategory(page.category, lang)
  const schedaIt = schedaTexts(exp.providerId)
  const schedaLoc = localizeScheda(exp.providerId, schedaIt, lang)
  // In inglese, senza traduzione dei testi lunghi, meglio niente testi che testi in italiano.
  const scheda = lang === 'en' && schedaLoc === schedaIt ? undefined : schedaLoc
  const { has, toggle } = useSaved()
  const saved = has(itTitle)
  const bookable = !!exp.affiliateUrl && !!exp.provider && exp.provider !== 'cosefighe'
  const provider = exp.provider ? PROVIDER_LABEL[exp.provider] : ''
  const credit = creditFor(exp.image)
  const intro = scheda?.intro ?? t('{c} a Napoli, {place}. {duration}. {included}.', { c: category.label, place: exp.location, duration: exp.duration, included: exp.included })

  usePageMeta({
    title: seoTitle(exp.title),
    description: intro.slice(0, 160),
    image: exp.image,
  })

  const allOthers = category.experiences.filter((e) => e.title !== itTitle)
  const others = (lang === 'it' ? allOthers : allOthers.filter(hasExperienceEn).map((e) => localizeExperience(e, lang))).slice(0, 3)
  const categoryCount = lang === 'it' ? category.experiences.length : category.experiences.filter(hasExperienceEn).length
  const readsIt = relatedForExperience(page.exp, category.slug)
  const reads = lang === 'it' ? readsIt : readsIt.filter(hasArticleEn).map((a) => localizeArticle(a, lang))
  const days = exp.days?.length ? exp.days.map((d) => (lang === 'en' ? WEEKDAYS_EN : WEEKDAYS)[d]).join(', ') : t('tutti i giorni')
  const onBook = () => track('prenota', { provider: exp.provider ?? '', title: itTitle, from: 'scheda' })
  const locale = lang === 'en' ? 'en-GB' : 'it-IT'

  // Su telefono il riquadro di prenotazione sta in fondo: mentre si legge, una barra fissa in basso tiene prezzo e Prenota a portata di pollice.
  // Compare quando la testata è uscita dallo schermo e sparisce quando si arriva al riquadro vero.
  const heroRef = useRef<HTMLElement>(null)
  const asideRef = useRef<HTMLElement>(null)
  const [barVisible, setBarVisible] = useState(false)
  useEffect(() => {
    const hero = heroRef.current
    const aside = asideRef.current
    if (!bookable || !hero || !aside) return
    let heroOut = false
    let asideIn = false
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (en.target === hero) heroOut = !en.isIntersecting && en.boundingClientRect.bottom < 0
        if (en.target === aside) asideIn = en.isIntersecting
      }
      setBarVisible(heroOut && !asideIn)
    })
    io.observe(hero)
    io.observe(aside)
    return () => io.disconnect()
  }, [bookable, itTitle])

  return (
    <Page>
      {/* Testata: categoria, titolo, intro e la foto. */}
      <section ref={heroRef} className="bg-sand pb-10 pt-24 md:pb-16 md:pt-36">
        <div className="container-x grid gap-8 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:items-center md:gap-14">
          <div>
            <Link to={lp(`/categoria/${category.slug}`)} viewTransition className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-ink">
              <ArrowLeft size={14} /> {parts(t('{c} a Napoli'), { c: category.label })}
            </Link>
            <p className="label mt-6 text-orange">
              {exp.tag} · {exp.duration}
            </p>
            <h1 className="mt-3 font-display text-[clamp(2.1rem,4.2vw,3.6rem)] uppercase leading-[0.98] tracking-tight text-balance">{exp.title}</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/70">{intro}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink/60">
              <span className="inline-flex items-center gap-1 font-semibold text-ink">
                <Star size={14} className="text-orange" fill="currentColor" />
                {exp.rating.toLocaleString(locale)}
                <span className="font-normal text-ink/45">
                  ({exp.reviews.toLocaleString(locale)}
                  {' ' + t(lang === 'en' && exp.reviews === 1 ? 'recensione' : 'recensioni')}
                  {provider ? ' ' + t('su {p}', { p: provider }) : ''})
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
                {t('Foto:') + ' '}
                {credit.artist}
                {credit.license ? `, ${credit.license}` : ''} ·{' '}
                <Link to={lp('/privacy#fotografie')} className="underline underline-offset-2">
                  {t('crediti')}
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
                <Fact icon={<Clock size={15} />} label={t('Durata')} value={exp.duration} />
                <Fact icon={<Users size={15} />} label={t('Gruppo')} value={exp.group || t('piccolo gruppo')} />
                <Fact icon={<Globe size={15} />} label={t('Lingue')} value={langNamesIn(exp.languages, lang)} />
                <Fact icon={<Ban size={15} />} label={t('Cancellazione')} value={exp.cancellation || t('vedi la piattaforma')} />
                <Fact icon={<CalendarDays size={15} />} label={t('Giorni')} value={days} />
                <Fact icon={<MapPin size={15} />} label={t('Partenza')} value={exp.location} />
              </div>
            </Reveal>

            {hasTexts(scheda) ? (
              <>
                <Reveal className="mt-12">
                  <h2 className="heading-md">{t('Cosa si fa')}</h2>
                  {(scheda.cosaSiFa ?? []).map((p, i) => (
                    <p key={i} className="mt-4 text-lg leading-relaxed text-ink/75">
                      {p}
                    </p>
                  ))}
                </Reveal>
                {scheda.perChi && (
                  <Reveal className="mt-10">
                    <h2 className="heading-md">{t('Per chi è')}</h2>
                    <p className="mt-4 text-lg leading-relaxed text-ink/75">{scheda.perChi}</p>
                  </Reveal>
                )}
                {scheda.consiglio && (
                  <Reveal className="mt-10">
                    <div className="rounded-3xl bg-blue p-6 text-white md:p-8">
                      <p className="label text-white/70">{t('Consiglio da local')}</p>
                      <p className="mt-3 text-lg leading-relaxed">{scheda.consiglio}</p>
                    </div>
                  </Reveal>
                )}
              </>
            ) : null}

            <Reveal className="mt-10">
              <h2 className="heading-md">{t('Cosa è incluso')}</h2>
              <p className="mt-4 text-lg leading-relaxed text-ink/75">{exp.included}.</p>
              <p className="mt-3 text-sm text-ink/55">
                {parts(t('Prezzo, disponibilità e dettagli sono quelli di {p}, aggiornati. Se prenoti da qui, a noi resta una piccola commissione, a te non costa niente di più.'), {
                  p: provider || t('la piattaforma partner'),
                })}
              </p>
            </Reveal>

            {scheda?.faq?.length ? (
              <Reveal className="mt-12">
                <h2 className="heading-md">{t('Domande frequenti')}</h2>
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
            {reads.length > 0 && (
              <Reveal className="mt-12">
                <h2 className="heading-md">{t('Da leggere prima di andare')}</h2>
                <ul className="mt-5 divide-y divide-line border-y border-line">
                  {reads.map((a) => (
                    <li key={a.slug}>
                      <Link to={lp(`/blog/${a.slug}`)} viewTransition className="group flex items-start justify-between gap-4 py-4">
                        <span className="min-w-0">
                          <span className="block font-semibold leading-snug transition-colors group-hover:text-orange">{a.title}</span>
                          <span className="mt-1 block text-sm text-ink/55">{parts(t('{n} minuti di lettura'), { n: a.readingTime })}</span>
                        </span>
                        <ArrowRight size={16} className="mt-1 shrink-0 text-ink/40 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>

          {/* Riquadro di prenotazione: fisso a lato su computer, in coda su telefono. */}
          <aside ref={asideRef} className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6">
              <div className="flex items-end justify-between gap-3">
                <div className="leading-none">
                  <span className="text-xs font-medium text-ink/45">{t('da')}</span>
                  <span className="ml-1 font-display text-4xl text-orange">{exp.price}</span>
                  <span className="mt-1 block text-xs text-ink/45">{t('a persona')}</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(itTitle)}
                  aria-pressed={saved}
                  aria-label={saved ? t('Togli dalle salvate') : t('Salva tra le preferite')}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border border-line transition-colors ${saved ? 'text-orange' : 'text-ink'}`}
                >
                  <Heart size={16} fill={saved ? 'currentColor' : 'none'} strokeWidth={2.2} />
                </button>
              </div>
              {bookable ? (
                <ButtonAnchor href={exp.affiliateUrl} target="_blank" rel="sponsored noopener noreferrer" onClick={onBook} className="mt-5 w-full">
                  {parts(t('Prenota su {p}') + ' ', { p: provider })}
                  <ArrowUpRight size={16} />
                </ButtonAnchor>
              ) : (
                <p className="mt-5 text-sm text-ink/55">{t('Prenotazioni in arrivo.')}</p>
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
            {(() => {
              const item = experienceToItem(exp, category.slug)
              return item ? <DoveBox item={item} place={exp.ritrovo ? exp.ritrovo.split(",")[0] : exp.location} detail={exp.ritrovo ? t('Punto di ritrovo: {r}', { r: exp.ritrovo.replace(/^[^,]+,\s*/, "") }) : t("Punto di partenza")} /> : null
            })()}
            <p className="mt-4 text-center text-xs text-ink/45">
              <Link to={lp('/cosa-fare')} viewTransition className="underline underline-offset-4 hover:text-ink">
                {t('Cosa succede a Napoli in questi giorni')}
              </Link>
            </p>
          </aside>
        </div>
      </section>

      {bookable && (
        <div
          aria-hidden={!barVisible}
          className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform duration-300 ease-out-quart lg:hidden ${
            barVisible ? 'translate-y-0' : 'pointer-events-none translate-y-full'
          }`}
        >
          <div className="container-x flex items-center justify-between gap-4">
            <div className="min-w-0 leading-tight">
              <span className="text-xs font-medium text-ink/45">{t('da')}</span>
              <span className="ml-1 font-display text-2xl text-orange">{exp.price}</span>
              <span className="block truncate text-[11px] text-ink/50">{exp.cancellation || t('a persona')}</span>
            </div>
            <ButtonAnchor href={exp.affiliateUrl} target="_blank" rel="sponsored noopener noreferrer" onClick={onBook} className="shrink-0">
              {t('Prenota') + ' '}
              <ArrowUpRight size={16} />
            </ButtonAnchor>
          </div>
        </div>
      )}

      {others.length > 0 && (
        <section className="section-y bg-paper">
          <div className="container-x">
            <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-xl">
                <h2 className="heading-lg">{parts(t('Altre esperienze {c}'), { c: lang === 'en' ? category.label : category.label.toLowerCase() })}</h2>
                <p className="mt-3 text-ink/60">{category.subtitle}.</p>
              </div>
              <Link to={lp(`/categoria/${category.slug}`)} viewTransition className="inline-flex items-center gap-1 font-medium underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
                {parts(t('Tutte le {n}') + ' ', { n: categoryCount })}
                <ArrowRight size={15} />
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
        title={t('Cosa fare a Napoli nei giorni in cui ci sei')}
        text={t('Feste, mercati, concerti e mostre, giorno per giorno, e le esperienze prenotabili in quelle date.')}
        primary={{ to: lp('/cosa-fare'), label: t('Il programma') }}
        secondary={{ to: lp('/esperienze'), label: t('Tutte le esperienze') }}
      />
    </Page>
  )
}

export default function ExperiencePage() {
  const { slug } = useParams()
  // In /en/experiences/<slug> lo slug è quello inglese: le schede si cercano per slug italiano.
  const page = findExperiencePage(itSlug('esperienze', slug ?? ''))
  if (!page) return <NotFoundPage />
  return <ExperienceView key={page.slug} page={page} />
}
