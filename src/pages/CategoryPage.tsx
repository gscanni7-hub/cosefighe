import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Page } from '../components/Page'
import { Band } from '../components/Band'
import { PageHero } from '../components/ui/PageHero'
import { ButtonLink } from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'
import { ExperienceCard } from '../components/ui/ExperienceCard'
import { WaitlistForm } from '../components/ui/WaitlistForm'
import { CATEGORIES, CATEGORY_LIST } from '../data/categories'
import { fetchExperiencesByCategory, mapDbExperience } from '../lib/db'
import { usePageMeta } from '../hooks/usePageMeta'
import NotFoundPage from './NotFoundPage'
import type { Category, Experience } from '../types'

const categoryImages: Record<string, string> = {
  food: '/food.webp',
  outdoor: '/outdoor.webp',
  sport: '/sport.webp',
  arte: '/arte.webp',
  laboratori: '/laboratori.webp',
  spettacoli: '/spettacoli.webp',
}

const heroTone = (cat: Category) => (cat.bg === '#111111' ? 'ink' : cat.bg === '#FF5500' ? 'orange' : 'blue')

function CategoryView({ cat }: { cat: Category }) {
  const [experiences, setExperiences] = useState<Experience[]>(cat.experiences)

  usePageMeta({
    title: `${cat.label} a Napoli · Cose Fighe`,
    description: `${cat.subtitle}. ${cat.experiences.length} esperienze ${cat.label.toLowerCase()} a Napoli curate da creator locali.`,
    image: categoryImages[cat.slug],
  })

  useEffect(() => {
    setExperiences(cat.experiences)
    fetchExperiencesByCategory(cat.slug).then((rows) => {
      if (rows && rows.length > 0) setExperiences(rows.map(mapDbExperience))
    })
  }, [cat])

  const others = CATEGORY_LIST.filter((c) => c.slug !== cat.slug)
  const tone = heroTone(cat)

  return (
    <Page>
      <PageHero
        tone={tone}
        kicker={cat.subtitle}
        title={cat.label}
        subtitle={`${experiences.length} esperienze a Napoli. Le prenotazioni aprono presto.`}
        actions={
          <ButtonLink to="/esperienze" variant={tone === 'ink' ? 'ghost-light' : 'white'} size="sm">
            <ArrowLeft size={14} /> Tutte le categorie
          </ButtonLink>
        }
        aside={
          <div
            className="mx-auto w-[220px] overflow-hidden rounded-[2rem] border-4 border-ink bg-cream shadow-hard-lg md:ml-auto md:w-[320px]"
            aria-hidden="true"
          >
            <img src={categoryImages[cat.slug]} alt="" width={900} height={900} className="h-full w-full object-cover" />
          </div>
        }
      />

      <Band text={`${cat.label.toUpperCase()} • NAPOLI • ESPERIENZE • `} tone="white" tilt={-1} />

      <section className="section-y">
        <div className="container-x">
          <Reveal className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="font-display text-display-lg uppercase">
              Tutte le <span className="text-outline">esperienze</span>
            </h2>
            <p className="max-w-xs text-sm text-ink/55 md:text-right">
              Ordinate per popolarità. Prezzi a persona, gruppi piccoli.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {experiences.map((exp, i) => (
              <ExperienceCard key={exp.title} exp={exp} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t-4 border-ink bg-paper py-16">
        <div className="container-x">
          <h2 className="font-display text-display-md uppercase">Altre categorie</h2>
          <ul className="mt-6 flex flex-wrap gap-3">
            {others.map((c) => (
              <li key={c.slug}>
                <ButtonLink to={`/categoria/${c.slug}`} variant="white" size="sm">
                  {c.label} <ArrowRight size={14} />
                </ButtonLink>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-y bg-ink text-white">
        <div className="container-x grid items-center gap-10 md:grid-cols-2">
          <Reveal>
            <h2 className="font-display text-display-lg uppercase">
              Ti avvisiamo <span className="text-orange">quando si parte</span>
            </h2>
            <p className="mt-5 max-w-md text-white/70">
              Le esperienze {cat.label} aprono presto. Lascia la mail e sei tra i primi.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <WaitlistForm source={`categoria-${cat.slug}`} tone="dark" />
          </Reveal>
        </div>
      </section>
    </Page>
  )
}

export default function CategoryPage() {
  const { slug } = useParams()
  const cat = CATEGORIES[slug ?? ''] as Category | undefined
  if (!cat) return <NotFoundPage />
  return <CategoryView key={cat.slug} cat={cat} />
}
