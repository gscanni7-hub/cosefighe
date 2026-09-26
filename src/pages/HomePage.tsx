import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { Page } from '../components/Page'
import { DragScroll, FloatingImage } from '../components/Decorations'
import { Button, ButtonLink } from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'
import { ExperienceCard } from '../components/ui/ExperienceCard'
import { ArticleCard } from '../components/ui/ArticleCard'
import { Segmented } from '../components/ui/Segmented'
import { CATEGORY_LIST, categoryListIn } from '../data/categories'
import { ARTICLES_BY_DATE } from '../data/articles'
import { GUIDE_LABELS, guideArticles } from '../data/correlati'
import { eventPath, upcomingEvents } from '../data/events'
import { DATE_PRESETS, addDays, dayParts } from '../lib/dates'
import { usePageMeta } from '../hooks/usePageMeta'
import { useToday } from '../hooks/useToday'
import { preloadMappa } from '../lib/mappaPreload'
import { useLang, useLp, useT, type Lang } from '../i18n/lang'
import { hasArticleEn, hasEventEn, localizeArticle, localizeEvent, testiIn } from '../i18n/content'

const categoryImages: Record<string, string> = {
  food: '/food.webp',
  outdoor: '/outdoor.webp',
  sport: '/sport.webp',
  arte: '/arte.webp',
  laboratori: '/laboratori.webp',
  spettacoli: '/spettacoli.webp',
}

/** Le tre esperienze in vetrina: la prima di Food, Outdoor e Arte (in inglese la prima tradotta). */
const featuredIn = (lang: Lang) => {
  const cats = Object.fromEntries(categoryListIn(lang).map((c) => [c.slug, c]))
  return ['food', 'outdoor', 'arte'].map((slug) => ({ exp: cats[slug]?.experiences[0], cat: cats[slug]?.label ?? '' }))
}
const totalIn = (lang: Lang) => categoryListIn(lang).reduce((n, c) => n + c.experiences.length, 0)

/** Testo con segnaposto diviso in pezzi come nel JSX di prima, così l'HTML italiano resta identico. */
const parts = (text: string, vars: Record<string, string | number>) =>
  text
    .split(/(\{\w+\})/)
    .filter(Boolean)
    .map((p) => (/^\{\w+\}$/.test(p) ? vars[p.slice(1, -1)] : p))

const ease = [0.25, 1, 0.5, 1] as const

/** Ingresso del testo del primo schermo: animazione CSS (classe "rise"), così nell'HTML dal server il titolo è già visibile per Google e per chi condivide il link. */
const rise = (delay: number) => ({ className: 'rise', style: { animationDelay: `${delay}s` } })

/** Parallasse al mouse sul primo schermo: due strati che si muovono in direzioni opposte. Spento su touch e con "riduci movimento". */
function useHeroParallax(max = 14) {
  const ref = useRef<HTMLElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 50, damping: 16, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 50, damping: 16, mass: 0.5 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      x.set(((e.clientX - r.left) / r.width - 0.5) * 2 * max)
      y.set(((e.clientY - r.top) / r.height - 0.5) * 2 * max)
    }
    const onLeave = () => {
      x.set(0)
      y.set(0)
    }
    el.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [max, x, y])

  return { ref, sx, sy }
}

