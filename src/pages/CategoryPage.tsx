import { useParams } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { Page } from '../components/Page'
import { PageHero } from '../components/ui/PageHero'
import { ButtonLink } from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'
import { ExperienceCard } from '../components/ui/ExperienceCard'
import { NextStep } from '../components/ui/NextStep'
import { CATEGORIES, CATEGORY_LIST } from '../data/categories'
import { CATEGORY_TEXTS } from '../data/categorieTesti'
import { relatedForCategory } from '../data/correlati'
import { usePageMeta } from '../hooks/usePageMeta'
import NotFoundPage from './NotFoundPage'
import type { Category } from '../types'

const categoryImages: Record<string, string> = {
  food: '/food.webp',
  outdoor: '/outdoor.webp',
  sport: '/sport.webp',
  arte: '/arte.webp',
  laboratori: '/laboratori.webp',
  spettacoli: '/spettacoli.webp',
}

function CategoryView({ cat }: { cat: Category }) {
  const experiences = cat.experiences

  usePageMeta({
    title: `${cat.label} a Napoli · Cose Fighe`,
    description: `${cat.subtitle}. ${cat.experiences.length} esperienze ${cat.label.toLowerCase()} a Napoli, scelte una per una.`,
    image: categoryImages[cat.slug],
  })

  const others = CATEGORY_LIST.filter((c) => c.slug !== cat.slug)
  const texts = CATEGORY_TEXTS[cat.slug]
  const reads = relatedForCategory(cat.slug)

  return (
    <Page>
      <PageHero
        back={{ to: '/esperienze', label: 'Tutte le categorie' }}
        eyebrow={cat.subtitle}
        title={cat.label}
        subtitle={`${experiences.length} esperienze a Napoli, scelte da chi la città la vive.`}
        aside={
          <div className="mx-auto w-[200px] overflow-hidden rounded-[2rem] md:ml-auto md:w-[280px]" style={{ backgroundColor: cat.accent }} aria-hidden="true">
            <img src={categoryImages[cat.slug]} alt="" width={900} height={900} className="h-full w-full object-cover" />
          </div>
        }
      />

      <section className="section-y">
        <div className="container-x">
          {texts && (
            <Reveal className="mb-10 max-w-3xl md:mb-14">
              <p className="text-lg leading-relaxed text-ink/70">{texts.intro}</p>
            </Reveal>
          )}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {experiences.map((exp, i) => (
              <ExperienceCard key={exp.title} exp={exp} category={cat.label} index={i} />
            ))}
          </div>
          {reads.length > 0 && (
            <Reveal className="mt-14 border-t border-line pt-8">
              <p className="label text-ink/50">Guide utili</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {reads.map((a) => (
                  <li key={a.slug}>
                    <ButtonLink to={`/blog/${a.slug}`} variant="secondary" size="sm">
                      {a.title.split(':')[0]} <ArrowRight size={14} />
                    </ButtonLink>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
          <Reveal className="mt-8 border-t border-line pt-8">
            <p className="label text-ink/50">Altre categorie</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {others.map((c) => (
                <li key={c.slug}>
                  <ButtonLink to={`/categoria/${c.slug}`} variant="secondary" size="sm">
                    {c.label} <ArrowRight size={14} />
                  </ButtonLink>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {texts && (
        <section className="section-y border-t border-line bg-white">
          <div className="container-x">
            <Reveal>
              <h2 className="heading-lg">Domande frequenti</h2>
              <p className="mt-3 max-w-xl text-ink/60">
                Su {cat.label.toLowerCase()} a Napoli, le cose che ci chiedono più spesso.
              </p>
            </Reveal>
            <div className="mt-10 grid gap-x-12 gap-y-10 md:grid-cols-2">
              {texts.faq.map((f) => (
                <div key={f.q}>
                  <h3 className="text-lg font-semibold leading-snug">{f.q}</h3>
                  <p className="mt-2 leading-relaxed text-ink/65">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <NextStep
        title="Cosa succede in città in questi giorni?"
        text="Feste, mercati, concerti e mostre a Napoli, giorno per giorno. Scegli le date e guarda cosa c'è."
        primary={{ to: '/cosa-fare', label: 'Cosa fare a Napoli' }}
        secondary={{ to: '/esperienze', label: 'Tutte le esperienze' }}
      />
    </Page>
  )
}

export default function CategoryPage() {
  const { slug } = useParams()
  const cat = CATEGORIES[slug ?? ''] as Category | undefined
  if (!cat) return <NotFoundPage />
  return <CategoryView key={cat.slug} cat={cat} />
}
