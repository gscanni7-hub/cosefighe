import { ArrowRight } from 'lucide-react'
import { Page } from '../components/Page'
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

function CategorySection({ cat }: { cat: Category }) {
  return (
    <section id={`cat-${cat.slug}`} className="scroll-mt-32 border-t border-ink/10 py-12 md:py-16">
      <Reveal className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="heading-lg">{cat.label}</h2>
          <p className="mt-2 text-ink/60">
            {cat.subtitle} · {cat.experiences.length} esperienze
          </p>
        </div>
        <ButtonLink to={`/categoria/${cat.slug}`} variant="link">
          Vedi la categoria <ArrowRight size={15} />
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
        eyebrow="Cosa vuoi vivere?"
        title="Esperienze a Napoli"
        subtitle={`${CATEGORY_LIST.length} categorie, ${total} esperienze. Le prenotazioni aprono presto: intanto guarda cosa c'è.`}
        aside={
          <div className="relative mx-auto w-[180px] md:ml-auto md:w-[260px]" aria-hidden="true">
            <FloatingImage src="/trekking.webp" amplitude={10} />
          </div>
        }
      />

      <nav aria-label="Categorie" className="sticky top-[56px] z-40 border-b border-ink/10 bg-white/90 backdrop-blur-md md:top-[60px]">
        <div className="container-x">
          <ul className="flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORY_LIST.map((cat) => (
              <li key={cat.slug} className="shrink-0">
                <a
                  href={`#cat-${cat.slug}`}
                  className="inline-flex min-h-[38px] items-center rounded-full border border-ink/15 px-4 text-sm font-medium text-ink/75 transition-colors hover:border-ink hover:text-ink"
                >
                  {cat.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="container-x pb-8">
        {CATEGORY_LIST.map((cat) => (
          <CategorySection key={cat.slug} cat={cat} />
        ))}
      </div>

      <section className="section-y bg-paper">
        <div className="container-x grid items-center gap-10 md:grid-cols-2">
          <Reveal>
            <h2 className="heading-lg">Non sai da dove iniziare?</h2>
            <p className="mt-4 max-w-md text-ink/60">
              Lascia la mail: quando aprono le prenotazioni ti scriviamo per primo, con qualche consiglio su misura.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <WaitlistForm source="esperienze" />
          </Reveal>
        </div>
      </section>
    </Page>
  )
}
