import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { ArrowRight, Clock, MapPin } from 'lucide-react'
import { Page } from '../components/Page'
import { DragScroll, FloatingImage } from '../components/Decorations'
import { Button, ButtonLink } from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'
import { ExperienceCard } from '../components/ui/ExperienceCard'
import { ArticleCard } from '../components/ui/ArticleCard'
import { DateRange, type DateRangeValue } from '../components/ui/DateRange'
import { CATEGORIES, CATEGORY_LIST } from '../data/categories'
import { ARTICLES_BY_DATE } from '../data/articles'
import { EVENT_CATEGORY_LABELS, eventEnd, upcomingEvents } from '../data/events'
import { addDays, dayParts, formatRange, todayISO } from '../lib/dates'
import { usePageMeta } from '../hooks/usePageMeta'
import { useHydrated } from '../hooks/useHydrated'

const categoryImages: Record<string, string> = {
  food: '/food.webp',
  outdoor: '/outdoor.webp',
  sport: '/sport.webp',
  arte: '/arte.webp',
  laboratori: '/laboratori.webp',
  spettacoli: '/spettacoli.webp',
}

const featured = [
  { exp: CATEGORIES.food.experiences[0], cat: CATEGORIES.food.label },
  { exp: CATEGORIES.outdoor.experiences[0], cat: CATEGORIES.outdoor.label },
  { exp: CATEGORIES.arte.experiences[0], cat: CATEGORIES.arte.label },
]
const totalExperiences = CATEGORY_LIST.reduce((n, c) => n + c.experiences.length, 0)

const ease = [0.25, 1, 0.5, 1] as const

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease },
})

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
  const { ref, sx, sy } = useHeroParallax(14)
  const backDepth = -0.35
  const backX = useTransform(sx, (v) => v * backDepth)
  const backY = useTransform(sy, (v) => v * backDepth)
  const mascotX = useTransform(sx, (v) => v)
  const mascotY = useTransform(sy, (v) => v)

  const mascot = (
    <motion.div
      initial={{ opacity: 0, y: 60, rotate: 4 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
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
    <section ref={ref} className="relative overflow-hidden bg-paper">
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

      <div className="container-x relative z-10 grid items-center gap-8 pb-[min(78vw,390px)] pt-28 md:h-[100svh] md:max-h-[780px] md:min-h-[600px] md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:pb-20 md:pt-28">
        <div>
          <motion.p {...rise(0.06)} className="label text-orange">
            Esperienze autentiche a Napoli
          </motion.p>
          <h1 className="mt-4 font-display text-display-xl uppercase tracking-tight">
            <motion.span {...rise(0.12)} className="block">
              Scopri <span className="text-orange">cose fighe</span>
            </motion.span>
            <motion.span {...rise(0.19)} className="block">
              da fare a Napoli
            </motion.span>
          </h1>
          <motion.p {...rise(0.28)} className="mt-6 max-w-lg text-lg leading-relaxed text-ink/65">
            Tour, laboratori e avventure fuori dai giri turistici, raccontati da creator che la città la vivono ogni
            giorno.
          </motion.p>
          <motion.div {...rise(0.34)} className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink to="/esperienze" size="lg">
              Esplora le esperienze <ArrowRight size={18} />
            </ButtonLink>
            <ButtonLink to="/cosa-fare" variant="secondary" size="lg">
              Cosa fare a Napoli
            </ButtonLink>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

const CategoriesStrip = () => (
  <section className="relative bg-white pt-24 pb-16 md:pt-32 md:pb-24">
    <div className="container-x flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="max-w-xl">
        <h2 className="heading-lg">Sei modi di vivere Napoli</h2>
        <p className="mt-3 text-ink/60">Dal cibo di strada ai laboratori artigiani: ogni categoria è curata da chi Napoli la conosce davvero.</p>
      </div>
      <p className="hidden text-sm text-ink/45 md:block">Trascina per scorrere</p>
    </div>
    <DragScroll
      ariaLabel="Categorie"
      className="mt-10 flex gap-5 overflow-x-auto pb-4 pl-5 pr-5 sm:pl-8 sm:pr-8 md:gap-6 lg:pl-[calc((100vw-80rem)/2+2.5rem)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {CATEGORY_LIST.map((cat) => (
        <Link
          key={cat.slug}
          to={`/categoria/${cat.slug}`}
          viewTransition
          className="group w-[220px] shrink-0 sm:w-[260px] md:w-[300px]"
          draggable={false}
        >
          <div className="aspect-square overflow-hidden rounded-[2rem] bg-cream transition-transform duration-300 ease-out-quart group-hover:-translate-y-1">
            <img
              src={categoryImages[cat.slug]}
              alt={`Categoria ${cat.label}`}
              width={900}
              height={900}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="h-full w-full object-cover transition-transform duration-500 ease-out-quart group-hover:scale-[1.04]"
            />
          </div>
          <div className="mt-4 flex items-baseline justify-between gap-3">
            <h3 className="text-lg font-bold">{cat.label}</h3>
            <span className="text-sm text-ink/45">{cat.experiences.length} esperienze</span>
          </div>
          <p className="mt-1 text-sm text-ink/55">{cat.subtitle}</p>
        </Link>
      ))}
    </DragScroll>
  </section>
)

