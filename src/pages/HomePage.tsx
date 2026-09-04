import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { Page } from '../components/Page'
import { DragScroll, FloatingImage } from '../components/Decorations'
import { ButtonLink } from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'
import { ExperienceCard } from '../components/ui/ExperienceCard'
import { ArticleCard } from '../components/ui/ArticleCard'
import { CATEGORIES, CATEGORY_LIST } from '../data/categories'
import { ARTICLES_BY_DATE } from '../data/articles'
import { usePageMeta } from '../hooks/usePageMeta'

const categoryImages: Record<string, string> = {
  food: '/food.webp',
  outdoor: '/outdoor.webp',
  sport: '/sport.webp',
  arte: '/arte.webp',
  laboratori: '/laboratori.webp',
  spettacoli: '/spettacoli.webp',
}

const featured = [CATEGORIES.food.experiences[0], CATEGORIES.outdoor.experiences[0], CATEGORIES.arte.experiences[0]]
const totalExperiences = CATEGORY_LIST.reduce((n, c) => n + c.experiences.length, 0)

const steps = [
  {
    title: 'Scegli',
    text: `Sei categorie, ${totalExperiences} esperienze. Cibo, mare, arte, laboratori: filtra per quello che ti va davvero.`,
  },
  {
    title: 'Prenota',
    text: 'Gruppi piccoli e date chiare. Le prenotazioni aprono presto: lascia la mail e ti avvisiamo per primo.',
  },
  {
    title: 'Vivi',
    text: 'Un creator napoletano ti porta dove le guide non arrivano. Torni a casa con storie, non solo foto.',
  },
]

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

  const sticker = (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.9, ease }}
      className="absolute left-0 top-[14%] -rotate-[8deg] whitespace-nowrap rounded-full border-2 border-ink bg-white px-3.5 py-2 text-[13px] font-bold shadow-hard-sm max-md:left-auto max-md:right-[62%] max-md:top-[22%]"
    >
      <b className="text-orange">{totalExperiences}</b> esperienze · <b className="text-orange">6</b> categorie
    </motion.div>
  )

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
      {sticker}
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
            <ButtonLink to="/creator" variant="secondary" size="lg">
              Diventa creator
            </ButtonLink>
          </motion.div>
          <motion.p {...rise(0.4)} className="mt-8 hidden text-sm text-ink/50 md:block">
            {totalExperiences} esperienze · 6 categorie · prenotazioni in apertura
          </motion.p>
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

const FeaturedSection = () => (
  <section className="section-y bg-paper">
    <div className="container-x">
      <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <h2 className="heading-lg">Le più richieste</h2>
          <p className="mt-3 text-ink/60">Tre esperienze per capire lo spirito di Cose Fighe. Le prenotazioni aprono presto.</p>
        </div>
        <ButtonLink to="/esperienze" variant="link">
          Tutte le {totalExperiences} esperienze <ArrowRight size={15} />
        </ButtonLink>
      </Reveal>
      <div className="mt-10 grid gap-5 md:gap-6 lg:grid-cols-[1.3fr_1fr]">
        <ExperienceCard exp={featured[0]} index={0} />
        <div className="grid gap-5 md:gap-6">
          <ExperienceCard exp={featured[1]} index={1} layout="row" />
          <ExperienceCard exp={featured[2]} index={2} layout="row" />
        </div>
      </div>
    </div>
  </section>
)

const HowItWorks = () => (
  <section className="section-y bg-ink text-white">
    <div className="container-x grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
      <Reveal>
        <h2 className="heading-lg">Tre mosse e sei in giro</h2>
        <p className="mt-4 max-w-sm text-white/60">
          Niente app da scaricare, niente pacchetti turistici. Solo persone del posto che ti portano dove vale la pena.
        </p>
      </Reveal>
      <Reveal delay={0.08}>
        <ol className="divide-y divide-white/10">
          {steps.map((s, i) => (
            <li key={s.title} className="grid grid-cols-[3.5rem_1fr] gap-4 py-6 first:pt-0 last:pb-0">
              <span className="font-display text-3xl leading-none text-orange">0{i + 1}</span>
              <div>
                <h3 className="text-lg font-bold">{s.title}</h3>
                <p className="mt-1.5 max-w-md text-white/60">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>
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
      <HowItWorks />
      <BlogTeaser />
      <CreatorBand />
    </Page>
  )
}
