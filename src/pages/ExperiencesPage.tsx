import { ArrowRight } from 'lucide-react'
import { Page } from '../components/Page'
import { Band } from '../components/Band'
import { FloatingImage } from '../components/Decorations'
import { PageHero } from '../components/ui/PageHero'
import { ButtonLink } from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'
import { ExperienceCard } from '../components/ui/ExperienceCard'
import { WaitlistForm } from '../components/ui/WaitlistForm'
import { CATEGORY_LIST } from '../data/categories'
import { usePageMeta } from '../hooks/usePageMeta'
import type { Category } from '../types'

const total = CATEGORY_LIST.reduce((n, c) => n + c.experiences.length, 0)

const headerTone = (cat: Category) =>
  cat.bg === '#111111' ? 'bg-ink text-white' : cat.bg === '#FF5500' ? 'bg-orange text-white' : 'bg-blue text-white'

function CategorySection({ cat }: { cat: Category }) {
  return (
    <section id={`cat-${cat.slug}`} className="scroll-mt-32 py-12 md:py-16">
      <Reveal
        className={`mb-8 flex flex-col gap-4 rounded-[2rem] border-4 border-ink px-6 py-6 shadow-hard-lg md:flex-row md:items-center md:justify-between md:px-8 ${headerTone(cat)}`}
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-70">{cat.experiences.length} esperienze</p>
          <h2 className="mt-1 font-display text-display-lg uppercase leading-none">{cat.label}</h2>
          <p className="mt-2 opacity-80">{cat.subtitle}</p>
        </div>
        <ButtonLink to={`/categoria/${cat.slug}`} variant="white" size="sm" className="self-start md:self-auto">
          Vedi la categoria <ArrowRight size={14} />
        </ButtonLink>
      </Reveal>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
        {cat.experiences.map((exp, i) => (
          <ExperienceCard key={exp.title} exp={exp} index={i} />
        ))}
      </div>
    </section>
  )
}

export default function ExperiencesPage() {
  usePageMeta({
    title: 'Esperienze a Napoli · Cose Fighe',
    description: `${total} esperienze in 6 categorie: food, outdoor, sport, arte, laboratori e spettacoli. Curate da creator napoletani.`,
  })

  return (
    <Page>
      <PageHero
        tone="orange"
        kicker="Cosa vuoi vivere?"
        title={
          <>
            Esperienze
            <br />
            <span className="text-outline-light">a Napoli</span>
          </>
        }
        subtitle={`${CATEGORY_LIST.length} categorie, ${total} esperienze. Le prenotazioni aprono presto: intanto guarda cosa c'è.`}
        aside={
          <div className="relative mx-auto w-[200px] md:ml-auto md:w-[300px]" aria-hidden="true">
            <FloatingImage src="/trekking.webp" />
          </div>
        }
      />

      <Band text="FOOD • OUTDOOR • SPORT • ARTE • LABORATORI • SPETTACOLI • NAPOLI • " tone="ink" tilt={1} />

      <nav
        aria-label="Categorie"
        className="sticky top-[60px] z-40 border-b-4 border-ink bg-white/95 backdrop-blur-md md:top-[68px]"
      >
        <div className="container-x">
          <ul className="flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORY_LIST.map((cat) => (
              <li key={cat.slug} className="flex-shrink-0">
                <a
                  href={`#cat-${cat.slug}`}
                  className="inline-flex min-h-[40px] items-center rounded-full border-2 border-ink px-4 text-xs font-bold uppercase tracking-wider transition-colors hover:bg-orange hover:text-white"
                >
                  {cat.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="container-x pt-8 pb-16">
        {CATEGORY_LIST.map((cat) => (
          <CategorySection key={cat.slug} cat={cat} />
        ))}
      </div>

      <section className="section-y bg-ink text-white">
        <div className="container-x grid items-center gap-10 md:grid-cols-[1fr_1fr]">
          <Reveal>
            <h2 className="font-display text-display-lg uppercase">
              Non sai da <span className="text-orange">dove iniziare?</span>
            </h2>
            <p className="mt-5 max-w-md text-white/70">
              Lascia la mail: quando aprono le prenotazioni ti scriviamo per primo, con qualche consiglio su misura.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <WaitlistForm source="esperienze" tone="dark" />
            <p className="mt-4 text-sm text-white/50">
              Preferisci parlarne?{' '}
              <ButtonLink to="/contatti" variant="ghost-light" size="sm" className="ml-2">
                Scrivici
              </ButtonLink>
            </p>
          </Reveal>
        </div>
      </section>
    </Page>
  )
}