const WhatsOnBand = () => {
  const navigate = useNavigate()
  const hydrated = useHydrated()
  const [range, setRange] = useState<DateRangeValue>(() => ({ from: todayISO(), to: addDays(todayISO(), 6) }))
  const upcoming = upcomingEvents(4)
  const go = () => navigate(`/cosa-fare?dal=${range.from}&al=${range.to}`, { viewTransition: true })
  return (
    <section className="section-y bg-blue text-white">
      <div className="container-x grid gap-12 md:grid-cols-[1fr_1fr] md:gap-16">
        <Reveal>
          <p className="label text-white/75">Il programma</p>
          <h2 className="heading-lg mt-4">Cosa fare a Napoli nei giorni in cui ci sei</h2>
          <p className="mt-4 max-w-md text-white/80">
            Feste, concerti, mercati, mostre: scegli le date e ti diciamo cosa succede in città e quali esperienze puoi prenotare.
          </p>
          {hydrated ? (
            <>
              <div className="mt-8">
                <DateRange value={range} onChange={setRange} tone="dark" compact />
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Button onClick={go}>
                  Vedi il programma {formatRange(range.from, range.to)} <ArrowRight size={16} />
                </Button>
              </div>
            </>
          ) : (
            <div className="mt-8 min-h-[180px]">
              <ButtonLink to="/cosa-fare">
                Vedi il programma <ArrowRight size={16} />
              </ButtonLink>
            </div>
          )}
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mb-2 text-sm font-semibold text-white/75">I prossimi in città</p>
          <ul className="divide-y divide-white/15 border-y border-white/15">
            {(hydrated ? upcoming : []).map((e) => {
              const p = dayParts(e.start)
              return (
                <li key={e.slug}>
                  <Link
                    to={`/cosa-fare?dal=${e.start}&al=${eventEnd(e)}`}
                    viewTransition
                    className="group grid grid-cols-[3.25rem_1fr_auto] items-center gap-4 py-4 transition-colors hover:bg-white/5"
                  >
                    <span className="flex flex-col items-center leading-none">
                      <span className="font-display text-3xl">{p.day}</span>
                      <span className="mt-1 text-[11px] font-semibold uppercase text-white/70">{p.mon}</span>
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-bold">{e.title}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-white/70">
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} /> {e.place}
                        </span>
                        {e.time && (
                          <span className="inline-flex items-center gap-1">
                            <Clock size={12} /> {e.time}
                          </span>
                        )}
                        <span className="text-white/50">{EVENT_CATEGORY_LABELS[e.category]}</span>
                      </span>
                    </span>
                    <ArrowRight size={16} className="text-white/60 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              )
            })}
          </ul>
          <ButtonLink to="/cosa-fare" variant="link" className="mt-6 text-white decoration-white/40 hover:text-white hover:decoration-white">
            Tutto il programma <ArrowRight size={15} />
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  )
}

const FeaturedSection = () => (
  <section className="section-y bg-paper">
    <div className="container-x">
      <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <h2 className="heading-lg">Le più richieste</h2>
          <p className="mt-3 text-ink/60">Tre esperienze per capire lo spirito di Cose Fighe.</p>
        </div>
        <ButtonLink to="/esperienze" variant="link">
          Tutte le {totalExperiences} esperienze <ArrowRight size={15} />
        </ButtonLink>
      </Reveal>
      <div className="mt-10 grid gap-5 md:gap-6 lg:grid-cols-[1.3fr_1fr]">
        <ExperienceCard exp={featured[0].exp} category={featured[0].cat} index={0} />
        <div className="grid gap-5 md:gap-6">
          <ExperienceCard exp={featured[1].exp} category={featured[1].cat} index={1} layout="row" />
          <ExperienceCard exp={featured[2].exp} category={featured[2].cat} index={2} layout="row" />
        </div>
      </div>
    </div>
  </section>
)

const BlogTeaser = () => (
  <section className="section-y bg-white">
    <div className="container-x">
      <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <h2 className="heading-lg">Dal blog</h2>
          <p className="mt-3 text-ink/60">Guide scritte da chi Napoli la vive ogni giorno: posti veri, orari veri.</p>
        </div>
        <ButtonLink to="/blog" variant="link">
          Tutti gli articoli <ArrowRight size={15} />
        </ButtonLink>
      </Reveal>
      <div className="mt-10">
        <ArticleCard article={ARTICLES_BY_DATE[0]} featured />
      </div>
    </div>
  </section>
)

const CreatorBand = () => (
  <section className="section-y overflow-hidden bg-orange text-white">
    <div className="container-x grid items-center gap-10 md:grid-cols-[0.65fr_1.35fr] md:gap-16">
      <div className="relative mx-auto w-[200px] md:w-full md:max-w-[300px]" aria-hidden="true">
        <FloatingImage src="/mascotte-creator.webp" amplitude={10} />
      </div>
      <Reveal>
        <p className="label text-white/75">Per chi Napoli la conosce</p>
        <h2 className="heading-lg mt-4">Sai raccontare Napoli meglio di una guida?</h2>
        <p className="mt-5 max-w-lg text-white/85">
          Proponi la tua esperienza, decidi tu prezzo e date, guadagni a ogni prenotazione. Ti aiutiamo a costruire il
          profilo.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink to="/creator" variant="dark" size="lg">
            Candidati come creator <ArrowRight size={18} />
          </ButtonLink>
          <ButtonLink to="/chi-siamo" variant="ghost-light" size="lg">
            Chi siamo
          </ButtonLink>
        </div>
      </Reveal>
    </div>
  </section>
)

export default function HomePage() {
  usePageMeta({
    title: 'Cose Fighe · Esperienze autentiche a Napoli',
    description:
      'Tour, laboratori, sport e spettacoli a Napoli fuori dai giri turistici, curati da creator locali. Scopri cose fighe da fare in città.',
    image: '/img/napoli-skyline.webp',
  })
  return (
    <Page>
      <Hero />
      <CategoriesStrip />
      <FeaturedSection />
      <WhatsOnBand />
      <BlogTeaser />
      <CreatorBand />
    </Page>
  )
}