const Hero = () => {
  const t = useT()
  const lp = useLp()
  const { ref, sx, sy } = useHeroParallax(14)
  const backDepth = -0.35
  const backX = useTransform(sx, (v) => v * backDepth)
  const backY = useTransform(sy, (v) => v * backDepth)
  const mascotX = useTransform(sx, (v) => v)
  const mascotY = useTransform(sy, (v) => v)

  const mascot = (
    <motion.div
      // Visibile da subito (è l'immagine principale per Google): entra solo salendo e raddrizzandosi.
      initial={{ y: 60, rotate: 4 }}
      animate={{ y: 0, rotate: 0 }}
      transition={{ duration: 0.9, delay: 0.24, ease }}
      className="relative"
    >
      <motion.img
        src="/mascotte-hero.webp"
        alt=""
        width={806}
        height={1000}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        className="block h-auto w-full drop-shadow-[0_18px_0_rgba(0,0,0,0.12)]"
      />
    </motion.div>
  )

  return (
    <section ref={ref} className="relative overflow-hidden bg-sand">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <motion.div
              style={{ x: backX, y: backY }}
              className="absolute right-[-14vw] top-[-8%] aspect-square w-[min(64vw,900px)] max-md:bottom-[-46vw] max-md:right-[-42vw] max-md:top-auto max-md:w-[110vw]"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.08, ease }}
                className="h-full w-full rounded-full bg-blue"
              />
            </motion.div>
            <motion.div
              style={{ x: mascotX, y: mascotY }}
              className="absolute bottom-[-13%] right-[max(1vw,calc((100vw-80rem)/2-60px))] w-[min(48vw,700px)] max-md:bottom-[-7%] max-md:right-[-3vw] max-md:w-[min(66vw,320px)]"
            >
              {mascot}
            </motion.div>
      </div>

      <div className="container-x relative z-10 grid items-center gap-8 pb-[min(78vw,380px)] pt-24 md:h-[100svh] md:max-h-[780px] md:min-h-[600px] md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:pb-20 md:pt-28">
        <div>
          <p className="rise label text-orange" style={{ animationDelay: '0.06s' }}>
            {t('Esperienze autentiche a Napoli')}
          </p>
          <h1 className="mt-4 font-display text-display-xl uppercase tracking-tight">
            <span className="rise block" style={{ animationDelay: '0.12s' }}>
              {t('Scopri') + ' '}
              <span className="text-orange">{t('cose fighe')}</span>
            </span>
            <span className="rise block" style={{ animationDelay: '0.19s' }}>
              {t('da fare a Napoli')}
            </span>
          </h1>
          <p className="rise mt-6 max-w-lg text-lg leading-relaxed text-ink/65" style={{ animationDelay: '0.28s' }}>
            {t('Tour, laboratori e avventure a Napoli, scelti uno per uno. Prenoti sulle piattaforme, ai loro prezzi.')}
          </p>
          <div className="rise mt-8" style={{ animationDelay: '0.34s' }}>
            <QuandoBox />
            <Link to={lp('/esperienze')} className="mt-4 inline-flex items-center gap-1.5 text-[15px] font-semibold text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
              {t('Oppure esplora tutte le esperienze') + ' '}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/** «Quando sei a Napoli?»: due date e si va al programma di quei giorni (Cosa fare, con eventi ed esperienze). */
function QuandoBox() {
  const t = useT()
  const lp = useLp()
  const navigate = useNavigate()
  const today = useToday()
  const [from, setFrom] = useState<string | null>(null)
  const [to, setTo] = useState<string | null>(null)
  const a = from ?? today
  const b = to && to >= a ? to : addDays(a, 2)
  const go = (f: string, l: string) => navigate(lp(`/cosa-fare?dal=${f}&al=${l}`))
  const field = 'mt-1 block w-full min-w-0 bg-transparent text-[15px] font-semibold text-ink outline-none'
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        go(a, b)
      }}
      className="max-w-xl rounded-[1.75rem] border border-line bg-white p-3 shadow-card"
    >
      <p className="px-2 pt-1 font-semibold">{t('Quando sei a Napoli?')}</p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <label className="rounded-2xl bg-paper px-3 py-2">
          <span className="label text-ink/60">{t('Arrivo')}</span>
          <input type="date" value={a} min={today} onChange={(e) => e.target.value && setFrom(e.target.value)} className={field} />
        </label>
        <label className="rounded-2xl bg-paper px-3 py-2">
          <span className="label text-ink/60">{t('Partenza')}</span>
          <input type="date" value={b} min={a} onChange={(e) => e.target.value && setTo(e.target.value)} className={field} />
        </label>
        <Button type="submit" size="lg" className="col-span-2 sm:col-span-1">
          {t('Cosa c’è') + ' '}
          <ArrowRight size={18} />
        </Button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 px-1 pb-1">
        {DATE_PRESETS.filter((p) => ['oggi', 'weekend', '7'].includes(p.key)).map((p) => {
          const r = p.range(today)
          return (
            <button key={p.key} type="button" onClick={() => go(r.from, r.to)} className="chip">
              {t(p.label)}
            </button>
          )
        })}
      </div>
    </form>
  )
}

