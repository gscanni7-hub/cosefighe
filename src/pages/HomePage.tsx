import { Link } from 'react-router'
import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { Page } from '../components/Page'
import { Band } from '../components/Band'
import { FloatingImage, Parallax } from '../components/Decorations'
import { ButtonLink } from '../components/ui/Button'
import { Sticker } from '../components/ui/Sticker'
import { Reveal } from '../components/ui/Reveal'
import { ExperienceCard } from '../components/ui/ExperienceCard'
import { CATEGORIES, CATEGORY_LIST } from '../data/categories'
import { usePageMeta } from '../hooks/usePageMeta'
import type { Category } from '../types'

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

const Hero = () => (
  <section className="relative overflow-hidden bg-paper pt-32 pb-16 md:pt-40 md:pb-24">
    <div className="pointer-events-none absolute inset-0 dots text-ink/[0.07]" aria-hidden="true" />
    <div className="container-x relative grid items-center gap-12 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
        <Sticker tone="orange" rotate={-2}>
          Napoli, come un local
        </Sticker>
        <h1 className="mt-6 font-display text-display-xl uppercase tracking-tight text-orange">
          Scopri <span className="text-outline">cose fighe</span> da fare a Napoli
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/65 md:text-xl">
          Tour, laboratori e avventure fuori dai giri turistici, raccontati da creator che la città la vivono ogni
          giorno.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <ButtonLink to="/esperienze" size="lg">
            Esplora le esperienze <ArrowRight size={18} />
          </ButtonLink>
          <ButtonLink to="/creator" variant="white" size="lg">
            Diventa creator
          </ButtonLink>
        </div>
        <p className="mt-8 text-sm font-medium text-ink/55">
          {totalExperiences} esperienze · 6 categorie · creator napoletani
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.1, ease }}
        className="relative mx-auto aspect-square w-full max-w-[340px] md:max-w-[520px]"
        aria-hidden="true"
      >
        <div className="absolute inset-[9%] rounded-full border-4 border-ink bg-orange shadow-hard-lg" />
        <div className="absolute inset-[9%] rounded-full dots text-ink/20" />
        <FloatingImage src="/mascotte-1.webp" className="absolute left-1/2 top-1/2 w-[54%] -translate-x-1/2 -translate-y-1/2" />
        <FloatingImage src="/meditazione.webp" className="absolute left-[-3%] top-[4%] w-[30%]" delay={1} />
        <FloatingImage src="/cose-beve.webp" className="absolute right-[-3%] top-[14%] w-[30%]" delay={2} />
        <FloatingImage src="/trekking.webp" className="absolute bottom-[-2%] left-[8%] w-[30%]" delay={1.5} />
        <div className="absolute bottom-[10%] right-[0%]">
          <Sticker tone="white" rotate={3}>
            Prossimamente
          </Sticker>
        </div>
      </motion.div>
    </div>
  </section>
)

const CategoryTile = ({ cat, wide }: { cat: Category; wide: boolean }) => (
  <Link
    to={`/categoria/${cat.slug}`}
    viewTransition
    className={`group flex h-full overflow-hidden rounded-[2rem] border-4 border-ink bg-white shadow-hard-lg transition-[transform,box-shadow] duration-200 ease-out-quart hover:-translate-y-1.5 hover:shadow-hard-xl ${
      wide ? 'col-span-2 flex-row' : 'flex-col'
    }`}
  >
    <div
      className={`overflow-hidden bg-cream ${wide ? 'w-1/2 flex-shrink-0 border-r-4 border-ink' : 'aspect-square border-b-4 border-ink'}`}
    >
      <img
        src={categoryImages[cat.slug]}
        alt={`Categoria ${cat.label}`}
        width={900}
        height={900}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-500 ease-out-quart group-hover:scale-105"
      />
    </div>
    <div className={`flex flex-1 flex-col justify-end gap-3 p-4 md:p-6 ${wide ? 'justify-between' : ''}`}>
      {wide && (
        <span className="hidden text-xs font-bold uppercase tracking-widest text-ink/50 md:block">
          {cat.experiences.length} esperienze
        </span>
      )}
      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl uppercase leading-none md:text-3xl">{cat.label}</h3>
          <p className="mt-1.5 text-xs text-ink/55 md:text-sm">{cat.subtitle}</p>
        </div>
        <span className="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-ink transition-colors group-hover:border-orange group-hover:bg-orange group-hover:text-white md:flex">
          <ArrowRight size={16} />
        </span>
      </div>
    </div>
  </Link>
)