const CategoriesStrip = () => {
  const t = useT()
  const lp = useLp()
  const lang = useLang()
  return (
  <section className="relative bg-white pb-10 pt-14 md:pb-24 md:pt-32">
    <div className="container-x flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="max-w-xl">
        <h2 className="heading-lg">{t('Sei modi di vivere Napoli')}</h2>
        <p className="mt-3 text-ink/60">{t('Dal cibo di strada ai laboratori artigiani: ogni categoria è curata da chi Napoli la conosce davvero.')}</p>
      </div>
      <p className="hidden text-sm text-ink/60 lg:block">{t('Trascina per scorrere')}</p>
    </div>
    <DragScroll
      ariaLabel={t('Categorie')}
      className="mt-8 grid grid-cols-2 gap-4 px-5 sm:px-8 md:mt-10 md:grid-cols-3 md:gap-5 lg:flex lg:gap-6 lg:overflow-x-auto lg:pb-4 lg:pl-[calc((100vw-80rem)/2+2.5rem)] lg:pr-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {categoryListIn(lang).map((cat) => (
        <Link
          key={cat.slug}
          to={lp(`/categoria/${cat.slug}`)}
          viewTransition
          className="group w-full lg:w-[300px] lg:shrink-0"
          draggable={false}
        >
          <div className="aspect-square overflow-hidden rounded-3xl bg-cream lg:rounded-[2rem] transition-transform duration-300 ease-out-quart group-hover:-translate-y-1">
            <img
              src={categoryImages[cat.slug]}
              alt={t('Categoria {c}', { c: cat.label })}
              width={900}
              height={900}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="h-full w-full object-cover transition-transform duration-500 ease-out-quart group-hover:scale-[1.04]"
            />
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2 md:mt-4">
            <h3 className="text-base font-bold lg:text-lg">{cat.label}</h3>
            <span className="shrink-0 text-xs text-ink/60 md:text-sm">{cat.experiences.length}</span>
          </div>
          <p className="mt-1 hidden text-sm text-ink/60 lg:block">{cat.subtitle}</p>
        </Link>
      ))}
    </DragScroll>
  </section>
  )
}

const bandPresets = (t: (s: string) => string) =>
  DATE_PRESETS.filter((p) => ['oggi', 'weekend', '7'].includes(p.key)).map((p) => ({
    key: p.key,
    label: t(p.key === '7' ? '7 giorni' : p.key === 'weekend' ? 'Weekend' : p.label),
    short: p.key === '7' ? t('7 gg') : undefined,
  }))

/** La mappa: un'anteprima ferma e il bottone. La mappa vera sta in /mappa, così la home resta leggera. */
const MapBand = () => {
  const t = useT()
  const lp = useLp()
  return (
  <section className="section-y bg-sand">
    <div className="container-x grid items-center gap-10 md:grid-cols-2 md:gap-16">
      <Reveal>
        <p className="label text-orange">{t('Novità')}</p>
        <h2 className="heading-lg mt-4">{t('Napoli sulla mappa')}</h2>
        <p className="mt-4 max-w-md text-ink/70">{t('Gli eventi di questi giorni e le esperienze prenotabili, ognuno dove sta davvero, con i monumenti disegnati da noi. Guarda cosa hai vicino, tocca, e le indicazioni si aprono sul telefono.')}</p>
        <ButtonLink to={lp('/mappa')} variant="dark" className="mt-8" onMouseEnter={preloadMappa} onTouchStart={preloadMappa}>
          {t('Apri la mappa') + ' '}
          <ArrowRight size={16} />
        </ButtonLink>
      </Reveal>
      <Reveal delay={0.08}>
        <Link to={lp('/mappa')} viewTransition className="block overflow-hidden rounded-[2rem] border border-line shadow-soft">
          <img src="/mappa/anteprima.webp" alt={t('La mappa di Napoli di Cose Fighe, con i monumenti disegnati e i segnaposto')} width={1200} height={800} loading="lazy" decoding="async" className="block w-full" />
        </Link>
      </Reveal>
    </div>
  </section>
  )
}

const WhatsOnBand = () => {
  const t = useT()
  const lp = useLp()
  const lang = useLang()
  const navigate = useNavigate()
  const today = useToday()
  const [preset, setPreset] = useState('7')
  // In inglese solo gli eventi tradotti.
  const upcoming = lang === 'it' ? upcomingEvents(4, today) : upcomingEvents(1000, today).filter(hasEventEn).slice(0, 4).map((e) => localizeEvent(e, lang))
  const go = () => {
    const r = DATE_PRESETS.find((p) => p.key === preset)!.range(today)
    navigate(lp(`/cosa-fare?dal=${r.from}&al=${r.to}`), { viewTransition: true })
  }
  return (
    <section className="section-y bg-blue text-white">
      <div className="container-x grid gap-12 md:grid-cols-[1fr_1.15fr] md:gap-16">
        <Reveal>
          <p className="label text-white/75">{t('Il programma')}</p>
          <h2 className="heading-lg mt-4">{t('Cosa fare a Napoli nei giorni in cui ci sei')}</h2>
          <p className="mt-4 max-w-md text-white/80">{t('Feste, concerti, mercati, mostre: scegli quando e ti diciamo cosa succede in città e cosa puoi prenotare.')}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Segmented options={bandPresets(t)} value={preset} onChange={setPreset} tone="dark" label={t('Quando')} />
            <Button onClick={go}>
              {t('Vedi il programma') + ' '}
              <ArrowRight size={16} />
            </Button>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          {(lang === 'it' || upcoming.length > 0) && (
          <ul className="divide-y divide-white/15 border-y border-white/15">
            {upcoming.map((e) => {
              const p = dayParts(e.start, lang)
              return (
                <li key={e.slug}>
                  <Link
                    to={lp(eventPath(e))}
                    viewTransition
                    className="group grid grid-cols-[3.5rem_1fr_auto] items-center gap-4 py-4 transition-colors hover:bg-white/5"
                  >
                    <span className="flex flex-col items-center leading-none">
                      <span className="text-2xl font-bold tabular-nums">{p.day}</span>
                      <span className="mt-1 text-[11px] font-semibold uppercase text-white/70">{p.mon}</span>
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{e.title}</span>
                      <span className="mt-0.5 block truncate text-sm text-white/70">
                        {e.place}
                        {e.time ? ` · ${e.time}` : ''}
                      </span>
                    </span>
                    <ArrowRight size={16} className="text-white/60 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              )
            })}
          </ul>
          )}
          <ButtonLink to={lp('/cosa-fare')} variant="link" className="mt-6 text-white decoration-white/40 hover:text-white hover:decoration-white">
            {t('Tutto il programma') + ' '}
            <ArrowRight size={15} />
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  )
}

const FeaturedSection = () => {
  const t = useT()
  const lp = useLp()
  const lang = useLang()
  const featured = featuredIn(lang)
  const totalExperiences = totalIn(lang)
  return (
  <section className="section-y bg-paper">
    <div className="container-x">
      <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <h2 className="heading-lg">{t('Le più richieste')}</h2>
          <p className="mt-3 text-ink/60">{t('Tre esperienze per capire lo spirito di Cose Fighe.')}</p>
        </div>
        <ButtonLink to={lp('/esperienze')} variant="link">
          {parts(t('Tutte le {n} esperienze') + ' ', { n: totalExperiences })}
          <ArrowRight size={15} />
        </ButtonLink>
      </Reveal>
      <div className="mt-10 grid gap-5 md:gap-6 lg:grid-cols-[1.3fr_1fr]">
        {featured[0].exp && <ExperienceCard exp={featured[0].exp} category={featured[0].cat} index={0} />}
        <div className="grid gap-5 md:gap-6">
          {featured[1].exp && <ExperienceCard exp={featured[1].exp} category={featured[1].cat} index={1} layout="row" />}
          {featured[2].exp && <ExperienceCard exp={featured[2].exp} category={featured[2].cat} index={2} layout="row" />}
        </div>
      </div>
    </div>
  </section>
  )
}

const BlogTeaser = () => {
  const t = useT()
  const lp = useLp()
  const lang = useLang()
  // In inglese solo gli articoli tradotti.
  const first = lang === 'it' ? ARTICLES_BY_DATE[0] : ARTICLES_BY_DATE.find(hasArticleEn)
  const lead = first && localizeArticle(first, lang)
  const guides = lang === 'it' ? guideArticles() : guideArticles().filter(hasArticleEn).map((a) => localizeArticle(a, lang))
  const guideLabels = testiIn('GUIDE_LABELS', GUIDE_LABELS, lang)
  return (
  <section className="section-y bg-white">
    <div className="container-x">
      <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <h2 className="heading-lg">{t('Dal blog')}</h2>
          <p className="mt-3 text-ink/60">{t('Guide scritte da chi Napoli la vive ogni giorno: posti veri, orari veri.')}</p>
        </div>
        <ButtonLink to={lp('/blog')} variant="link">
          {t('Tutti gli articoli') + ' '}
          <ArrowRight size={15} />
        </ButtonLink>
      </Reveal>
      {lead && (
      <div className="mt-10">
        <ArticleCard article={lead} featured />
      </div>
      )}
      {guides.length > 0 && (
        <Reveal className="mt-10 border-t border-line pt-8">
          <p className="label text-ink/60">{t('Le guide')}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {guides.map((a) => (
              <li key={a.slug}>
                <ButtonLink to={lp(`/blog/${a.slug}`)} variant="secondary" size="sm">
                  {guideLabels[a.slug] ?? a.title.split(':')[0]}{' '}
                  <ArrowRight size={14} />
                </ButtonLink>
              </li>
            ))}
          </ul>
        </Reveal>
      )}
    </div>
  </section>
  )
}

const CreatorBand = () => {
  const t = useT()
  const lp = useLp()
  return (
  <section className="section-y overflow-hidden bg-orange text-white">
    <div className="container-x grid items-center gap-10 md:grid-cols-[0.65fr_1.35fr] md:gap-16">
      <div className="relative mx-auto w-[200px] md:w-full md:max-w-[300px]" aria-hidden="true">
        <FloatingImage src="/mascotte-creator.webp" amplitude={10} />
      </div>
      <Reveal>
        <p className="label text-white/75">{t('Per chi Napoli la conosce')}</p>
        <h2 className="heading-lg mt-4">{t('Sai raccontare Napoli meglio di una guida?')}</h2>
        <p className="mt-5 max-w-lg text-white/85">
          {t('Proponi la tua esperienza, decidi tu prezzo e date, guadagni a ogni prenotazione. Ti aiutiamo a costruire il profilo.')}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink to={lp('/creator')} variant="dark" size="lg">
            {t('Candidati come creator') + ' '}
            <ArrowRight size={18} />
          </ButtonLink>
          <ButtonLink to={lp('/chi-siamo')} variant="ghost-light" size="lg">
            {t('Chi siamo')}
          </ButtonLink>
        </div>
      </Reveal>
    </div>
  </section>
  )
}

export default function HomePage() {
  const lang = useLang()
  usePageMeta(
    lang === 'en'
      ? {
          title: 'Things to do in Naples, picked by locals · Cose Fighe',
          description:
            'Things to do in Naples today, this weekend or on your dates: events checked by locals, plus food tours, boat trips and day trips, picked one by one.',
        }
      : {
          title: 'Cosa fare a Napoli: esperienze, eventi e idee di local · Cose Fighe',
          description:
            'Cosa fare a Napoli oggi, nel weekend e nei giorni in cui ci sei: eventi controllati dalla redazione e tour, laboratori, barche e sotterranei scelti uno per uno, con i prezzi delle piattaforme.',
        },
  )
  return (
    <Page>
      <Hero />
      <CategoriesStrip />
      <FeaturedSection />
      <WhatsOnBand />
      <MapBand />
      <BlogTeaser />
      <CreatorBand />
    </Page>
  )
}