const CategoriesSection = () => (
  <section className="section-y bg-white">
    <div className="container-x">
      <Reveal className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <h2 className="max-w-2xl font-display text-display-lg uppercase">Scegli la tua esperienza alternativa</h2>
        <p className="max-w-sm text-ink/60 md:text-right">
          Dal cibo di strada ai laboratori artigiani: ogni categoria è curata da chi Napoli la conosce davvero.
        </p>
      </Reveal>
      <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
        {CATEGORY_LIST.map((cat) => (
          <CategoryTile key={cat.slug} cat={cat} wide={cat.slug === 'food' || cat.slug === 'spettacoli'} />
        ))}
      </div>
    </div>
  </section>
)

const HowItWorks = () => (
  <section className="section-y border-y-4 border-ink bg-paper">
    <div className="container-x grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
      <Reveal>
        <Sticker tone="orange" rotate={-2}>
          Come funziona
        </Sticker>
        <h2 className="mt-5 font-display text-display-lg uppercase">Tre mosse e sei in giro</h2>
        <p className="mt-5 max-w-md text-ink/65">
          Niente app da scaricare, niente pacchetti turistici. Solo persone del posto che ti portano dove vale la
          pena.
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <ol className="relative grid gap-10 sm:grid-cols-3 sm:gap-6">
          <span
            className="absolute left-7 top-7 hidden h-0 w-[calc(100%-3.5rem)] border-t-4 border-dashed border-ink/30 sm:block"
            aria-hidden="true"
          />
          {steps.map((s, i) => (
            <li key={s.title} className="relative">
              <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-4 border-ink bg-orange font-display text-2xl text-white shadow-hard-sm">
                {i + 1}
              </span>
              <h3 className="mt-5 font-display text-3xl uppercase">{s.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink/65">{s.text}</p>
            </li>
          ))}
        </ol>
      </Reveal>
    </div>
  </section>
)

const FeaturedSection = () => (
  <section className="section-y bg-blue text-white">
    <div className="container-x">
      <Reveal className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <h2 className="max-w-3xl font-display text-display-lg uppercase">
          Vivi la città <span className="text-outline-light">come un vero local</span>
        </h2>
        <p className="max-w-sm text-white/75 md:text-right">
          Tre tra le più richieste. Le prenotazioni aprono presto: lascia la mail in fondo alla pagina e ti avvisiamo.
        </p>
      </Reveal>
      <div className="grid gap-6 md:grid-cols-3">
        {featured.map((exp, i) => (
          <ExperienceCard key={exp.title} exp={exp} index={i} />
        ))}
      </div>
      <div className="mt-12 flex flex-wrap items-center gap-4">
        <ButtonLink to="/esperienze" variant="white">
          Vedi tutte le {totalExperiences} esperienze <ArrowRight size={16} />
        </ButtonLink>
      </div>
    </div>
  </section>
)

const CreatorBand = () => (
  <section className="section-y relative overflow-hidden border-t-4 border-ink bg-orange text-white">
    <div className="pointer-events-none absolute inset-0 dots text-white/15" aria-hidden="true" />
    <div className="container-x relative grid items-center gap-10 md:grid-cols-[1.2fr_0.8fr]">
      <Reveal>
        <Sticker tone="ink" rotate={-2}>
          Per chi Napoli la conosce
        </Sticker>
        <h2 className="mt-5 font-display text-display-lg uppercase">
          Sai raccontare Napoli meglio di una guida? <span className="text-outline-light">Diventa creator</span>
        </h2>
        <p className="mt-5 max-w-lg text-white/85">
          Proponi la tua esperienza, decidi tu prezzo e date, guadagni a ogni prenotazione. Ti aiutiamo a costruire il
          profilo.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <ButtonLink to="/creator" variant="dark" size="lg">
            Candidati ora <ArrowRight size={18} />
          </ButtonLink>
          <ButtonLink to="/chi-siamo" variant="ghost-light" size="lg">
            Chi siamo
          </ButtonLink>
        </div>
      </Reveal>
      <Parallax speed={0.6} className="relative mx-auto w-full max-w-[240px] md:max-w-[340px]">
        <FloatingImage src="/cose-beve.webp" />
      </Parallax>
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
      <Band text="FOOD • OUTDOOR • SPORT • ARTE • LABORATORI • SPETTACOLI • " tone="orange" tilt={-1} className="-mt-6" />
      <CategoriesSection />
      <HowItWorks />
      <FeaturedSection />
      <CreatorBand />
    </Page>
  )
}
